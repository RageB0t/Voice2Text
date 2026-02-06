# Updater Quick Reference

## One-Time Setup (Do Once)

```bash
# 1. Generate keys
npm run tauri signer generate -- -w ~/.tauri/myapp.key

# 2. Copy public key from output to tauri.conf.json
# 3. Update endpoint URL in tauri.conf.json
# 4. Add *.key to .gitignore
```

## Every Release (Repeat for Each Version)

```bash
# 1. Update version in tauri.conf.json
# Example: "version": "0.2.0"

# 2. Build
npm run tauri build

# 3. Sign
npm run tauri signer sign "src-tauri/target/release/bundle/nsis/Vanta Dictate_0.2.0_x64-setup.exe" -k ~/.tauri/myapp.key

# 4. Zip (Windows)
Compress-Archive -Path "src-tauri/target/release/bundle/nsis/Vanta Dictate_0.2.0_x64-setup.exe" -DestinationPath "Vanta.Dictate_0.2.0_x64-setup.nsis.zip"

# 5. Get signature
Get-Content "src-tauri/target/release/bundle/nsis/Vanta Dictate_0.2.0_x64-setup.exe.sig"

# 6. Update updater.json
{
  "version": "0.2.0",
  "notes": "What's new in this version",
  "pub_date": "2024-02-05T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "PASTE_SIGNATURE_HERE",
      "url": "https://github.com/USER/REPO/releases/download/v0.2.0/Vanta.Dictate_0.2.0_x64-setup.nsis.zip"
    }
  }
}

# 7. Upload to GitHub Releases
# - Create new release with tag v0.2.0
# - Upload the .nsis.zip file
# - Copy download URL

# 8. Commit and push updater.json
git add updater.json
git commit -m "Release v0.2.0"
git push
```

## User Experience

1. **App launches** → Checks for updates silently
2. **Update found** → Badge appears in About tab
3. **User clicks** → Downloads with progress bar
4. **Download complete** → App restarts automatically

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to check for updates" | Verify endpoint URL is accessible |
| "Signature verification failed" | Re-sign with correct private key |
| "Download failed" | Check URL is publicly accessible |
| Update not detected | Ensure version in updater.json > current version |

## File Locations

- **Private Key**: `~/.tauri/myapp.key` (keep secret!)
- **Public Key**: In `tauri.conf.json`
- **Updater Manifest**: `updater.json` (in repo root)
- **Installer**: `src-tauri/target/release/bundle/nsis/*.exe`
- **Signature**: `src-tauri/target/release/bundle/nsis/*.exe.sig`

## Security Checklist

- [ ] Private key stored securely (not in git)
- [ ] Public key in tauri.conf.json
- [ ] Endpoint uses HTTPS
- [ ] Installer signed before publishing
- [ ] Signature verified in updater.json
- [ ] Download URL publicly accessible

## GitHub Actions (Optional Automation)

See `UPDATER_SETUP.md` for GitHub Actions workflow to automate:
- Building
- Signing
- Creating releases
- Updating updater.json

---

**Quick Start**: See `UPDATER_SETUP.md` for detailed instructions
**Implementation**: See `UPDATER_IMPLEMENTATION.md` for technical details
