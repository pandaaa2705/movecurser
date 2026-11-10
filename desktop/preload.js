const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('moveCursor', {
  start: () => ipcRenderer.invoke('server:start'), stop: () => ipcRenderer.invoke('server:stop'), restart: () => ipcRenderer.invoke('server:restart'),
  onStatus: cb => ipcRenderer.on('status', (_, v) => cb(v)), onLog: cb => ipcRenderer.on('log', (_, v) => cb(v)), onError: cb => ipcRenderer.on('error', (_, v) => cb(v)), onEngine: cb => ipcRenderer.on('engine', (_, v) => cb(v))
});
