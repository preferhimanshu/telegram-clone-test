# Telegram Desktop Clone (Electron App)

This folder contains the complete desktop application packaging configuration for Telegram Clone.
It connects to the same backend, Cloud SQL PostgreSQL database, and Firebase Authentication as the web app.

## Running in Development
```bash
# From workspace root:
npm run dev

# In another terminal:
cd desktop
npm install
npm start
```

## Building Desktop Installers

### Windows Installer (NSIS .exe):
```bash
npm run dist:win
```
The output installer will be located in `desktop/dist-electron/Telegram Desktop Setup 1.0.0.exe`.

### macOS DMG:
```bash
npm run dist:mac
```

### Linux AppImage / Deb:
```bash
npm run dist:linux
```
