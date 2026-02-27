import { getRuntime, invokeDesktop } from './tauri-adapter'

const state = {
  status: 'idle',
  pid: null,
  lastError: null,
}

export async function startService(args, modelName) {
  state.lastError = null

  try {
    const runtime = getRuntime()

    if (runtime !== 'web') {
      const result = await invokeDesktop('service_start', { args, modelName })
      state.status = 'running'
      state.pid = result?.pid ?? null
      return { ok: true, ...result }
    }

    state.status = 'running'
    return {
      ok: true,
      pid: null,
      note: `Web preview mode. Run in terminal: bun run src/main.ts ${args.join(' ')}`,
    }
  }
  catch (error) {
    state.status = 'error'
    state.lastError = String(error)
    return {
      ok: false,
      error: String(error),
    }
  }
}

export async function stopService() {
  state.lastError = null

  try {
    if (getRuntime() !== 'web')
      await invokeDesktop('service_stop')

    state.status = 'stopped'
    state.pid = null

    return { ok: true }
  }
  catch (error) {
    state.status = 'error'
    state.lastError = String(error)
    return {
      ok: false,
      error: String(error),
    }
  }
}

export function getServiceState() {
  return {
    ...state,
    runtime: getRuntime(),
  }
}

/** Called when service was started externally (e.g. from tray menu) */
export function markServiceRunning() {
  state.status = 'running'
  state.lastError = null
}

/** Called when service was stopped externally (e.g. from tray menu) */
export function markServiceStopped() {
  state.status = 'stopped'
  state.pid = null
  state.lastError = null
}

// ─── Auth ───────────────────────────────────────────────────────────

export async function getAuthStatus() {
  const runtime = getRuntime()

  if (runtime === 'web') {
    return {
      runtime,
      supported: false,
      hasToken: false,
      tokenPath: null,
      message: 'Web mode cannot read local token file.',
    }
  }

  const result = await invokeDesktop('auth_status')
  return {
    runtime,
    supported: true,
    ...result,
  }
}

/**
 * Start GitHub device code flow.
 * Returns { user_code, verification_uri, device_code, interval, expires_in }
 * Also opens the verification URL in the default browser.
 */
export async function startDeviceCodeAuth(payload) {
  const runtime = getRuntime()

  if (runtime === 'web') {
    throw new Error('Device code auth requires desktop runtime (Electron).')
  }

  return invokeDesktop('auth_device_code_start', payload)
}

/**
 * Get service log lines from Electron main process buffer.
 */
export async function getServiceLogs() {
  const runtime = getRuntime()

  if (runtime === 'web') {
    return { lines: ['[Web mode: logs only available in desktop runtime]'] }
  }

  return invokeDesktop('service_logs')
}

/**
 * Resize the Electron window.
 */
export async function resizeWindow(width, height) {
  const runtime = getRuntime()
  if (runtime === 'web') return
  return invokeDesktop('resize_window', { width, height })
}

/**
 * Auto-detect account type (individual/business/enterprise)
 * by probing each Copilot API base URL.
 */
export async function detectAccountType() {
  const runtime = getRuntime()
  if (runtime === 'web') {
    return { detected: false, error: 'Requires desktop runtime' }
  }
  return invokeDesktop('detect_account_type')
}

/**
 * Launch Claude Code in a new terminal window with Copilot Proxy env vars.
 */
export async function launchClaudeCode(port, model, smallModel) {
  const runtime = getRuntime()
  if (runtime === 'web') {
    return { ok: false, error: 'Requires desktop runtime' }
  }
  return invokeDesktop('launch_claude_code', { port, model, smallModel })
}

/**
 * Write Claude Code env vars to Windows user-level environment.
 */
export async function writeClaudeEnv(port, model, smallModel) {
  const runtime = getRuntime()
  if (runtime === 'web') return { ok: false }
  return invokeDesktop('write_claude_env', { port, model, smallModel })
}

/**
 * Clear Claude Code env vars from Windows user-level environment.
 */
export async function clearClaudeEnv() {
  const runtime = getRuntime()
  if (runtime === 'web') return { ok: false }
  return invokeDesktop('clear_claude_env')
}

/**
 * Check if Claude Code env vars are written.
 */
export async function checkClaudeEnv() {
  const runtime = getRuntime()
  if (runtime === 'web') return { written: false }
  return invokeDesktop('check_claude_env')
}

/**
 * Delete the saved GitHub token file.
 */
export async function deleteToken() {
  const runtime = getRuntime()
  if (runtime === 'web') return
  return invokeDesktop('delete_token')
}

/**
 * Fetch available models directly from Copilot API using stored GitHub token.
 * Does not require the proxy service to be running.
 */
export async function fetchModelsFromCopilot(accountType) {
  const runtime = getRuntime()
  if (runtime === 'web') {
    throw new Error('Requires desktop runtime (Electron).')
  }
  return invokeDesktop('fetch_models', { accountType })
}
