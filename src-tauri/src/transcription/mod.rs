// Transcription module - Provider trait and implementations

use async_trait::async_trait;

pub type AudioBuffer = Vec<f32>;

#[async_trait]
pub trait TranscriptionProvider: Send + Sync {
    async fn transcribe(&self, audio: AudioBuffer, sample_rate: u32) -> Result<String, Box<dyn std::error::Error + Send + Sync>>;
    fn supports_streaming(&self) -> bool;
}

// Mock provider for MVP testing
pub struct MockProvider;

impl MockProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl TranscriptionProvider for MockProvider {
    async fn transcribe(&self, _audio: AudioBuffer, _sample_rate: u32) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        // Simulate processing delay
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        
        Ok("This is a test transcription from the mock provider.".to_string())
    }
    
    fn supports_streaming(&self) -> bool {
        false
    }
}

// Whisper.cpp provider for local transcription (subprocess-based, no LLVM required)
pub struct WhisperProvider {
    model_path: String,
    whisper_exe_path: String,
}

impl WhisperProvider {
    pub fn new(model_path: String) -> Self {
        // Determine whisper.cpp executable path
        // In production, this will be bundled with the app in resources
        let whisper_exe_path = if cfg!(windows) {
            // Try to find bundled whisper.exe in resources
            let mut exe_path = std::env::current_exe()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            
            // Remove the executable name to get the directory
            exe_path.pop();
            
            // Check common Tauri resource locations
            let possible_paths = vec![
                exe_path.join("resources").join("whisper.exe"),  // Installed app
                exe_path.join("..").join("resources").join("whisper.exe"),  // Dev mode
                exe_path.join("whisper.exe"),  // Same directory
            ];
            
            let found_path = possible_paths.iter()
                .find(|p| p.exists())
                .cloned();
            
            if let Some(path) = found_path {
                log::info!("Found bundled whisper.exe at: {}", path.display());
                path.to_string_lossy().to_string()
            } else {
                log::warn!("Bundled whisper.exe not found, trying PATH");
                // Fallback: assume whisper.exe is in PATH
                "whisper.exe".to_string()
            }
        } else {
            "whisper".to_string()
        };
        
        log::info!("WhisperProvider initialized with model: {}", model_path);
        log::info!("Whisper executable path: {}", whisper_exe_path);
        
        Self {
            model_path,
            whisper_exe_path,
        }
    }
    
    fn write_wav_file(&self, audio: &[f32], sample_rate: u32, path: &std::path::Path) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        use std::io::Write;
        
        // Convert f32 samples to i16
        let samples_i16: Vec<i16> = audio.iter()
            .map(|&s| (s.clamp(-1.0, 1.0) * 32767.0) as i16)
            .collect();
        
        let num_channels: u16 = 1; // Mono
        let bits_per_sample: u16 = 16;
        let num_samples = samples_i16.len() as u32;
        let byte_rate = sample_rate * num_channels as u32 * (bits_per_sample / 8) as u32;
        let block_align = num_channels * (bits_per_sample / 8);
        let data_size = num_samples * (bits_per_sample / 8) as u32;
        let file_size = 36 + data_size;
        
        let mut file = std::fs::File::create(path)?;
        
        // RIFF header
        file.write_all(b"RIFF")?;
        file.write_all(&file_size.to_le_bytes())?;
        file.write_all(b"WAVE")?;
        
        // fmt chunk
        file.write_all(b"fmt ")?;
        file.write_all(&16u32.to_le_bytes())?; // Subchunk1Size (16 for PCM)
        file.write_all(&1u16.to_le_bytes())?; // AudioFormat (1 = PCM)
        file.write_all(&num_channels.to_le_bytes())?; // NumChannels
        file.write_all(&sample_rate.to_le_bytes())?; // SampleRate
        file.write_all(&byte_rate.to_le_bytes())?; // ByteRate
        file.write_all(&block_align.to_le_bytes())?; // BlockAlign
        file.write_all(&bits_per_sample.to_le_bytes())?; // BitsPerSample
        
        // data chunk
        file.write_all(b"data")?;
        file.write_all(&data_size.to_le_bytes())?;
        
        // Write samples
        for sample in samples_i16 {
            file.write_all(&sample.to_le_bytes())?;
        }
        
        file.flush()?;
        
        Ok(())
    }
}

#[async_trait]
impl TranscriptionProvider for WhisperProvider {
    async fn transcribe(&self, audio: AudioBuffer, sample_rate: u32) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        // Check if model exists
        if !std::path::Path::new(&self.model_path).exists() {
            return Err(format!("Whisper model not found at: {}\n\nPlease download the model from Settings.", self.model_path).into());
        }
        
        log::info!("Transcribing {} samples at {}Hz with Whisper.cpp", audio.len(), sample_rate);
        
        // Resample to 16kHz if needed (Whisper requirement)
        let audio_16k = if sample_rate != 16000 {
            log::info!("Resampling from {}Hz to 16kHz", sample_rate);
            let ratio = sample_rate as f32 / 16000.0;
            audio.iter()
                .step_by(ratio.ceil() as usize)
                .copied()
                .collect()
        } else {
            audio
        };
        
        // Create temp WAV file
        let temp_dir = std::env::temp_dir();
        let audio_file = temp_dir.join(format!("vanta_audio_{}.wav", uuid::Uuid::new_v4()));
        
        log::debug!("Writing audio to temp file: {}", audio_file.display());
        self.write_wav_file(&audio_16k, 16000, &audio_file)?;
        
        // Run whisper.cpp as subprocess
        let model_path = self.model_path.clone();
        let whisper_exe = self.whisper_exe_path.clone();
        let audio_file_clone = audio_file.clone();
        
        let result = tokio::task::spawn_blocking(move || -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
            // Log FULL command line for debugging
            log::info!("=== WHISPER EXECUTION DEBUG ===");
            log::info!("Whisper exe: {}", whisper_exe);
            log::info!("Model path: {}", model_path);
            log::info!("Audio file: {}", audio_file_clone.display());
            
            // On Windows, hide the console window
            #[cfg(windows)]
            let output = {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;
                
                std::process::Command::new(&whisper_exe)
                    .arg("-m").arg(&model_path)
                    .arg("-f").arg(audio_file_clone.to_str().unwrap())
                    .arg("-l").arg("en")
                    .arg("-nt") // --no-timestamps
                    .creation_flags(CREATE_NO_WINDOW)
                    .output()
            };
            
            #[cfg(not(windows))]
            let output = std::process::Command::new(&whisper_exe)
                .arg("-m").arg(&model_path)
                .arg("-f").arg(audio_file_clone.to_str().unwrap())
                .arg("-l").arg("en")
                .arg("-nt") // --no-timestamps
                .output();
            
            match output {
                Ok(output) => {
                    let exit_code = output.status.code().unwrap_or(-1);
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    
                    log::info!("=== WHISPER OUTPUT ===");
                    log::info!("Exit code: {}", exit_code);
                    log::info!("STDOUT length: {} bytes", output.stdout.len());
                    log::info!("STDERR length: {} bytes", output.stderr.len());
                    log::info!("STDOUT raw:\n{}", stdout);
                    log::info!("STDERR raw:\n{}", stderr);
                    log::info!("=== END WHISPER OUTPUT ===");
                    
                    if output.status.success() {
                        // Get raw transcription
                        let raw_text = stdout.trim().to_string();
                        
                        log::info!("Transcription raw text: '{}'", raw_text);
                        
                        // Post-process: Remove music notes and other non-speech symbols
                        let cleaned_text = raw_text
                            .replace("♪", "")  // Remove music notes
                            .replace("♫", "")  // Remove double music notes
                            .replace("🎵", "") // Remove music emoji
                            .replace("🎶", "") // Remove music emoji
                            .replace("[BLANK_AUDIO]", "") // Remove blank audio markers
                            .trim()
                            .to_string();
                        
                        log::info!("Transcription cleaned text: '{}'", cleaned_text);
                        log::info!("Transcription length: {}", cleaned_text.len());
                        
                        if cleaned_text.is_empty() {
                            log::error!("WHISPER RETURNED EMPTY TEXT!");
                            log::error!("This means either:");
                            log::error!("1. Model not found at path: {}", model_path);
                            log::error!("2. Audio file is invalid");
                            log::error!("3. Whisper detected silence");
                            log::error!("4. Whisper crashed silently");
                            Err("Whisper returned empty transcription".into())
                        } else {
                            Ok(cleaned_text)
                        }
                    } else {
                        log::error!("Whisper.cpp failed with exit code: {}", exit_code);
                        Err(format!("Whisper.cpp failed: {}", stderr).into())
                    }
                }
                Err(e) => {
                    log::error!("Failed to execute whisper.cpp: {}", e);
                    log::error!("Whisper exe path: {}", whisper_exe);
                    log::error!("Make sure whisper.exe exists and has execute permissions");
                    Err(format!("Failed to execute whisper.cpp: {}\n\nMake sure whisper.exe is bundled with the app or in PATH.", e).into())
                }
            }
        }).await?;
        
        // Clean up temp file
        let _ = std::fs::remove_file(&audio_file);
        
        let transcription = result?;
        log::info!("Whisper transcription complete: '{}' (len: {})", transcription, transcription.len());
        
        Ok(transcription)
    }
    
    fn supports_streaming(&self) -> bool {
        false
    }
}

// Cloud STT provider stub
pub struct CloudSTTProvider {
    api_key: Option<String>,
}

impl CloudSTTProvider {
    pub fn new(api_key: Option<String>) -> Self {
        Self { api_key }
    }
}

#[async_trait]
impl TranscriptionProvider for CloudSTTProvider {
    async fn transcribe(&self, _audio: AudioBuffer, _sample_rate: u32) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        if self.api_key.is_none() {
            return Err("Cloud STT API key not configured".into());
        }
        
        // TODO: Implement actual cloud API call
        // For now, return mock data
        Ok("Cloud STT transcription (not implemented yet)".to_string())
    }
    
    fn supports_streaming(&self) -> bool {
        true
    }
}
