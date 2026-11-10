const { app, BrowserWindow, ipcMain } = require('electron');
const { WebSocketServer, WebSocket } = require('ws');
const crypto = require('node:crypto');

let win;
let wss;
let token;
const clients = new Set();
const send = (channel, data) => win?.webContents.send(channel, data);
function broadcast(message) {
  for (const ws of clients) if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
function startServer() {
  if (wss) return { running: true, connections: clients.size };
  token = crypto.randomBytes(24).toString('hex');
  wss = new WebSocketServer({ host: '127.0.0.1', port: 17391, maxPayload: 8192, verifyClient: ({ req }, done) => {
    const origin = req.headers.origin;
    const okOrigin = !origin || origin.startsWith('chrome-extension://'); // extension origin plus pairing token
    done(okOrigin && req.headers['sec-websocket-protocol'] === `movecursor, ${token}`);
  }});
  wss.on('connection', ws => {
    clients.add(ws); send('status', { running: true, connections: clients.size });
    ws.send(JSON.stringify({ type: 'SERVER_READY' }));
    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw.toString()); } catch { return ws.close(1003, 'Invalid JSON'); }
      if (!m || typeof m.type !== 'string' || m.type.length > 40) return;
      if (m.type === 'EXTENSION_CONNECTED') send('log', 'Chrome extension connected');
      if (m.type === 'ENGINE_STATUS') send('engine', Boolean(m.running));
    });
    ws.on('close', () => { clients.delete(ws); send('status', { running: Boolean(wss), connections: clients.size }); });
    ws.on('error', () => {});
  });
  wss.on('listening', () => { send('status', { running: true, connections: 0 }); send('log', 'Local server started on 127.0.0.1:17391'); });
  wss.on('error', e => { send('error', e.message); wss = null; });
  return { running: true, connections: 0, token };
}
async function stopServer() {
  if (!wss) return;
  broadcast({ type: 'SERVER_STOPPING' });
  for (const ws of clients) ws.close(1001, 'Desktop stopped');
  const server = wss; wss = null; clients.clear();
  await new Promise(resolve => server.close(resolve));
  send('status', { running: false, connections: 0 }); send('engine', false); send('log', 'Local server stopped');
}
function createWindow() {
  win = new BrowserWindow({ width: 900, height: 660, minWidth: 720, minHeight: 560, backgroundColor: '#0c1018', title: 'MoveCursor', webPreferences: { preload: require('node:path').join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.loadFile(require('node:path').join(__dirname, 'index.html'));
}
app.whenReady().then(createWindow);
ipcMain.handle('server:start', startServer);
ipcMain.handle('server:stop', stopServer);
ipcMain.handle('server:restart', async () => { await stopServer(); return startServer(); });
app.on('before-quit', e => { if (wss) { e.preventDefault(); stopServer().finally(() => app.exit(0)); } });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
