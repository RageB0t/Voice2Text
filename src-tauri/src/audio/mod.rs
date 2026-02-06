// Audio capture module - High-Compatibility Wireless Bridge

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::{Arc, mpsc};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, Instant};

pub struct AudioRecorder {
    cmd_tx: Option<mpsc::Sender<Cmd>>,
    worker_handle: Option<thread::JoinHandle<()>>,
    sample_rate: u32,
}

#[allow(dead_code)]
enum Cmd {
    Start,
    Stop(mpsc::Sender<Vec<f32>>),
    Shutdown,
}

impl AudioRecorder {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            cmd_tx: None,
            worker_handle: None,
            sample_rate: 16000,
        })
    }

    pub fn open(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if self.worker_handle.is_some() { return Ok(()); }

        let (cmd_tx, cmd_rx) = mpsc::channel::<Cmd>();
        let (sample_tx, sample_rx) = mpsc::channel::<Vec<f32>>();

        let handle = thread::spawn(move || {
            #[cfg(windows)]
            unsafe {
                let _ = windows::Win32::System::Com::CoInitializeEx(None, windows::Win32::System::Com::COINIT_MULTITHREADED);
            }

            let pings = Arc::new(AtomicU64::new(0));
            let s_tx = sample_tx;
            
            let mut buffer = Vec::new();
            let mut recording = false;
            let mut last_heartbeat = Instant::now();

            let host = cpal::default_host();
            log::info!("Audio host: {:?}", host.id());
            
            let device = match host.default_input_device() {
                Some(d) => {
                    let name = d.name().unwrap_or_else(|_| "Unknown".to_string());
                    log::info!("Using input device: {}", name);
                    d
                },
                None => {
                    log::error!("NO INPUT DEVICE FOUND");
                    return;
                }
            };

            let config = match device.default_input_config() {
                Ok(c) => {
                    log::info!("Device config: sample_rate={}, channels={}, format={:?}", 
                        c.sample_rate().0, c.channels(), c.sample_format());
                    c
                },
                Err(e) => {
                    log::error!("FAILED TO GET HW CONFIG: {}", e);
                    return;
                }
            };

            // Use default buffer size instead of fixed
            let stream_config: cpal::StreamConfig = config.clone().into();
            log::info!("Stream config: buffer_size={:?}", stream_config.buffer_size);

            let native_rate = config.sample_rate().0;
            let channels = config.channels() as usize;
            log::info!("HW LOCK: {}Hz, {}ch, Format: {:?}", native_rate, channels, config.sample_format());

            let pings_inner = pings.clone();
            let s_tx_inner = s_tx.clone();
            let recording_test = Arc::new(std::sync::atomic::AtomicBool::new(false));
            let recording_test_inner = recording_test.clone();

            let stream_result = match config.sample_format() {
                cpal::SampleFormat::F32 => {
                    device.build_input_stream(
                        &stream_config,
                        move |data: &[f32], _| {
                            pings_inner.fetch_add(1, Ordering::SeqCst);
                            
                            // Log first callback
                            if !recording_test_inner.swap(true, Ordering::SeqCst) {
                                log::info!("FIRST AUDIO CALLBACK RECEIVED! Data length: {}", data.len());
                            }
                            
                            let mono: Vec<f32> = if channels == 1 {
                                data.to_vec()
                            } else {
                                data.chunks(channels).map(|c| c.iter().sum::<f32>() / channels as f32).collect()
                            };
                            let _ = s_tx_inner.send(mono);
                        },
                        |err| log::error!("HW ERROR: {}", err),
                        None
                    )
                },
                cpal::SampleFormat::I16 => {
                    device.build_input_stream(
                        &stream_config,
                        move |data: &[i16], _| {
                            pings_inner.fetch_add(1, Ordering::SeqCst);
                            let mono: Vec<f32> = data.iter().map(|&s| cpal::Sample::to_sample::<f32>(s)).collect();
                            // Handle channels for I16 too
                            let final_mono = if channels == 1 { mono } else {
                                mono.chunks(channels).map(|c| c.iter().sum::<f32>() / channels as f32).collect()
                            };
                            let _ = s_tx_inner.send(final_mono);
                        },
                        |err| log::error!("HW ERROR: {}", err),
                        None
                    )
                },
                _ => {
                    log::error!("UNSUPPORTED SAMPLE FORMAT");
                    return;
                }
            };

            let stream = stream_result.expect("FAILED TO START STREAM");

            // Give the driver 500ms to settle before playing
            thread::sleep(Duration::from_millis(500));
            
            if let Err(e) = stream.play() {
                log::error!("FAILED TO START STREAM PLAYBACK: {}", e);
                return;
            }
            
            log::info!("--- HARDWARE BRIDGE LIVE (Wireless Optimizations Applied) ---");
            log::info!("Stream started successfully. Waiting for audio callbacks...");

            // Test: Force a ping to verify the callback works
            thread::sleep(Duration::from_millis(100));
            let initial_pings = pings.load(Ordering::SeqCst);
            log::info!("Initial ping check: {} callbacks received", initial_pings);

            loop {
                // 1. Control commands (PROCESS FIRST!)
                while let Ok(cmd) = cmd_rx.try_recv() {
                    match cmd {
                        Cmd::Start => {
                            log::info!("WORKER: START CAPTURE");
                            buffer.clear();
                            recording = true;
                        }
                        Cmd::Stop(reply_tx) => {
                            log::info!("WORKER: STOP CAPTURE ({} samples)", buffer.len());
                            recording = false;
                            let _ = reply_tx.send(std::mem::take(&mut buffer));
                        }
                        Cmd::Shutdown => return,
                    }
                }

                // 2. Drain samples (PROCESS AFTER COMMANDS!)
                while let Ok(samples) = sample_rx.try_recv() {
                    // Always update heartbeat if we are getting data
                    if !samples.is_empty() {
                        // We use pings as the heartbeat metric
                    }
                    if recording {
                        // Simple 3:1 downsampler if 48k -> 16k
                        if native_rate == 48000 {
                            for chunk in samples.chunks(3) { buffer.push(chunk[0]); }
                        } else {
                            buffer.extend_from_slice(&samples);
                        }
                    }
                }

                // 3. Passive Heartbeat
                if last_heartbeat.elapsed() > Duration::from_secs(10) {
                    let p = pings.load(Ordering::SeqCst);
                    log::info!("[HW STATUS] Pings: {}. Captured Buffer: {}. Rec State: {}", p, buffer.len(), recording);
                    pings.store(0, Ordering::SeqCst);
                    last_heartbeat = Instant::now();
                }

                thread::sleep(Duration::from_millis(10));
            }
        });

        self.cmd_tx = Some(cmd_tx);
        self.worker_handle = Some(handle);
        self.sample_rate = 16000; 

        Ok(())
    }

    pub fn start_recording(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(tx) = &self.cmd_tx { let _ = tx.send(Cmd::Start); }
        Ok(())
    }

    pub fn stop_recording(&mut self) -> Vec<f32> {
        if let Some(tx) = &self.cmd_tx {
            let (resp_tx, resp_rx) = mpsc::channel();
            if tx.send(Cmd::Stop(resp_tx)).is_ok() {
                return resp_rx.recv_timeout(Duration::from_secs(2)).unwrap_or_default();
            }
        }
        Vec::new()
    }

    pub fn get_sample_rate(&self) -> u32 { self.sample_rate }
}
