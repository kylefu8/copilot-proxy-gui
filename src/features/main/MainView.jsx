import { useCallback, useEffect, useRef, useState } from 'react'
import { resizeWindow, launchClaudeCode, writeClaudeEnv, clearClaudeEnv, checkClaudeEnv } from '../../core/service-manager'
import { themes, applyTheme } from '../../core/config-store'
import { useI18n } from '../../core/i18n'

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
  const { t, lang, setLang } = useI18n()
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
  const statusLabel = serviceBusy ? (isRunning ? t('status.stopping') : t('status.starting')) : isRunning ? t('status.running') : service.status === 'error' ? t('status.error') : t('status.stopped')

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
              <button type="button" className="icon-btn" onClick={() => setThemeOpen(v => !v)} title={t('header.theme')}>
                🎨
              </button>
              {themeOpen && (
                <div className="theme-popup">
                  {themes.map(th => (
                    <button
                      key={th.id}
                      type="button"
                      className={`theme-popup-item${config.theme === th.id ? ' active' : ''}`}
                      onClick={() => {
                        onChangeConfig('theme', th.id)
                        applyTheme(th.id)
                        setThemeOpen(false)
                      }}
                    >
                      {t(`theme.${th.id}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="icon-btn lang-toggle" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} title={t('header.lang')}>
              {lang === 'zh' ? 'EN' : '中'}
            </button>
            <button type="button" className="icon-btn" onClick={() => setLogsOpen(v => !v)} title={t('header.logs')}>
              📋
            </button>
            <button type="button" className="icon-btn" onClick={onOpenSettings} title={t('header.settings')}>
              ⚙
            </button>
            <button type="button" className="icon-btn" onClick={onOpenAbout} title={t('header.about')}>
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
              {serviceBusy ? (isRunning ? t('svc.stopping') : t('svc.starting')) : isRunning ? t('svc.stop') : t('svc.start')}
            </button>

            <div className="service-info">
              <span className="info-label">{t('svc.port')}</span>
              <span className="info-value">{config.port}</span>
            </div>

            <div className="service-info flex-fill">
              <span className="info-label">{t('svc.model')}</span>
              <span className="info-value">
                {config.defaultModel || '—'}
                {config.defaultSmallModel ? ` / ${config.defaultSmallModel}` : ''}
              </span>
            </div>
          </div>

          {service.lastError && <p className="error">{service.lastError}</p>}
          {!service.lastError && hasAuth && hasModels && !config.defaultModel && !isRunning && <p className="hint" style={{ margin: '6px 0 0' }}>{t('svc.selectModelFirst')}</p>}
        </section>

        {/* Model selection */}
        <section className="control-bar model-bar">
          <div className="row gap-8">
            <label className="model-select-row" title={t('model.defaultTooltip')}>
              <span className="info-label">{t('model.default')}</span>
              <select
                value={config.defaultModel}
                onChange={(e) => { onChangeAndSaveConfig('defaultModel', e.target.value); showToast(t('model.saved')) }}
                disabled={!hasModels || modelsLoading}
              >
                <option value="">{modelsLoading ? t('loading') : t('model.select')}</option>
                {modelOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </label>
            <label className="model-select-row" title={t('model.smallTooltip')}>
              <span className="info-label">{t('model.small')}</span>
              <select
                value={config.defaultSmallModel}
                onChange={(e) => { onChangeAndSaveConfig('defaultSmallModel', e.target.value); showToast(t('model.saved')) }}
                disabled={!hasModels || modelsLoading}
              >
                <option value="">{t('model.optional')}</option>
                {modelOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </label>
          </div>
          {!hasAuth && !modelsLoading && <p className="hint">{t('model.loginFirst')}</p>}
          {hasAuth && !hasModels && !modelsLoading && !modelsError && <p className="hint">{t('model.loadingList')}</p>}
          {hasAuth && hasModels && !config.defaultModel && !isRunning && <p className="hint">{t('model.selectFirst')}</p>}
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
                    showToast(t('claude.launched'))
                  } catch (err) {
                    showToast(t('claude.launchFailed') + String(err))
                  } finally {
                    setClaudeLaunching(false)
                  }
                }}
                title={t('claude.launchTooltip')}
              >
                {claudeLaunching ? t('claude.launching') : t('claude.launch')}
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
                      showToast(t('claude.clearDone'))
                    } else {
                      await writeClaudeEnv(config.port, config.defaultModel, config.defaultSmallModel)
                      setEnvWritten(true)
                      showToast(t('claude.writeDone'))
                    }
                  } catch (err) {
                    showToast(t('claude.opFailed') + String(err))
                  } finally {
                    setEnvBusy(false)
                  }
                }}
                title={envWritten ? t('claude.clearTooltip') : t('claude.writeTooltip')}
              >
                {envBusy ? t('processing') : envWritten ? t('claude.clearConfig') : t('claude.writeConfig')}
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
            <span>{t('usage.title')}</span>
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
                {usageLoading ? t('refreshing') : t('refresh')}
              </button>
              {!isRunning && <span className="hint">{t('usage.needService')}</span>}
              {usage && (() => {
                const resetDate = usage.quota_reset_date
                  ? new Date(usage.quota_reset_date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric' })
                  : null
                return (usage.copilot_plan || resetDate) ? (
                  <span className="usage-meta-inline">
                    {usage.copilot_plan && <span>{t('usage.plan')}: {usage.copilot_plan}</span>}
                    {resetDate && <span>{t('usage.reset')}: {resetDate}</span>}
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
                      <span>{q.unlimited ? t('usage.unlimited') : `${t('usage.remaining')} ${q.remaining}`}</span>
                      {q.overage_permitted && q.overage_count > 0 && <span style={{color:'var(--yellow)'}}>{t('usage.overage')} {q.overage_count}</span>}
                    </div>
                  </div>
                )
              }

              return (
                <div className="usage-grid">
                  {renderQuota(t('usage.premium'), snap.premium_interactions)}
                  {renderQuota(t('usage.chat'), snap.chat)}
                  {renderQuota(t('usage.completions'), snap.completions)}
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
            <span className="log-sidebar-title">{t('logs.title')}</span>
            <div className="log-toolbar">
              <button
                type="button"
                className={`icon-btn icon-btn-sm${logFollow ? ' active' : ''}`}
                onClick={() => setLogFollow(v => !v)}
                title={logFollow ? t('logs.following') : t('logs.notFollowing')}
              >
                {logFollow ? '↓' : '∥'}
              </button>
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => setLogFontSize(s => Math.max(8, s - 1))} title={t('logs.fontSmaller')}>A−</button>
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => setLogFontSize(s => Math.min(20, s + 1))} title={t('logs.fontLarger')}>A+</button>
              <button type="button" className="icon-btn" onClick={() => setLogsOpen(false)} title={t('close')}>✕</button>
            </div>
          </div>
          <div className="log-sidebar-body">
            {logs.length === 0 && (
              <p className="hint">{isRunning ? t('logs.waiting') : t('logs.notRunning')}</p>
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
