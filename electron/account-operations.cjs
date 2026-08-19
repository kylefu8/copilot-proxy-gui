const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const ACCOUNT_TYPES = new Set(['individual', 'business', 'enterprise'])
const ACCOUNT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,31}$/
const WINDOWS_RESERVED_ACCOUNT_IDS = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/
const ACCOUNT_DESCRIPTOR_KEYS = ['id', 'accountType', 'githubLogin', 'githubUserId', 'maxConcurrency']
const ROUTE_KEYS = ['match', 'account']
const REQUIRED_ROUTE_KEYS = ['surface', 'model']
const MULTI_ACCOUNT_LOCK_NAMES = ['runtime.lock', 'accounts.lock']
const GUI_BACKUP_PREFIX = 'accounts.json.gui-backup-'

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isAllowedGitHubVerificationUrl(value) {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:'
      && url.hostname.toLowerCase() === 'github.com'
      && url.port === ''
      && url.username === ''
      && url.password === ''
      && (url.pathname === '/login/device' || url.pathname === '/login/device/')
  } catch {
    return false
  }
}

function getProxyDataDir({ env = process.env, platform = process.platform, homedir = os.homedir() } = {}) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix
  const configured = typeof env.COPILOT_PROXY_DATA_DIR === 'string'
    ? env.COPILOT_PROXY_DATA_DIR.trim()
    : ''

  if (configured) return pathApi.resolve(configured)

  if (platform === 'win32') {
    const dataHome = typeof env.LOCALAPPDATA === 'string' && env.LOCALAPPDATA.trim()
      ? env.LOCALAPPDATA.trim()
      : pathApi.join(homedir, 'AppData', 'Local')
    return pathApi.join(dataHome, 'copilot-proxy')
  }

  const configuredDataHome = typeof env.XDG_DATA_HOME === 'string'
    ? env.XDG_DATA_HOME.trim()
    : ''
  const dataHome = configuredDataHome && pathApi.isAbsolute(configuredDataHome)
    ? configuredDataHome
    : pathApi.join(homedir, '.local', 'share')
  return pathApi.join(dataHome, 'copilot-proxy')
}

function accountsConfigPath(dataDir) {
  return path.join(dataDir, 'accounts.json')
}

function readAccountsFileSnapshot(dataDir) {
  const filePath = accountsConfigPath(dataDir)
  let raw
  let stat

  try {
    raw = fs.readFileSync(filePath)
    stat = fs.statSync(filePath)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('Cannot exit multi-account mode: accounts.json was not found.')
    }
    throw new Error('Cannot read accounts.json safely.', { cause: error })
  }

  let configuration
  try {
    configuration = JSON.parse(raw.toString('utf8'))
  } catch (error) {
    throw new Error('Cannot exit multi-account mode: accounts.json is invalid.', { cause: error })
  }

  return {
    filePath,
    raw,
    stat,
    configuration: normalizeAccountsConfiguration(configuration),
  }
}

function sameAccountsFileSnapshot(left, right) {
  return left.stat.dev === right.stat.dev
    && left.stat.ino === right.stat.ino
    && left.stat.size === right.stat.size
    && left.stat.mtimeMs === right.stat.mtimeMs
    && left.stat.ctimeMs === right.stat.ctimeMs
    && Buffer.compare(left.raw, right.raw) === 0
}

function assertAccountsFileUnchanged(snapshot) {
  let current
  try {
    current = readAccountsFileSnapshot(path.dirname(snapshot.filePath))
  } catch (error) {
    throw new Error('Cannot exit multi-account mode safely: accounts.json changed during the operation.', { cause: error })
  }

  if (!sameAccountsFileSnapshot(snapshot, current)) {
    throw new Error('Cannot exit multi-account mode safely: accounts.json changed during the operation.')
  }
}

function assertNoMultiAccountLocks(dataDir) {
  for (const lockName of MULTI_ACCOUNT_LOCK_NAMES) {
    const lockPath = path.join(dataDir, lockName)
    try {
      fs.lstatSync(lockPath)
    } catch (error) {
      if (error && error.code === 'ENOENT') continue
      throw new Error(`Cannot inspect ${lockName} before exiting multi-account mode.`, { cause: error })
    }
    throw new Error(`Cannot exit multi-account mode while ${lockName} may indicate another proxy process or account write. Stop it and retry.`)
  }
}

function readSingleAccountToken(dataDir, accountId) {
  assertAccountId(accountId, 'configured account id')
  const tokenPath = path.join(dataDir, 'tokens', accountId)
  let token
  try {
    token = fs.readFileSync(tokenPath, 'utf8').trim()
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error('Cannot exit multi-account mode: the account token file is missing.')
    }
    throw new Error('Cannot read the account token safely.', { cause: error })
  }
  if (!token) {
    throw new Error('Cannot exit multi-account mode: the account token file is empty.')
  }
  return token
}

function pathExists(filePath) {
  try {
    fs.lstatSync(filePath)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') return false
    throw error
  }
}

function chooseGuiBackupPath(dataDir, timestamp = Date.now()) {
  const safeTimestamp = Number.isFinite(Number(timestamp))
    ? String(Math.trunc(Number(timestamp)))
    : String(Date.now())

  for (let sequence = 0; sequence < 10000; sequence += 1) {
    const suffix = sequence === 0 ? '' : `-${sequence}`
    const fileName = `${GUI_BACKUP_PREFIX}${safeTimestamp}${suffix}`
    const candidate = path.join(dataDir, fileName)
    if (!pathExists(candidate)) return candidate
  }

  throw new Error('Cannot choose a unique accounts.json backup name safely.')
}

function exitMultiAccountMode({
  dataDir,
  writeToken,
  now = Date.now,
} = {}) {
  if (typeof writeToken !== 'function') {
    throw new Error('A legacy token writer is required to exit multi-account mode.')
  }

  const resolvedDataDir = path.resolve(dataDir || getProxyDataDir())
  assertNoMultiAccountLocks(resolvedDataDir)

  const snapshot = readAccountsFileSnapshot(resolvedDataDir)
  const accounts = snapshot.configuration.accounts
  if (accounts.length !== 1) {
    throw new Error('Cannot exit multi-account mode: exactly one configured account is required.')
  }

  const accountId = accounts[0].id
  const token = readSingleAccountToken(resolvedDataDir, accountId)

  // Recheck immediately before handing the token to Electron storage so a
  // changed registry can never be silently converted using an old snapshot.
  assertNoMultiAccountLocks(resolvedDataDir)
  assertAccountsFileUnchanged(snapshot)
  writeToken(token)

  // The token has deliberately never been part of the return value or a
  // child-process argument. Recheck both guards before the atomic rename.
  assertNoMultiAccountLocks(resolvedDataDir)
  assertAccountsFileUnchanged(snapshot)

  let backupPath
  for (let attempt = 0; attempt < 10000; attempt += 1) {
    assertNoMultiAccountLocks(resolvedDataDir)
    assertAccountsFileUnchanged(snapshot)
    backupPath = chooseGuiBackupPath(resolvedDataDir, now())
    try {
      fs.renameSync(snapshot.filePath, backupPath)
      break
    } catch (error) {
      if (error && (error.code === 'EEXIST' || error.code === 'ENOTEMPTY')) continue
      throw new Error('Cannot back up accounts.json safely.', { cause: error })
    }
  }

  if (!backupPath || pathExists(snapshot.filePath)) {
    throw new Error('Cannot back up accounts.json safely.')
  }

  return {
    ok: true,
    backupFileName: path.basename(backupPath),
  }
}

function copyKnownFields(value, keys) {
  if (!isRecord(value)) return null
  const result = {}
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) result[key] = value[key]
  }
  return result
}

function normalizeAccountsConfiguration(configuration) {
  const source = isRecord(configuration) ? configuration : {}
  const normalized = { explicit: true }

  if (Object.prototype.hasOwnProperty.call(source, 'version')) normalized.version = source.version
  if (Object.prototype.hasOwnProperty.call(source, 'revision')) normalized.revision = source.revision
  normalized.defaultAccount = typeof source.defaultAccount === 'string'
    ? source.defaultAccount
    : null
  normalized.accounts = Array.isArray(source.accounts)
    ? source.accounts.map(account => copyKnownFields(account, ACCOUNT_DESCRIPTOR_KEYS)).filter(Boolean)
    : []
  normalized.routes = Array.isArray(source.routes)
    ? source.routes.map(route => copyKnownFields(route, ROUTE_KEYS)).filter(Boolean)
    : []
  normalized.requiredRoutes = Array.isArray(source.requiredRoutes)
    ? source.requiredRoutes.map(route => copyKnownFields(route, REQUIRED_ROUTE_KEYS)).filter(Boolean)
    : []

  return normalized
}

function readAccountsSnapshot({ dataDir, env = process.env, platform = process.platform, homedir } = {}) {
  const resolvedDataDir = dataDir || getProxyDataDir({ env, platform, homedir })
  const filePath = accountsConfigPath(resolvedDataDir)

  if (!fs.existsSync(filePath)) {
    return {
      explicit: false,
      defaultAccount: null,
      accounts: [],
      routes: [],
      requiredRoutes: [],
    }
  }

  let configuration
  try {
    configuration = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid accounts configuration JSON at ${filePath}`, { cause: error })
  }

  return normalizeAccountsConfiguration(configuration)
}

function assertAccountId(value, label = 'account id') {
  if (
    typeof value !== 'string'
    || !ACCOUNT_ID_PATTERN.test(value)
    || WINDOWS_RESERVED_ACCOUNT_IDS.test(value)
  ) {
    throw new Error(`Invalid ${label}. Use 1-32 lowercase letters, digits, underscores, or hyphens.`)
  }
  return value
}

function assertAccountType(value) {
  if (typeof value !== 'string' || !ACCOUNT_TYPES.has(value)) {
    throw new Error(`Invalid account type: ${String(value)}`)
  }
  return value
}

function assertPositionalText(value, label) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.trim() !== value
    || value.startsWith('-')
    || /[\u0000-\u001f\u007f\s]/.test(value)
  ) {
    throw new Error(`Invalid ${label}`)
  }
  return value
}

function assertProxyEnv(value) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new Error('proxyEnv must be a boolean')
  }
  return value === true
}

function proxyFlag(proxyEnv) {
  return proxyEnv ? ['--proxy-env'] : []
}

function buildAccountCommand(command, payload = {}) {
  switch (command) {
    case 'account_add_saved_token': {
      const id = assertAccountId(payload.id)
      const accountType = assertAccountType(payload.accountType)
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return [
        'accounts', 'add', id,
        '--account-type', accountType,
        '--token-stdin',
        ...proxyFlag(proxyEnv),
        '--yes',
      ]
    }
    case 'account_reauth': {
      const id = assertAccountId(payload.id)
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return [
        'accounts', 'auth', id,
        '--token-stdin',
        ...proxyFlag(proxyEnv),
        '--yes',
      ]
    }
    case 'account_set_default': {
      const id = assertAccountId(payload.id)
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return ['accounts', 'default', id, ...proxyFlag(proxyEnv), '--yes']
    }
    case 'account_remove': {
      const id = assertAccountId(payload.id)
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return ['accounts', 'remove', id, ...proxyFlag(proxyEnv), '--yes']
    }
    case 'account_route_set': {
      const match = assertPositionalText(payload.match, 'route match')
      const account = assertAccountId(payload.account)
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return ['accounts', 'route', 'set', match, account, ...proxyFlag(proxyEnv), '--yes']
    }
    case 'account_route_remove': {
      const match = assertPositionalText(payload.match, 'route match')
      const proxyEnv = assertProxyEnv(payload.proxyEnv)
      return ['accounts', 'route', 'remove', match, ...proxyFlag(proxyEnv), '--yes']
    }
    default:
      throw new Error(`Unsupported account operation: ${command}`)
  }
}

function buildAccountActionCommand(accountAction) {
  if (!isRecord(accountAction)) throw new Error('accountAction must be an object')

  if (accountAction.type === 'add') {
    return {
      args: buildAccountCommand('account_add_saved_token', accountAction),
      id: assertAccountId(accountAction.id),
      description: 'Account added',
    }
  }

  if (accountAction.type === 'reauth') {
    return {
      args: buildAccountCommand('account_reauth', accountAction),
      id: assertAccountId(accountAction.id),
      description: 'Account re-authenticated',
    }
  }

  throw new Error('Unsupported accountAction type')
}

function resolveProxyCommand({
  isPackaged,
  resourcesPath = process.resourcesPath,
  dirname = __dirname,
  repoRoot,
  processExecPath = process.execPath,
  bunPath,
  fileExists = fs.existsSync,
} = {}) {
  if (isPackaged) {
    const bundlePath = path.join(resourcesPath, 'copilot-proxy-bundle.mjs')
    const legacyBinaryName = process.platform === 'win32' ? 'copilot-proxy-server.exe' : 'copilot-proxy-server'
    const legacyBinaryPath = path.join(resourcesPath, legacyBinaryName)

    if (fileExists(bundlePath)) {
      return {
        bin: processExecPath,
        args: [bundlePath],
        env: { ELECTRON_RUN_AS_NODE: '1' },
        cwd: undefined,
        path: bundlePath,
      }
    }
    if (fileExists(legacyBinaryPath)) {
      return {
        bin: legacyBinaryPath,
        args: [],
        env: {},
        cwd: undefined,
        path: legacyBinaryPath,
      }
    }

    throw new Error(`Proxy server not found. Looked for:\n  ${bundlePath}\n  ${legacyBinaryPath}`)
  }

  const devBundlePath = path.resolve(dirname, '..', 'build', 'copilot-proxy-bundle.mjs')
  if (fileExists(devBundlePath)) {
    return {
      bin: processExecPath,
      args: [devBundlePath],
      env: { ELECTRON_RUN_AS_NODE: '1' },
      cwd: undefined,
      path: devBundlePath,
    }
  }

  if (repoRoot) {
    if (!bunPath) {
      throw new Error('Neither build/copilot-proxy-bundle.mjs nor bun found. Run: node scripts/bundle-proxy.cjs')
    }
    return {
      bin: bunPath,
      args: ['run', 'src/main.ts'],
      env: {},
      cwd: repoRoot,
      path: path.join(repoRoot, 'src', 'main.ts'),
    }
  }

  throw new Error('Proxy server not found. Run: node scripts/bundle-proxy.cjs')
}

function buildAccountCommandEnvironment({ baseEnv = process.env, dataDir, commandEnv = {} } = {}) {
  const env = { ...baseEnv, ...(commandEnv || {}) }
  delete env.GH_TOKEN
  delete env.GITHUB_TOKEN
  if (dataDir) env.COPILOT_PROXY_DATA_DIR = dataDir
  return env
}

function runProxyCommand({
  command,
  args = [],
  baseEnv = process.env,
  dataDir,
  stdinToken,
  spawnImpl = spawn,
} = {}) {
  if (!command || typeof command.bin !== 'string') {
    return Promise.reject(new Error('A resolved proxy command is required'))
  }
  if (stdinToken !== undefined && String(stdinToken).trim() === '') {
    return Promise.reject(new Error('Token input must not be empty'))
  }

  const commandArgs = [...(command.args || []), ...args]
  const env = buildAccountCommandEnvironment({
    baseEnv,
    dataDir,
    commandEnv: command.env,
  })

  return new Promise((resolve, reject) => {
    let child
    try {
      child = spawnImpl(command.bin, commandArgs, {
        cwd: command.cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
        windowsHide: true,
      })
    } catch (error) {
      reject(error)
      return
    }

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += String(chunk) })
    child.stderr.on('data', chunk => { stderr += String(chunk) })
    child.once('error', reject)
    child.once('close', (code, signal) => {
      resolve({
        exitCode: code === null ? 1 : code,
        signal: signal || null,
        stdout,
        stderr,
      })
    })

    if (stdinToken === undefined) child.stdin.end()
    else child.stdin.end(`${String(stdinToken).trim()}\n`)
  })
}

function parseJsonOutput(stdout) {
  const output = String(stdout || '').trim()
  if (!output) throw new Error('Proxy command returned empty JSON output')

  try {
    return JSON.parse(output)
  } catch {
    const first = output.indexOf('{')
    const last = output.lastIndexOf('}')
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(output.slice(first, last + 1))
      } catch {
        // Fall through to the descriptive error below.
      }
    }
    throw new Error('Proxy command returned invalid JSON output')
  }
}

function redactCommandOutput(output, secrets = []) {
  let result = String(output || '')
  for (const secret of secrets) {
    const value = String(secret || '')
    if (value) result = result.split(value).join('[redacted]')
  }
  // Strip ANSI CSI sequences (for example, red error backgrounds) after
  // secret replacement so CLI diagnostics cannot leak terminal controls to
  // the renderer or end up in a user-facing Error message.
  result = result.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
  return result.trim().slice(0, 2000)
}

function summarizeCommandFailure(output, secrets = []) {
  const redacted = redactCommandOutput(output, secrets)
  const lines = redacted.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const errorLine = lines.find(line => /\bERROR\b/i.test(line))
  if (errorLine) {
    return errorLine.replace(/^.*?\bERROR\b\s*/i, '').trim()
  }
  const usefulLine = lines.find(line => (
    !/^i\s+/i.test(line)
    && !/^info\s+/i.test(line)
    && !/^configured copilot upstream/i.test(line)
    && !/^using built-in longer/i.test(line)
    && !/^change preview:/i.test(line)
  ))
  return usefulLine || redacted
}

module.exports = {
  ACCOUNT_ID_PATTERN,
  ACCOUNT_TYPES,
  accountsConfigPath,
  buildAccountActionCommand,
  buildAccountCommand,
  buildAccountCommandEnvironment,
  exitMultiAccountMode,
  getProxyDataDir,
  isAllowedGitHubVerificationUrl,
  normalizeAccountsConfiguration,
  parseJsonOutput,
  readAccountsSnapshot,
  redactCommandOutput,
  summarizeCommandFailure,
  resolveProxyCommand,
  runProxyCommand,
}
