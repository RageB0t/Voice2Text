# Verification Checklist - Vanta Dictate

Use this checklist to verify that the core dictation functionality is working correctly.

## ✅ Pre-Test Setup

- [ ] App is running (check system tray for icon)
- [ ] Notepad is open
- [ ] Cursor is in Notepad's text area
- [ ] No clipboard managers are running
- [ ] Notepad is NOT running as administrator

## ✅ Basic Functionality Test

### Test 1: HUD Appearance
- [ ] Press and hold `Ctrl + Shift + Space`
- [ ] HUD appears at bottom center of screen
- [ ] HUD shows pulsing microphone icon
- [ ] HUD shows timer counting up (00:01, 00:02, etc.)
- [ ] HUD has glassy, futuristic appearance
- [ ] Text "Listening..." appears below the HUD

### Test 2: HUD Disappearance
- [ ] Release the hotkey
- [ ] HUD disappears immediately
- [ ] No other windows appear
- [ ] Notepad remains focused

### Test 3: Text Injection
- [ ] After releasing hotkey, wait ~500ms
- [ ] Text appears in Notepad: "This is a test transcription from the mock provider."
- [ ] Text appears at cursor position
- [ ] Cursor moves to end of inserted text
- [ ] No windows flashed or stole focus

## ✅ Advanced Tests

### Test 4: Multiple Activations
- [ ] Press and hold hotkey again
- [ ] HUD appears
- [ ] Release hotkey
- [ ] Text appears again
- [ ] Can repeat multiple times without issues

### Test 5: Different Applications

Try the same test in these apps:

**Text Editors:**
- [ ] VS Code
- [ ] Notepad++
- [ ] Sublime Text

**Browsers:**
- [ ] Chrome (Google search box)
- [ ] Firefox (any text field)
- [ ] Edge (any text field)

**Chat Apps:**
- [ ] Discord (message box)
- [ ] Slack (message box)

**Terminals:**
- [ ] Windows Terminal
- [ ] PowerShell
- [ ] CMD

### Test 6: Edge Cases

- [ ] Press hotkey for <1 second (should still work)
- [ ] Press hotkey for >5 seconds (should still work)
- [ ] Press hotkey, switch windows, release (should inject into original window)
- [ ] Press hotkey multiple times rapidly (should handle gracefully)

## ✅ Log Verification

Open PowerShell and run:
```powershell
Get-Content src-tauri/vanta.log -Tail 50 -Wait
```

Then press and release the hotkey. Verify you see:

- [ ] `[INFO] Hotkey Pressed: Starting recording sequence`
- [ ] `[INFO] Captured HWND: 0x...` (some hex number)
- [ ] `[INFO] WORKER: START CAPTURE`
- [ ] `[DEBUG] Recording collection started successfully`
- [ ] `[INFO] Hotkey Released: Stopping recording sequence`
- [ ] `[INFO] WORKER: STOP CAPTURE (X samples)`
- [ ] `[INFO] Recording stopped. Captured X samples (Y.YYs) at 16000Hz`
- [ ] `[INFO] Transcribing captured audio...`
- [ ] `[INFO] Transcription success: '...' (len: 54)`
- [ ] `[DEBUG] Formatted text for injection: '...'`
- [ ] `[INFO] Injecting text: '...' (len: 54)`
- [ ] `[DEBUG] Clipboard set successfully`
- [ ] `[DEBUG] Focus restored`
- [ ] `[DEBUG] SendInput sent 4 of 4 events`
- [ ] `[INFO] Injection pipeline completed successfully!`

## ✅ Settings Window

- [ ] Click system tray icon
- [ ] Settings window opens
- [ ] Window is movable
- [ ] Window is resizable
- [ ] All settings are visible
- [ ] Can toggle autostart checkbox
- [ ] Can change recording mode dropdown
- [ ] Can change language dropdown
- [ ] Can change output style buttons
- [ ] Can change transcription engine dropdown
- [ ] "Save Changes" button is visible
- [ ] Clicking "Save Changes" doesn't crash

## ✅ System Tray

- [ ] Tray icon is visible
- [ ] Left-clicking icon opens settings
- [ ] Right-clicking icon shows menu
- [ ] Menu has "Settings" option
- [ ] Menu has "Quit" option
- [ ] "Quit" option closes the app

## ✅ Performance

- [ ] HUD appears instantly (<50ms)
- [ ] HUD disappears instantly
- [ ] Text injection feels fast (<200ms after release)
- [ ] No lag or stuttering
- [ ] CPU usage is low when idle
- [ ] Memory usage is reasonable (<100MB)

## ✅ Stability

- [ ] App doesn't crash during normal use
- [ ] Can use hotkey 10+ times without issues
- [ ] Can switch between apps without issues
- [ ] Can minimize/maximize windows without issues
- [ ] Closing settings window doesn't quit app
- [ ] App survives sleep/wake cycle

## 🐛 Troubleshooting

If any test fails, check:

1. **Logs first:**
   ```powershell
   Get-Content src-tauri/vanta.log -Tail 100
   ```

2. **Common issues:**
   - HUD doesn't appear → Check logs for "Hotkey Pressed"
   - No text appears → Check logs for "Injection pipeline completed"
   - Text appears in wrong app → Check logs for "Captured HWND"
   - Clipboard error → Close clipboard managers

3. **Restart the app:**
   ```bash
   # Stop current process
   taskkill /F /IM vanta-dictate.exe
   
   # Start fresh
   npm run tauri dev
   ```

## ✅ Final Verification

After completing all tests:

- [ ] Core functionality works reliably
- [ ] HUD is smooth and professional
- [ ] Text injection is fast and accurate
- [ ] No focus stealing or window flashing
- [ ] Logs show successful pipeline execution
- [ ] Ready to integrate real transcription

## 📊 Test Results Summary

**Date:** _____________  
**Tester:** _____________

**Tests Passed:** _____ / _____  
**Tests Failed:** _____ / _____

**Overall Status:**
- [ ] ✅ All tests passed - Ready for real transcription
- [ ] ⚠️ Minor issues - Document and continue
- [ ] ❌ Major issues - Review logs and fix

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

## 🎯 Success Criteria

The app is considered **working** when:
- ✅ All basic functionality tests pass
- ✅ Text injection works in at least 5 different apps
- ✅ Logs show complete pipeline execution
- ✅ No crashes or errors during normal use
- ✅ Performance feels snappy and professional

**If all criteria are met: CONGRATULATIONS! 🎉**

The core dictation pipeline is working perfectly. You're ready to:
1. Integrate real transcription (Whisper.cpp or cloud API)
2. Add waveform visualization
3. Implement custom formatting
4. Polish the UX further

---

**Questions or issues?** Check the logs first, then see TESTING_GUIDE.md for detailed troubleshooting.
