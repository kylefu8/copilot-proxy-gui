import { useEffect, useRef } from 'react'
import { resizeWindow } from '../../core/service-manager'
import { useI18n } from '../../core/i18n'

const APP_VERSION = '0.1.1'
const GUI_REPO = 'https://github.com/kylefu8/copilot-proxy-gui'
const UPSTREAM_REPO = 'https://github.com/Jer-y/copilot-proxy'

export function AboutPage({ onBack }) {
  const { t } = useI18n()
  const contentRef = useRef(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const raf = requestAnimationFrame(() => {
      const h = Math.max(el.offsetHeight, 200)
      resizeWindow(480, h).catch(e => console.warn('Window resize failed:', e))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const openLink = (url) => {
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('open_external', { url })
    } else {
      window.open(url, '_blank')
    }
  }

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
