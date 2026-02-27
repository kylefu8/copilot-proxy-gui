import { useCallback, useEffect, useRef, useState } from 'react'
import { resizeWindow, detectAccountType } from '../../core/service-manager'
import { useI18n } from '../../core/i18n'

const accountTypes = ['individual', 'business', 'enterprise']

export function SettingsPage({
  config,
  onChangeConfig,
  onSaveConfig,
  onResetConfig,
  authStatus,
  authLoading,
  onCheckAuth,
  onStartDeviceCode,
  onBack,
}) {
  const { t } = useI18n()

  // Login flow state
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginError, setLoginError] = useState('')

  // Auto-detect account type after login
  const autoDetect = useCallback(async () => {
    try {
      setLoginMessage(t('settings.loginSuccess'))
      const result = await detectAccountType()
      if (result.detected && result.accountType) {
        onChangeConfig('accountType', result.accountType)
        setLoginMessage(t('settings.loginSuccessType') + result.accountType)
      } else {
        setLoginMessage(t('settings.loginSuccessNoType'))
      }
    } catch {
      setLoginMessage(t('settings.loginSuccessNoType'))
    }
  }, [onChangeConfig, t])

  const contentRef = useRef(null)

  // Dynamic window height based on content
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const raf = requestAnimationFrame(() => {
      const h = Math.max(el.offsetHeight, 200)
      resizeWindow(480, h).catch(e => console.warn('Window resize failed:', e))
    })
    return () => cancelAnimationFrame(raf)
  }, [loginBusy, loginMessage, loginError, authStatus])

  // Auto-check auth status on mount
  useEffect(() => {
    onCheckAuth()
  }, [])

  const startLogin = useCallback(async () => {
    setLoginError('')
    setLoginMessage('')
    setLoginBusy(true)

    try {
      // This opens a child window and returns when auth completes or is canceled
      const result = await onStartDeviceCode({ theme: config.theme })

      if (result.status === 'success') {
        onCheckAuth(true)
        autoDetect()
      } else if (result.status === 'canceled') {
        setLoginMessage('')
      } else if (result.status === 'expired') {
        setLoginError(result.message || t('settings.codeExpired'))
      } else if (result.status === 'error') {
        setLoginError(result.message || t('settings.loginError'))
      }
    }
    catch (err) {
      setLoginError(String(err))
    }
    finally {
      setLoginBusy(false)
    }
  }, [onStartDeviceCode, onCheckAuth, autoDetect, t])

  function handleSave() {
    onSaveConfig()
  }

  return (
    <div className="settings-page">
      <div className="settings-page-inner" ref={contentRef}>
      <header className="settings-header">
        <button type="button" className="back-btn" onClick={onBack}>{t('back')}</button>
        <h1>{t('settings.title')}</h1>
      </header>

      {/* ── Section: GitHub Auth ─────────────────────── */}
      <section className="settings-section">
        <h2>{t('settings.githubLogin')}</h2>

        <div className="row gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {authStatus?.hasToken && !authStatus?.tokenExpired ? (
            <>
              <span className="success" style={{ margin: 0 }}>{t('settings.loggedIn')}</span>
              {authStatus.tokenPath && (
                <span className="hint" style={{ margin: 0, wordBreak: 'break-all' }}>Token: {authStatus.tokenPath}</span>
              )}
            </>
          ) : (
            <>
              {authStatus?.tokenExpired && (
                <span className="error" style={{ margin: 0 }}>{t('settings.tokenExpired')}</span>
              )}
              <button type="button" onClick={startLogin} disabled={loginBusy}>
                {loginBusy ? t('settings.loginBusy') : t('settings.loginBtn')}
              </button>
              {loginMessage && <span className="success" style={{ margin: 0 }}>{loginMessage}</span>}
              {loginError && <span className="error" style={{ margin: 0 }}>❌ {loginError}</span>}
              {authStatus && !authStatus?.tokenExpired && !loginMessage && !loginError && (
                <span style={{ margin: 0 }}>{t('settings.notLoggedIn')}</span>
              )}
            </>
          )}
          {authLoading && <span style={{ margin: 0 }}>{t('settings.checking')}</span>}
        </div>
      </section>

      {/* ── Section: Service Config ──────────────────── */}
      <section className="settings-section">
        <h2>{t('settings.serviceParams')}</h2>

        <div className="grid2" style={{ marginBottom: 8 }}>
          <div className="row gap-8">
            <label style={{ minWidth: 0 }} title={t('settings.portTooltip')}>
              {t('settings.port')}
              <input
                type="number"
                value={config.port}
                onChange={e => onChangeConfig('port', Number(e.target.value))}
                style={{ width: 90 }}
              />
            </label>

            <label style={{ minWidth: 0 }} title={t('settings.rateLimitTooltip')}>
              {t('settings.rateLimit')}
              <input
                type="number"
                value={config.rateLimitSeconds}
                onChange={e => onChangeConfig('rateLimitSeconds', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={t('settings.rateLimitPlaceholder')}
                style={{ width: 90 }}
              />
            </label>
          </div>

          <label title={t('settings.accountTypeTooltip')}>
            {t('settings.accountType')}
            <select
              value={config.accountType}
              onChange={e => onChangeConfig('accountType', e.target.value)}
            >
              {accountTypes.map(at => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid2">
          <label className="checkbox" title={t('settings.rateLimitWaitTooltip')}>
            <input
              type="checkbox"
              checked={config.rateLimitWait}
              onChange={e => onChangeConfig('rateLimitWait', e.target.checked)}
            />
            {t('settings.rateLimitWait')}
          </label>

          <label className="checkbox" title={t('settings.verboseTooltip')}>
            <input
              type="checkbox"
              checked={config.verbose}
              onChange={e => onChangeConfig('verbose', e.target.checked)}
            />
            {t('settings.verbose')}
          </label>

          <label className="checkbox" title={t('settings.manualApproveTooltip')}>
            <input
              type="checkbox"
              checked={config.manualApprove}
              onChange={e => onChangeConfig('manualApprove', e.target.checked)}
            />
            {t('settings.manualApprove')}
          </label>

          <label className="checkbox" title={t('settings.proxyEnvTooltip')}>
            <input
              type="checkbox"
              checked={config.proxyEnv}
              onChange={e => onChangeConfig('proxyEnv', e.target.checked)}
            />
            {t('settings.proxyEnv')}
          </label>

          <label className="checkbox" title={t('settings.showTokenTooltip')}>
            <input
              type="checkbox"
              checked={config.showToken}
              onChange={e => onChangeConfig('showToken', e.target.checked)}
            />
            {t('settings.showToken')}
          </label>

          <label className="checkbox" title={t('settings.autoStartTooltip')}>
            <input
              type="checkbox"
              checked={config.autoStart}
              onChange={e => onChangeConfig('autoStart', e.target.checked)}
            />
            {t('settings.autoStart')}
          </label>

          <label className="model-select-row" title={t('settings.closeActionTooltip')}>
            {t('settings.closeAction')}
            <select className="port-input" value={config.closeAction || ''} onChange={e => onChangeConfig('closeAction', e.target.value)}>
              <option value="">{t('settings.closeAction.ask')}</option>
              <option value="minimize">{t('settings.closeAction.minimize')}</option>
              <option value="quit">{t('settings.closeAction.quit')}</option>
            </select>
          </label>
        </div>
      </section>

      <div className="settings-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onResetConfig} style={{ background: 'transparent', borderColor: 'var(--red)', color: 'var(--red)' }}>{t('settings.resetBtn')}</button>
        <button type="button" onClick={handleSave}>{t('settings.saveBtn')}</button>
      </div>
      </div>
    </div>
  )
}
