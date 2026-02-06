# Creating GitHub Release v0.1.0

## ✅ Prerequisites Complete

- [x] Code pushed to GitHub
- [x] Installer signed and packaged
- [x] updater.json configured
- [x] Endpoint URLs updated

## 📦 File to Upload

**Location**: `src-tauri\target\release\bundle\nsis\Vanta.Dictate_0.1.0_x64-setup.nsis.zip`

**Size**: ~14-15 MB (includes Whisper.exe and all DLLs)

## 🚀 Steps to Create Release

### 1. Go to GitHub Releases Page

Open: https://github.com/RageB0t/Voice2Text/releases/new

### 2. Fill in Release Details

**Tag**: `v0.1.0`
- Click "Choose a tag"
- Type: `v0.1.0`
- Click "Create new tag: v0.1.0 on publish"

**Release Title**: `Vanta Dictate v0.1.0 - Initial Release`

**Description**: Copy from `RELEASE_NOTES_v0.1.0.md` or use this:

```markdown
# 🎉 Vanta Dictate v0.1.0 - Initial Release

Premium speech-to-text dictation for Windows. Speak naturally, type effortlessly.

## ✨ Key Features

- **Press & Hold Dictation**: `Ctrl+Shift+Space` to record
- **Offline Transcription**: Powered by Whisper.cpp
- **Universal Input**: Works in any Windows app
- **Auto-Updates**: Seamless update delivery
- **Premium UI**: Modern, clean interface

## 🚀 Quick Start

1. Download and run the installer
2. Open Settings → Transcription
3. Download the Base model (142MB)
4. Press `Ctrl+Shift+Space` and speak!

## 📋 System Requirements

- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 500MB storage

## 🔐 Privacy

100% offline - your voice never leaves your computer.

## 📚 Documentation

See the [README](https://github.com/RageB0t/Voice2Text) for full documentation.

---

**Full Release Notes**: See `RELEASE_NOTES_v0.1.0.md` in the repository
```

### 3. Upload the Installer

1. Click "Attach binaries by dropping them here or selecting them"
2. Navigate to: `src-tauri\target\release\bundle\nsis\`
3. Select: `Vanta.Dictate_0.1.0_x64-setup.nsis.zip`
4. Wait for upload to complete

### 4. Publish Release

1. Check "Set as the latest release" (should be checked by default)
2. Click "Publish release"

## ✅ Verification

After publishing, verify:

1. **Release is visible**: https://github.com/RageB0t/Voice2Text/releases
2. **Download link works**: Click the .nsis.zip file
3. **URL matches updater.json**: 
   ```
   https://github.com/RageB0t/Voice2Text/releases/download/v0.1.0/Vanta.Dictate_0.1.0_x64-setup.nsis.zip
   ```

## 🧪 Test the Updater

### Option 1: Wait for Next Release
When you release v0.2.0, users with v0.1.0 will see the update notification.

### Option 2: Test Locally Now
1. Install v0.1.0 from the release
2. Change version to 0.2.0 in `tauri.conf.json`
3. Build and sign v0.2.0
4. Update `updater.json` with v0.2.0 details
5. Push `updater.json` to GitHub
6. Open v0.1.0 → Settings → About
7. Should see "Update Available" badge

## 📝 Post-Release Checklist

- [ ] Release published on GitHub
- [ ] Download link tested
- [ ] updater.json URL matches release URL
- [ ] Share release announcement
- [ ] Monitor for issues

## 🎯 Next Steps

### For Users
- Download from: https://github.com/RageB0t/Voice2Text/releases/latest
- Install and start dictating
- Updates will be automatic

### For Development
- Monitor issues: https://github.com/RageB0t/Voice2Text/issues
- Plan v0.2.0 features
- Collect user feedback

## 🔄 Future Releases

For subsequent releases (v0.2.0, v0.3.0, etc.):

1. Update version in `tauri.conf.json`
2. Build: `npm run tauri build`
3. Sign: Use the command from `.tauri-credentials`
4. Zip the installer
5. Update `updater.json` with new version and signature
6. Create GitHub release with new tag
7. Upload new .nsis.zip
8. Commit and push `updater.json`

Users with auto-update will see the notification automatically!

---

**Current Status**: Ready to create release
**Repository**: https://github.com/RageB0t/Voice2Text
**Release URL**: https://github.com/RageB0t/Voice2Text/releases/new
