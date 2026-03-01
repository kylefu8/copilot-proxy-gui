const { contextBridge, ipcRenderer } = require('electron')

// Read version passed from main process via additionalArguments
// (cannot use require('../package.json') in sandboxed preload)
const appVersion = (process.argv.find(a => a.startsWith('--app-version=')) || '').split('=')[1] || '0.0.0'

contextBridge.exposeInMainWorld('copilotProxyDesktop', {
  appVersion,
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
