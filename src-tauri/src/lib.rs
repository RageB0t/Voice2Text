// Core modules
pub mod hotkey;
pub mod audio;
pub mod transcription;
pub mod formatting;
pub mod injection;

use std::thread;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use hotkey::{HotkeyManager, HotkeyEvent};
use audio::AudioRecorder;
use transcription::{TranscriptionProvider, MockProvider, WhisperProvider, CloudSTTProvider};
use formatting::{FormattingEngine, TranscriptionMode};
use injection::TextInjector;
#[cfg(windows)]
use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod config;
use config::ConfigManager;

// Config commands
#[tauri::command]
fn get_config() -> config::AppConfig {
    let manager = ConfigManager::new();
    manager.load_config()
}

#[tauri::command]
fn save_config(app: tauri::AppHandle, config: config::AppConfig) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    
    let manager = ConfigManager::new();
    manager.save_config(&config).map_err(|e| e.to_string())?;
    
    // Apply autostart
    let autostart_manager = app.autolaunch();
    if config.autostart {
        let _ = autostart_manager.enable();
    } else {
        let _ = autostart_manager.disable();
    }
    
    Ok(())
}

// Phase 2: Model management commands
#[tauri::command]
fn get_model_path(model_name: String) -> String {
    let mut model_path = dirs::data_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    model_path.push("VantaDictate");
    model_path.push("models");
    model_path.push(format!("ggml-{}.bin", model_name));
    model_path.to_string_lossy().to_string()
}

#[tauri::command]
fn check_model_exists(model_name: String) -> bool {
    let model_path = get_model_path(model_name);
    std::path::Path::new(&model_path).exists()
}

#[tauri::command]
fn get_models_dir() -> String {
    let mut models_dir = dirs::data_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    models_dir.push("VantaDictate");
    models_dir.push("models");
    
    // Create directory if it doesn't exist
    let _ = std::fs::create_dir_all(&models_dir);
    
    models_dir.to_string_lossy().to_string()
}

#[tauri::command]
async fn download_model(
    app: tauri::AppHandle,
    model_name: String,
) -> Result<String, String> {
    use std::io::Write;
    
    log::info!("Starting download for model: {}", model_name);
    
    // Model URLs from HuggingFace
    let model_url = match model_name.as_str() {
        "tiny" => "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
        "base" => "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        "small" => "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
        "medium" => "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
        _ => return Err(format!("Unknown model: {}", model_name)),
    };
    
    let model_path = get_model_path(model_name.clone());
    let model_path_buf = std::path::PathBuf::from(&model_path);
    
    // Create parent directory
    if let Some(parent) = model_path_buf.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Download with progress
    let client = reqwest::Client::new();
    let response = client.get(model_url)
        .send()
        .await
        .map_err(|e| format!("Download failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }
    
    let total_size = response.content_length().unwrap_or(0);
    log::info!("Downloading {} bytes to {}", total_size, model_path);
    
    let mut file = std::fs::File::create(&model_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    
    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Download error: {}", e))?;
        file.write_all(&chunk).map_err(|e| format!("Write error: {}", e))?;
        
        downloaded += chunk.len() as u64;
        
        // Emit progress event
        if total_size > 0 {
            let progress = (downloaded as f64 / total_size as f64 * 100.0) as u32;
            let _ = app.emit("download-progress", progress);
        }
    }
    
    log::info!("Download complete: {}", model_path);
    Ok(model_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    use simplelog::*;
    use std::fs::File;
    use tauri_plugin_autostart::MacosLauncher;
    use tauri_plugin_autostart::ManagerExt;
    
    let log_config = ConfigBuilder::new()
        .set_time_level(LevelFilter::Debug)
        .build();

    let _ = CombinedLogger::init(
        vec![
            TermLogger::new(LevelFilter::Debug, log_config.clone(), TerminalMode::Mixed, ColorChoice::Auto),
            WriteLogger::new(LevelFilter::Debug, log_config, File::create("vanta.log").unwrap_or_else(|_| File::create("vanta_fallback.log").unwrap())),
        ]
    );
    
    log::info!("Vanta Dictate starting up...");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .plugin(tauri_plugin_positioner::init()) // Init positioner
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, get_config, save_config, get_model_path, check_model_exists, get_models_dir, download_model])
        .setup(|app| {
            log::info!("Tauri setup hook running");
            
            // --- TRAY SETUP ---
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let settings_i = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_i, &quit_i])?;

            let _tray = TrayIconBuilder::with_id("vanta-tray")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "settings" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;
            // ------------------

            // Initialize config
            let config_manager = ConfigManager::new();
            let config = config_manager.load_config();
            log::info!("Loaded config: {:?}", config);
            
            // Handle autostart based on config
            let autostart_manager = app.autolaunch();
            if config.autostart {
                let _ = autostart_manager.enable();
            } else {
                let _ = autostart_manager.disable();
            }
            
            // Initialize managers
            let (hotkey_manager, hotkey_rx) = HotkeyManager::new().expect("Failed to init hotkey manager");
            let register_result = "Success"; // Logging placeholder
            log::info!("Hotkey registration result: {}", register_result);

            // Extract values needed for the thread BEFORE moving manager
            let event_tx = hotkey_manager.get_event_sender();
            let hotkey_id = hotkey_manager.get_hotkey_id();

            // CRITICAL: Keep hotkey_manager alive by leaking it (destructor never called)
            // This avoids Send/Sync requirements for GlobalHotKeyManager in Tauri State
            Box::leak(Box::new(hotkey_manager));
            
            // Phase 2: Initialize transcription provider based on config
            let transcription_provider: Box<dyn TranscriptionProvider> = match config.provider.as_str() {
                "Whisper" => {
                    // Get model path from app data directory
                    let mut model_path = dirs::data_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
                    model_path.push("VantaDictate");
                    model_path.push("models");
                    model_path.push(format!("ggml-{}.bin", config.whisper_model));
                    
                    log::info!("Using Whisper provider with model: {}", model_path.display());
                    
                    // Check if model exists at startup
                    if !model_path.exists() {
                        log::warn!("Whisper model not found at: {}. User must download it.", model_path.display());
                    }
                    
                    Box::new(WhisperProvider::new(model_path.to_string_lossy().to_string()))
                }
                "Cloud" => {
                    log::info!("Using Cloud STT provider");
                    Box::new(CloudSTTProvider::new(None))
                }
                "Mock" => {
                    log::info!("Using Mock provider");
                    Box::new(MockProvider::new())
                }
                _ => {
                    log::warn!("Unknown provider '{}', falling back to Mock", config.provider);
                    Box::new(MockProvider::new())
                }
            };
            
            let formatting_engine = FormattingEngine::new(TranscriptionMode::Formatted);
            let text_injector = TextInjector::new();
            
            // Apply config to text injector
            text_injector.set_focus_delay(config.focus_delay_ms);
            text_injector.set_fallback_enabled(config.enable_typing_fallback);
            
            // Clone config for thread
            let config_for_thread = config.clone();

            thread::spawn(move || {
                log::info!("Starting hotkey listener thread");
                HotkeyManager::start_listening(event_tx, hotkey_id);
            });

            // Spawn main logic thread to handle hotkey events
            let app_handle = app.handle().clone();
            
            thread::spawn(move || {
                #[cfg(windows)]
                unsafe {
                    let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
                    log::info!("COM initialized on logic thread");
                }

                let rt = tokio::runtime::Runtime::new().unwrap();
                log::info!("Starting main logic thread");
                
                // Initialize AudioRecorder here to ensure it stays on this thread
                let mut audio_recorder = AudioRecorder::new().expect("Failed to init audio recorder");
                if let Err(e) = audio_recorder.open() {
                    log::error!("Failed to open audio recorder: {}", e);
                }
                log::info!("AudioRecorder initialized and opened on logic thread");
                
                while let Ok(event) = hotkey_rx.recv() {
                    match event {
                        HotkeyEvent::Pressed => {
                            log::info!("Hotkey Pressed: Starting recording sequence");
                            
                            // 1. Show HUD overlay (click-through)
                            if let Some(hud) = app_handle.get_webview_window("hud") {
                                use tauri_plugin_positioner::{WindowExt, Position};
                                
                                if let Err(e) = hud.move_window(Position::BottomCenter) {
                                    log::error!("Failed to move HUD: {}", e);
                                }
                                
                                let _ = hud.set_ignore_cursor_events(true); // Click-through
                                if let Err(e) = hud.show() {
                                    log::error!("Failed to show HUD: {}", e);
                                }
                                
                                // Emit event to frontend to start timer
                                let _ = hud.emit("recording-start", ());
                            } else {
                                log::error!("HUD window not found!");
                            }

                            // 2. Capture focus
                            text_injector.capture_focus();
                            
                            // 3. Audio feedback: Start
                            text_injector.play_beep(true);
                            
                            // 4. Start Recording (Tell the worker to start collecting)
                            if let Err(e) = audio_recorder.start_recording() {
                                log::error!("Failed to start recording collection: {}", e);
                            } else {
                                log::debug!("Recording collection started successfully");
                            }
                        }
                        HotkeyEvent::Released => {
                            log::info!("Hotkey Released: Stopping recording sequence");
                            let release_time = std::time::Instant::now();
                            
                            // 1. Hide HUD
                            if let Some(hud) = app_handle.get_webview_window("hud") {
                                let _ = hud.hide();
                                let _ = hud.emit("recording-stop", ());
                            }
                            
                            // 2. Stop Recording
                            let stop_start = std::time::Instant::now();
                            let audio_data = audio_recorder.stop_recording();
                            let sample_rate = audio_recorder.get_sample_rate();
                            let stop_duration = stop_start.elapsed();
                            
                            // 3. Audio feedback: Stop/Processing
                            text_injector.play_beep(false);
                            
                            let duration_secs = audio_data.len() as f32 / sample_rate as f32;
                            log::info!("Recording stopped. Captured {} samples ({:.2}s) at {}Hz [stop_recording took: {:?}]", 
                                audio_data.len(), duration_secs, sample_rate, stop_duration);

                            // For testing with mock provider, allow empty audio buffer
                            if audio_data.is_empty() {
                                log::warn!("Audio buffer empty, but continuing with transcription for testing.");
                            }
                            
                            // 4. Transcribe and Inject
                            rt.block_on(async {
                                // PHASE 1: Injection Test Mode
                                let transcribe_start = std::time::Instant::now();
                                let text = if config_for_thread.injection_test_mode {
                                    log::info!("INJECTION TEST MODE: Skipping transcription");
                                    "Test transcription successful".to_string()
                                } else {
                                    log::info!("Starting transcription...");
                                    match transcription_provider.transcribe(audio_data, sample_rate).await {
                                        Ok(t) => {
                                            let transcribe_duration = transcribe_start.elapsed();
                                            if t.is_empty() {
                                                log::error!("Transcription returned empty text [took: {:?}]", transcribe_duration);
                                                // Show error to user via HUD
                                                if let Some(hud) = app_handle.get_webview_window("hud") {
                                                    let _ = hud.emit("transcription-error", "Transcription returned empty text");
                                                }
                                                return;
                                            }
                                            log::info!("Transcription success: '{}' (len: {}) [took: {:?}]", t, t.len(), transcribe_duration);
                                            t
                                        }
                                        Err(e) => {
                                            let transcribe_duration = transcribe_start.elapsed();
                                            log::error!("Transcription failed: {} [took: {:?}]", e, transcribe_duration);
                                            // Show error to user via HUD
                                            if let Some(hud) = app_handle.get_webview_window("hud") {
                                                let _ = hud.emit("transcription-error", format!("Transcription failed: {}", e));
                                            }
                                            return;
                                        }
                                    }
                                };
                                
                                let format_start = std::time::Instant::now();
                                let formatted = formatting_engine.format(&text);
                                let format_duration = format_start.elapsed();
                                log::debug!("Formatted text for injection: '{}' [took: {:?}]", formatted, format_duration);
                                
                                // inject() handles restore_focus internally and has fallback
                                let inject_start = std::time::Instant::now();
                                if let Err(e) = text_injector.inject(&formatted) {
                                    log::error!("Injection pipeline failed: {}", e);
                                } else {
                                    let inject_duration = inject_start.elapsed();
                                    let total_duration = release_time.elapsed();
                                    log::info!("Injection pipeline completed successfully! [inject took: {:?}]", inject_duration);
                                    log::info!("⏱️  TOTAL PIPELINE: {:?} (stop: {:?}, transcribe: {:?}, format: {:?}, inject: {:?})", 
                                        total_duration, stop_duration, transcribe_start.elapsed(), format_duration, inject_duration);
                                }
                            });
                        }
                    }
                }
            });
            
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
