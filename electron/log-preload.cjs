const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('logViewerAPI', {
  onLogUpdate(callback) {
    const listener = (_event, lines) => callback(lines)
    ipcRenderer.on('copilot-proxy:log-update', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:log-update', listener)
  },
  onThemeUpdate(callback) {
    const listener = (_event, theme) => callback(theme)
    ipcRenderer.on('copilot-proxy:theme-update', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:theme-update', listener)
  },
})
