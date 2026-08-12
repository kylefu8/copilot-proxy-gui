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

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
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
  return result.trim().slice(0, 2000)
}

module.exports = {
  ACCOUNT_ID_PATTERN,
  ACCOUNT_TYPES,
  accountsConfigPath,
  buildAccountActionCommand,
  buildAccountCommand,
  buildAccountCommandEnvironment,
  getProxyDataDir,
  normalizeAccountsConfiguration,
  parseJsonOutput,
  readAccountsSnapshot,
  redactCommandOutput,
  resolveProxyCommand,
  runProxyCommand,
}
