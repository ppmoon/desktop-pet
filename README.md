# Desktop Pet

Tauri + React + TypeScript desktop pet with extensible command palette.

## Features

- Alt+Space global shortcut to summon command palette
- Micro-kernel extension system (file search, pet switcher, etc.)
- Cross-platform: Windows, macOS, Linux
- Compatible with petdex spritesheet format

## Install

Download the latest build from [GitHub Actions](https://github.com/ppmoon/desktop-pet/actions) artifacts.

### macOS

After downloading the DMG, drag the app to `/Applications`, then remove the quarantine attribute:

```bash
xattr -cr "/Applications/Desktop Pet.app"
```

This is required because the app is not notarized (requires a paid Apple Developer account).

### Windows

Run the MSI installer directly.

### Linux

Make the AppImage executable and run:

```bash
chmod +x desktop-pet_amd64.AppImage
./desktop-pet_amd64.AppImage
```

Requires `libwebkit2gtk-4.1`.

## Development

```bash
bun install
npm run tauri dev
```

## Adding Pets

Place petdex-compatible pet folders in `~/.pet/pets/<pet-id>/`:

```
~/.pet/pets/<pet-id>/
├── pet.json
└── spritesheet.webp (or .png)
```
