# Troubleshooting: Transcription Not Working

## Issue
Pressed Ctrl+Shift+Space and spoke "Hello how are you" but text didn't paste.

## Diagnostic Steps

### Step 1: Verify App is Running
1. Check system tray for Vanta Dictate icon
2. If not visible, start the app
3. Confirm icon appears in system tray

### Step 2: Check Logs
The log file is at: `vanta.log` in the app directory

**What to look for:**
```
[INFO] Hotkey Pressed: Starting recording sequence
[INFO] Hotkey Released: Stopping recording sequence
[INFO] Recording stopped. Captured X samples
[INFO] Transcribing captured audio...
[INFO] Transcription success: 'text here'
[INFO] Injection pipeline completed successfully!
```

**If you see:**
- No "Hotkey Pressed" → Hotkey not triggering
- "Hotkey Pressed" but no "Transcription" → Provider issue
- "Transcription" but no "Injection" → Injection issue

### Step 3: Test Hotkey Registration
1. Open Settings window
2. Check if hotkey is set to "Ctrl+Shift+Space"
3. Try pressing the hotkey
4. Watch for HUD overlay to appear

**If HUD doesn't appear:**
- Hotkey not registered
- Another app is capturing the hotkey
- App not running

### Step 4: Check Provider Configuration
1. Open Settings → Transcription tab
2. Verify provider is set to "Whisper (Local, Offline) - Default"
3. Verify model status shows "✓ Model Ready"
4. If not, click "Download Model"

### Step 5: Test with Injection Test Mode
This bypasses transcription to test injection only:

1. Open Settings → Advanced tab
2. Enable "Injection Test Mode"
3. Click Save
4. Open Notepad
5. Click in Notepad
6. Press Ctrl+Shift+Space
7. Release immediately

**Expected**: "Test transcription successful" should appear in Notepad

**If this works:**
- Injection is working
- Problem is with transcription

**If this doesn't work:**
- Injection is failing
- Check focus/clipboard issues

### Step 6: Check Whisper.exe
1. Open Command Prompt
2. Navigate to app directory:
   ```cmd
   cd "C:\Program Files\Vanta Dictate\resources"
   ```
3. Test whisper.exe:
   ```cmd
   whisper.exe --help
   ```

**Expected**: Help output appears

**If error:**
- whisper.exe not found
- DLL missing
- Permission issue

### Step 7: Check Model File
1. Open File Explorer
2. Navigate to: `%APPDATA%\VantaDictate\models\`
3. Verify `ggml-base.bin` exists
4. Check file size: ~142 MB

**If missing:**
- Download model from Settings
- Check internet connection
- Check disk space

### Step 8: Run in Dev Mode (Detailed Logs)
1. Close the installed app
2. Open terminal in project directory
3. Run:
   ```powershell
   npm run tauri dev
   ```
4. Watch console output
5. Press Ctrl+Shift+Space
6. Check for errors

## Common Issues

### Issue 1: Hotkey Not Triggering
**Symptoms**: No HUD appears, no logs

**Causes**:
- Another app using Ctrl+Shift+Space
- App not running
- Hotkey registration failed

**Solutions**:
- Close other apps (Discord, OBS, etc.)
- Restart Vanta Dictate
- Try different hotkey in Settings

### Issue 2: Model Not Downloaded
**Symptoms**: Error "Model not found"

**Causes**:
- Model not downloaded
- Download failed
- Wrong model path

**Solutions**:
- Open Settings → Transcription
- Click "Download Model"
- Wait for completion
- Verify "✓ Model Ready"

### Issue 3: Whisper.exe Not Found
**Symptoms**: Error "Failed to execute whisper.cpp"

**Causes**:
- whisper.exe not bundled
- DLL missing
- Permission denied

**Solutions**:
- Reinstall app
- Check antivirus settings
- Run as Administrator

### Issue 4: Empty Transcription
**Symptoms**: Logs show "Empty transcription"

**Causes**:
- Audio too short
- Microphone not working
- Background noise
- Whisper failed

**Solutions**:
- Speak longer (3+ seconds)
- Check microphone in Windows Settings
- Reduce background noise
- Try different model

### Issue 5: Injection Fails
**Symptoms**: Transcription works but text doesn't appear

**Causes**:
- Focus lost
- Clipboard blocked
- Target app doesn't accept paste
- Timing issue

**Solutions**:
- Enable "Typing Fallback" in Advanced settings
- Increase "Focus Delay" to 200ms
- Try in different app (Notepad)
- Check clipboard permissions

## Quick Test Procedure

### Test 1: Injection Test Mode
1. Settings → Advanced → Enable "Injection Test Mode"
2. Save
3. Open Notepad
4. Press Ctrl+Shift+Space
5. Release
6. **Expected**: "Test transcription successful"

### Test 2: Real Transcription
1. Settings → Advanced → Disable "Injection Test Mode"
2. Settings → Transcription → Verify "Whisper" and "✓ Model Ready"
3. Save
4. Open Notepad
5. Press and HOLD Ctrl+Shift+Space
6. Speak clearly: "Hello how are you"
7. Release hotkey
8. **Expected**: "Hello how are you" (or similar)

### Test 3: Check Logs
1. After test, check `vanta.log`
2. Look for:
   ```
   [INFO] Hotkey Pressed
   [INFO] Hotkey Released
   [INFO] Recording stopped. Captured X samples
   [INFO] Transcribing captured audio...
   [INFO] Transcription success: 'Hello how are you'
   [INFO] Injection pipeline completed successfully!
   ```

## Debug Commands

### Check if app is running
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*vanta*"}
```

### Check config file
```powershell
Get-Content "$env:APPDATA\VantaDictate\config.json"
```

### Check model file
```powershell
Test-Path "$env:APPDATA\VantaDictate\models\ggml-base.bin"
(Get-Item "$env:APPDATA\VantaDictate\models\ggml-base.bin").Length / 1MB
```

### Check whisper.exe
```powershell
cd "C:\Program Files\Vanta Dictate\resources"
.\whisper.exe --help
```

### View recent logs
```powershell
Get-Content "vanta.log" | Select-Object -Last 50
```

## What to Report

If issue persists, provide:
1. **Logs**: Last 50 lines of `vanta.log`
2. **Config**: Content of config.json
3. **Model**: Does ggml-base.bin exist? Size?
4. **Whisper**: Does `whisper.exe --help` work?
5. **Test Mode**: Does Injection Test Mode work?
6. **Symptoms**: Exactly what happens when you press hotkey

## Next Steps

Based on your issue ("said 'Hello how are you' but didn't paste"):

1. **First, check if hotkey triggered**:
   - Did HUD appear?
   - Check logs for "Hotkey Pressed"

2. **If HUD appeared**:
   - Check logs for transcription result
   - Check if model is downloaded
   - Try Injection Test Mode

3. **If HUD didn't appear**:
   - Hotkey not triggering
   - Check if app is running
   - Try different hotkey

4. **Run dev mode for detailed logs**:
   ```powershell
   npm run tauri dev
   ```
   Then press hotkey and watch console

## Expected Behavior

**Correct flow:**
1. Press Ctrl+Shift+Space → HUD appears (bottom center)
2. Speak → HUD shows "listening" animation
3. Release → HUD disappears
4. Wait 2-3 seconds → Text appears in focused app

**Timing:**
- HUD: Instant
- Transcription: 2-3 seconds
- Injection: <100ms

If any step fails, that's where the problem is.
