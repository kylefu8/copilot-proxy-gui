export async function invokeDesktop(command, payload = {}) {
  const tauri = window.__TAURI__
  if (tauri?.core?.invoke) {
    return tauri.core.invoke(command, payload)
  }

  const electron = window.copilotProxyDesktop
  if (electron?.invoke) {
    return electron.invoke(command, payload)
  }

  return null
}

export function getRuntime() {
  if (window.__TAURI__?.core?.invoke)
    return 'tauri'

  if (window.copilotProxyDesktop?.invoke)
    return 'electron'

  return 'web'
}
