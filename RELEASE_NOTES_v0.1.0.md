# Vanta Dictate v0.1.0 - Initial Release

## 🎉 Welcome to Vanta Dictate

Premium speech-to-text dictation for Windows. Speak naturally, type effortlessly.

## ✨ Features

### Core Functionality
- **Press & Hold Dictation**: Press `Ctrl+Shift+Space`, speak, release to transcribe
- **Universal Input**: Works in any Windows application
- **Offline Transcription**: Powered by Whisper.cpp - no internet required
- **Auto-Update System**: Seamless updates delivered automatically

### Transcription Engine
- **Whisper.cpp Integration**: State-of-the-art speech recognition
- **Multiple Model Sizes**: Choose from Tiny, Base, Small, or Medium
- **High Accuracy**: Optimized for clear speech with noise suppression
- **Fast Processing**: BLAS-accelerated for quick transcription

### User Interface
- **Premium Dashboard**: Clean, modern settings interface
- **HUD Overlay**: Visual feedback while recording
- **Non-Intrusive**: Minimal, click-through overlay
- **Dark Theme**: Easy on the eyes

### Reliability Features
- **Smart Text Injection**: Clipboard + Ctrl+V method
- **Typing Fallback**: Character-by-character backup method
- **Focus Management**: Automatic window focus restoration
- **Error Handling**: Graceful failure recovery

## 🚀 Getting Started

1. **Download & Install**: Run the installer
2. **Download Model**: Open Settings → Transcription → Download Base Model
3. **Start Dictating**: Press `Ctrl+Shift+Space` and speak
4. **Release**: Text appears in your active application

## 📋 System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB for app + models
- **Microphone**: Any Windows-compatible microphone

## 🔧 Configuration

### Settings Available
- **Recording Mode**: Press & Hold or Toggle
- **Language**: English (more coming soon)
- **Output Style**: Lightning (raw) or Formatted (smart punctuation)
- **Model Size**: Tiny (75MB) to Medium (1.5GB)
- **Startup**: Launch on Windows startup
- **Advanced**: Focus delay, typing fallback, test mode

## 📦 What's Included

- Vanta Dictate application
- Whisper.cpp engine (bundled)
- Required DLLs (BLAS, OpenBLAS, etc.)
- Auto-updater system
- Comprehensive documentation

## 🔐 Privacy & Security

- **100% Offline**: All transcription happens locally
- **No Data Collection**: Your voice never leaves your computer
- **No Telemetry**: No tracking or analytics
- **Signed Updates**: Cryptographically verified updates

## 📚 Documentation

- `README.md` - Project overview
- `QUICK_START.md` - Quick start guide
- `TROUBLESHOOTING_TRANSCRIPTION.md` - Common issues
- `UPDATER_SETUP.md` - Update system details

## 🐛 Known Issues

- First transcription may be slower (model loading)
- Very short recordings (<0.5s) may not transcribe
- Background noise can affect accuracy

## 🔄 Updates

This version includes automatic update support. Future updates will:
- Download automatically in the background
- Show notification in Settings → About
- Install with one click and restart

## 💡 Tips

- Speak clearly and at normal pace
- Use in quiet environment for best results
- Base model recommended for balance of speed/accuracy
- Check Settings → About for updates

## 🙏 Credits

- **Whisper.cpp**: Georgi Gerganov and contributors
- **Tauri**: Tauri Programme within The Commons Conservancy
- **React**: Meta and contributors

## 📝 License

See LICENSE file for details.

## 🔗 Links

- **Repository**: https://github.com/RageB0t/Voice2Text
- **Issues**: https://github.com/RageB0t/Voice2Text/issues
- **Releases**: https://github.com/RageB0t/Voice2Text/releases

---

**Version**: 0.1.0  
**Release Date**: February 5, 2024  
**Build**: Production  
**Installer**: `Vanta.Dictate_0.1.0_x64-setup.nsis.zip`
