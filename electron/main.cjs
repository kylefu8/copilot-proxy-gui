const fs = require('node:fs')
const originalFs = require('original-fs') // bypass Electron's ASAR interception
const os = require('node:os')
const path = require('node:path')
const https = require('node:https')
const { spawn, spawnSync } = require('node:child_process')
const crypto = require('node:crypto')
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

// Ensure dev mode uses the same userData directory as the packaged app,
// so token files and settings are shared across both modes.
app.setName('copilot-proxy-gui')

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
const logPreloadPath = path.resolve(__dirname, 'log-preload.cjs')
const convPreloadPath = path.resolve(__dirname, 'conversation-preload.cjs')
const conversationStore = require('./conversation-store.cjs')

let mainWin = null
let logWin = null
let convWin = null
let tray = null
let isQuitting = false
// Detect system language: use Chinese if locale starts with 'zh', otherwise English
let currentLang = (app.getLocale() || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'

// ─── Main-process i18n (tray menu & error messages) ─────────────
const mainI18n = {
  zh: {
    'tray.stopped': '已停止',
    'tray.running': '运行中',
    'tray.model': '模型',
    'tray.statusRunning': '● 运行中',
    'tray.statusStopped': '○ 已停止',
    'tray.stop': '■ 停止代理',
    'tray.start': '▶ 启动代理',
    'tray.show': '显示窗口',
    'tray.quit': '退出',
    'err.loginFirst': '请先登录 GitHub',
    'err.copilotToken': '获取 Copilot token 失败: HTTP ',
    'err.detectFailed': '无法自动检测，默认使用 individual',
    'err.modelList': '获取模型列表失败: HTTP ',
    'err.deviceCode': '获取验证码失败: HTTP ',
    'err.tokenSaveFailed': 'Token 保存失败: ',
    'err.tokenWriteFailed': 'Token 写入失败: ',
    'err.expired': '验证码已过期',
    'err.expiredRetry': '❌ 验证码已过期，请重试',
    'err.denied': '授权被拒绝',
    'err.deniedIcon': '❌ 授权被拒绝',
    'dialog.selectWorkspace': '选择 Claude Code 工作空间',
    'dialog.authTitle': 'GitHub 登录验证',
    'auth.hint': '请在浏览器中输入以下验证码',
    'auth.copy': '📋 复制验证码',
    'auth.browserOpened': '浏览器已自动打开验证页面',
    'auth.waiting': '⏳ 等待授权...',
    'auth.copied': '✅ 已复制',
    'auth.copyFailed': '⚠️ 请手动复制',
    'auth.canceled': '用户关闭了登录窗口',
    'auth.success': '✅ 登录成功！',
    'auth.retrying': '重试中',
    'app.alreadyRunning': '程序已在运行中',
    'app.alreadyRunningDetail': '另一个 Copilot Proxy GUI 实例已在运行，将切换到该窗口。',
    'update.check': '检查更新',
    'update.newVersion': '🔔 有新版本 v{v}',
    'update.latest': '已是最新版本',
    'update.failed': '更新检查失败',
  },
  en: {
    'tray.stopped': 'Stopped',
    'tray.running': 'Running',
    'tray.model': 'Model',
    'tray.statusRunning': '● Running',
    'tray.statusStopped': '○ Stopped',
    'tray.stop': '■ Stop Proxy',
    'tray.start': '▶ Start Proxy',
    'tray.show': 'Show Window',
    'tray.quit': 'Quit',
    'err.loginFirst': 'Please log in to GitHub first',
    'err.copilotToken': 'Failed to get Copilot token: HTTP ',
    'err.detectFailed': 'Cannot auto-detect, defaulting to individual',
    'err.modelList': 'Failed to fetch model list: HTTP ',
    'err.deviceCode': 'Failed to get device code: HTTP ',
    'err.tokenSaveFailed': 'Token save failed: ',
    'err.tokenWriteFailed': 'Token write failed: ',
    'err.expired': 'Verification code expired',
    'err.expiredRetry': '❌ Code expired, please retry',
    'err.denied': 'Authorization denied',
    'err.deniedIcon': '❌ Authorization denied',
    'dialog.selectWorkspace': 'Select Claude Code Workspace',
    'dialog.authTitle': 'GitHub Login Verification',
    'auth.hint': 'Enter the following code in your browser',
    'auth.copy': '📋 Copy Code',
    'auth.browserOpened': 'Browser opened the verification page',
    'auth.waiting': '⏳ Waiting for authorization...',
    'auth.copied': '✅ Copied',
    'auth.copyFailed': '⚠️ Please copy manually',
    'auth.canceled': 'User closed the login window',
    'auth.success': '✅ Login successful!',
    'auth.retrying': 'retrying',
    'app.alreadyRunning': 'Application Already Running',
    'app.alreadyRunningDetail': 'Another instance of Copilot Proxy GUI is already running. Switching to that window.',
    'update.check': 'Check for Updates',
    'update.newVersion': '🔔 Update Available v{v}',
    'update.latest': 'Already up to date',
    'update.failed': 'Update check failed',
  },
}
function mt(key) { return mainI18n[currentLang]?.[key] ?? mainI18n.zh[key] ?? key }

const GITHUB_BASE_URL = 'https://github.com'
const GITHUB_CLIENT_ID = 'Iv1.b507a08c87ecfe98'
const GITHUB_APP_SCOPES = 'read:user'

let serviceChild = null
const MAX_LOG_LINES = 500
let serviceLogs = []
let lastServicePayload = null   // remembered for tray "Start" action
let lastModelName = ''          // model name shown in tray tooltip

function pushLog(line) {
  // Prepend timestamp if the line doesn't already have one
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 23)
  const stamped = line.startsWith('[2') ? line : `[${ts}] ${line}`
  serviceLogs.push(stamped)
  if (serviceLogs.length > MAX_LOG_LINES) {
    serviceLogs = serviceLogs.slice(-MAX_LOG_LINES)
  }
  // Push only the new line to log viewer (incremental)
  if (logWin && !logWin.isDestroyed()) {
    logWin.webContents.send('copilot-proxy:log-line', stamped)
  }
}

// ─── Update state ────────────────────────────────────────────────────
let updateState = {
  checking: false,
  available: false,
  downloading: false,
  progress: 0,
  latestVersion: null,
  releaseUrl: null,
  manifestData: null,
  lightweightPossible: false,
  error: null,
}

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

  const home = process.env.HOME || process.env.USERPROFILE
  if (home) {
    if (process.platform === 'win32') {
      candidates.push(path.join(home, '.bun', 'bin', 'bun.exe'))
    }
    candidates.push(path.join(home, '.bun', 'bin', 'bun'))
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

  const convLogEnv = payload?.conversationLog ? { COPILOT_PROXY_CONVERSATION_LOG: '1' } : {}

  if (isPackaged) {
    // Prefer JS bundle (lightweight) over legacy bun-compiled binary
    const bundlePath = path.join(process.resourcesPath, 'copilot-proxy-bundle.mjs')
    const legacyBinaryName = process.platform === 'win32' ? 'copilot-proxy-server.exe' : 'copilot-proxy-server'
    const legacyBinaryPath = path.join(process.resourcesPath, legacyBinaryName)

    if (fs.existsSync(bundlePath)) {
      // New approach: run JS bundle with Electron's built-in Node.js
      serviceChild = spawn(
        process.execPath,
        [bundlePath, ...args],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: false,
          env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...convLogEnv },
        },
      )
    } else if (fs.existsSync(legacyBinaryPath)) {
      // Fallback: legacy bun-compiled binary
      serviceChild = spawn(
        legacyBinaryPath,
        args,
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: false,
          env: { ...process.env, ...convLogEnv },
        },
      )
    } else {
      throw new Error('Proxy server not found. Looked for:\n  ' + bundlePath + '\n  ' + legacyBinaryPath + '\nPlease rebuild with: npm run desktop:build')
    }
  } else {
    // Dev mode: run JS bundle or source with Node.js / bun
    const devBundlePath = path.join(__dirname, '..', 'build', 'copilot-proxy-bundle.mjs')
    if (fs.existsSync(devBundlePath)) {
      // Use pre-built JS bundle with Node.js
      serviceChild = spawn(
        process.execPath,
        [devBundlePath, ...args],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: false,
          env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...convLogEnv },
        },
      )
    } else if (repoRoot) {
      // Fallback: use bun to run source
      const bunInfo = resolveBunExecutable()
      if (!bunInfo) {
        throw new Error('Neither build/copilot-proxy-bundle.mjs nor bun found.\nRun: node scripts/bundle-proxy.cjs')
      }
      serviceChild = spawn(
        bunInfo.bin,
        ['run', 'src/main.ts', ...args],
        {
          cwd: repoRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          shell: false,
          env: { ...process.env, ...convLogEnv },
        },
      )
    } else {
      throw new Error('Proxy server not found. Run: node scripts/bundle-proxy.cjs')
    }
  }

  serviceChild.stdout.on('data', (chunk) => {
    String(chunk).split('\n').filter(Boolean).forEach((line) => {
      if (line.startsWith('[CONV]')) {
        try {
          const entry = JSON.parse(line.slice(6))
          conversationStore.appendConversation(entry)
          if (convWin && !convWin.isDestroyed()) {
            convWin.webContents.send('copilot-proxy:new-conversation', entry)
          }
        } catch (e) {
          console.warn('Failed to parse [CONV] line:', e)
        }
      } else {
        pushLog(line)
      }
    })
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

// ─── Self-update ────────────────────────────────────────────────────

const REPO_OWNER = 'kylefu8'
const REPO_NAME = 'copilot-proxy-gui'
const UPDATE_CHECK_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`

function notifyUpdateState() {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('copilot-proxy:update-state', { ...updateState })
  }
  updateTrayMenu()
}

function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').replace(/-.*$/, '').split('.').map(Number)
  const pb = String(b).replace(/^v/, '').replace(/-.*$/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const va = pa[i] || 0
    const vb = pb[i] || 0
    if (va > vb) return 1
    if (va < vb) return -1
  }
  return 0
}

/**
 * Download a file over HTTPS, following redirects (GitHub → S3).
 * Returns a Buffer. Calls onProgress(downloaded, total) during download.
 */
function httpsDownload(url, onProgress) {
  return new Promise((resolve, reject) => {
    const doRequest = (reqUrl, redirectCount = 0) => {
      if (redirectCount > 5) return reject(new Error('Too many redirects'))

      const u = new URL(reqUrl)
      const proto = u.protocol === 'https:' ? https : require('node:http')

      proto.get(reqUrl, {
        headers: { 'user-agent': `CopilotProxyGUI/${require('../package.json').version}` },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, reqUrl).href
          return doRequest(next, redirectCount + 1)
        }

        if (res.statusCode !== 200) {
          res.resume()
          return reject(new Error(`Download failed: HTTP ${res.statusCode}`))
        }

        const totalSize = parseInt(res.headers['content-length'], 10) || 0
        const chunks = []
        let downloaded = 0

        res.on('data', (chunk) => {
          chunks.push(chunk)
          downloaded += chunk.length
          if (onProgress && totalSize) onProgress(downloaded, totalSize)
        })
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      }).on('error', reject)
    }

    doRequest(url)
  })
}

async function checkForUpdates() {
  const currentVersion = require('../package.json').version

  updateState = { ...updateState, checking: true, error: null }
  notifyUpdateState()

  try {
    const res = await httpsGet(UPDATE_CHECK_URL, {
      'user-agent': `CopilotProxyGUI/${currentVersion}`,
    }, 15000)

    if (!res.ok) throw new Error(`GitHub API error: HTTP ${res.status}`)

    const release = res.json
    const latestVersion = (release.tag_name || '').replace(/^v/, '')

    if (compareVersions(latestVersion, currentVersion) <= 0) {
      updateState = { ...updateState, checking: false, available: false, latestVersion }
      notifyUpdateState()
      return { upToDate: true, currentVersion, latestVersion }
    }

    // New version available — check for lightweight update manifest
    const manifestAsset = (release.assets || []).find(a => a.name === 'update-manifest.json')
    let manifestData = null
    let lightweightPossible = false

    if (manifestAsset) {
      try {
        const mBuf = await httpsDownload(manifestAsset.browser_download_url)
        manifestData = JSON.parse(mBuf.toString('utf8'))
        const electronVersion = process.versions.electron
        if (!manifestData.minElectronVersion || compareVersions(electronVersion, manifestData.minElectronVersion) >= 0) {
          // Portable exe extracts to a temp dir each launch — lightweight update
          // would be overwritten on next start. Only allow for installed apps.
          const isPortable = process.platform === 'win32' && (
            process.resourcesPath.includes(path.join('AppData', 'Local', 'Temp')) ||
            !process.resourcesPath.includes(path.join('AppData', 'Local', 'Programs'))
          )
          if (isPortable) {
            console.log('Portable mode detected — lightweight update disabled')
          } else {
            lightweightPossible = true
          }
        }
      } catch (e) {
        console.warn('Failed to fetch update manifest:', e)
      }
    }

    updateState = {
      ...updateState,
      checking: false,
      available: true,
      latestVersion,
      releaseUrl: release.html_url,
      manifestData,
      lightweightPossible,
    }
    notifyUpdateState()

    return { upToDate: false, currentVersion, latestVersion, releaseUrl: release.html_url, lightweightPossible }
  } catch (e) {
    updateState = { ...updateState, checking: false, error: e.message || String(e) }
    notifyUpdateState()
    return { error: true, message: e.message || String(e) }
  }
}

async function applyLightweightUpdate() {
  if (!updateState.available || !updateState.lightweightPossible || !updateState.manifestData) {
    return { error: true, message: 'No lightweight update available' }
  }
  if (updateState.downloading) return { error: true, message: 'Already downloading' }

  const manifest = updateState.manifestData
  const expectedAssets = manifest.assets || {}

  // Fetch release to get asset download URLs
  const res = await httpsGet(UPDATE_CHECK_URL, {
    'user-agent': `CopilotProxyGUI/${require('../package.json').version}`,
  }, 15000)
  if (!res.ok) throw new Error('Failed to fetch release info')

  const releaseAssets = res.json.assets || []

  updateState = { ...updateState, downloading: true, progress: 0, error: null }
  notifyUpdateState()

  try {
    const resourcesPath = process.resourcesPath
    let filesDone = 0
    const filesToUpdate = []

    // Determine which assets to download
    const bundleAsset = releaseAssets.find(a => a.name === 'copilot-proxy-bundle.mjs')
    const asarAsset = releaseAssets.find(a => a.name === 'app.asar')
    if (bundleAsset) filesToUpdate.push({ asset: bundleAsset, key: 'copilot-proxy-bundle.mjs' })
    if (asarAsset) filesToUpdate.push({ asset: asarAsset, key: 'app.asar' })

    if (filesToUpdate.length === 0) {
      throw new Error('No downloadable assets found in release')
    }

    // Download all files to a temp directory first
    const tempDir = path.join(app.getPath('temp'), 'copilot-proxy-update')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const downloadedFiles = []

    for (const { asset, key } of filesToUpdate) {
      const progressBase = (filesDone / filesToUpdate.length) * 100
      const progressRange = 100 / filesToUpdate.length

      const data = await httpsDownload(asset.browser_download_url, (downloaded, total) => {
        updateState.progress = Math.round(progressBase + (downloaded / total) * progressRange)
        notifyUpdateState()
      })

      // Verify SHA256 if available
      if (expectedAssets[key]?.sha256) {
        const hash = crypto.createHash('sha256').update(data).digest('hex')
        if (hash !== expectedAssets[key].sha256) {
          throw new Error(`SHA256 mismatch for ${key}`)
        }
      }

      const tempFile = path.join(tempDir, key)
      // Use originalFs for .asar files to bypass Electron's ASAR interception
      if (key.endsWith('.asar')) {
        originalFs.writeFileSync(tempFile, data)
      } else {
        fs.writeFileSync(tempFile, data)
      }
      downloadedFiles.push({ tempFile, destFile: path.join(resourcesPath, key), key })
      filesDone++
    }

    // Copy files from temp to resources using original-fs (bypasses ASAR interception)
    for (const { tempFile, destFile, key } of downloadedFiles) {
      try {
        originalFs.copyFileSync(tempFile, destFile)
      } catch (copyErr) {
        // On macOS, /Applications may need elevated permissions
        if (process.platform === 'darwin' && (copyErr.code === 'EACCES' || copyErr.code === 'EPERM')) {
          // Use cp command with shell as fallback
          const { execSync } = require('node:child_process')
          execSync(`cp "${tempFile}" "${destFile}"`)
        } else {
          throw copyErr
        }
      }
    }

    // Clean up temp files using originalFs.rmSync for .asar compatibility
    try { originalFs.rmSync(tempDir, { recursive: true, force: true }) } catch { /* ignore */ }

    updateState = { ...updateState, downloading: false, progress: 100 }
    notifyUpdateState()

    return { ok: true, version: manifest.version, needRestart: !!asarAsset }
  } catch (e) {
    updateState = { ...updateState, downloading: false, error: e.message || String(e) }
    notifyUpdateState()
    return { error: true, message: e.message || String(e) }
  }
}

function restartApp() {
  app.relaunch()
  isQuitting = true
  app.quit()
}

// ─── Launch Claude Code ─────────────────────────────────────────────

async function launchClaudeCode(payload) {
  const { port, model, smallModel } = payload || {}
  const serverUrl = `http://localhost:${port || 4399}`

  // Let user pick a workspace folder
  const win = mainWin
  const result = await dialog.showOpenDialog(win, {
    title: mt('dialog.selectWorkspace'),
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

  if (process.platform === 'win32') {
    // Windows: open a visible PowerShell window
    const cdCmd = `Set-Location '${cwd.replace(/'/g, "''")}'`
    const setEnv = Object.entries(envVars)
      .map(([k, v]) => `$env:${k}='${v}'`)
      .join('; ')
    const psCommand = `${cdCmd}; ${setEnv}; claude`

    spawn('cmd.exe', ['/c', 'start', 'powershell.exe', '-NoExit', '-Command', psCommand], {
      detached: true,
      stdio: 'ignore',
      shell: false,
    }).unref()
  } else if (process.platform === 'darwin') {
    // macOS: open Terminal.app via osascript
    const exportEnv = Object.entries(envVars)
      .map(([k, v]) => `export ${k}='${v.replace(/'/g, "'\\''")}'`)
      .join('; ')
    const script = `cd '${cwd.replace(/'/g, "'\\''")}'  && ${exportEnv} && claude`
    const osaScript = `tell application "Terminal"
      activate
      do script "${script.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"
    end tell`

    spawn('osascript', ['-e', osaScript], {
      detached: true,
      stdio: 'ignore',
      shell: false,
    }).unref()
  }

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
    throw new Error(mt('err.loginFirst'))
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
    throw new Error(`${mt('err.copilotToken')}${tokenRes.status}`)
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

  return { accountType: 'individual', detected: false, message: mt('err.detectFailed') }
}

// ─── Fetch models directly from Copilot API ─────────────────────────

async function fetchModels(payload) {
  const accountType = payload?.accountType || 'individual'

  pushLog(`[models] Refreshing model list (accountType=${accountType})`)

  // 1. Read GitHub token
  const githubToken = readToken()
  if (!githubToken) {
    pushLog('[models] Refresh failed: GitHub token not found')
    throw new Error(mt('err.loginFirst'))
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
    pushLog(`[models] Refresh failed: unable to get Copilot token (${tokenRes.status})`)
    throw new Error(`${mt('err.copilotToken')}${tokenRes.status}`)
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
    pushLog(`[models] Refresh failed: model list request returned ${modelsRes.status}`)
    throw new Error(`${mt('err.modelList')}${modelsRes.status}`)
  }

  const count = Array.isArray(modelsRes.json?.data) ? modelsRes.json.data.length : 0
  pushLog(`[models] Refreshed model list successfully (${count} models)`)

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
    throw new Error(`${mt('err.deviceCode')}${response.status} - ${response.raw}`)
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
    title: mt('dialog.authTitle'),
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
  <div class="hint">${mt('auth.hint')}</div>
  <div class="code">${safeCode}</div>
  <div class="copy-row">
    <button class="copy-btn" id="copyBtn">${mt('auth.copy')}</button>
    <span class="copied" id="copied"></span>
  </div>
  <div class="hint">${mt('auth.browserOpened')}<br><a href="${safeUri}">${safeUri}</a></div>
  <div class="status" id="status">${mt('auth.waiting')}</div>
  <script>
    function copyCode() {
      var code = '${safeCode}';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function(){ document.getElementById('copied').textContent='${mt('auth.copied')}' }).catch(fallbackCopy);
      } else { fallbackCopy(); }
    }
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = '${safeCode}';
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); document.getElementById('copied').textContent='${mt('auth.copied')}'; } catch(e) { document.getElementById('copied').textContent='${mt('auth.copyFailed')}'; }
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
      resolve({ status: 'canceled', message: mt('auth.canceled') })
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
          setChildStatus(`${mt('auth.waiting')} (${pollCount})`)
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
            setChildStatus('❌ ' + mt('err.tokenSaveFailed') + (writeErr.message || writeErr), 'status')
            setTimeout(() => {
              if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
            }, 3000)
            resolve({ status: 'error', message: mt('err.tokenWriteFailed') + (writeErr.message || writeErr) })
            return
          }
          // Show success briefly then close
          setChildStatus(mt('auth.success'), 'status success')
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 1500)
          resolve({ status: 'success', message: 'GitHub token saved', tokenPath: githubTokenPath() })
          return
        }

        if (json && json.error === 'slow_down') {
          interval += 2
        } else if (json && json.error === 'expired_token') {
          setChildStatus(mt('err.expiredRetry'))
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 2000)
          resolve({ status: 'expired', message: mt('err.expired') })
          return
        } else if (json && json.error === 'access_denied') {
          setChildStatus(mt('err.deniedIcon'))
          setTimeout(() => {
            if (authChildWin && !authChildWin.isDestroyed()) authChildWin.close()
          }, 2000)
          resolve({ status: 'error', message: mt('err.denied') })
          return
        }

        // Still pending, continue polling — show attempt count so user knows it's alive
        setChildStatus(`${mt('auth.waiting')} (${pollCount})`)
        setTimeout(poll, interval * 1000)
      } catch (e) {
        console.warn('Auth poll error, retrying:', e.message || e)
        setChildStatus(`${mt('auth.waiting')} ${mt('auth.retrying')} (${pollCount})`)
        if (!closed) setTimeout(poll, interval * 1000)
      }
    }

    setTimeout(poll, interval * 1000)
  })
}

// ─── System Tray ────────────────────────────────────────────────────

const icons = require('./icons.cjs')

function createTray() {
  const icon = process.platform === 'darwin'
    ? icons.createTrayIconTemplate()
    : icons.createTrayIcon('#888888')
  tray = new Tray(icon)
  tray.setToolTip(`Copilot Proxy - ${mt('tray.stopped')}`)
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
  const statusText = running ? mt('tray.running') : mt('tray.stopped')
  // macOS uses template image (always monochrome); other platforms use colored icon
  if (process.platform !== 'darwin') {
    tray.setImage(icons.createTrayIcon(color))
  }

  let tooltip = `Copilot Proxy - ${statusText}`
  if (running && lastModelName) {
    tooltip += `\n${mt('tray.model')}: ${lastModelName}`
  }
  tray.setToolTip(tooltip)
  updateTrayMenu()
}

function updateTrayMenu() {
  if (!tray) return
  const running = !!serviceChild
  const statusText = running ? mt('tray.statusRunning') : mt('tray.statusStopped')

  const menuItems = [
    { label: statusText, enabled: false },
    { type: 'separator' },
  ]

  if (running) {
    menuItems.push({
      label: mt('tray.stop'),
      click: () => {
        serviceStop()
        // Notify renderer so UI stays in sync
        if (mainWin) mainWin.webContents.send('copilot-proxy:service-stopped')
      },
    })
  } else {
    menuItems.push({
      label: mt('tray.start'),
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

  // Update check item
  if (updateState.available && updateState.latestVersion) {
    menuItems.push(
      { type: 'separator' },
      {
        label: mt('update.newVersion').replace('{v}', updateState.latestVersion),
        click: () => {
          if (updateState.releaseUrl) shell.openExternal(updateState.releaseUrl)
        },
      },
    )
  } else {
    menuItems.push(
      { type: 'separator' },
      {
        label: mt('update.check'),
        click: () => checkForUpdates(),
      },
    )
  }

  menuItems.push(
    { type: 'separator' },
    {
      label: mt('tray.show'),
      click: () => {
        if (mainWin) {
          mainWin.show()
          mainWin.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: mt('tray.quit'),
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  )

  const menu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(menu)
}

// ─── Log Viewer Window ──────────────────────────────────────────────

function openLogWindow(payload) {
  if (logWin && !logWin.isDestroyed()) {
    logWin.close()
    logWin = null
    return { ok: true, closed: true }
  }

  logWin = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 480,
    minHeight: 300,
    resizable: true,
    title: 'Copilot Proxy – Logs',
    icon: icons.createAppIcon(),
    webPreferences: {
      preload: logPreloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remove menu bar on Windows for clean look
  if (process.platform !== 'darwin') {
    logWin.setMenuBarVisibility(false)
  }

  logWin.loadFile(path.resolve(__dirname, 'log-viewer.html'))

  logWin.on('closed', () => { logWin = null })

  // Send current logs once the window is ready
  logWin.webContents.once('did-finish-load', () => {
    if (logWin && !logWin.isDestroyed()) {
      logWin.webContents.send('copilot-proxy:log-update', serviceLogs)
      const theme = payload?.theme || 'midnight'
      logWin.webContents.send('copilot-proxy:theme-update', theme)
    }
  })

  return { ok: true, alreadyOpen: false }
}

// ─── Conversation Viewer Window ─────────────────────────────────────

function openConversationWindow(payload) {
  if (convWin && !convWin.isDestroyed()) {
    convWin.close()
    convWin = null
    return { ok: true, closed: true }
  }

  convWin = new BrowserWindow({
    width: 960,
    height: 650,
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    title: 'Copilot Proxy – Conversations',
    icon: icons.createAppIcon(),
    webPreferences: {
      preload: convPreloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.platform !== 'darwin') {
    convWin.setMenuBarVisibility(false)
  }

  convWin.loadFile(path.resolve(__dirname, 'conversation-viewer.html'))
  convWin.on('closed', () => { convWin = null })

  convWin.webContents.once('did-finish-load', () => {
    if (convWin && !convWin.isDestroyed()) {
      const theme = payload?.theme || 'midnight'
      convWin.webContents.send('copilot-proxy:theme-update', theme)
    }
  })

  return { ok: true, alreadyOpen: false }
}

// ─── Electron Window ────────────────────────────────────────────────

function createWindow() {
  // On macOS: set a standard application menu so Cmd+C/V/X/A/Q work properly
  // On Windows: remove the default menu bar for a clean look
  if (process.platform === 'darwin') {
    const template = [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
        ],
      },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }

  const isMac = process.platform === 'darwin'

  mainWin = new BrowserWindow({
    width: 480,
    height: isMac ? 380 : 340,
    useContentSize: isMac,
    resizable: false,
    title: `Copilot Proxy GUI v${require('../package.json').version}`,
    icon: icons.createAppIcon(),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--app-version=${require('../package.json').version}`],
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
    mainWin.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5190')
    mainWin.webContents.once('did-finish-load', () => {
      if (mainWin) mainWin.setTitle(`Copilot Proxy GUI v${require('../package.json').version}`)
    })
    return
  }

  mainWin.loadFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
  mainWin.webContents.once('did-finish-load', () => {
    if (mainWin) mainWin.setTitle(`Copilot Proxy GUI v${require('../package.json').version}`)
  })
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
  // Windows Aero Snap interference during window drag.
  // On Windows, min/max use outer (frame) dimensions, so compensate for title bar / borders.
  // On macOS, useContentSize: true makes this unnecessary.
  const isMacResize = process.platform === 'darwin'
  const outer = win.getSize()
  const inner = win.getContentSize()
  const frameW = isMacResize ? 0 : outer[0] - inner[0]
  const frameH = isMacResize ? 0 : outer[1] - inner[1]
  win.setMinimumSize(w + frameW, h + frameH)
  win.setMaximumSize(w + frameW, h + frameH)
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
    case 'open_log_window':
      return openLogWindow(payload)
    case 'update_log_theme': {
      if (logWin && !logWin.isDestroyed()) {
        logWin.webContents.send('copilot-proxy:theme-update', payload?.theme || 'midnight')
      }
      return { ok: true }
    }
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
      return detectAccountType().catch(e => ({ error: true, message: e.message || String(e) }))
    case 'fetch_models':
      return fetchModels(payload).catch(e => ({ error: true, message: e.message || String(e) }))
    case 'launch_claude_code':
      return launchClaudeCode(payload)
    case 'write_claude_env':
      return writeClaudeEnv(payload)
    case 'clear_claude_env':
      return clearClaudeEnv()
    case 'check_claude_env':
      return checkClaudeEnv()
    case 'check_update':
      return checkForUpdates()
    case 'apply_update':
      return applyLightweightUpdate()
    case 'restart_app':
      setTimeout(() => restartApp(), 200)
      return { ok: true }
    case 'get_update_state':
      return { ...updateState }
    case 'open_conversation_window':
      return openConversationWindow(payload)
    case 'list_conversation_sessions':
      return conversationStore.listSessions()
    case 'load_conversation_session':
      return conversationStore.loadSession(payload?.sessionId)
    case 'clear_conversations':
      conversationStore.clearAll()
      return { ok: true }
    case 'check_claude_installed': {
      // Check if 'claude' CLI is available
      // Strategy: use an interactive login shell to resolve the real PATH
      // (this picks up nvm, fnm, volta, homebrew, etc. from .zshrc/.bashrc)
      const home = process.env.HOME || process.env.USERPROFILE

      if (process.platform !== 'win32') {
        // macOS / Linux: spawn interactive login shell to get full PATH
        const userShell = process.env.SHELL || '/bin/zsh'
        const loginResult = spawnSync(userShell, ['-ilc', 'claude --version'], {
          stdio: 'pipe',
          timeout: 10000,
          env: { ...process.env },
        })
        if (loginResult.status === 0) {
          const version = String(loginResult.stdout).trim().split('\n').pop()
          // Also resolve the actual path
          const whichResult = spawnSync(userShell, ['-ilc', 'which claude'], {
            stdio: 'pipe',
            timeout: 5000,
            env: { ...process.env },
          })
          const claudePath = String(whichResult.stdout).trim().split('\n').pop() || 'claude'
          return { installed: true, version, path: claudePath }
        }
      } else {
        // Windows: try shell: true (inherits cmd PATH), then check known paths
        const shellResult = spawnSync('claude', ['--version'], {
          stdio: 'pipe',
          shell: true,
          timeout: 5000,
        })
        if (shellResult.status === 0) {
          return { installed: true, version: String(shellResult.stdout).trim(), path: 'claude' }
        }
        // Windows fallback: check well-known paths
        const winCandidates = []
        if (home) {
          winCandidates.push(path.join(home, 'AppData', 'Roaming', 'npm', 'claude.cmd'))
          winCandidates.push(path.join(home, '.npm-global', 'claude.cmd'))
        }
        for (const c of winCandidates) {
          if (!fs.existsSync(c)) continue
          const r = spawnSync(c, ['--version'], { stdio: 'pipe', shell: false, timeout: 5000 })
          if (r.status === 0) {
            return { installed: true, version: String(r.stdout).trim(), path: c }
          }
        }
      }
      return { installed: false }
    }
    case 'open_external': {
      const url = payload?.url
      if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
        shell.openExternal(url)
      }
      return { ok: true }
    }
    case 'set_lang': {
      const lang = payload?.lang
      if (lang === 'zh' || lang === 'en') {
        currentLang = lang
        updateTrayStatus()
      }
      return { ok: true }
    }

    default:
      throw new Error(`Unknown command: ${command}`)
  }
})

// ─── Single instance lock ────────────────────────────────────────────
const isDev = !!process.env.COPILOT_GUI_DEV
const gotLock = isDev || app.requestSingleInstanceLock()
if (!gotLock) {
  app.whenReady().then(() => {
    dialog.showMessageBoxSync({
      type: 'info',
      title: mt('app.alreadyRunning'),
      message: mt('app.alreadyRunningDetail'),
    })
    app.quit()
  })
} else {
  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore()
      mainWin.show()
      mainWin.focus()
    }
  })
}

// ─── App lifecycle ──────────────────────────────────────────────────

if (gotLock) app.whenReady().then(() => {
  conversationStore.init(app.getPath('userData'))
  createTray()
  createWindow()

  // Auto-check for updates 10s after launch
  setTimeout(() => {
    checkForUpdates().catch(e => console.warn('Auto update check failed:', e))
  }, 10000)

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
