import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const translations = {
  zh: {
    // ── Common ────────────────────────────────────
    back: '← 返回',
    cancel: '取消',
    save: '保存',
    loading: '加载中...',
    error: '错误',
    processing: '处理中...',
    refresh: '刷新',
    refreshing: '刷新中...',
    close: '关闭',

    // ── Status ────────────────────────────────────
    'status.running': '运行中',
    'status.stopped': '已停止',
    'status.starting': '启动中',
    'status.stopping': '停止中',
    'status.error': '错误',

    // ── Header ────────────────────────────────────
    'header.theme': '主题',
    'header.logs': '日志',
    'header.settings': '设置',
    'header.about': '关于',
    'header.lang': '语言',

    // ── Themes ────────────────────────────────────
    'theme.frost': '薰衣草',
    'theme.sakura': '蜜桃',
    'theme.cherry': '樱花',
    'theme.midnight': '星空',
    'theme.aurora': '极光',

    // ── Service Control ───────────────────────────
    'svc.start': '▶ 启动',
    'svc.stop': '⏹ 停止',
    'svc.starting': '启动中...',
    'svc.stopping': '停止中...',
    'svc.port': '端口',
    'svc.model': '模型',
    'svc.needLogin': '请先在设置中登录 GitHub',
    'svc.cannotCheckAuth': '无法检查登录状态',
    'svc.needModel': '请先选择默认模型',
    'svc.selectModelFirst': '⚠ 请先选择默认模型再启动',

    // ── Model Selection ───────────────────────────
    'model.default': '默认模型',
    'model.small': '快速模型',
    'model.saved': '模型选择已保存',
    'model.select': '请选择',
    'model.optional': '可选',
    'model.loginFirst': '请先到设置中登录 GitHub',
    'model.loadingList': '正在加载模型列表...',
    'model.selectFirst': '请先选择默认模型再启动',
    'model.tokenExpired': 'Token 已过期，请到设置中重新登录 GitHub',
    'model.fetchError': '获取模型失败: ',
    'model.defaultTooltip': '主力模型，用于处理复杂任务和长文本推理，如 Claude Sonnet / GPT-4o 等',
    'model.smallTooltip': '轻量快速模型，用于简单补全、摘要等低延迟场景，如 GPT-4o-mini / Claude Haiku 等（可选）',

    // ── Claude Code ───────────────────────────────
    'claude.launch': '🚀 启动 Claude Code',
    'claude.launching': '启动中...',
    'claude.launched': 'Claude Code 已启动',
    'claude.launchFailed': '启动失败: ',
    'claude.launchTooltip': '打开新终端窗口，设置好环境变量并运行 Claude Code',
    'claude.writeConfig': '📋 写入 CC 配置',
    'claude.clearConfig': '❌ 清除 CC 配置',
    'claude.writeTooltip': '将代理配置写入 Claude Code 的 ~/.claude/settings.json，之后直接运行 claude 即走代理',
    'claude.clearTooltip': '从 ~/.claude/settings.json 中清除代理配置',
    'claude.writeDone': '已写入 ~/.claude/settings.json，直接运行 claude 即可',
    'claude.clearDone': '已从 Claude Code 配置中清除代理设置',
    'claude.opFailed': '操作失败: ',
    'claude.notInstalled': '⚠️ 未检测到 Claude Code，请先安装: npm install -g @anthropic-ai/claude-code',
    'claude.installLink': '查看安装指南',

    // ── Usage ─────────────────────────────────────
    'usage.title': '📊 用量',
    'usage.needService': '需先启动代理',
    'usage.plan': '计划',
    'usage.reset': '重置',
    'usage.unlimited': '无限制',
    'usage.remaining': '剩余',
    'usage.overage': '超额',
    'usage.premium': '高级请求',
    'usage.chat': '聊天',
    'usage.completions': '补全',

    // ── Logs ──────────────────────────────────────
    'logs.title': 'Verbose 日志',
    'logs.openWindow': '📋 打开日志窗口',
    'logs.following': '已跟随，点击停止',
    'logs.notFollowing': '未跟随，点击开启',
    'logs.fontSmaller': '缩小字体',
    'logs.fontLarger': '放大字体',
    'logs.waiting': '等待日志...',
    'logs.notRunning': '服务未运行',

    // ── Settings ──────────────────────────────────
    'settings.title': '设置',
    'settings.githubLogin': 'GitHub 登录',
    'settings.loggedIn': '✅ 已登录',
    'settings.notLoggedIn': '⚠️ 未登录',
    'settings.tokenExpired': '⚠️ Token 已过期，请重新登录',
    'settings.loginBusy': '登录中...',
    'settings.loginBtn': '开始登录',
    'settings.checking': '检查中...',
    'settings.loginSuccess': '✅ 登录成功！正在检测账号类型...',
    'settings.loginSuccessType': '✅ 登录成功！账号类型: ',
    'settings.loginSuccessNoType': '✅ 登录成功！（账号类型检测失败，请手动选择）',
    'settings.codeExpired': '验证码已过期',
    'settings.loginError': '登录出错',

    'settings.serviceParams': '服务参数',
    'settings.port': '端口',
    'settings.portTooltip': '代理服务监听的端口号，默认 4399。',
    'settings.rateLimit': '限流秒数',
    'settings.rateLimitTooltip': '每次请求之间的最小间隔秒数，防止过于频繁调用 API。留空表示不限制。',
    'settings.rateLimitPlaceholder': '不限',
    'settings.accountType': '账号类型',
    'settings.accountTypeTooltip': 'GitHub Copilot 订阅类型，影响可用模型和配额。',
    'settings.rateLimitWait': '超限等待',
    'settings.rateLimitWaitTooltip': '开启后，当触发限流时请求会排队等待而不是直接拒绝（返回 429）。',
    'settings.verbose': '详细日志',
    'settings.verboseTooltip': '开启后，服务会输出更详细的日志信息，包括请求/响应的完整内容，便于调试问题。',
    'settings.manualApprove': '手动审批',
    'settings.manualApproveTooltip': '开启后，每次 API 请求都需要在终端手动确认后才会转发到 Copilot，适合调试或安全审计。',
    'settings.proxyEnv': '使用代理环境变量',
    'settings.proxyEnvTooltip': '开启后，服务会读取系统的 HTTP_PROXY / HTTPS_PROXY 环境变量，通过代理服务器访问 GitHub API。',
    'settings.showToken': '显示 Token（调试）',
    'settings.showTokenTooltip': '开启后，启动日志中会打印 Copilot Token 的完整内容，仅用于调试目的。',
    'settings.autoStart': '启动时自动运行服务',
    'settings.autoStartTooltip': '开启后，应用启动时会自动运行代理服务，无需手动点击启动按钮。',
    'settings.closeAction': '关闭窗口时',
    'settings.closeActionTooltip': '设置点击关闭按钮时的默认行为。选择"每次询问"可在关闭时弹出选择对话框。',
    'settings.closeAction.ask': '每次询问',
    'settings.closeAction.minimize': '最小化到托盘',
    'settings.closeAction.quit': '退出应用',
    'settings.resetBtn': '恢复默认设置',
    'settings.saveBtn': '保存所有配置',

    // ── Config Toast ──────────────────────────────
    'config.saved': '配置已保存，重启 Proxy 后生效',
    'config.resetConfirm': '确定要恢复所有默认设置、停止正在运行的服务并删除登录 Token 吗？',

    // ── About ─────────────────────────────────────
    'about.title': '关于',
    'about.desc': '一个桌面客户端，用于管理和运行 Copilot Proxy 服务，将 GitHub Copilot 作为 OpenAI 兼容的 API 使用。',
    'about.repoTitle': '项目地址',
    'about.credits': '致谢',
    'about.creditsDesc': '本项目基于以下开源项目开发，特此感谢：',
    'about.upstreamDesc': 'by Jer-y — 核心代理服务实现',
    // ── Update ────────────────────────────────────────
    'update.title': '软件更新',
    'update.check': '检查更新',
    'update.checking': '检查中...',
    'update.upToDate': '✅ 已是最新版本',
    'update.available': '发现新版本',
    'update.download': '⬇ 下载更新',
    'update.downloading': '下载中...',
    'update.ready': '✅ 更新已就绪',
    'update.restart': '🔄 重启应用',
    'update.restartHint': '重启以完成更新',
    'update.failed': '更新失败: ',
    'update.retry': '重试',
    'update.fullNeeded': '此版本需要下载完整安装包',
    'update.openRelease': '前往下载',
    'update.bundleOnly': '仅更新代理服务，无需重启',
    // ── Risk Dialog ───────────────────────────────
    'risk.title': '⚠️ 使用风险提示',
    'risk.warn1': '警告 1',
    'risk.warn2': '警告 2 — GitHub 安全提示',
    'risk.summary': '点击「我接受风险」即表示你已阅读并理解上述警告，同意自行承担所有使用风险。',
    'risk.accept': '我接受风险',

    // ── Close Dialog ──────────────────────────────
    'close.title': '关闭窗口',
    'close.message': '请选择操作',
    'close.minimize': '最小化到托盘',
    'close.quit': '退出程序',
    'close.remember': '记住我的选择',
  },

  en: {
    // ── Common ────────────────────────────────────
    back: '← Back',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    processing: 'Processing...',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    close: 'Close',

    // ── Status ────────────────────────────────────
    'status.running': 'Running',
    'status.stopped': 'Stopped',
    'status.starting': 'Starting',
    'status.stopping': 'Stopping',
    'status.error': 'Error',

    // ── Header ────────────────────────────────────
    'header.theme': 'Theme',
    'header.logs': 'Logs',
    'header.settings': 'Settings',
    'header.about': 'About',
    'header.lang': 'Language',

    // ── Themes ────────────────────────────────────
    'theme.frost': 'Lavender',
    'theme.sakura': 'Peach',
    'theme.cherry': 'Cherry',
    'theme.midnight': 'Midnight',
    'theme.aurora': 'Aurora',

    // ── Service Control ───────────────────────────
    'svc.start': '▶ Start',
    'svc.stop': '⏹ Stop',
    'svc.starting': 'Starting...',
    'svc.stopping': 'Stopping...',
    'svc.port': 'Port',
    'svc.model': 'Model',
    'svc.needLogin': 'Please log in to GitHub in Settings first',
    'svc.cannotCheckAuth': 'Cannot check login status',
    'svc.needModel': 'Please select a default model first',
    'svc.selectModelFirst': '⚠ Please select a default model before starting',

    // ── Model Selection ───────────────────────────
    'model.default': 'Default Model',
    'model.small': 'Fast Model',
    'model.saved': 'Model selection saved',
    'model.select': 'Select...',
    'model.optional': 'Optional',
    'model.loginFirst': 'Please log in to GitHub in Settings first',
    'model.loadingList': 'Loading model list...',
    'model.selectFirst': 'Please select a default model before starting',
    'model.tokenExpired': 'Token expired. Please re-login in Settings.',
    'model.fetchError': 'Failed to fetch models: ',
    'model.defaultTooltip': 'Primary model for complex tasks and long-text reasoning, e.g. Claude Sonnet / GPT-4o',
    'model.smallTooltip': 'Lightweight fast model for simple completions, summaries etc. e.g. GPT-4o-mini / Claude Haiku (optional)',

    // ── Claude Code ───────────────────────────────
    'claude.launch': '🚀 Launch Claude Code',
    'claude.launching': 'Launching...',
    'claude.launched': 'Claude Code launched',
    'claude.launchFailed': 'Launch failed: ',
    'claude.launchTooltip': 'Open a new terminal window with environment variables set and run Claude Code',
    'claude.writeConfig': '📋 Write CC Config',
    'claude.clearConfig': '❌ Clear CC Config',
    'claude.writeTooltip': 'Write proxy config to ~/.claude/settings.json so claude runs through the proxy',
    'claude.clearTooltip': 'Remove proxy config from ~/.claude/settings.json',
    'claude.writeDone': 'Written to ~/.claude/settings.json. Run claude directly to use proxy.',
    'claude.clearDone': 'Proxy settings cleared from Claude Code config',
    'claude.opFailed': 'Operation failed: ',
    'claude.notInstalled': '⚠️ Claude Code not found. Please install first: npm install -g @anthropic-ai/claude-code',
    'claude.installLink': 'Installation guide',

    // ── Usage ─────────────────────────────────────
    'usage.title': '📊 Usage',
    'usage.needService': 'Start proxy first',
    'usage.plan': 'Plan',
    'usage.reset': 'Reset',
    'usage.unlimited': 'Unlimited',
    'usage.remaining': 'Remaining',
    'usage.overage': 'Overage',
    'usage.premium': 'Premium Requests',
    'usage.chat': 'Chat',
    'usage.completions': 'Completions',

    // ── Logs ──────────────────────────────────────
    'logs.title': 'Verbose Logs',
    'logs.openWindow': '📋 Open Log Window',
    'logs.following': 'Following, click to stop',
    'logs.notFollowing': 'Not following, click to start',
    'logs.fontSmaller': 'Smaller font',
    'logs.fontLarger': 'Larger font',
    'logs.waiting': 'Waiting for logs...',
    'logs.notRunning': 'Service not running',

    // ── Settings ──────────────────────────────────
    'settings.title': 'Settings',
    'settings.githubLogin': 'GitHub Login',
    'settings.loggedIn': '✅ Logged in',
    'settings.notLoggedIn': '⚠️ Not logged in',
    'settings.tokenExpired': '⚠️ Token expired. Please re-login.',
    'settings.loginBusy': 'Logging in...',
    'settings.loginBtn': 'Log In',
    'settings.checking': 'Checking...',
    'settings.loginSuccess': '✅ Login successful! Detecting account type...',
    'settings.loginSuccessType': '✅ Login successful! Account type: ',
    'settings.loginSuccessNoType': '✅ Login successful! (Failed to detect account type, please select manually)',
    'settings.codeExpired': 'Verification code expired',
    'settings.loginError': 'Login error',

    'settings.serviceParams': 'Service Parameters',
    'settings.port': 'Port',
    'settings.portTooltip': 'Port for the proxy service to listen on. Default: 4399.',
    'settings.rateLimit': 'Rate Limit (s)',
    'settings.rateLimitTooltip': 'Minimum interval in seconds between requests to prevent excessive API calls. Leave blank for no limit.',
    'settings.rateLimitPlaceholder': 'None',
    'settings.accountType': 'Account Type',
    'settings.accountTypeTooltip': 'GitHub Copilot subscription type, affects available models and quotas.',
    'settings.rateLimitWait': 'Wait on Limit',
    'settings.rateLimitWaitTooltip': 'When enabled, requests queue instead of being rejected (429) when rate limited.',
    'settings.verbose': 'Verbose Logs',
    'settings.verboseTooltip': 'When enabled, outputs detailed log info including full request/response content for debugging.',
    'settings.manualApprove': 'Manual Approve',
    'settings.manualApproveTooltip': 'When enabled, each API request requires manual confirmation in the terminal before forwarding to Copilot.',
    'settings.proxyEnv': 'Use Proxy Env Vars',
    'settings.proxyEnvTooltip': 'When enabled, reads HTTP_PROXY / HTTPS_PROXY environment variables to access GitHub API through a proxy.',
    'settings.showToken': 'Show Token (Debug)',
    'settings.showTokenTooltip': 'When enabled, prints the full Copilot Token in startup logs. For debugging only.',
    'settings.autoStart': 'Auto-start Service',
    'settings.autoStartTooltip': 'When enabled, automatically starts the proxy service when the app launches.',
    'settings.closeAction': 'On Close',
    'settings.closeActionTooltip': 'Default action when the window close button is clicked. Choose "Ask every time" to show a confirmation dialog.',
    'settings.closeAction.ask': 'Ask every time',
    'settings.closeAction.minimize': 'Minimize to tray',
    'settings.closeAction.quit': 'Quit app',
    'settings.resetBtn': 'Reset to Defaults',
    'settings.saveBtn': 'Save All Settings',

    // ── Config Toast ──────────────────────────────
    'config.saved': 'Settings saved. Restart proxy to apply.',
    'config.resetConfirm': 'Are you sure you want to reset all settings, stop the running service, and delete the login token?',

    // ── About ─────────────────────────────────────
    'about.title': 'About',
    'about.desc': 'A desktop client for managing and running Copilot Proxy service, using GitHub Copilot as an OpenAI-compatible API.',
    'about.repoTitle': 'Repository',
    'about.credits': 'Credits',
    'about.creditsDesc': 'This project is built upon the following open-source project:',
    'about.upstreamDesc': 'by Jer-y — Core proxy service implementation',
    // ── Update ────────────────────────────────────────
    'update.title': 'Software Update',
    'update.check': 'Check for Updates',
    'update.checking': 'Checking...',
    'update.upToDate': '✅ Already up to date',
    'update.available': 'New version available',
    'update.download': '⬇ Download Update',
    'update.downloading': 'Downloading...',
    'update.ready': '✅ Update ready',
    'update.restart': '🔄 Restart App',
    'update.restartHint': 'Restart to complete update',
    'update.failed': 'Update failed: ',
    'update.retry': 'Retry',
    'update.fullNeeded': 'This version requires a full download',
    'update.openRelease': 'Go to Download',
    'update.bundleOnly': 'Proxy updated, no restart needed',
    // ── Risk Dialog ───────────────────────────────
    'risk.title': '⚠️ Risk Disclaimer',
    'risk.warn1': 'Warning 1',
    'risk.warn2': 'Warning 2 — GitHub Safety Notice',
    'risk.summary': 'By clicking "I Accept the Risk", you acknowledge that you have read and understood the above warnings and agree to assume all risks.',
    'risk.accept': 'I Accept the Risk',

    // ── Close Dialog ──────────────────────────────
    'close.title': 'Close Window',
    'close.message': 'Choose an action',
    'close.minimize': 'Minimize to Tray',
    'close.quit': 'Quit',
    'close.remember': 'Remember my choice',
  },
}

const I18nContext = createContext(null)

export function I18nProvider({ lang: initialLang = 'zh', onChangeLang, children }) {
  const [lang, setLangState] = useState(initialLang)

  const setLang = useCallback((newLang) => {
    setLangState(newLang)
    if (onChangeLang) onChangeLang(newLang)
  }, [onChangeLang])

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations.zh[key] ?? key
  }, [lang])

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang, setLang])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
