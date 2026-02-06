# Vanta Dictate v0.2.0 - Bug Fix Release

## 🐛 Bug Fixes

### Transcription Reliability
- **Fixed audio warmup**: App now warms up audio device on startup to ensure immediate transcription
- **Fixed WAV format**: Improved WAV file compatibility with Whisper.exe
- **Fixed random failures**: Eliminated "works sometimes" issue - now works consistently from first use

### Updater System
- **Fixed ACL permissions**: Update checker now works without permission errors
- **Added updater capabilities**: Proper permissions for checking and downloading updates

## 🔧 Technical Improvements

- Audio device initialization with 500ms warmup period
- Test recording on startup to verify audio flow
- Improved WAV file header format for better compatibility
- Added flush() to ensure WAV files are written completely
- Fixed updater plugin permissions in capabilities

## 📋 What's Fixed

Before this update:
- ❌ Transcription wouldn't work initially
- ❌ Would randomly start working after several attempts
- ❌ Update checker showed ACL error

After this update:
- ✅ Transcription works immediately from first use
- ✅ Consistent, reliable audio capture
- ✅ Update checker works properly

## 🚀 Upgrade Instructions

If you have v0.1.0 installed:
1. Open Settings → About
2. Click "Check for Updates"
3. Click "Download & Restart"
4. App will update automatically

Or download and install manually from the release page.

## 📝 Notes

- This is a bug fix release - no new features
- All existing features work the same
- Recommended for all v0.1.0 users

---

**Version**: 0.2.0  
**Release Date**: February 5, 2024  
**Type**: Bug Fix Release  
**Installer**: `Vanta.Dictate_0.2.0_x64-setup.nsis.zip`
