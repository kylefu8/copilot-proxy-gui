const STORAGE_KEY = 'copilot-proxy-gui.config.v1'

export const defaultConfig = {
  port: 4399,
  accountType: 'individual',
  verbose: false,
  manualApprove: false,
  rateLimitSeconds: '',
  rateLimitWait: false,
  proxyEnv: false,
  showToken: false,
  autoStart: false,
  defaultModel: '',
  defaultSmallModel: '',
  theme: 'frost',
  lang: 'zh',
  riskAcceptedAt: null,       // ISO timestamp when user accepted risk
  riskConfigFingerprint: '',  // fingerprint of config at acceptance time
}

/** Build a fingerprint string from the service-affecting config keys */
export function configFingerprint(config) {
  const keys = ['port', 'accountType', 'verbose', 'manualApprove', 'rateLimitSeconds', 'rateLimitWait', 'proxyEnv', 'showToken']
  return keys.map(k => `${k}=${config[k] ?? ''}`).join('|')
}

/** Check whether risk must be (re-)accepted before starting */
export function needsRiskAcceptance(config) {
  if (!config.riskAcceptedAt) return true
  return config.riskConfigFingerprint !== configFingerprint(config)
}

export const themes = [
  { id: 'frost' },
  { id: 'sakura' },
  { id: 'cherry' },
  { id: 'midnight' },
  { id: 'aurora' },
]

export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId)
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return { ...defaultConfig }

    const parsed = JSON.parse(raw)
    return {
      ...defaultConfig,
      ...parsed,
    }
  }
  catch (e) {
    console.warn('Failed to load config from localStorage:', e)
    return { ...defaultConfig }
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function resetConfig() {
  localStorage.removeItem(STORAGE_KEY)
  return { ...defaultConfig }
}

export function toCliArgs(config) {
  const args = ['start', '--port', String(config.port)]

  if (config.accountType && config.accountType !== 'individual')
    args.push('--account-type', config.accountType)

  if (config.verbose)
    args.push('--verbose')

  if (config.manualApprove)
    args.push('--manual')

  if (config.rateLimitSeconds !== '' && config.rateLimitSeconds !== null) {
    args.push('--rate-limit', String(config.rateLimitSeconds))
  }

  if (config.rateLimitWait)
    args.push('--wait')

  if (config.proxyEnv)
    args.push('--proxy-env')

  if (config.showToken)
    args.push('--show-token')

  return args
}
