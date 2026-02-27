const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const https = require('node:https')
const { spawn, spawnSync } = require('node:child_process')
const { app, BrowserWindow, ipcMain, shell, dialog, Menu, Tray, nativeImage, safeStorage } = require('electron')

/**
 * Make an HTTPS POST request using Node.js's native https module.
 * This bypasses Electron's net.fetch (which uses Chromium's network stack)
 * to avoid potential caching / session-cookie / redirect quirks in packaged apps.
 */
function httpsPost(url, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const data = JSON.stringify(body)
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'content-length': Buffer.byteLength(data),
          ...extraHeaders,
        },
      },
      (res) => {
        let buf = ''
        res.on('data', (chunk) => (buf += chunk))
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300
          let json = null
          try { json = JSON.parse(buf) } catch { /* ignore */ }
          resolve({ ok, status: res.statusCode, json, raw: buf })
        })
      },
    )
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

/**
 * Make an HTTPS GET request using Node.js's native https module.
 */
function httpsGet(url, headers, timeoutMs) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...headers,
        },
      },
      (res) => {
        let buf = ''
        res.on('data', (chunk) => (buf += chunk))
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300
          let json = null
          try { json = JSON.parse(buf) } catch { /* ignore */ }
          resolve({ ok, status: res.statusCode, json, raw: buf })
        })
      },
    )
    if (timeoutMs) {
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`Request timed out after ${timeoutMs}ms`))
      })
    }
    req.on('error', reject)
    req.end()
  })
}

const isPackaged = app.isPackaged
// Locate proxy source: submodule (copilot-proxy/) or monorepo (../../)
function findRepoRoot() {
  const submodule = path.resolve(__dirname, '..', 'copilot-proxy')
  if (fs.existsSync(path.join(submodule, 'src', 'main.ts'))) return submodule
  const mono = path.resolve(__dirname, '..', '..', '..')
  if (fs.existsSync(path.join(mono, 'src', 'main.ts'))) return mono
  return null
}
const repoRoot = isPackaged ? null : findRepoRoot()
const preloadPath = path.resolve(__dirname, 'preload.cjs')

let mainWin = null
let tray = null
let isQuitting = false

const GITHUB_BASE_URL = 'https://github.com'
const GITHUB_CLIENT_ID = 'Iv1.b507a08c87ecfe98'
const GITHUB_APP_SCOPES = 'read:user'

let serviceChild = null
const MAX_LOG_LINES = 500
let serviceLogs = []
let lastServicePayload = null   // remembered for tray "Start" action
let lastModelName = ''          // model name shown in tray tooltip

// Token & config are stored under Electron's userData directory:
//   Windows:  %APPDATA%/copilot-proxy-gui/
//   macOS:    ~/Library/Application Support/copilot-proxy-gui/
//   Linux:    ~/.config/copilot-proxy-gui/
function githubTokenDir() {
  return app.getPath('userData')
}

// Legacy path used by CLI and older GUI versions
function legacyTokenDir() {
  return path.join(os.homedir(), '.local', 'share', 'copilot-proxy')
}

function githubTokenPath() {
  return path.join(githubTokenDir(), 'github_token')
}

function legacyTokenPath() {
  return path.join(legacyTokenDir(), 'github_token')
}

function ensureTokenDir() {
  const dir = githubTokenDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ─── Platform-aware process kill ────────────────────────────────────

function killServiceProcess(child) {
  if (!child || !child.pid) return
  if (process.platform === 'win32') {
    // On Windows, child.kill() only terminates the direct process.
    // Use taskkill /T to kill the entire process tree.
    try {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'])
    } catch (e) {
      console.warn('taskkill failed, falling back to child.kill():', e)
      child.kill()
    }
  } else {
    child.kill('SIGTERM')
  }
}

// ─── Token storage (encrypted via Electron safeStorage) ─────────────

function readToken() {
  const encPath = githubTokenPath() + '.enc'
  const plainPath = githubTokenPath()

  // Try encrypted file first (new location)
  if (fs.existsSync(encPath)) {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encrypted token found but safeStorage unavailable')
      if (fs.existsSync(plainPath)) {
        return fs.readFileSync(plainPath, 'utf8').trim()
      }
      return ''
    }
    try {
      const encBuf = fs.readFileSync(encPath)
      return safeStorage.decryptString(encBuf)
    } catch (e) {
      console.warn('Failed to decrypt token:', e)
      return ''
    }
  }

  // Try plaintext in new location
  if (fs.existsSync(plainPath)) {
    const token = fs.readFileSync(plainPath, 'utf8').trim()
    if (token && safeStorage.isEncryptionAvailable()) {
      try {
        ensureTokenDir()
        const enc = safeStorage.encryptString(token)
        fs.writeFileSync(encPath, enc)
        fs.unlinkSync(plainPath)
      } catch (e) {
        console.warn('Token migration to encrypted storage failed:', e)
      }
    }
    return token
  }

  // Migrate from legacy path (~/.local/share/copilot-proxy/)
  const legacyEnc = legacyTokenPath() + '.enc'
  const legacyPlain = legacyTokenPath()

  let legacyToken = ''
  if (fs.existsSync(legacyEnc) && safeStorage.isEncryptionAvailable()) {
    try {
      legacyToken = safeStorage.decryptString(fs.readFileSync(legacyEnc))
    } catch (e) {
      console.warn('Failed to decrypt legacy token:', e)
    }
  }
  if (!legacyToken && fs.existsSync(legacyPlain)) {
    legacyToken = fs.readFileSync(legacyPlain, 'utf8').trim()
  }

  if (legacyToken) {
    // Save to new location and clean up legacy files
    writeToken(legacyToken)
    try {
      if (fs.existsSync(legacyEnc)) fs.unlinkSync(legacyEnc)
      if (fs.existsSync(legacyPlain)) fs.unlinkSync(legacyPlain)
    } catch (e) {
      console.warn('Failed to clean up legacy token files:', e)
    }
    return legacyToken
  }

  return ''
}

function writeToken(token) {
  ensureTokenDir()
  if (safeStorage.isEncryptionAvailable()) {
    try {
      const enc = safeStorage.encryptString(token)
      fs.writeFileSync(githubTokenPath() + '.enc', enc)
      // Remove any leftover plaintext file
      const plainPath = githubTokenPath()
      if (fs.existsSync(plainPath)) fs.unlinkSync(plainPath)
      return
    } catch (e) {
      console.warn('Failed to encrypt token, falling back to plaintext:', e)
    }
  }
  fs.writeFileSync(githubTokenPath(), token, 'utf8')
}

function deleteTokenFile() {
  // New location
  const encPath = githubTokenPath() + '.enc'
  const plainPath = githubTokenPath()
  if (fs.existsSync(encPath)) fs.unlinkSync(encPath)
  if (fs.existsSync(plainPath)) fs.unlinkSync(plainPath)
  // Legacy location
  const legacyEnc = legacyTokenPath() + '.enc'
  const legacyPlain = legacyTokenPath()
  if (fs.existsSync(legacyEnc)) fs.unlinkSync(legacyEnc)
  if (fs.existsSync(legacyPlain)) fs.unlinkSync(legacyPlain)
}

function resolveBunExecutable() {
  const candidates = ['bun']

  if (process.env.USERPROFILE) {
    candidates.push(path.join(process.env.USERPROFILE, '.bun', 'bin', 'bun.exe'))
    candidates.push(path.join(process.env.USERPROFILE, '.bun', 'bin', 'bun'))
  }

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], {
      stdio: 'pipe',
      shell: false,
    })

    if (result.status === 0) {
      return {
        bin: candidate,
        version: String(result.stdout).trim(),
      }
    }
  }

  return null
}

// ─── Service management ──────────────────────────────────────────────

function serviceStart(payload) {
  if (serviceChild) {
    return {
      pid: serviceChild.pid,
      alreadyRunning: true,
    }
  }

  const args = Array.isArray(payload?.args) ? [...payload.args] : ['start', '--port', '4399']

  // Inject decrypted token so the CLI doesn't need to read the (now encrypted) token file
  const token = readToken()
  if (token && !args.includes('--github-token')) {
    args.push('--github-token', token)
  }

  // Remember payload & model for tray "Start" replay and tooltip
  lastServicePayload = payload
  if (payload?.modelName) lastModelName = payload.modelName

  serviceLogs = []

  if (isPackaged) {
    // Check for bundled standalone proxy exe first (full build)
    const proxyExe = path.join(process.resourcesPath, 'copilot-proxy-server.exe')
    if (fs.existsSync(proxyExe)) {
      serviceChild = spawn(
        proxyExe,
        args,
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: false,
        },
      )
    } else {
      throw new Error('Bundled proxy server not found at: ' + proxyExe + '\nPlease rebuild with: npm run desktop:build')
    }
  } else {
    // Dev mode: use bun to run source
    const bunInfo = resolveBunExecutable()
    if (!bunInfo) {
      throw new Error('bun not found in PATH or %USERPROFILE%/.bun/bin')
    }
    serviceChild = spawn(
      bunInfo.bin,
      ['run', 'src/main.ts', ...args],
      {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: false,
      },
    )
  }

  function pushLog(line) {
    serviceLogs.push(line)
    if (serviceLogs.length > MAX_LOG_LINES) {
      serviceLogs = serviceLogs.slice(-MAX_LOG_LINES)
    }
  }

  serviceChild.stdout.on('data', (chunk) => {
    String(chunk).split('\n').filter(Boolean).forEach(pushLog)
  })

  serviceChild.stderr.on('data', (chunk) => {
    String(chunk).split('\n').filter(Boolean).forEach(pushLog)
  })

  serviceChild.once('exit', (code) => {
    pushLog(`[process exited with code ${code}]`)
    const wasRunning = !!serviceChild
    serviceChild = null
    updateTrayStatus()
    // Only notify renderer if this was an unexpected exit (not from serviceStop())
    // serviceStop() sets serviceChild = null before kill, so wasRunning would be false
    if (wasRunning && mainWin) mainWin.webContents.send('copilot-proxy:service-stopped')
  })

  updateTrayStatus()

  return {
    pid: serviceChild.pid,
    alreadyRunning: false,
  }
}

function serviceStop() {
  if (!serviceChild) {
    return {
      ok: true,
      message: 'service was not running',
    }
  }

  const child = serviceChild
  serviceChild = null

  killServiceProcess(child)
  updateTrayStatus()

  return {
    ok: true,
    message: 'service stopped',
  }
}

// ─── Launch Claude Code ─────────────────────────────────────────────

async function launchClaudeCode(payload) {
  const { port, model, smallModel } = payload || {}
  const serverUrl = `http://localhost:${port || 4399}`

  // Let user pick a workspace folder
  const win = mainWin
  const result = await dialog.showOpenDialog(win, {
    title: '选择 Claude Code 工作空间',
    properties: ['openDirectory'],
  })

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return { ok: false, canceled: true }
  }

  const cwd = result.filePaths[0]

  const envVars = {
    ANTHROPIC_BASE_URL: serverUrl,
    ANTHROPIC_AUTH_TOKEN: 'dummy',
    ANTHROPIC_MODEL: model || '',
    ANTHROPIC_DEFAULT_SONNET_MODEL: model || '',
    ANTHROPIC_SMALL_FAST_MODEL: smallModel || model || '',
    ANTHROPIC_DEFAULT_HAIKU_MODEL: smallModel || model || '',
    DISABLE_NON_ESSENTIAL_MODEL_CALLS: '1',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
  }

  // Build PowerShell command: cd to workspace, set env vars, run claude
  const cdCmd = `Set-Location '${cwd.replace(/'/g, "''")}'`
  const setEnv = Object.entries(envVars)
    .map(([k, v]) => `$env:${k}='${v}'`)
    .join('; ')
  const psCommand = `${cdCmd}; ${setEnv}; claude`

  // Use cmd /c start to open a visible PowerShell window
  spawn('cmd.exe', ['/c', 'start', 'powershell.exe', '-NoExit', '-Command', psCommand], {
    detached: true,
    stdio: 'ignore',
    shell: false,
  }).unref()

  return { ok: true, cwd }
}

// ─── Write / Clear Claude Code env vars (user-level) ────────────────

// ─── Write / Clear Claude Code settings.json ────────────────────────

const CLAUDE_ENV_KEYS = [
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_SMALL_FAST_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'DISABLE_NON_ESSENTIAL_MODEL_CALLS',
  'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC',
]

function claudeSettingsPath() {
  return path.join(os.homedir(), '.claude', 'settings.json')
}

function readClaudeSettings() {
  const p = claudeSettingsPath()
  if (!fs.existsSync(p)) return {}
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (e) {
    console.warn('Failed to parse Claude settings:', e)
    return {}
  }
}

function saveClaudeSettings(settings) {
  const dir = path.dirname(claudeSettingsPath())
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(claudeSettingsPath(), JSON.stringify(settings, null, 2), 'utf8')
}

function writeClaudeEnv(payload) {
  const { port, model, smallModel } = payload || {}
  const serverUrl = `http://localhost:${port || 4399}`
  const envVars = {
    ANTHROPIC_BASE_URL: serverUrl,
    ANTHROPIC_AUTH_TOKEN: 'dummy',
    ANTHROPIC_MODEL: model || '',
    ANTHROPIC_DEFAULT_SONNET_MODEL: model || '',
    ANTHROPIC_SMALL_FAST_MODEL: smallModel || model || '',
    ANTHROPIC_DEFAULT_HAIKU_MODEL: smallModel || model || '',
    DISABLE_NON_ESSENTIAL_MODEL_CALLS: '1',
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
  }
  const settings = readClaudeSettings()
  if (!settings.env) settings.env = {}
  Object.assign(settings.env, envVars)
  saveClaudeSettings(settings)
  return { ok: true, path: claudeSettingsPath(), vars: Object.keys(envVars) }
}

function clearClaudeEnv() {
  const settings = readClaudeSettings()
  if (!settings.env) return { ok: true }
  for (const k of CLAUDE_ENV_KEYS) {
    delete settings.env[k]
  }
  // Remove env key if empty
  if (Object.keys(settings.env).length === 0) delete settings.env
  saveClaudeSettings(settings)
  return { ok: true, path: claudeSettingsPath() }
}

function checkClaudeEnv() {
  const settings = readClaudeSettings()
  const hasEnv = !!(settings.env && settings.env.ANTHROPIC_BASE_URL)
  return { written: hasEnv, baseUrl: settings.env?.ANTHROPIC_BASE_URL || null }
}

// ─── Auth: token file check ─────────────────────────────────────────

function authStatus() {
  const token = readToken()
  const hasToken = token.length > 0

  return {
    hasToken,
    tokenPath: githubTokenPath(),
    message: hasToken ? 'GitHub token exists' : 'GitHub token not found',
  }
}

// ─── Auto-detect account type ───────────────────────────────────────

async function detectAccountType() {
  // 1. Read GitHub token
  const githubToken = readToken()
  if (!githubToken) {
    throw new Error('请先登录 GitHub')
  }

  // 2. Get a Copilot token
  const tokenRes = await httpsGet('https://api.github.com/copilot_internal/v2/token', {
    'authorization': `token ${githubToken}`,
    'content-type': 'application/json',
    'editor-version': 'vscode/1.97.0',
    'editor-plugin-version': 'copilot-chat/0.26.7',
    'user-agent': 'GitHubCopilotChat/0.26.7',
  })

  if (!tokenRes.ok) {
    throw new Error(`获取 Copilot token 失败: HTTP ${tokenRes.status}`)
  }

  const copilotToken = tokenRes.json.token

  // 3. Probe each account type (enterprise/business first, individual is the fallback)
  const types = ['enterprise', 'business', 'individual']
  for (const accountType of types) {
    const baseUrl = accountType === 'individual'
      ? 'https://api.githubcopilot.com'
      : `https://api.${accountType}.githubcopilot.com`

    try {
      const modelsRes = await httpsGet(`${baseUrl}/models`, {
        'authorization': `Bearer ${copilotToken}`,
        'content-type': 'application/json',
        'copilot-integration-id': 'vscode-chat',
        'editor-version': 'vscode/1.97.0',
        'editor-plugin-version': 'copilot-chat/0.26.7',
        'user-agent': 'GitHubCopilotChat/0.26.7',
      }, 8000)

      if (modelsRes.ok) {
        return { accountType, detected: true }
      }
    }
    catch (e) {
      console.warn('Account type detection endpoint failed:', e.message || e)
    }
  }

  return { accountType: 'individual', detected: false, message: '无法自动检测，默认使用 individual' }
}

// ─── Fetch models directly from Copilot API ─────────────────────────

async function fetchModels(payload) {
  const accountType = payload?.accountType || 'individual'

  // 1. Read GitHub token
  const githubToken = readToken()
  if (!githubToken) {
    throw new Error('请先登录 GitHub')
  }

  // 2. Get a Copilot token
  const tokenRes = await httpsGet('https://api.github.com/copilot_internal/v2/token', {
    'authorization': `token ${githubToken}`,
    'content-type': 'application/json',
    'editor-version': 'vscode/1.97.0',
    'editor-plugin-version': 'copilot-chat/0.26.7',
    'user-agent': 'GitHubCopilotChat/0.26.7',
  })

  if (!tokenRes.ok) {
    throw new Error(`获取 Copilot token 失败: HTTP ${tokenRes.status}`)
  }

  const copilotToken = tokenRes.json.token

  // 3. Fetch models
  const baseUrl = accountType === 'individual'
    ? 'https://api.githubcopilot.com'
    : `https://api.${accountType}.githubcopilot.com`

  const modelsRes = await httpsGet(`${baseUrl}/models`, {
    'authorization': `Bearer ${copilotToken}`,
    'content-type': 'application/json',
    'copilot-integration-id': 'vscode-chat',
    'editor-version': 'vscode/1.97.0',
    'editor-plugin-version': 'copilot-chat/0.26.7',
    'user-agent': 'GitHubCopilotChat/0.26.7',
  }, 10000)

  if (!modelsRes.ok) {
    throw new Error(`获取模型列表失败: HTTP ${modelsRes.status}`)
  }

  return modelsRes.json
}

// ─── Auth: GitHub Device Code OAuth Flow (child window) ─────────────

let authChildWin = null

async function authDeviceCodeFlow(payload) {
  const theme = payload?.theme || 'midnight'
  // Request device code from GitHub (use node:https to bypass Electron net.fetch)
  const response = await httpsPost(`${GITHUB_BASE_URL}/login/device/code`, {
    client_id: GITHUB_CLIENT_ID,
    scope: GITHUB_APP_SCOPES,
  })

  if (!response.ok) {
    throw new Error(`获取验证码失败: HTTP ${response.status} - ${response.raw}`)
  }

  const data = response.json
  const { user_code, verification_uri, device_code } = data
  let interval = (data.interval || 5) + 1

  // Open browser for verification
  if (verification_uri) {
    shell.openExternal(verification_uri)
  }

  // Create a small child window showing the code
  const parent = mainWin
  if (authChildWin && !authChildWin.isDestroyed()) {
    authChildWin.close()
  }

  authChildWin = new BrowserWindow({
    width: 360,
    height: 230,
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent,
    modal: true,
    title: 'GitHub 登录验证',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  authChildWin.setMenuBarVisibility(false)

  const themeStyles = {
    midnight: { bg: '#121829', card: '#1a2240', text: '#e4e8f7', dim: '#8892b3', accent: '#6d8cff', green: '#4ade80', yellow: '#fbbf24', border: '#2a3558', inputBg: '#131a2e' },
    aurora:   { bg: '#0c0a1a', card: '#15122a', text: '#ede9fe', dim: '#a196c8', accent: '#a855f7', green: '#4ade80', yellow: '#facc15', border: '#2d2654', inputBg: '#120e24' },
    frost:    { bg: '#f5f0ff', card: '#ffffff', text: '#1e1535', dim: '#6b5b8a', accent: '#7c3aed', green: '#16a34a', yellow: '#d97706', border: '#ddd0f2', inputBg: '#ffffff' },
    sakura:   { bg: '#fff4ec', card: '#fff9f4', text: '#2c1810', dim: '#8c6048', accent: '#e8602c', green: '#16a34a', yellow: '#d97706', border: '#f0c8a8', inputBg: '#fffaf6' },
    cherry:   { bg: '#fdf0f4', card: '#fff6f9', text: '#2e0e1e', dim: '#8a4566', accent: '#e0457b', green: '#16a34a', yellow: '#d97706', border: '#eab0c4', inputBg: '#fff8fa' },
  }
  const t = themeStyles[theme] || themeStyles.midnight

  // Sanitize user_code to prevent XSS (GitHub codes are alphanumeric + hyphen, but be safe)
  const safeCode = String(user_code).replace(/[^A-Za-z0-9\-]/g, '')
  const safeUri = String(verification_uri).replace(/["'<>&]/g, c => `&#${c.charCodeAt(0)};`)

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, "Segoe UI", sans-serif; background: ${t.bg}; color: ${t.text}; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: ${t.accent}; margin: 12px 0; user-select: all; }
  .hint { font-size: 13px; color: ${t.dim}; text-align: center; line-height: 1.6; }
  .hint a { color: ${t.accent}; }
  .copy-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  .copy-btn { background: transparent; border: 1px solid ${t.border}; color: ${t.accent}; padding: 2px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
  .copy-btn:hover { background: ${t.inputBg}; }
  .copied { font-size: 12px; color: ${t.green}; }
  .status { font-size: 13px; margin-top: 10px; color: ${t.yellow}; }
  .success { color: ${t.green}; }
</style></head><body>
  <div class="hint">请在浏览器中输入以下验证码</div>
  <div class="code">${safeCode}</div>
  <div class="copy-row">
    <button class="copy-btn" id="copyBtn">📋 复制验证码</button>
    <span class="copied" id="copied"></span>
  </div>
  <div class="hint">浏览器已自动打开验证页面<br><a href="${safeUri}">${safeUri}</a></div>
  <div class="status" id="status">⏳ 等待授权...</div>
  <script>
    function copyCode() {
      var code = '${safeCode}';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function(){ document.getElementById('copied').textContent='✅ 已复制' }).catch(fallbackCopy);
      } else { fallbackCopy(); }
    }
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = '${safeCode}';
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); document.getElementById('copied').textContent='✅ 已复制'; } catch(e) { document.getElementById('copied').textContent='⚠️ 请手动复制'; }
      document.body.removeChild(ta);
    }
    document.getElementById('copyBtn').onclick = copyCode;
  </script>
</body></html>`

  authChildWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  // Poll for authorization
  return new Promise((resolve) => {
    let closed = false

    authChildWin.on('closed', () => {
      closed = true
      authChildWin = null
      resolve({ status: 'canceled', message: '用户关闭了登录窗口' })
    })

    let pollCount = 0

    const setChildStatus = (text, className) => {
      if (closed || !authChildWin || authChildWin.isDestroyed()) return
      const safeText = String(text).replace(/'/g, "\\'").replace(/\n/g, ' ')
      authChildWin.webContents.executeJavaScript(
        `document.getElementById('status').className='${className || 'status'}';document.getElementById('status').textContent='${safeText}'`
      ).catch(() => { /* ignore if window is gone */ })
    }

    const poll = async () => {
      if (closed) return
      pollCount++

      try {
        const pollResp = await httpsPost(`${GITHUB_BASE_URL}/login/oauth/access_token`, {
          client_id: GITHUB_CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        })

        if (!pollResp.ok) {
          setChildStatus(`⏳ 等待授权... (${pollCount})`)
          setTimeout(poll, interval * 1000)
          return
        }

        const json = pollResp.json

        if (json && json.access_token) {
          // Save token — wrap in try/catch so a write error doesn't cause infinite retry
          try {
            writeToken(json.access_token)
          } catch (writeErr) {
            console.error('Failed to write token:', writeErr)
            setChildStatus('❌ Token 保存失败: ' + (writeErr.message || writeErr), 'status')
            setTimeout(() => {
              if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
            }, 3000)
            resolve({ status: 'error', message: 'Token 写入失败: ' + (writeErr.message || writeErr) })
            return
          }
          // Show success briefly then close
          setChildStatus('✅ 登录成功！', 'status success')
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 1500)
          resolve({ status: 'success', message: 'GitHub token saved', tokenPath: githubTokenPath() })
          return
        }

        if (json && json.error === 'slow_down') {
          interval += 2
        } else if (json && json.error === 'expired_token') {
          setChildStatus('❌ 验证码已过期，请重试')
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 2000)
          resolve({ status: 'expired', message: '验证码已过期' })
          return
        } else if (json && json.error === 'access_denied') {
          setChildStatus('❌ 授权被拒绝')
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 2000)
          resolve({ status: 'error', message: '授权被拒绝' })
          return
        }

        // Still pending, continue polling — show attempt count so user knows it's alive
        setChildStatus(`⏳ 等待授权... (${pollCount})`)
        setTimeout(poll, interval * 1000)
      } catch (e) {
        console.warn('Auth poll error, retrying:', e.message || e)
        setChildStatus(`⏳ 等待授权... 重试中 (${pollCount})`)
        if (!closed) setTimeout(poll, interval * 1000)
      }
    }

    setTimeout(poll, interval * 1000)
  })
}

// ─── System Tray ────────────────────────────────────────────────────

const icons = require('./icons.cjs')

function createTray() {
  const icon = icons.createTrayIcon('#888888')
  tray = new Tray(icon)
  tray.setToolTip('Copilot Proxy - 已停止')
  updateTrayMenu()

  tray.on('double-click', () => {
    if (mainWin) {
      mainWin.show()
      mainWin.focus()
    }
  })
}

function updateTrayStatus() {
  if (!tray) return
  const running = !!serviceChild
  const color = running ? '#22c55e' : '#888888'
  const statusText = running ? '运行中' : '已停止'
  tray.setImage(icons.createTrayIcon(color))

  let tooltip = `Copilot Proxy - ${statusText}`
  if (running && lastModelName) {
    tooltip += `\n模型: ${lastModelName}`
  }
  tray.setToolTip(tooltip)
  updateTrayMenu()
}

function updateTrayMenu() {
  if (!tray) return
  const running = !!serviceChild
  const statusText = running ? '● 运行中' : '○ 已停止'

  const menuItems = [
    { label: statusText, enabled: false },
    { type: 'separator' },
  ]

  if (running) {
    menuItems.push({
      label: '■ 停止服务',
      click: () => {
        serviceStop()
        // Notify renderer so UI stays in sync
        if (mainWin) mainWin.webContents.send('copilot-proxy:service-stopped')
      },
    })
  } else {
    menuItems.push({
      label: '▶ 启动服务',
      click: () => {
        if (lastServicePayload) {
          // Replay last known config
          try {
            serviceStart(lastServicePayload)
            if (mainWin) mainWin.webContents.send('copilot-proxy:service-started')
          } catch (e) {
            console.warn('Failed to start service from tray:', e)
          }
        } else {
          // No saved config — ask renderer to run its full start flow (auth + model checks)
          if (mainWin) {
            mainWin.show()
            mainWin.focus()
            mainWin.webContents.send('copilot-proxy:trigger-start')
          }
        }
      },
    })
  }

  menuItems.push(
    { type: 'separator' },
    {
      label: '显示窗口',
      click: () => {
        if (mainWin) {
          mainWin.show()
          mainWin.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  )

  const menu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(menu)
}

// ─── Electron Window ────────────────────────────────────────────────

function createWindow() {
  // Remove default menu bar
  Menu.setApplicationMenu(null)

  mainWin = new BrowserWindow({
    width: 480,
    height: 340,
    resizable: false,
    title: 'Copilot Proxy GUI',
    icon: icons.createAppIcon(),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Intercept window close: send to renderer for custom themed dialog
  mainWin.on('close', (event) => {
    if (isQuitting) return // Allow quit when explicitly requested

    event.preventDefault()
    // Ask renderer to show custom close confirmation dialog
    if (mainWin && mainWin.webContents) {
      mainWin.webContents.send('copilot-proxy:close-requested')
    }
  })

  mainWin.on('closed', () => { mainWin = null })

  if (process.env.COPILOT_GUI_DEV === '1') {
    mainWin.loadURL('http://localhost:5190')
    return
  }

  mainWin.loadFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
}

// ─── Window Resizing ────────────────────────────────────────────────

function resizeWindow(payload) {
  const win = mainWin
  if (!win) return

  const { width, height } = payload
  const cur = win.getContentSize()
  const w = width || cur[0]
  const h = height || cur[1]

  // Set size directly without toggling resizable to avoid
  // Windows Aero Snap interference during window drag
  win.setMinimumSize(w, h)
  win.setMaximumSize(w, h)
  win.setContentSize(w, h, false)
  // Reset min/max constraints after size is applied
  setTimeout(() => {
    win.setMinimumSize(0, 0)
    win.setMaximumSize(0, 0)
  }, 50)
  return { ok: true }
}

// ─── IPC Handlers ───────────────────────────────────────────────────

ipcMain.handle('copilot-proxy:invoke', async (_event, request) => {
  const command = request?.command
  const payload = request?.payload

  switch (command) {
    case 'service_start':
      return serviceStart(payload)
    case 'service_stop':
      return serviceStop()
    case 'auth_status':
      return authStatus()
    case 'auth_device_code_start':
      return authDeviceCodeFlow(payload)
    case 'service_logs':
      return { lines: serviceLogs }
    case 'delete_token': {
      deleteTokenFile()
      return { ok: true, tokenPath: githubTokenPath() }
    }
    case 'resize_window':
      return resizeWindow(payload)
    case 'close_confirm_response': {
      const action = payload?.action
      if (action === 'minimize') {
        if (mainWin) mainWin.hide()
      } else if (action === 'quit') {
        isQuitting = true
        app.quit()
      }
      // action === 'cancel': do nothing
      return { ok: true }
    }
    case 'detect_account_type':
      return detectAccountType()
    case 'fetch_models':
      return fetchModels(payload)
    case 'launch_claude_code':
      return launchClaudeCode(payload)
    case 'write_claude_env':
      return writeClaudeEnv(payload)
    case 'clear_claude_env':
      return clearClaudeEnv()
    case 'check_claude_env':
      return checkClaudeEnv()
    case 'open_external': {
      const url = payload?.url
      if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
        shell.openExternal(url)
      }
      return { ok: true }
    }

    default:
      throw new Error(`Unknown command: ${command}`)
  }
})

// ─── App lifecycle ──────────────────────────────────────────────────

app.whenReady().then(() => {
  createTray()
  createWindow()

  app.on('activate', () => {
    if (mainWin) {
      mainWin.show()
      mainWin.focus()
    } else {
      createWindow()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
  if (serviceChild) {
    try {
      killServiceProcess(serviceChild)
    }
    catch (e) {
      console.warn('Failed to stop service on quit:', e)
    }
  }
})

app.on('window-all-closed', () => {
  // Don't quit when window is closed — tray keeps the app alive
  // App will quit only when isQuitting is true (from tray menu or close dialog)
  if (isQuitting && process.platform !== 'darwin') {
    app.quit()
  }
})
