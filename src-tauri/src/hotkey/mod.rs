// Hotkey module - Global hotkey registration and event handling

use global_hotkey::{GlobalHotKeyManager, HotKeyState, hotkey::{HotKey, Code, Modifiers}};
use std::sync::mpsc::{channel, Receiver, Sender};

pub enum HotkeyEvent {
    Pressed,
    Released,
}

pub struct HotkeyManager {
    _manager: GlobalHotKeyManager,
    hotkey: HotKey,
    event_tx: Sender<HotkeyEvent>,
}

impl HotkeyManager {
    pub fn new() -> Result<(Self, Receiver<HotkeyEvent>), Box<dyn std::error::Error>> {
        let manager = GlobalHotKeyManager::new()?;
        let (event_tx, event_rx) = channel();
        
        // Default hotkey: Ctrl+Shift+Space
        let hotkey = HotKey::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
        
        manager.register(hotkey)?;
        
        Ok((Self {
            _manager: manager,
            hotkey,
            event_tx,
        }, event_rx))
    }
    
    // Separate function to run the listener loop
    pub fn start_listening(event_tx: Sender<HotkeyEvent>, hotkey_id: u32) {
        use global_hotkey::GlobalHotKeyEvent;
        
        log::info!("GlobalHotKey listener loop started for ID: {}", hotkey_id);

        loop {
            // Using try_recv and a small sleep prevents potential locking issues
            // in some Windows environments while remaining responsive.
            while let Ok(event) = GlobalHotKeyEvent::receiver().try_recv() {
                if event.id == hotkey_id {
                    match event.state {
                        HotKeyState::Pressed => {
                            log::debug!("Raw Event: KeyDown (ID: {})", event.id);
                            let _ = event_tx.send(HotkeyEvent::Pressed);
                        }
                        HotKeyState::Released => {
                            log::debug!("Raw Event: KeyUp (ID: {})", event.id);
                            let _ = event_tx.send(HotkeyEvent::Released);
                        }
                    }
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(5));
        }
    }
    
    pub fn get_event_sender(&self) -> Sender<HotkeyEvent> {
        self.event_tx.clone()
    }

    pub fn get_hotkey_id(&self) -> u32 {
        self.hotkey.id()
    }
}
