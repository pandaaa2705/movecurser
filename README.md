# MoveCursor (Windows 10/11, 64-bit)

MoveCursor displays a virtual pointer inside a user-drawn Chrome page region. It does not move the operating-system mouse or type. The extension sends synthetic pointer and mouse events to page elements, and its optional click mode invokes DOM clicks; websites that require trusted physical mouse input may ignore these events.

## Build the Windows installer

Install a current Node.js LTS/npm on the **build machine** (end users do not need Node.js), then in this folder run `npm install` and `npm run pack:win`. The installer is written to `release/MoveCursor-Setup.exe`. Electron embeds its own Node runtime and the WebSocket server dependencies. The Windows NSIS installer offers per-user installation, shortcuts, and normal uninstall.

This source tree targets Windows x64 only. The generated installer is unsigned; Windows may show a publisher warning until you sign it with your organization’s code-signing certificate. Complete the Windows 10/11 and Chrome acceptance checks before distributing it broadly.

## Install

1. Run `MoveCursor-Setup.exe`; choose the install folder if desired.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select the `extension` folder from this project or the installed app's `resources/extension` folder. Keep that folder in place.
4. Open MoveCursor Desktop and press **START**.
5. In the extension popup, paste the pairing code shown in the desktop dashboard and choose **CONNECT DESKTOP**. The extension stores the code for automatic reconnection.

## Use

1. Open the target page and click the MoveCursor toolbar icon.
2. Choose **DRAW BOX**, then drag on the page. Press Escape to cancel.
3. Leave **Click new page targets continuously** checked to click each page target the virtual cursor reaches once per movement run, or uncheck it to move without clicking. DOM clicks can activate controls, follow links, or submit forms. A website that requires trusted physical mouse input may not respond.
4. Choose **START MOVEMENT**. Adjust travel, pause, and cursor size values before starting if desired.
5. Choose **STOP MOVEMENT** to stop both movement and repeated clicks while preserving the region, or **CLEAR SELECTION** to remove it.
6. Press **STOP** in the desktop app to stop all connected tabs and close the local service. RESTART reinitializes the service.

The service binds only to `127.0.0.1:17391`. A fresh random pairing token is created for each server start. After a restart, paste the newly displayed code into the extension again. Connection uses WebSocket.

## Project layout

- `desktop/` Electron dashboard, service lifecycle, and local WebSocket server.
- `extension/` Chrome Manifest V3 popup, background worker, content script and virtual cursor engine.
- `shared/` protocol resources (reserved for shared protocol definitions).
- `tests/` Node test suite location.

## Test and known limitations

Run `npm test` for automated checks. See `TEST-REPORT.md` for the actual Chrome/Hotstar check and remaining Windows packaging checks. The extension permissions and connection handshake are deliberately local-only.
