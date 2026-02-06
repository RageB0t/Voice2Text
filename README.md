# Vanta Dictate

**Premium Windows Speech-to-Text Dictation App**

A system-level productivity tool that lets you dictate text into any Windows application using a global hotkey.

## 🎯 Core Features

- **Global Hotkey**: Press and hold `Ctrl + Shift + Space` to dictate
- **Universal Compatibility**: Works in Notepad, browsers, IDEs, chat apps, terminals
- **Invisible Operation**: No windows pop up, no focus stealing
- **Futuristic HUD**: Elegant overlay shows recording status
- **System Tray**: Runs quietly in the background
- **Professional Polish**: Apple-level UX meets developer tool power

## 🚀 Quick Start

### Prerequisites
- Windows 10/11
- Node.js 18+ and npm
- Rust toolchain (for building)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vanta-dictate
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

4. Build for production:
```bash
npm run tauri build
```

## 📖 How to Use

1. **Launch the app** - It will appear in your system tray
2. **Click into any text field** in any Windows application
3. **Press and hold** `Ctrl + Shift + Space`
   - A sleek HUD appears at the bottom of your screen
   - Speak your text
4. **Release the hotkey**
   - The HUD disappears
   - Your transcribed text appears where your cursor was

**That's it!** No manual pasting, no window switching, no friction.

## 🎨 Current Status

### ✅ Working
- System tray integration
- Global hotkey (Ctrl+Shift+Space)
- Press-and-hold detection
- Audio capture (optimized for wireless headsets)
- HUD overlay (futuristic, click-through, always-on-top)
- Focus capture and restoration
- Text injection via clipboard + Ctrl+V
- Settings window
- Mock transcription provider (for testing)

### 🚧 In Progress
- Real transcription (Whisper.cpp or cloud API)
- Live waveform visualization
- Partial transcription display
- Custom formatting rules

### 📋 Planned
- Voice commands
- Multi-language support
- Hotkey customization UI
- Audio feedback (beeps)
- Subscription/licensing system

## 🛠️ Technical Architecture

### Backend (Rust/Tauri)
- **Hotkey System**: `global-hotkey` crate for system-wide key detection
- **Audio Capture**: CPAL with wireless headset optimizations
- **Text Injection**: Native Windows APIs (clipboard + SendInput)
- **Transcription**: Pluggable provider system (Mock/Cloud/Local)

### Frontend (React/TypeScript)
- **HUD**: Transparent, animated overlay with glassmorphism
- **Settings**: Clean dashboard with dark mode
- **State Management**: React hooks + Tauri events

### Key Design Decisions

**Why Clipboard + Ctrl+V?**
- Most reliable method across all Windows apps
- Works with security-sensitive applications
- No compatibility issues with different input methods

**Why Press-and-Hold?**
- Natural "walkie-talkie" interaction
- Clear start/stop boundaries
- Prevents accidental activations

**Why Mock Provider First?**
- Validates the entire pipeline works
- Allows testing without transcription complexity
- Easy to swap in real providers later

## 📁 Project Structure

```
vanta-dictate/
├── src/                    # React frontend
│   ├── components/
│   │   ├── RecordingHUD.tsx      # Overlay UI
│   │   └── SettingsWindow.tsx    # Settings dashboard
│   ├── App.tsx
│   └── styles.css
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── audio/          # Audio capture
│   │   ├── hotkey/         # Global hotkey
│   │   ├── transcription/  # STT providers
│   │   ├── injection/      # Text injection
│   │   ├── formatting/     # Text formatting
│   │   ├── config.rs       # Configuration
│   │   ├── lib.rs          # Main library
│   │   └── main.rs         # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

**Quick Test:**
1. Open Notepad
2. Press and hold `Ctrl + Shift + Space`
3. Speak (or just wait)
4. Release the hotkey
5. You should see: "This is a test transcription from the mock provider."

## 🔧 Configuration

Settings are stored in `%APPDATA%/com.ragebot.vanta-dictate/config.json`

Available options:
- `autostart`: Launch on Windows startup
- `hotkey`: Activation key combination
- `mode`: PressAndHold or Toggle
- `language`: Target language (en-US, es-ES, etc.)
- `transcriptionMode`: Lightning (raw) or Formatted
- `provider`: Mock, Cloud, or Local

## 🐛 Troubleshooting

### Text doesn't appear
- Check if HUD appeared (confirms hotkey works)
- Verify target app isn't running as administrator
- Check logs: `src-tauri/vanta.log`

### HUD doesn't show
- Verify hotkey isn't conflicting with another app
- Check logs for "Hotkey Pressed" message
- Try restarting the app

### No audio captured
- Check Windows microphone permissions
- Verify microphone is set as default input device
- Try speaking louder or longer

### Clipboard issues
- Close any clipboard manager apps temporarily
- Check logs for "Clipboard set successfully"

## 📝 Logs

Logs are written to:
- Development: `src-tauri/vanta.log`
- Production: `%APPDATA%/com.ragebot.vanta-dictate/vanta.log`

View logs in real-time:
```bash
Get-Content src-tauri/vanta.log -Tail 50 -Wait
```

## 🤝 Contributing

This is a premium product under active development. Contributions welcome!

## 📄 License

Proprietary - All rights reserved

## 🎯 Roadmap

### Phase 1: Core Functionality (Current)
- [x] System tray app
- [x] Global hotkey
- [x] Audio capture
- [x] HUD overlay
- [x] Text injection
- [ ] Real transcription

### Phase 2: Polish
- [ ] Waveform visualization
- [ ] Partial transcription
- [ ] Audio feedback
- [ ] Error recovery
- [ ] Performance optimization

### Phase 3: Features
- [ ] Custom formatting
- [ ] Voice commands
- [ ] Multi-language
- [ ] Hotkey customization
- [ ] Cloud sync

### Phase 4: Monetization
- [ ] Licensing system
- [ ] Subscription management
- [ ] Usage analytics
- [ ] Auto-updates

---

**Built with ❤️ for productivity enthusiasts**
