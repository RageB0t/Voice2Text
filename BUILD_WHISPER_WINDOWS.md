# Building Whisper.cpp for Windows

## Quick Start

This guide shows how to build `whisper.exe` for bundling with Vanta Dictate.

## Prerequisites

### Required Software
1. **Visual Studio 2022** (Community Edition is free)
   - Download: https://visualstudio.microsoft.com/downloads/
   - During installation, select "Desktop development with C++"
   - This includes MSVC compiler and Windows SDK

2. **CMake** (3.15 or higher)
   - Download: https://cmake.org/download/
   - Choose "Windows x64 Installer"
   - During installation, select "Add CMake to system PATH"

3. **Git** (for cloning the repository)
   - Download: https://git-scm.com/download/win
   - Use default installation options

### Verify Installation
Open PowerShell and verify:
```powershell
cmake --version
# Should show: cmake version 3.x.x

git --version
# Should show: git version 2.x.x
```

## Build Steps

### 1. Clone Whisper.cpp Repository
```powershell
# Navigate to a working directory
cd C:\Temp

# Clone the repository
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
```

### 2. Create Build Directory
```powershell
mkdir build
cd build
```

### 3. Generate Visual Studio Project
```powershell
# Generate build files for Visual Studio 2022
cmake .. -G "Visual Studio 17 2022" -A x64

# This creates a Visual Studio solution file
```

### 4. Build Release Version
```powershell
# Build the Release configuration
cmake --build . --config Release

# This compiles whisper.cpp and creates the executable
# Takes 2-5 minutes depending on your CPU
```

### 5. Locate the Executable
The compiled executable will be at:
```
C:\Temp\whisper.cpp\build\bin\Release\main.exe
```

### 6. Rename and Copy
```powershell
# Rename to whisper.exe
Copy-Item "bin\Release\main.exe" "whisper.exe"

# Copy to your Vanta Dictate project
Copy-Item "whisper.exe" "C:\Path\To\VantaDictate\src-tauri\resources\whisper.exe"
```

## Alternative: Pre-built Binaries

If you don't want to build from source, you can download pre-built binaries:

### Option 1: GitHub Releases
1. Go to: https://github.com/ggerganov/whisper.cpp/releases
2. Download the latest Windows release (e.g., `whisper-bin-x64-windows.zip`)
3. Extract `main.exe`
4. Rename to `whisper.exe`
5. Copy to `src-tauri/resources/`

### Option 2: Build with MSYS2 (Advanced)
```bash
# Install MSYS2 from https://www.msys2.org/
# Open MSYS2 MinGW 64-bit terminal

pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-cmake make

git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
mkdir build && cd build
cmake .. -G "MinGW Makefiles"
cmake --build . --config Release
```

## Bundling with Tauri

### 1. Create Resources Directory
```powershell
# In your Vanta Dictate project root
cd src-tauri
mkdir resources
```

### 2. Copy whisper.exe
```powershell
Copy-Item "C:\Path\To\whisper.exe" "resources\whisper.exe"
```

### 3. Update tauri.conf.json
Edit `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "identifier": "com.vanta.dictate",
    "resources": [
      "resources/whisper.exe"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

### 4. Build Tauri App
```powershell
# From project root
npm run tauri build
```

The installer will include `whisper.exe` in the resources folder.

## Verification

### Test whisper.exe Locally
```powershell
# Create a test audio file (or use an existing WAV file)
# Test the executable
.\whisper.exe -m "C:\Path\To\ggml-base.bin" -f "test.wav" -nt -np -l en
```

Expected output:
```
whisper_init_from_file: loading model from 'ggml-base.bin'
...
[00:00:00.000 --> 00:00:05.000]  Your transcribed text here
```

### Test in Vanta Dictate
1. Build the app with bundled whisper.exe
2. Install on a test machine
3. Download a model via Settings
4. Test transcription with Ctrl+Shift+Space
5. Check logs for whisper.exe execution

## Troubleshooting

### CMake Not Found
```
Error: 'cmake' is not recognized as an internal or external command
```

**Solution**: Add CMake to PATH
1. Find CMake installation (usually `C:\Program Files\CMake\bin`)
2. Add to System PATH environment variable
3. Restart PowerShell

### Visual Studio Not Found
```
Error: Could not find Visual Studio
```

**Solution**: Install Visual Studio 2022 with C++ tools
1. Download Visual Studio 2022 Community
2. Run installer
3. Select "Desktop development with C++"
4. Install

### Build Fails with "LINK : fatal error"
```
LINK : fatal error LNK1181: cannot open input file
```

**Solution**: Clean and rebuild
```powershell
cd build
Remove-Item * -Recurse -Force
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
```

### whisper.exe Crashes
```
The application was unable to start correctly (0xc000007b)
```

**Solution**: Missing Visual C++ Redistributable
1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Install
3. Restart

### Large File Size
The `whisper.exe` might be 5-10 MB. This is normal and includes:
- Whisper inference engine
- GGML runtime
- Windows dependencies

To reduce size (optional):
```powershell
# Strip debug symbols (requires MSVC tools)
strip whisper.exe
```

## Performance Optimization

### Enable AVX2 (Faster on Modern CPUs)
```powershell
# When generating build files
cmake .. -G "Visual Studio 17 2022" -A x64 -DWHISPER_AVX2=ON
cmake --build . --config Release
```

### Enable OpenBLAS (Even Faster)
```powershell
# Install OpenBLAS first
# Then build with:
cmake .. -G "Visual Studio 17 2022" -A x64 -DWHISPER_OPENBLAS=ON
cmake --build . --config Release
```

### Enable CUDA (GPU Acceleration)
```powershell
# Requires NVIDIA GPU and CUDA Toolkit
cmake .. -G "Visual Studio 17 2022" -A x64 -DWHISPER_CUBLAS=ON
cmake --build . --config Release
```

## File Sizes

Expected sizes for `whisper.exe`:
- Basic build: ~5 MB
- With AVX2: ~5 MB
- With OpenBLAS: ~8 MB
- With CUDA: ~15 MB

## Distribution

### What to Include
When distributing Vanta Dictate:
1. ✅ `whisper.exe` (bundled in resources)
2. ✅ Visual C++ Redistributable (installer dependency)
3. ❌ Models (downloaded by user)
4. ❌ CUDA (optional, user installs if needed)

### Installer Size
- App without models: ~20-30 MB
- With whisper.exe: ~25-35 MB
- Models downloaded separately by user

## Testing Checklist

Before releasing:
- [ ] whisper.exe runs on Windows 10
- [ ] whisper.exe runs on Windows 11
- [ ] Works without CUDA (CPU only)
- [ ] Works with base model
- [ ] Works with small model
- [ ] Transcription is accurate
- [ ] Performance is acceptable
- [ ] No missing DLL errors
- [ ] Bundled correctly in installer
- [ ] Found by app at runtime

## Resources

- **Whisper.cpp GitHub**: https://github.com/ggerganov/whisper.cpp
- **CMake Download**: https://cmake.org/download/
- **Visual Studio**: https://visualstudio.microsoft.com/
- **VC++ Redistributable**: https://aka.ms/vs/17/release/vc_redist.x64.exe

## Quick Reference

```powershell
# Complete build script
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
Copy-Item "bin\Release\main.exe" "whisper.exe"

# Copy to Vanta Dictate
Copy-Item "whisper.exe" "C:\Path\To\VantaDictate\src-tauri\resources\whisper.exe"

# Build Tauri app
cd C:\Path\To\VantaDictate
npm run tauri build
```

## Success Criteria

✅ whisper.exe built successfully
✅ Runs on clean Windows machine
✅ No missing DLL errors
✅ Transcription works correctly
✅ Bundled with Tauri app
✅ Installer includes whisper.exe
✅ App finds whisper.exe at runtime

**Status**: Ready to build and bundle! 🚀
