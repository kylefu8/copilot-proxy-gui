import { useCallback, useEffect, useRef, useState } from 'react'
import { resizeWindow, launchClaudeCode, writeClaudeEnv, clearClaudeEnv, checkClaudeEnv } from '../../core/service-manager'
import { themes, applyTheme } from '../../core/config-store'

export function MainView({
  config,
  service,
  serviceBusy,
  onStart,
  onStop,
  baseUrl,
  onOpenSettings,
  onOpenAbout,
  getServiceLogs,
  getUsage,
  models,
  modelsLoading,
  modelsError,
  onFetchModels,
  onChangeConfig,
  onChangeAndSaveConfig,
  onSaveConfig,
  showToast,
  authStatus,
}) {
  const [usage, setUsage] = useState(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState('')
  const [logs, setLogs] = useState([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [usageOpen, setUsageOpen] = useState(false)
  const [claudeLaunching, setClaudeLaunching] = useState(false)
  const [envWritten, setEnvWritten] = useState(false)
  const [envBusy, setEnvBusy] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [logFontSize, setLogFontSize] = useState(12)
  const [logFollow, setLogFollow] = useState(true)
  const logEndRef = useRef(null)
  const pollRef = useRef(null)
  const themeRef = useRef(null)
  const contentRef = useRef(null)

  const isRunning = service.status === 'running'
  const modelOptions = models?.data ?? []

  const hasModels = modelOptions.length > 0
  const hasAuth = authStatus?.hasToken

  // Check env var status on mount
  useEffect(() => {
    checkClaudeEnv().then(r => setEnvWritten(r.written)).catch(e => console.warn('Claude env check failed:', e))
  }, [])

  // Close theme menu on outside click
  useEffect(() => {
    if (!themeOpen) return
    function handleClick(e) {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [themeOpen])

  // Dynamic window resizing: measure inner wrapper height + frame chrome
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const width = logsOpen ? 900 : 480

    // Use requestAnimationFrame to ensure DOM has rendered
    const raf = requestAnimationFrame(() => {
      const h = Math.max(el.offsetHeight, 200)
      resizeWindow(width, h).catch(e => console.warn('Window resize failed:', e))
    })

    return () => cancelAnimationFrame(raf)
  }, [logsOpen, usageOpen, isRunning, claudeLaunching, usage, usageError])

  // Poll logs when expanded and service running
  useEffect(() => {
    if (!logsOpen || !isRunning) {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }

    async function fetchLogs() {
      try {
        const result = await getServiceLogs()
        if (result?.lines) {
          setLogs(result.lines)
        }
      }
      catch (e) {
        console.warn('Failed to fetch logs:', e)
      }
    }

    fetchLogs()
    pollRef.current = setInterval(fetchLogs, 2000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [logsOpen, isRunning, getServiceLogs])

  // Auto-scroll logs
  useEffect(() => {
    if (logsOpen && logFollow && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, logsOpen, logFollow])

  const refreshUsage = useCallback(async () => {
    setUsageLoading(true)
    setUsageError('')
    try {
      const data = await getUsage(baseUrl)
      setUsage(data)
    }
    catch (error) {
      setUsage(null)
      setUsageError(String(error))
    }
    finally {
      setUsageLoading(false)
    }
  }, [baseUrl, getUsage])

  const premium = usage?.quota_snapshots?.premium_interactions

  const statusColor = serviceBusy ? '#f0a050' : isRunning ? '#6ee7b7' : service.status === 'error' ? '#ff9191' : '#8b99b5'
  const statusLabel = serviceBusy ? (isRunning ? '停止中' : '启动中') : isRunning ? '运行中' : service.status === 'error' ? '错误' : '已停止'

  return (
    <div className={`main-layout ${logsOpen ? 'logs-open' : ''}`}>
      {/* Left: main content */}
      <div className="main-view">
        <div className="main-view-inner" ref={contentRef}>
        {/* Header bar */}
        <header className="main-header">
          <div className="row">
            <h1 className="app-title">Copilot Proxy GUI</h1>
            <span className="status-badge" style={{ background: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <div className="row gap-8">
            <div className="theme-menu-wrap" ref={themeRef}>
              <button type="button" className="icon-btn" onClick={() => setThemeOpen(v => !v)} title="主题">
                🎨
              </button>
              {themeOpen && (
                <div className="theme-popup">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`theme-popup-item${config.theme === t.id ? ' active' : ''}`}
                      onClick={() => {
                        onChangeConfig('theme', t.id)
                        applyTheme(t.id)
                        setThemeOpen(false)
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="icon-btn" onClick={() => setLogsOpen(v => !v)} title="日志">
              📋
            </button>
            <button type="button" className="icon-btn" onClick={onOpenSettings} title="设置">
              ⚙
            </button>
            <button type="button" className="icon-btn" onClick={onOpenAbout} title="关于">
              ℹ
            </button>
          </div>
        </header>

        {/* Service control */}
        <section className="control-bar">
          <div className="row gap-12">
            <button
              type="button"
              className={`toggle-btn ${serviceBusy ? 'busy' : isRunning ? 'stop' : 'start'}`}
              onClick={isRunning ? onStop : onStart}
              disabled={serviceBusy}
            >
              {serviceBusy ? (isRunning ? '停止中...' : '启动中...') : isRunning ? '⏹ 停止' : '▶ 启动'}
            </button>

            <div className="service-info">
              <span className="info-label">端口</span>
              <span className="info-value">{config.port}</span>
            </div>

            <div className="service-info flex-fill">
              <span className="info-label">模型</span>
              <span className="info-value">
                {config.defaultModel || '—'}
                {config.defaultSmallModel ? ` / ${config.defaultSmallModel}` : ''}
              </span>
            </div>
          </div>

          {service.lastError && <p className="error">{service.lastError}</p>}
          {!service.lastError && hasAuth && hasModels && !config.defaultModel && !isRunning && <p className="hint" style={{ margin: '6px 0 0' }}>⚠ 请先选择默认模型再启动</p>}
        </section>

        {/* Model selection */}
        <section className="control-bar model-bar">
          <div className="row gap-8">
            <label className="model-select-row" title="主力模型，用于处理复杂任务和长文本推理，如 Claude Sonnet / GPT-4o 等">
              <span className="info-label">默认模型</span>
              <select
                value={config.defaultModel}
                onChange={(e) => { onChangeAndSaveConfig('defaultModel', e.target.value); showToast('模型选择已保存') }}
                disabled={!hasModels || modelsLoading}
              >
                <option value="">{modelsLoading ? '加载中...' : '请选择'}</option>
                {modelOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </label>
            <label className="model-select-row" title="轻量快速模型，用于简单补全、摘要等低延迟场景，如 GPT-4o-mini / Claude Haiku 等（可选）">
              <span className="info-label">小模型</span>
              <select
                value={config.defaultSmallModel}
                onChange={(e) => { onChangeAndSaveConfig('defaultSmallModel', e.target.value); showToast('模型选择已保存') }}
                disabled={!hasModels || modelsLoading}
              >
                <option value="">可选</option>
                {modelOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </label>
          </div>
          {!hasAuth && !modelsLoading && <p className="hint">请先到设置中登录 GitHub</p>}
          {hasAuth && !hasModels && !modelsLoading && !modelsError && <p className="hint">正在加载模型列表...</p>}
          {hasAuth && hasModels && !config.defaultModel && !isRunning && <p className="hint">请先选择默认模型再启动</p>}
          {modelsError && <p className="error">{modelsError}</p>}
          {isRunning && config.defaultModel && (
            <div className="row gap-8" style={{ marginTop: 4 }}>
              <button
                type="button"
                disabled={claudeLaunching}
                onClick={async () => {
                  setClaudeLaunching(true)
                  try {
                    const result = await launchClaudeCode(config.port, config.defaultModel, config.defaultSmallModel)
                    if (result.canceled) {
                      setClaudeLaunching(false)
                      return
                    }
                    showToast('Claude Code 已启动')
                  } catch (err) {
                    showToast('启动失败: ' + String(err))
                  } finally {
                    setClaudeLaunching(false)
                  }
                }}
                title="打开新终端窗口，设置好环境变量并运行 Claude Code"
              >
                {claudeLaunching ? '启动中...' : '🚀 启动 Claude Code'}
              </button>
              <button
                type="button"
                disabled={envBusy}
                onClick={async () => {
                  setEnvBusy(true)
                  try {
                    if (envWritten) {
                      await clearClaudeEnv()
                      setEnvWritten(false)
                      showToast('已从 Claude Code 配置中清除代理设置')
                    } else {
                      await writeClaudeEnv(config.port, config.defaultModel, config.defaultSmallModel)
                      setEnvWritten(true)
                      showToast('已写入 ~/.claude/settings.json，直接运行 claude 即可')
                    }
                  } catch (err) {
                    showToast('操作失败: ' + String(err))
                  } finally {
                    setEnvBusy(false)
                  }
                }}
                title={envWritten ? '从 ~/.claude/settings.json 中清除代理配置' : '将代理配置写入 Claude Code 的 ~/.claude/settings.json，之后直接运行 claude 即走代理'}
              >
                {envBusy ? '处理中...' : envWritten ? '❌ 清除 CC 配置' : '📋 写入 CC 配置'}
              </button>
            </div>
          )}
        </section>

        {/* Collapsible: Usage */}
        <details
          className="collapse-section"
          open={usageOpen}
          onToggle={e => setUsageOpen(e.target.open)}
        >
          <summary>
            <span>📊 用量</span>
            {premium && (
              <span className="usage-mini">
                {premium.entitlement - premium.remaining}/{premium.entitlement}
                {' \u00b7 '}
                {premium.percent_remaining?.toFixed?.(1) ?? premium.percent_remaining}%
              </span>
            )}
          </summary>
          <div className="collapse-body">
            <div className="row usage-toolbar" style={{ marginBottom: 4 }}>
              <button type="button" onClick={refreshUsage} disabled={usageLoading || !isRunning}>
                {usageLoading ? '刷新中...' : '刷新'}
              </button>
              {!isRunning && <span className="hint">需先启动服务</span>}
              {usage && (() => {
                const resetDate = usage.quota_reset_date
                  ? new Date(usage.quota_reset_date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
                  : null
                return (usage.copilot_plan || resetDate) ? (
                  <span className="usage-meta-inline">
                    {usage.copilot_plan && <span>计划: {usage.copilot_plan}</span>}
                    {resetDate && <span>重置: {resetDate}</span>}
                  </span>
                ) : null
              })()}
            </div>
            {usageError && <p className="error">{usageError}</p>}
            {usage && (() => {
              const snap = usage.quota_snapshots || {}

              function renderQuota(label, q) {
                if (!q) return null
                const used = q.entitlement - q.remaining
                const pct = q.entitlement > 0 ? (used / q.entitlement) * 100 : 0
                const barColor = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yellow)' : 'var(--green)'
                return (
                  <div className="usage-card" key={label}>
                    <div className="usage-card-header">
                      <span className="usage-card-label">{label}</span>
                      <span className="usage-card-nums">{q.unlimited ? '∞' : `${used} / ${q.entitlement}`}</span>
                    </div>
                    {!q.unlimited && (
                      <div className="usage-bar-track">
                        <div className="usage-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                      </div>
                    )}
                    <div className="usage-card-footer">
                      <span>{q.unlimited ? '无限制' : `剩余 ${q.remaining}`}</span>
                      {q.overage_permitted && q.overage_count > 0 && <span style={{color:'var(--yellow)'}}>超额 {q.overage_count}</span>}
                    </div>
                  </div>
                )
              }

              return (
                <div className="usage-grid">
                  {renderQuota('高级请求', snap.premium_interactions)}
                  {renderQuota('聊天', snap.chat)}
                  {renderQuota('补全', snap.completions)}
                </div>
              )
            })()}
          </div>
        </details>

        </div>
      </div>

      {logsOpen && (
        <aside className="log-sidebar">
          <div className="log-sidebar-header">
            <span className="log-sidebar-title">Verbose 日志</span>
            <div className="log-toolbar">
              <button
                type="button"
                className={`icon-btn icon-btn-sm${logFollow ? ' active' : ''}`}
                onClick={() => setLogFollow(v => !v)}
                title={logFollow ? '已跟随，点击停止' : '未跟随，点击开启'}
              >
                {logFollow ? '↓' : '∥'}
              </button>
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => setLogFontSize(s => Math.max(8, s - 1))} title="缩小字体">A−</button>
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => setLogFontSize(s => Math.min(20, s + 1))} title="放大字体">A+</button>
              <button type="button" className="icon-btn" onClick={() => setLogsOpen(false)} title="关闭">✕</button>
            </div>
          </div>
          <div className="log-sidebar-body">
            {logs.length === 0 && (
              <p className="hint">{isRunning ? '等待日志...' : '服务未运行'}</p>
            )}
            {logs.length > 0 && (
              <pre className="log-pre log-fill" style={{ fontSize: `${logFontSize}px` }}>
                {logs.join('\n')}
                <span ref={logEndRef} />
              </pre>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
