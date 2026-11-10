# MoveCursor test report

## Status

Windows x64 installer generated successfully and the app/extension are installed on this Windows system. Automated extension-engine checks pass. A live Hotstar check confirmed the extension opens and draws a selection box around the Quality control, but the desktop server was stopped, so movement, click activation of the Quality menu, and the full server lifecycle remain unverified.

| Check | Result | Notes |
|---|---|---|
| Windows NSIS x64 installer | Passed | `release/MoveCursor-Setup.exe`; unsigned, per-user install flow configured |
| Installed app executable | Packaged | `release/win-unpacked/MoveCursor.exe` |
| Bundled Chrome extension | Packaged | `release/win-unpacked/resources/extension/` |
| Electron app and local WebSocket server | Packaged | `resources/app.asar`; Electron contains bundled Node runtime and `ws` dependency |
| Bundle contents inspection | Passed | Confirmed desktop main/preload/UI files and `node_modules/ws` inside `app.asar`; unpacked extension directory copied to app `resources/extension/` |
| Continuous page-click option | Implemented | Optional popup checkbox (enabled by default); each newly reached DOM target is clicked once per movement run to avoid repeatedly toggling the same menu; STOP cancels the timer |
| Extension popup on JioHotstar | Partial | Popup opened and site access was granted; during the movement attempt it reported that the desktop server was not running |
| Box selection around Quality control | Passed | Drew and observed a green selection rectangle around the Quality control on the Rushi profile's Fifty Shades Freed player |
| Random movement and Quality menu activation by the virtual cursor | Blocked | Popup reported “MoveCursor Desktop is not running”; no virtual-movement test was possible. The visible menu under native pointer hover does not confirm virtual cursor activation. |
| Updated installed app | Passed | Updated NSIS installer applied; installed app relaunched; extension popup includes the click setting |
| Desktop extension copy | Updated | `C:\Users\namra\OneDrive\Desktop\MoveCursor Extension` |
| JavaScript syntax and project JSON | Passed | Desktop/extension JavaScript parsed by the available Node runtime; package and extension manifest JSON parsed |
| Dependency installation | Passed | 406 packages installed; npm reported 18 audit findings (4 moderate, 13 high, 1 critical) |
| Electron dashboard and server lifecycle | Implemented, pending Windows execution | Starts localhost WebSocket server in Electron bundled Node runtime |
| Extension connection / pairing | Partial | Chrome popup reports a live connection when the desktop server is running; server was stopped during the Hotstar movement attempt |
| Box selection / random movement | Partial | Box selection works on Hotstar. Movement and DOM clicks require the desktop server to be started in MoveCursor |
| Stop, restart, shutdown, uninstall | Pending Windows acceptance test | Verify process cleanup and server close |

## Windows acceptance checklist

On Windows 10/11 x64, install the generated NSIS installer, load `extension/` unpacked in Chrome, exercise START, connection, drawing, movement, stop, restart, app exit and uninstall. Confirm no mouse movement or synthetic input events occur. Record OS build, Chrome version, installer version, and results before release.
