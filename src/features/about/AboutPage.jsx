import { useEffect, useRef, useState, useCallback } from 'react'
import { resizeWindow } from '../../core/service-manager'
import { useI18n } from '../../core/i18n'

const APP_VERSION = window.copilotProxyDesktop?.appVersion || '0.0.0'
const GUI_REPO = 'https://github.com/kylefu8/copilot-proxy-gui'
const UPSTREAM_REPO = 'https://github.com/Jer-y/copilot-proxy'

export function AboutPage({ onBack }) {
  const { t } = useI18n()
  const contentRef = useRef(null)

  // Update state: 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'ready' | 'error' | 'full-needed'
  const [updatePhase, setUpdatePhase] = useState('idle')
  const [updateData, setUpdateData] = useState({})

  useEffect(() => {
    // Get initial update state (may have been auto-checked on startup)
    window.copilotProxyDesktop?.invoke('get_update_state').then(state => {
      if (state?.available) {
        setUpdatePhase(state.lightweightPossible ? 'available' : 'full-needed')
        setUpdateData(state)
      }
    }).catch(() => {})

    const unsub = window.copilotProxyDesktop?.onUpdateState?.((state) => {
      setUpdateData(state)
      if (state.checking) setUpdatePhase('checking')
      else if (state.downloading) setUpdatePhase('downloading')
      else if (state.error) setUpdatePhase('error')
      else if (state.progress >= 100) setUpdatePhase('ready')
      else if (state.available && state.lightweightPossible) setUpdatePhase('available')
      else if (state.available) setUpdatePhase('full-needed')
      else if (state.latestVersion) setUpdatePhase('up-to-date')
      else setUpdatePhase('idle')
    })
    return unsub
  }, [])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const raf = requestAnimationFrame(() => {
      const parent = el.parentElement
      const style = parent ? getComputedStyle(parent) : null
      const pad = style ? (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) : 0
      const h = Math.max(el.offsetHeight + pad, 200)
      resizeWindow(480, h).catch(e => console.warn('Window resize failed:', e))
    })
    return () => cancelAnimationFrame(raf)
  }, [updatePhase])

  const openLink = (url) => {
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('open_external', { url })
    } else {
      window.open(url, '_blank')
    }
  }

  const handleCheckUpdate = useCallback(async () => {
    setUpdatePhase('checking')
    await window.copilotProxyDesktop?.invoke('check_update')
  }, [])

  const handleApplyUpdate = useCallback(async () => {
    await window.copilotProxyDesktop?.invoke('apply_update')
  }, [])

  const handleRestart = useCallback(() => {
    window.copilotProxyDesktop?.invoke('restart_app')
  }, [])

  const handleOpenRelease = useCallback(() => {
    if (updateData.releaseUrl) openLink(updateData.releaseUrl)
  }, [updateData.releaseUrl])

  return (
    <div className="settings-page">
      <div className="settings-page-inner" ref={contentRef}>
        <header className="settings-header">
          <button type="button" className="back-btn" onClick={onBack}>{t('back')}</button>
          <h1>{t('about.title')}</h1>
        </header>

        <section className="settings-section">
          <div className="about-logo">🚀</div>
          <h2 className="about-title">Copilot Proxy GUI</h2>
          <p className="about-version">v{APP_VERSION}</p>
          <p className="about-desc">
            {t('about.desc')}
          </p>
        </section>

        {/* ── Update Section ── */}
        <section className="settings-section">
          <h2>{t('update.title')}</h2>
          <div className="update-section">
            {updatePhase === 'idle' && (
              <button type="button" className="about-link-btn" onClick={handleCheckUpdate}>
                <span className="about-link-icon">🔄</span>
                <div><div className="about-link-title">{t('update.check')}</div></div>
              </button>
            )}

            {updatePhase === 'checking' && (
              <div className="update-info">
                <span className="update-spinner">⏳</span>
                <span>{t('update.checking')}</span>
              </div>
            )}

            {updatePhase === 'up-to-date' && (
              <div className="update-info update-success">
                <span>{t('update.upToDate')}</span>
                <button type="button" className="update-recheck-btn" onClick={handleCheckUpdate}>🔄</button>
              </div>
            )}

            {updatePhase === 'available' && (
              <div className="update-available">
                <div className="update-info">
                  <span>🎉 {t('update.available')}: <strong>v{updateData.latestVersion}</strong></span>
                </div>
                <button type="button" className="update-action-btn update-action-primary" onClick={handleApplyUpdate}>
                  {t('update.download')}
                </button>
              </div>
            )}

            {updatePhase === 'full-needed' && (
              <div className="update-available">
                <div className="update-info">
                  <span>📦 {t('update.available')}: <strong>v{updateData.latestVersion}</strong></span>
                </div>
                <p className="update-hint">{t('update.fullNeeded')}</p>
                <button type="button" className="update-action-btn" onClick={handleOpenRelease}>
                  {t('update.openRelease')}
                </button>
              </div>
            )}

            {updatePhase === 'downloading' && (
              <div className="update-downloading">
                <div className="update-info">
                  <span>⬇️ {t('update.downloading')}</span>
                  <span className="update-pct">{updateData.progress || 0}%</span>
                </div>
                <div className="update-progress-bar">
                  <div className="update-progress-fill" style={{ width: `${updateData.progress || 0}%` }} />
                </div>
              </div>
            )}

            {updatePhase === 'ready' && (
              <div className="update-ready">
                <div className="update-info update-success">
                  <span>{t('update.ready')}</span>
                </div>
                <button type="button" className="update-action-btn update-action-primary" onClick={handleRestart}>
                  {t('update.restart')}
                </button>
                <p className="update-hint">{t('update.restartHint')}</p>
              </div>
            )}

            {updatePhase === 'error' && (
              <div className="update-error-block">
                <div className="update-info update-error-text">
                  <span>❌ {t('update.failed')}{updateData.error}</span>
                </div>
                <button type="button" className="update-action-btn" onClick={handleCheckUpdate}>
                  {t('update.retry')}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h2>{t('about.repoTitle')}</h2>
          <div className="about-links">
            <button type="button" className="about-link-btn" onClick={() => openLink(GUI_REPO)}>
              <span className="about-link-icon">📦</span>
              <div>
                <div className="about-link-title">Copilot Proxy GUI</div>
                <div className="about-link-url">{GUI_REPO}</div>
              </div>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>{t('about.credits')}</h2>
          <p className="about-desc">
            {t('about.creditsDesc')}
          </p>
          <div className="about-links">
            <button type="button" className="about-link-btn" onClick={() => openLink(UPSTREAM_REPO)}>
              <span className="about-link-icon">⭐</span>
              <div>
                <div className="about-link-title">copilot-proxy</div>
                <div className="about-link-url">{UPSTREAM_REPO}</div>
                <div className="about-link-desc">{t('about.upstreamDesc')}</div>
              </div>
            </button>
          </div>
        </section>

        <section className="settings-section about-footer-section">
          <p className="about-footer">Made with ❤️ by kylefu8</p>
          <p className="about-license">MIT License</p>
        </section>
      </div>
    </div>
  )
}
