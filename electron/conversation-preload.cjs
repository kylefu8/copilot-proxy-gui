const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('conversationAPI', {
  listSessions() {
    return ipcRenderer.invoke('copilot-proxy:invoke', { command: 'list_conversation_sessions' })
  },
  loadSession(sessionId) {
    return ipcRenderer.invoke('copilot-proxy:invoke', { command: 'load_conversation_session', payload: { sessionId } })
  },
  clearAll() {
    return ipcRenderer.invoke('copilot-proxy:invoke', { command: 'clear_conversations' })
  },
  onNewConversation(callback) {
    const listener = (_event, entry) => callback(entry)
    ipcRenderer.on('copilot-proxy:new-conversation', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:new-conversation', listener)
  },
  onThemeUpdate(callback) {
    const listener = (_event, theme) => callback(theme)
    ipcRenderer.on('copilot-proxy:theme-update', listener)
    return () => ipcRenderer.removeListener('copilot-proxy:theme-update', listener)
  },
})
