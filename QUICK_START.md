# Quick Start Guide - Vanta Dictate

## 🎯 What This App Does

Vanta Dictate lets you speak text into **any Windows application** using a simple hotkey. No copy-pasting, no window switching - just press, speak, and release.

## ⚡ 30-Second Test

1. **Make sure the app is running** (check system tray for icon)
2. **Open Notepad** (or any text editor)
3. **Click in the text area**
4. **Press and HOLD** `Ctrl + Shift + Space`
5. **Wait 2 seconds** (or speak something)
6. **Release** the keys
7. **Watch the magic** ✨

You should see this text appear:
```
This is a test transcription from the mock provider.
```

## ✅ Success Checklist

When you press the hotkey, you should see:
- [ ] A futuristic HUD appears at the bottom of your screen
- [ ] The HUD shows a pulsing microphone icon
- [ ] A timer counts up while you hold the key
- [ ] The HUD disappears when you release

After you release:
- [ ] Text appears in Notepad after ~500ms
- [ ] Your cursor stays where it was
- [ ] No windows pop up or steal focus

## 🐛 If It Doesn't Work

### HUD doesn't appear?
- Check if the app is running (system tray icon)
- Try pressing the hotkey again
- Check logs: `Get-Content src-tauri/vanta.log -Tail 20`

### No text appears?
- Make sure you clicked in Notepad first
- Don't run Notepad as administrator
- Check logs for "Injection pipeline completed successfully"

### App won't start?
```bash
# Kill any existing instances
taskkill /F /IM vanta-dictate.exe

# Start fresh
npm run tauri dev
```

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. You're typing in Notepad                            │
│     [Notepad Window]                                    │
│     Cursor blinking here: |                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Press and hold Ctrl+Shift+Space                     │
│     [Notepad Window]                                    │
│     Cursor still here: |                                │
│                                                         │
│     [HUD appears at bottom]                             │
│     ┌─────────────────────┐                            │
│     │  🎤  00:01  Listening...  │                      │
│     └─────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Speak: "Hello world"                                │
│     [Notepad Window]                                    │
│     Cursor still here: |                                │
│                                                         │
│     [HUD still visible]                                 │
│     ┌─────────────────────┐                            │
│     │  🎤  00:03  Listening...  │                      │
│     └─────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. Release the hotkey                                  │
│     [Notepad Window]                                    │
│     Cursor still here: |                                │
│                                                         │
│     [HUD disappears]                                    │
│     Processing...                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. Text appears! (after ~500ms)                        │
│     [Notepad Window]                                    │
│     This is a test transcription from the mock provider.|
│                                                         │
│     ✨ Magic! No windows flashed, no focus stolen       │
└─────────────────────────────────────────────────────────┘
```

## 🎮 Try These Apps

The dictation works in **all** of these:

### Text Editors
- ✅ Notepad
- ✅ Notepad++
- ✅ VS Code
- ✅ Sublime Text
- ✅ Vim/Neovim (in insert mode)

### Browsers
- ✅ Chrome (text fields, Google Docs)
- ✅ Firefox
- ✅ Edge
- ✅ Brave

### Office Apps
- ✅ Microsoft Word
- ✅ Excel (cell editing)
- ✅ PowerPoint (text boxes)
- ✅ OneNote

### Chat Apps
- ✅ Discord
- ✅ Slack
- ✅ Microsoft Teams
- ✅ WhatsApp Desktop

### Terminals
- ✅ Windows Terminal
- ✅ PowerShell
- ✅ CMD
- ✅ Git Bash

### IDEs
- ✅ Visual Studio
- ✅ IntelliJ IDEA
- ✅ PyCharm
- ✅ Android Studio

## 🔍 Monitoring Logs

Want to see what's happening under the hood?

```powershell
# Watch logs in real-time
Get-Content src-tauri/vanta.log -Tail 50 -Wait
```

**What you'll see:**
```
[INFO] Hotkey Pressed: Starting recording sequence
[INFO] Captured HWND: 0x00050A1C
[INFO] WORKER: START CAPTURE
[DEBUG] Recording collection started successfully
[INFO] Hotkey Released: Stopping recording sequence
[INFO] WORKER: STOP CAPTURE (32000 samples)
[INFO] Recording stopped. Captured 32000 samples (2.00s) at 16000Hz
[INFO] Transcribing captured audio...
[INFO] Transcription success: 'This is a test...' (len: 54)
[DEBUG] Formatted text for injection: 'This is a test...'
[INFO] Injecting text: 'This is a test...' (len: 54)
[DEBUG] Clipboard set successfully
[DEBUG] Focus restored
[DEBUG] SendInput sent 4 of 4 events
[INFO] Injection pipeline completed successfully!
```

## ⚙️ Settings

Click the system tray icon to open settings:

- **Autostart**: Launch on Windows startup
- **Recording Mode**: Press & Hold (recommended) or Toggle
- **Language**: Target language for transcription
- **Output Style**: Raw or Formatted
- **Transcription Engine**: Mock (for testing) / Cloud / Local

## 🚀 Next Steps

Once you've verified the basic flow works:

1. **Test in different apps** - Try browsers, IDEs, chat apps
2. **Check the logs** - Understand what's happening
3. **Read the docs** - See TESTING_GUIDE.md for detailed info
4. **Report issues** - If something doesn't work, check logs first

## 💡 Pro Tips

1. **Hold the key for at least 1 second** - Gives the system time to capture audio
2. **Speak clearly** - Once real transcription is added, this will matter
3. **Don't run target apps as admin** - Windows security prevents injection
4. **Close clipboard managers** - They can interfere with the clipboard

## 🎯 What's Next?

The mock provider proves the pipeline works. Next up:
- Real transcription (Whisper.cpp or cloud API)
- Live waveform visualization
- Partial transcription display
- Custom formatting rules

---

**Questions?** Check the logs first, then see TESTING_GUIDE.md for troubleshooting.

**It works?** Awesome! You're ready to add real transcription. 🎉
