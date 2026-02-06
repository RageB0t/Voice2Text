# Whisper.cpp Production Setup Guide

## Overview

Vanta Dictate now uses **Whisper.cpp** as the production transcription backend. This implementation:
- ✅ No LLVM runtime dependency
- ✅ Subprocess-based (bundled whisper.exe)
- ✅ One-click model download
- ✅ Clear error handling
- ✅ No silent fallback to Mock

## Architecture

### Subprocess Approach
Instead of using `whisper-rs` (which requires LLVM), we:
1. Bundle pre-compiled `whisper.exe` with the app
2. Write audio to temporary WAV file
3. Call `whisper.exe` as subprocess
4. Parse stdout for transcription
5. Clean up temp file

### Provider Selection
- **Mock**: Testing only (or when injection_test_mode is enabled)
- **Whisper**: Production default (requires model download)
- **Cloud**: Future implementation

## Building Whisper.cpp for Windows

### Prerequisites
- Visual Studio 2022 (with C++ tools)
- CMake
- Git

### Build Steps

```powershell
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# Build with CMake
mkdir build
cd build
cmake ..
cmake --build . --config Release

# The executable will be at: build/bin/Release/main.exe
# Rename it to whisper.exe
```

### Bundle with Tauri

1. Copy `whisper.exe` to `src-tauri/resources/whisper.exe`
2. Update `tauri.conf.json` to include resources:

```json
{
  "bundle": {
    "resources": [
      "resources/whisper.exe"
    ]
  }
}
```

3. The app will automatically find it at runtime

## Model Management

### Supported Models
- **tiny** (~75MB) - Fastest, good for testing
- **base** (~142MB) - Recommended default
- **small** (~466MB) - Better accuracy
- **medium** (~1.5GB) - Best accuracy

### Model Location
Models are stored in:
```
%APPDATA%\VantaDictate\models\
```

Example:
```
C:\Users\YourName\AppData\Roaming\VantaDictate\models\ggml-base.bin
```

### Download Process
1. User selects model in Settings
2. If not found, "Download Model" button appears
3. Click to download from HuggingFace
4. Progress bar shows download status
5. Model is saved automatically
6. Ready to use immediately

## User Experience

### First Run
1. App starts with Mock provider (for testing)
2. User opens Settings → Transcription
3. Selects "Whisper (Local, Offline)"
4. Sees "⚠️ Model Not Installed"
5. Clicks "Download Model"
6. Waits for download (progress shown)
7. Sees "✓ Model Ready"
8. Saves settings
9. Whisper is now active

### Error Handling
If Whisper fails:
- Clear error message in logs
- Error event emitted to HUD
- NO silent fallback to Mock
- User must fix the issue (download model, check whisper.exe, etc.)

### Injection Test Mode
When enabled:
- Bypasses ALL transcription (including Whisper)
- Always injects "Test transcription successful"
- Perfect for debugging injection issues
- Works regardless of provider selection

## Technical Details

### Audio Pipeline
1. CPAL captures audio at 16kHz mono
2. Audio stored as `Vec<f32>` (normalized -1.0 to 1.0)
3. WhisperProvider converts to WAV file:
   - 16-bit PCM
   - Mono channel
   - 16kHz sample rate
4. Whisper.exe processes WAV
5. Stdout parsed for transcription text
6. Text returned to injection pipeline

### Whisper.exe Command
```bash
whisper.exe -m <model_path> -f <audio_file> -nt -np -l en
```

Flags:
- `-m`: Model path
- `-f`: Audio file path
- `-nt`: No timestamps
- `-np`: No progress output
- `-l en`: Language (English)

### Output Parsing
Whisper.cpp outputs text to stdout. We:
1. Read all stdout
2. Filter out timestamp lines (start with `[`)
3. Join remaining lines
4. Trim whitespace
5. Return as transcription

## Development Workflow

### Testing with Mock
```rust
// In config.json
{
  "provider": "Mock"
}
```

### Testing with Whisper
```rust
// In config.json
{
  "provider": "Whisper",
  "whisper_model": "base"
}
```

### Testing Injection Only
```rust
// In config.json
{
  "injection_test_mode": true
}
```

## Troubleshooting

### "Whisper model not found"
- Download model from Settings
- Or manually place `ggml-base.bin` in models directory

### "Failed to execute whisper.cpp"
- Ensure `whisper.exe` is bundled in resources
- Check if it's in PATH as fallback
- Verify it's the correct Windows build

### "Whisper returned empty transcription"
- Audio might be too short
- Check microphone is working
- Try speaking louder/clearer
- Check audio buffer in logs

### Download fails
- Check internet connection
- HuggingFace might be down
- Try manual download and place in models directory

## Future Enhancements

### Planned
- [ ] GPU acceleration (CUDA/OpenCL)
- [ ] Streaming transcription (partial results)
- [ ] Language auto-detection
- [ ] Custom vocabulary
- [ ] Model auto-update
- [ ] Compression for faster loading

### Considered
- [ ] Multiple model support (switch on-the-fly)
- [ ] Model quantization options
- [ ] Voice activity detection (VAD)
- [ ] Noise reduction preprocessing

## Resources

- **Whisper.cpp**: https://github.com/ggerganov/whisper.cpp
- **Models**: https://huggingface.co/ggerganov/whisper.cpp
- **Whisper Paper**: https://arxiv.org/abs/2212.04356

## Success Criteria

✅ Whisper is production-ready when:
- [x] No LLVM runtime dependency
- [x] Subprocess approach works
- [x] One-click model download
- [x] Progress indicator works
- [x] Clear error messages
- [x] No silent fallback
- [x] Injection pipeline intact
- [ ] whisper.exe bundled with app
- [ ] End-to-end testing complete

## Status

**Current**: Implementation complete, needs whisper.exe bundling and testing

**Next Steps**:
1. Build whisper.exe for Windows
2. Bundle with Tauri app
3. Test end-to-end transcription
4. Verify error handling
5. Test model download
6. Production release
