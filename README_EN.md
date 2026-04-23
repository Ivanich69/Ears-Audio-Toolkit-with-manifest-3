# Ears Audio Toolkit (Manifest V3 Port)

This directory contains an unofficial Manifest V3 compatibility port of the original Ears Audio Toolkit Chrome extension.

The original Manifest V2 package only works on recent Chrome versions when legacy MV2 support is forced with special flags. This port keeps the original UI and core audio processing logic, but adapts the extension to the Manifest V3 runtime model so it can run on current Chrome builds without relying on those flags.

## What changed

- `manifest.json` was converted to Manifest V3
- the old background model was replaced with a service worker (`sw.js`)
- an offscreen host (`offscreen.html`) is used for MV3-compatible audio processing
- the original EQ engine in `bg.js` was kept and reused
- the popup UI and overall workflow were preserved as closely as possible
- original branding, contact links, and donation links were intentionally kept

## Load unpacked

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select this `extension_payload` directory

## Notes

- This is a compatibility port, not a ground-up rewrite.
- This is not an official release from the original author.
- No build step is required. The folder is ready to load as an unpacked extension.
- If Chrome cannot create an offscreen document, the MV3 bridge can fall back to a hidden host window or pinned background tab so tab audio capture can still work.

## Files

- `manifest.json` - Manifest V3 extension manifest
- `sw.js` - service worker and MV3 bridge logic
- `offscreen.html` - offscreen host page
- `bg.js` - audio processing and EQ logic
- `popup.html`, `popup.js`, `popup.css` - popup UI

## Disclaimer

This port exists to keep the extension usable on modern Chrome versions. Before publishing a public fork, review the original extension's license and redistribution terms.
