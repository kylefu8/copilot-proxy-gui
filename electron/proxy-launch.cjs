const GUI_ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1']

function isClaudeModelId(model) {
  if (!model) return false
  const value = String(model)
  const separator = value.indexOf('/')
  const modelId = separator > 0 ? value.slice(separator + 1) : value
  return /^claude/i.test(modelId)
}

function stripGithubTokenArguments(args) {
  const sanitized = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--') {
      sanitized.push(...args.slice(index))
      break
    }

    if (arg === '--github-token' || arg === '-g') {
      if (args[index + 1] !== undefined) index++
      continue
    }

    if (arg.startsWith('--github-token=') || (arg.startsWith('-g') && arg.length > 2)) {
      continue
    }

    sanitized.push(arg)
  }

  return sanitized
}

function mergeAllowedHosts(value) {
  const hosts = String(value || '').split(',').map(host => host.trim()).filter(Boolean)
  const seen = new Set(hosts.map(host => host.toLowerCase()))

  for (const host of GUI_ALLOWED_HOSTS) {
    if (seen.has(host)) continue
    hosts.push(host)
    seen.add(host)
  }

  return hosts.join(',')
}

function buildProxyLaunch({
  args,
  token,
  baseEnv = process.env,
  conversationLog = false,
  explicitAccounts = false,
  dataDir,
}) {
  const env = { ...baseEnv }
  const cleanToken = String(token || '').trim()

  // An explicit accounts.json is authoritative. Remove both legacy token
  // environment spellings so a copied parent environment cannot make the
  // long-running proxy fall back to the GUI's single-account credential.
  if (explicitAccounts) {
    delete env.GH_TOKEN
    delete env.GITHUB_TOKEN
  } else if (cleanToken) {
    env.GH_TOKEN = cleanToken
  }

  if (dataDir) env.COPILOT_PROXY_DATA_DIR = dataDir
  env.COPILOT_PROXY_ALLOWED_HOSTS = mergeAllowedHosts(env.COPILOT_PROXY_ALLOWED_HOSTS)
  if (conversationLog) env.COPILOT_PROXY_CONVERSATION_LOG = '1'

  return {
    args: stripGithubTokenArguments(Array.isArray(args) ? args : []),
    env,
  }
}

module.exports = { buildProxyLaunch, isClaudeModelId, stripGithubTokenArguments }
