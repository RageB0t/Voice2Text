// Text injection module - Clipboard + Ctrl+V with typing fallback

use std::sync::{Arc, Mutex};
use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, SetForegroundWindow};
use windows::Win32::Foundation::{HWND, HANDLE};
use windows::Win32::System::DataExchange::{OpenClipboard, CloseClipboard, EmptyClipboard, SetClipboardData};
use windows::Win32::System::Memory::{GlobalAlloc, GlobalLock, GlobalUnlock, GMEM_MOVEABLE};
use windows::Win32::UI::Input::KeyboardAndMouse::{SendInput, INPUT, INPUT_KEYBOARD, KEYEVENTF_KEYUP, KEYEVENTF_UNICODE, VK_CONTROL, VK_V};
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

const CF_UNICODETEXT: u32 = 13;

pub struct TextInjector {
    target_hwnd: Arc<Mutex<Option<HWND>>>,
    focus_delay_ms: Arc<Mutex<u64>>,
    enable_fallback: Arc<Mutex<bool>>,
}

unsafe impl Send for TextInjector {}
unsafe impl Sync for TextInjector {}

impl TextInjector {
    pub fn new() -> Self {
        Self {
            target_hwnd: Arc::new(Mutex::new(None)),
            focus_delay_ms: Arc::new(Mutex::new(100)),
            enable_fallback: Arc::new(Mutex::new(true)),
        }
    }
    
    pub fn set_focus_delay(&self, delay_ms: u64) {
        if let Ok(mut delay) = self.focus_delay_ms.lock() {
            *delay = delay_ms;
        }
    }
    
    pub fn set_fallback_enabled(&self, enabled: bool) {
        if let Ok(mut fallback) = self.enable_fallback.lock() {
            *fallback = enabled;
        }
    }

    pub fn capture_focus(&self) {
        unsafe {
            let hwnd = GetForegroundWindow();
            log::info!("Captured HWND: {:?}", hwnd);
            if let Ok(mut lock) = self.target_hwnd.lock() {
                *lock = Some(hwnd);
            }
        }
    }

    pub fn inject(&self, text: &str) -> Result<(), Box<dyn std::error::Error>> {
        log::info!("Injecting text: '{}' (len: {})", text, text.len());

        // Try primary method: Clipboard + Ctrl+V
        match self.inject_via_clipboard(text) {
            Ok(_) => {
                log::info!("Injection complete via Ctrl+V");
                Ok(())
            }
            Err(e) => {
                log::warn!("Clipboard injection failed: {}. Trying fallback...", e);
                
                let fallback_enabled = self.enable_fallback.lock().unwrap_or_else(|e| e.into_inner());
                if *fallback_enabled {
                    self.inject_via_typing(text)?;
                    log::info!("Injection complete via typing fallback");
                    Ok(())
                } else {
                    Err(e)
                }
            }
        }
    }
    
    fn inject_via_clipboard(&self, text: &str) -> Result<(), Box<dyn std::error::Error>> {
        // 1. Set clipboard
        self.set_clipboard_text(text)?;
        log::debug!("Clipboard set successfully");

        // 2. Restore focus
        self.restore_focus()?;
        log::debug!("Focus restored");

        // 3. Simulate Ctrl+V
        self.send_ctrl_v()?;

        Ok(())
    }
    
    fn inject_via_typing(&self, text: &str) -> Result<(), Box<dyn std::error::Error>> {
        log::info!("Using typing fallback for {} characters", text.len());
        
        // Restore focus first
        self.restore_focus()?;
        
        // Type each character using Unicode input
        for ch in text.chars() {
            self.send_unicode_char(ch)?;
            // Small delay between characters for reliability
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
        
        Ok(())
    }
    
    fn send_unicode_char(&self, ch: char) -> Result<(), Box<dyn std::error::Error>> {
        unsafe {
            let mut inputs: [INPUT; 2] = std::mem::zeroed();
            let code = ch as u16;

            // Key down
            inputs[0].r#type = INPUT_KEYBOARD;
            inputs[0].Anonymous.ki.wScan = code;
            inputs[0].Anonymous.ki.dwFlags = KEYEVENTF_UNICODE;

            // Key up
            inputs[1].r#type = INPUT_KEYBOARD;
            inputs[1].Anonymous.ki.wScan = code;
            inputs[1].Anonymous.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;

            let sent = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
            
            if sent != 2 {
                log::warn!("SendInput for char '{}' sent {} of 2 events", ch, sent);
            }

            Ok(())
        }
    }

    fn set_clipboard_text(&self, text: &str) -> Result<(), Box<dyn std::error::Error>> {
        unsafe {
            // Open clipboard
            OpenClipboard(None)?;

            // Empty clipboard
            EmptyClipboard()?;

            // Convert text to wide string (UTF-16)
            let wide: Vec<u16> = OsStr::new(text)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();
            let size = wide.len() * 2;

            // Allocate global memory
            let hmem = GlobalAlloc(GMEM_MOVEABLE, size)?;
            if hmem.0.is_null() {
                let _ = CloseClipboard();
                return Err("Failed to allocate global memory".into());
            }

            // Lock and copy
            let ptr = GlobalLock(hmem);
            if ptr.is_null() {
                let _ = CloseClipboard();
                return Err("Failed to lock global memory".into());
            }

            std::ptr::copy_nonoverlapping(wide.as_ptr(), ptr as *mut u16, wide.len());
            let _ = GlobalUnlock(hmem);

            // Set clipboard data
            let result = SetClipboardData(CF_UNICODETEXT, Some(HANDLE(hmem.0 as _)));
            let _ = CloseClipboard();

            if result.is_err() {
                return Err("Failed to set clipboard data".into());
            }

            Ok(())
        }
    }

    fn restore_focus(&self) -> Result<(), Box<dyn std::error::Error>> {
        let hwnd = {
            let lock = self.target_hwnd.lock().unwrap();
            lock.ok_or("No target HWND captured")?
        };

        unsafe {
            let _ = SetForegroundWindow(hwnd);
            
            // Phase 1: Focus safety delay
            let delay = *self.focus_delay_ms.lock().unwrap_or_else(|e| e.into_inner());
            std::thread::sleep(std::time::Duration::from_millis(delay));
        }
        Ok(())
    }

    fn send_ctrl_v(&self) -> Result<(), Box<dyn std::error::Error>> {
        unsafe {
            // Small delay to ensure window is ready
            std::thread::sleep(std::time::Duration::from_millis(50));

            let mut inputs: [INPUT; 4] = std::mem::zeroed();

            // Ctrl down
            inputs[0].r#type = INPUT_KEYBOARD;
            inputs[0].Anonymous.ki.wVk = VK_CONTROL;

            // V down
            inputs[1].r#type = INPUT_KEYBOARD;
            inputs[1].Anonymous.ki.wVk = VK_V;

            // V up
            inputs[2].r#type = INPUT_KEYBOARD;
            inputs[2].Anonymous.ki.wVk = VK_V;
            inputs[2].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;

            // Ctrl up
            inputs[3].r#type = INPUT_KEYBOARD;
            inputs[3].Anonymous.ki.wVk = VK_CONTROL;
            inputs[3].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;

            let sent = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
            
            log::debug!("SendInput sent {} of 4 events", sent);
            
            if sent != 4 {
                return Err(format!("SendInput only sent {} of 4 events", sent).into());
            }

            Ok(())
        }
    }

    pub fn play_beep(&self, _start: bool) {
        // Optional: Add system beep or audio feedback
    }
}
