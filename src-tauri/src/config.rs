use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub autostart: bool,
    pub hotkey: String,
    pub language: String,
    
    // Phase 1: Reliability features
    #[serde(default = "default_false")]
    pub injection_test_mode: bool,
    
    #[serde(default = "default_focus_delay")]
    pub focus_delay_ms: u64,
    
    #[serde(default = "default_true")]
    pub enable_typing_fallback: bool,
    
    // Phase 2: Transcription provider
    #[serde(default = "default_provider")]
    pub provider: String,
    
    #[serde(default = "default_model")]
    pub whisper_model: String,
}

fn default_false() -> bool { false }
fn default_true() -> bool { true }
fn default_focus_delay() -> u64 { 100 }
fn default_provider() -> String { "Whisper".to_string() }
fn default_model() -> String { "base".to_string() }

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            autostart: true,
            hotkey: "Ctrl+Shift+Space".to_string(),
            language: "en-US".to_string(),
            injection_test_mode: false,
            focus_delay_ms: 100,
            enable_typing_fallback: true,
            provider: "Whisper".to_string(),
            whisper_model: "base".to_string(),
        }
    }
}

pub struct ConfigManager {
    config_path: PathBuf,
}

impl ConfigManager {
    pub fn new() -> Self {
        let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("VantaDictate");
        if !path.exists() {
            let _ = fs::create_dir_all(&path);
        }
        path.push("config.json");
        
        Self { config_path: path }
    }

    pub fn load_config(&self) -> AppConfig {
        if let Ok(file) = File::open(&self.config_path) {
            if let Ok(config) = serde_json::from_reader(file) {
                return config;
            }
        }
        AppConfig::default()
    }

    pub fn save_config(&self, config: &AppConfig) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(config)?;
        let mut file = File::create(&self.config_path)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }
}
