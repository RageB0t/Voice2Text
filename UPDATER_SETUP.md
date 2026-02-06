# Tauri Updater Setup Guide

## Overview
The app now includes automatic update functionality using Tauri's built-in updater plugin.

## Features Implemented
✅ Silent update checking on app launch
✅ Non-blocking UI with update badge
✅ Download progress indicator
✅ Automatic restart after update
✅ Graceful error handling

## Setup Instructions

### 1. Generate Signing Keys

Updates must be signed for security. Generate a keypair:

```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

This creates:
- Private key: `~/.tauri/myapp.key` (keep secret!)
- Public key: Printed to console

### 2. Configure Public Key

Copy the public key from the console output and update `tauri.conf.json`:

```json
"plugins": {
  "updater": {
    "pubkey": "YOUR_PUBLIC_KEY_HERE"
  }
}
```

### 3. Configure Update Endpoint

Update the endpoint URL in `tauri.conf.json`:

```json
"plugins": {
  "updater": {
    "endpoints": [
      "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/updater.json"
    ]
  }
}
```

Options:
- **GitHub Releases**: Host `updater.json` in your repo
- **Custom Server**: Host on your own CDN/server
- **Multiple Endpoints**: Add fallback URLs

### 4. Build and Sign Release

Build your app:

```bash
npm run tauri build
```

Sign the installer:

```bash
npm run tauri signer sign path/to/installer.exe -k ~/.tauri/myapp.key
```

This generates a `.sig` file with the signature.

### 5. Create updater.json

Create/update `updater.json` with release info:

```json
{
  "version": "0.2.0",
  "notes": "Bug fixes and improvements",
  "pub_date": "2024-02-05T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "PASTE_SIGNATURE_HERE",
      "url": "https://github.com/USER/REPO/releases/download/v0.2.0/installer.nsis.zip"
    }
  }
}
```

**Important**: 
- The installer must be in a `.zip` file
- The signature comes from the `.sig` file
- The URL must be publicly accessible

### 6. Publish Update

1. Zip your signed installer:
   ```bash
   zip Vanta.Dictate_0.2.0_x64-setup.nsis.zip Vanta\ Dictate_0.2.0_x64-setup.exe
   ```

2. Upload to GitHub Releases or your server

3. Update `updater.json` with:
   - New version number
   - Signature from `.sig` file
   - Public download URL

4. Commit and push `updater.json` to your repo

## How It Works

### User Experience
1. App launches → Silently checks for updates in background
2. If update available → Badge appears in About tab
3. User clicks "Download & Restart" → Progress bar shows download
4. Download complete → App automatically restarts with new version

### Technical Flow
1. `check()` - Queries updater endpoint for latest version
2. Compares with current version in `tauri.conf.json`
3. If newer version exists, downloads installer
4. Verifies signature using public key
5. Installs update and relaunches app

## Testing Updates

### Local Testing
1. Build version 0.1.0
2. Install it
3. Change version to 0.2.0 in `tauri.conf.json`
4. Build version 0.2.0
5. Sign and create `updater.json`
6. Host `updater.json` locally or on GitHub
7. Run version 0.1.0 → Should detect 0.2.0 update

### Production Checklist
- [ ] Private key stored securely (never commit!)
- [ ] Public key in `tauri.conf.json`
- [ ] Endpoint URL configured
- [ ] Installer signed with private key
- [ ] Installer zipped
- [ ] Signature in `updater.json`
- [ ] Download URL publicly accessible
- [ ] `updater.json` published

## Security Notes

⚠️ **Never commit your private key!**
- Add `*.key` to `.gitignore`
- Store private key securely (password manager, secrets vault)
- Only use private key on trusted build machines

✅ **Signature verification**
- Tauri automatically verifies signatures
- Invalid signatures are rejected
- Prevents malicious updates

## Troubleshooting

### "Failed to check for updates"
- Check endpoint URL is accessible
- Verify `updater.json` format is correct
- Check network connectivity

### "Signature verification failed"
- Ensure public key in config matches private key used for signing
- Verify signature in `updater.json` is correct
- Re-sign installer if needed

### "Download failed"
- Verify download URL is publicly accessible
- Check file is zipped correctly
- Ensure file size isn't too large for hosting

## GitHub Actions (Optional)

Automate signing and publishing:

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run tauri build
      - name: Sign
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
        run: |
          echo "$TAURI_PRIVATE_KEY" > private.key
          npm run tauri signer sign target/release/bundle/nsis/*.exe -k private.key
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            target/release/bundle/nsis/*.zip
            target/release/bundle/nsis/*.sig
```

Store private key in GitHub Secrets as `TAURI_PRIVATE_KEY`.

## References
- [Tauri Updater Docs](https://v2.tauri.app/plugin/updater/)
- [Signing Guide](https://v2.tauri.app/plugin/updater/#signing-updates)
