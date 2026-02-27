const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('copilotProxyDesktop', {
  invoke(command, payload = {}) {
    return ipcRenderer.invoke('copilot-proxy:invoke', {
      command,
      payload,
    })
  },
  onCloseRequested(callback) {
    const listener = () => callback()
    ipcRenderer.on('copilot-proxy:close-requested', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:close-requested', listener)
  },
  onServiceStateChanged(callback) {
    const onStarted = () => callback('started')
    const onStopped = () => callback('stopped')
    ipcRenderer.on('copilot-proxy:service-started', onStarted)
    ipcRenderer.on('copilot-proxy:service-stopped', onStopped)
    return () => {
      ipcRenderer.removeListener('copilot-proxy:service-started', onStarted)
      ipcRenderer.removeListener('copilot-proxy:service-stopped', onStopped)
    }
  },
  onTriggerStart(callback) {
    const listener = () => callback()
    ipcRenderer.on('copilot-proxy:trigger-start', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:trigger-start', listener)
  },
})
