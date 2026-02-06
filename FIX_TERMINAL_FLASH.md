# Fix: Terminal Window Flashing

## Problem
When transcribing, a terminal window briefly flashes on screen. This window is whisper.exe being executed, and it steals focus from the target application, causing text injection to fail.

## Root Cause
By default, `std::process::Command` on Windows creates a visible console window when executing a subprocess. When whisper.exe runs, this console window:
1. Appears briefly
2. Steals focus from the target app (Notepad, etc.)
3. Disappears when whisper.exe finishes
4. Leaves focus on the wrong window
5. Text injection fails because we're pasting into the wrong window

## Solution
Use Windows `CREATE_NO_WINDOW` flag to hide the console window.

### Code Change
**File**: `src-tauri/src/transcription/mod.rs`

**Before**:
```rust
let output = std::process::Command::new(&whisper_exe)
    .arg("-m").arg(&model_path)
    .arg("-f").arg(audio_file_clone.to_str().unwrap())
    .arg("-nt")
    .arg("-np")
    .arg("-l").arg("en")
    .output();
```

**After**:
```rust
#[cfg(windows)]
let output = {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    
    std::process::Command::new(&whisper_exe)
        .arg("-m").arg(&model_path)
        .arg("-f").arg(audio_file_clone.to_str().unwrap())
        .arg("-nt")
        .arg("-np")
        .arg("-l").arg("en")
        .creation_flags(CREATE_NO_WINDOW)  // <-- This hides the window
        .output()
};

#[cfg(not(windows))]
let output = std::process::Command::new(&whisper_exe)
    .arg("-m").arg(&model_path)
    .arg("-f").arg(audio_file_clone.to_str().unwrap())
    .arg("-nt")
    .arg("-np")
    .arg("-l").arg("en")
    .output();
```

## How It Works
- `CREATE_NO_WINDOW` (0x08000000) is a Windows process creation flag
- It tells Windows to create the process without a console window
- The process still runs normally, but invisibly
- No focus stealing occurs
- Text injection works correctly

## Testing
1. Rebuild: `cargo build --release`
2. Run the app
3. Open Notepad
4. Press Ctrl+Shift+Space and speak
5. **No terminal window should flash**
6. Text should appear in Notepad

## Status
✅ **FIXED** - Applied in latest build

## Additional Notes
- This only affects Windows (hence the `#[cfg(windows)]`)
- On other platforms, the default behavior is fine
- The fix is transparent to users
- No performance impact
- Whisper.exe still runs normally, just hidden

## Related Issues
- Focus stealing
- Text injection failure
- "Nothing pastes" symptom
- Terminal window flashing

## Verification
After fix:
- ✅ No visible terminal window
- ✅ Focus remains on target app
- ✅ Text injection succeeds
- ✅ Smooth user experience
