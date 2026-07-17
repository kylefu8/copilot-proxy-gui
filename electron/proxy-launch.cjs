const GUI_ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1']

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

function buildProxyLaunch({ args, token, baseEnv = process.env, conversationLog = false }) {
  const env = { ...baseEnv }
  const cleanToken = String(token || '').trim()

  if (cleanToken) env.GH_TOKEN = cleanToken
  env.COPILOT_PROXY_ALLOWED_HOSTS = mergeAllowedHosts(env.COPILOT_PROXY_ALLOWED_HOSTS)
  if (conversationLog) env.COPILOT_PROXY_CONVERSATION_LOG = '1'

  return {
    args: stripGithubTokenArguments(Array.isArray(args) ? args : []),
    env,
  }
}

module.exports = { buildProxyLaunch, stripGithubTokenArguments }
