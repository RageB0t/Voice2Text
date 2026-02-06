# Vanta Dictate - Testing Guide

## Current Status
✅ App compiles successfully
✅ Hotkey system is active (Ctrl+Shift+Space)
✅ Audio capture is working (16kHz, mono)
✅ HUD overlay is configured
✅ Text injection pipeline is implemented

## How to Test

### 1. Start the Application
The app should already be running in the system tray. If not:
```bash
npm run tauri dev
```

### 2. Test Basic Dictation Flow

1. **Open Notepad** (or any text editor)
2. **Click inside the text area** to focus it
3. **Press and HOLD** `Ctrl + Shift + Space`
   - You should see a futuristic HUD appear at the bottom center of your screen
   - The HUD should show a pulsing microphone icon and timer
4. **Speak** something (e.g., "This is a test")
5. **Release** the hotkey
   - The HUD should disappear
   - After ~500ms, you should see text appear in Notepad

### 3. Expected Behavior

**Mock Provider Response:**
The current implementation uses a mock transcription provider that returns:
```
"This is a test transcription from the mock provider."
```

This proves the entire pipeline works:
- ✅ Hotkey detection
- ✅ Audio capture
- ✅ Focus capture
- ✅ Transcription (mocked)
- ✅ Focus restoration
- ✅ Text injection via clipboard + Ctrl+V

### 4. Check Logs

Monitor the log file for detailed information:
```bash
Get-Content src-tauri/vanta.log -Tail 50 -Wait
```

**Expected log sequence when you press/release the hotkey:**
```
[INFO] Hotkey Pressed: Starting recording sequence
[INFO] Captured HWND: <window handle>
[INFO] WORKER: START CAPTURE
[DEBUG] Recording collection started successfully
[INFO] Hotkey Released: Stopping recording sequence
[INFO] WORKER: STOP CAPTURE (<number> samples)
[INFO] Recording stopped. Captured <number> samples (<duration>s) at 16000Hz
[INFO] Transcribing captured audio...
[INFO] Transcription success: 'This is a test transcription from the mock provider.' (len: 54)
[DEBUG] Formatted text for injection: 'This is a test transcription from the mock provider.'
[INFO] Injecting text: 'This is a test transcription from the mock provider.' (len: 54)
[DEBUG] Clipboard set successfully
[DEBUG] Focus restored
[INFO] Injection pipeline completed successfully!
```

### 5. Troubleshooting

#### No text appears in Notepad
- Check if the HUD appeared (confirms hotkey works)
- Check logs for "Injection pipeline completed successfully"
- Try clicking in Notepad again before testing
- Make sure Notepad is not running as administrator (focus issues)

#### HUD doesn't appear
- Check logs for "Hotkey Pressed" message
- Verify hotkey isn't conflicting with another app
- Try restarting the app

#### Audio buffer is empty
- Check logs for "Captured X samples"
- If samples = 0, microphone may not be working
- Check Windows microphone permissions
- Try speaking louder or longer

#### Clipboard issues
- Check logs for "Clipboard set successfully"
- If clipboard fails, another app may be blocking it
- Close any clipboard managers temporarily

### 6. Settings Window

Click the system tray icon to open the Settings window. You can configure:
- **Autostart**: Launch on Windows startup
- **Hotkey**: Change the activation key (UI not fully wired yet)
- **Recording Mode**: Press & Hold vs Toggle
- **Language**: Target language for transcription
- **Output Style**: Raw vs Formatted
- **Transcription Engine**: Mock / Cloud / Local

## Next Steps

Once the mock provider works reliably:

1. **Add Real Transcription**
   - Integrate Whisper.cpp for local transcription
   - Or add cloud API (OpenAI, Google, Azure)

2. **Improve HUD**
   - Add waveform visualization
   - Show partial transcription results
   - Add processing state

3. **Add Features**
   - Custom formatting rules
   - Voice commands
   - Multi-language support
   - Hotkey customization UI

4. **Polish**
   - Add audio feedback (beeps)
   - Improve error handling
   - Add retry logic
   - Performance optimization

## Technical Notes

### Text Injection Method
The app uses the most reliable Windows text injection method:
1. Capture focused window handle
2. Set clipboard with UTF-16 text
3. Restore focus to captured window
4. Simulate Ctrl+V using SendInput

This works across all Windows applications including:
- Notepad, Word, Excel
- Browsers (Chrome, Firefox, Edge)
- IDEs (VS Code, Visual Studio)
- Chat apps (Discord, Slack, Teams)
- Terminal apps (CMD, PowerShell, Windows Terminal)

### Audio Capture
- Uses CPAL for cross-platform audio
- Optimized for wireless headsets
- Fixed buffer size (1024 samples) prevents stuttering
- Automatic downsampling from 48kHz to 16kHz
- Mono conversion for stereo inputs

### Hotkey System
- Global hotkey using `global-hotkey` crate
- Press-and-hold detection
- Runs on dedicated thread to prevent blocking
- Survives window focus changes

## Success Criteria

The app is considered **working** when:
✅ Pressing Ctrl+Shift+Space shows the HUD
✅ Speaking while holding the key captures audio
✅ Releasing the key hides the HUD
✅ Text appears in the focused application
✅ No windows flash or steal focus
✅ The experience feels smooth and professional

**Current Status: READY FOR TESTING** 🚀
