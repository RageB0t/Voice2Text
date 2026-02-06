# Tauri Resources Directory

## whisper.exe

This directory should contain `whisper.exe` - the Whisper.cpp executable for Windows.

### How to Obtain whisper.exe

**Option 1: Download Pre-built Binary (Easiest)**
1. Go to: https://sourceforge.net/projects/whisper-cpp.mirror/files/v1.8.3/
2. Download `whisper-bin-x64.zip` (4.0 MB)
3. Extract the archive
4. Find `main.exe` inside
5. Rename to `whisper.exe`
6. Place here: `src-tauri/resources/whisper.exe`

**Option 2: Build from Source**
```powershell
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
mkdir build && cd build
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
# Copy build/bin/Release/main.exe to src-tauri/resources/whisper.exe
```

### Verification

After placing whisper.exe here, verify it works:
```powershell
.\whisper.exe --help
```

You should see Whisper.cpp help output.

### File Size

Expected size: ~3-5 MB (CPU-only build)

### Required for

- Production transcription
- Offline speech-to-text
- No LLVM dependency

### Not Required for

- Development with Mock provider
- Injection Test Mode
- UI testing

## After Adding whisper.exe

1. Build the app: `npm run tauri build`
2. The installer will include whisper.exe
3. Users can download models and use Whisper transcription
