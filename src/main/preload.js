const { contextBridge, ipcRenderer } = require('electron');
// NOTE: exposes limited IPC bridge for renderer

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, listener) => ipcRenderer.on(channel, listener)
});
