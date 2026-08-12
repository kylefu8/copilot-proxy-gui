import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addAccountFromSavedToken,
  detectAccountType,
  removeAccount,
  removeAccountRoute,
  resizeWindow,
  setAccountRoute,
  setDefaultAccount,
} from '../../core/service-manager'
import { useI18n } from '../../core/i18n'
import { DangerConfirmDialog } from '../main/DangerConfirmDialog'

const accountTypes = ['individual', 'business', 'enterprise']
const ACCOUNT_ID_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/
const WINDOWS_RESERVED_ACCOUNT_IDS = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/

export function SettingsPage({
  config,
  onChangeConfig,
  onSaveConfig,
  onResetConfig,
  authStatus,
  authLoading,
  onCheckAuth,
  onStartDeviceCode,
  accountsState,
  accountsLoading,
  serviceRunning,
  onAccountsChanged,
  onBack,
}) {
  const { t } = useI18n()

  // Login flow state
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showDangerDialog, setShowDangerDialog] = useState(false)
  const [accountBusy, setAccountBusy] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const [newAccountId, setNewAccountId] = useState('')
  const [newAccountType, setNewAccountType] = useState('individual')
  const [routeMatch, setRouteMatch] = useState('')
  const [routeAccount, setRouteAccount] = useState('')

  const explicitAccounts = !!accountsState?.explicit
  const configuredAccounts = accountsState?.accounts || []
  const accountWritesDisabled = serviceRunning || !!accountBusy

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

  // Keep the settings window aligned with account cards and native <details>
  // expansion without coupling resize behavior to every piece of React state.
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    let raf = 0
    const resizeToContent = () => {
      const parent = el.parentElement
      const style = parent ? getComputedStyle(parent) : null
      const pad = style ? (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) : 0
      const h = Math.max(el.offsetHeight + pad, 200)
      resizeWindow(explicitAccounts ? 620 : 540, h).catch(e => console.warn('Window resize failed:', e))
    }
    const scheduleResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(resizeToContent)
    }
    const observer = new ResizeObserver(scheduleResize)
    observer.observe(el)
    scheduleResize()
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [explicitAccounts])

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

  useEffect(() => {
    if (routeAccount && configuredAccounts.some(account => account.id === routeAccount)) return
    setRouteAccount(accountsState?.defaultAccount || configuredAccounts[0]?.id || '')
  }, [accountsState?.defaultAccount, configuredAccounts, routeAccount])

  const runAccountAction = useCallback(async (key, action, successMessage) => {
    setAccountBusy(key)
    setAccountMessage('')
    setAccountError('')
    try {
      await action()
      await onAccountsChanged()
      setAccountMessage(successMessage)
      return true
    }
    catch (error) {
      setAccountError(error?.message || String(error))
      return false
    }
    finally {
      setAccountBusy('')
    }
  }, [onAccountsChanged])

  const validateNewAccount = useCallback(() => {
    const id = newAccountId.trim()
    if (!ACCOUNT_ID_RE.test(id) || WINDOWS_RESERVED_ACCOUNT_IDS.test(id)) {
      setAccountError(t('accounts.idError'))
      return null
    }
    return id
  }, [newAccountId, t])

  const addAccountWithLogin = useCallback(async () => {
    const id = validateNewAccount()
    if (!id) return
    const added = await runAccountAction(`add:${id}`, async () => {
      const result = await onStartDeviceCode({
        theme: config.theme,
        accountAction: {
          type: 'add',
          id,
          accountType: newAccountType,
          proxyEnv: !!config.proxyEnv,
        },
      })
      if (result?.status !== 'success') {
        throw new Error(result?.message || t('accounts.addCanceled'))
      }
    }, t('accounts.added'))
    if (added) setNewAccountId('')
  }, [config.proxyEnv, config.theme, newAccountType, onStartDeviceCode, runAccountAction, t, validateNewAccount])

  const addAccountFromCurrentLogin = useCallback(async () => {
    const id = validateNewAccount()
    if (!id) return
    const added = await runAccountAction(`migrate:${id}`, () => (
      addAccountFromSavedToken(id, newAccountType, !!config.proxyEnv)
    ), t('accounts.migrated'))
    if (added) setNewAccountId('')
  }, [config.proxyEnv, newAccountType, runAccountAction, t, validateNewAccount])

  const reauthenticateAccount = useCallback(async (id) => {
    await runAccountAction(`reauth:${id}`, async () => {
      const result = await onStartDeviceCode({
        theme: config.theme,
        accountAction: { type: 'reauth', id, proxyEnv: !!config.proxyEnv },
      })
      if (result?.status !== 'success') {
        throw new Error(result?.message || t('accounts.authCanceled'))
      }
    }, t('accounts.reauthenticated'))
  }, [config.proxyEnv, config.theme, onStartDeviceCode, runAccountAction, t])

  const removeConfiguredAccount = useCallback(async (id) => {
    if (!confirm(t('accounts.removeConfirm').replace('{id}', id))) return
    await runAccountAction(`remove:${id}`, () => removeAccount(id, !!config.proxyEnv), t('accounts.removed'))
  }, [config.proxyEnv, runAccountAction, t])

  const saveRoute = useCallback(async () => {
    const match = routeMatch.trim()
    if (!match || !routeAccount) {
      setAccountError(t('accounts.routeError'))
      return
    }
    const saved = await runAccountAction(`route:${match}`, () => (
      setAccountRoute(match, routeAccount, !!config.proxyEnv)
    ), t('accounts.routeSaved'))
    if (saved) setRouteMatch('')
  }, [config.proxyEnv, routeAccount, routeMatch, runAccountAction, t])

  function handleSave() {
    onSaveConfig()
  }

  const isWin = /Win/.test(navigator.platform)

  return (
    <div className={`settings-page${isWin ? ' platform-win' : ''}`}>
      <div className="settings-page-inner" ref={contentRef}>
      <header className="settings-header">
        <button type="button" className="back-btn" onClick={onBack}>{t('back')}</button>
        <h1>{t('settings.title')}</h1>
      </header>

      {/* ── Section: GitHub accounts ─────────────────── */}
      <section className="settings-section accounts-section">
        <div className="row between gap-8">
          <h2>{explicitAccounts ? t('accounts.title') : t('settings.githubLogin')}</h2>
          {explicitAccounts && <span className="account-mode-badge">{t('accounts.multiMode')}</span>}
        </div>

        {!explicitAccounts && (
          <div className="account-legacy-block">
            <div className="row gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {authStatus?.hasToken && !authStatus?.tokenExpired ? (
                <>
                  <span className="success" style={{ margin: 0 }}>{t('settings.loggedIn')}</span>
                  {authStatus.tokenPath && (
                    <span className="hint account-token-path">Token: {authStatus.tokenPath}</span>
                  )}
                </>
              ) : (
                <>
                  {authStatus?.tokenExpired && <span className="error">{t('settings.tokenExpired')}</span>}
                  <button type="button" onClick={startLogin} disabled={loginBusy || accountWritesDisabled}>
                    {loginBusy ? t('settings.loginBusy') : t('settings.loginBtn')}
                  </button>
                  {authStatus && !authStatus?.tokenExpired && !loginMessage && !loginError && (
                    <span>{t('settings.notLoggedIn')}</span>
                  )}
                </>
              )}
              {authLoading && <span>{t('settings.checking')}</span>}
            </div>
            {loginMessage && <p className="success compact-message">{loginMessage}</p>}
            {loginError && <p className="error compact-message">❌ {loginError}</p>}
          </div>
        )}

        {explicitAccounts && (
          <div className="account-list">
            {configuredAccounts.map(account => {
              const isDefault = account.id === accountsState.defaultAccount
              return (
                <div className="account-card" key={account.id}>
                  <div className="account-card-main">
                    <div className="account-card-title">
                      <strong>{account.id}</strong>
                      {isDefault && <span className="account-default-badge">{t('accounts.default')}</span>}
                    </div>
                    <div className="account-card-meta">
                      <span>{account.githubLogin || '—'}</span>
                      <span>{account.accountType}</span>
                      {account.maxConcurrency && <span>{t('accounts.concurrency')}: {account.maxConcurrency}</span>}
                    </div>
                  </div>
                  <div className="account-card-actions">
                    {!isDefault && (
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={accountWritesDisabled}
                        onClick={() => runAccountAction(`default:${account.id}`, () => setDefaultAccount(account.id, !!config.proxyEnv), t('accounts.defaultChanged'))}
                      >
                        {t('accounts.makeDefault')}
                      </button>
                    )}
                    <button type="button" className="secondary-btn" disabled={accountWritesDisabled} onClick={() => reauthenticateAccount(account.id)}>
                      {t('accounts.reauth')}
                    </button>
                    <button type="button" className="danger-text-btn" disabled={accountWritesDisabled} onClick={() => removeConfiguredAccount(account.id)}>
                      {t('accounts.remove')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="account-add-panel">
          <div className="account-add-heading">
            <strong>{explicitAccounts ? t('accounts.addAnother') : t('accounts.enableMulti')}</strong>
            <span className="hint">{t('accounts.addHint')}</span>
          </div>
          <div className="account-form-row">
            <input
              value={newAccountId}
              onChange={event => setNewAccountId(event.target.value.toLowerCase())}
              placeholder={t('accounts.idPlaceholder')}
              maxLength={32}
              disabled={accountWritesDisabled}
            />
            <select value={newAccountType} onChange={event => setNewAccountType(event.target.value)} disabled={accountWritesDisabled}>
              {accountTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <button type="button" onClick={addAccountWithLogin} disabled={accountWritesDisabled || !newAccountId.trim()}>
              {accountBusy.startsWith('add:') ? t('settings.loginBusy') : t('accounts.loginAndAdd')}
            </button>
          </div>
          {!explicitAccounts && authStatus?.hasToken && !authStatus?.tokenExpired && (
            <button type="button" className="secondary-btn migrate-account-btn" onClick={addAccountFromCurrentLogin} disabled={accountWritesDisabled || !newAccountId.trim()}>
              {t('accounts.useCurrentLogin')}
            </button>
          )}
        </div>

        {serviceRunning && <p className="hint account-lock-hint">{t('accounts.stopToEdit')}</p>}
        {accountsLoading && <p className="hint compact-message">{t('accounts.loading')}</p>}
        {accountMessage && <p className="success compact-message">{accountMessage}</p>}
        {accountError && <p className="error compact-message">❌ {accountError}</p>}

        {explicitAccounts && (
          <details className="account-routes">
            <summary>{t('accounts.routesTitle')}</summary>
            <p className="hint">{t('accounts.routesHint')}</p>
            {(accountsState.routes || []).map((route, index) => (
              <div className="route-row" key={`${route.match}:${index}`}>
                <code>{route.match}</code>
                <span>→</span>
                <strong>{route.account}</strong>
                <button
                  type="button"
                  className="danger-text-btn"
                  disabled={accountWritesDisabled}
                  onClick={() => runAccountAction(`route-remove:${route.match}`, () => removeAccountRoute(route.match, !!config.proxyEnv), t('accounts.routeRemoved'))}
                >
                  {t('accounts.remove')}
                </button>
              </div>
            ))}
            {(accountsState.routes || []).length === 0 && <p className="hint">{t('accounts.noRoutes')}</p>}
            <div className="route-form-row">
              <input value={routeMatch} onChange={event => setRouteMatch(event.target.value)} placeholder="claude-*" disabled={accountWritesDisabled} />
              <select value={routeAccount} onChange={event => setRouteAccount(event.target.value)} disabled={accountWritesDisabled}>
                {configuredAccounts.map(account => <option key={account.id} value={account.id}>{account.id}</option>)}
              </select>
              <button type="button" onClick={saveRoute} disabled={accountWritesDisabled || !routeMatch.trim() || !routeAccount}>{t('accounts.addRoute')}</button>
            </div>
          </details>
        )}
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

          {!explicitAccounts && (
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
          )}
          {explicitAccounts && (
            <div className="account-type-managed-note">
              <span className="info-label">{t('settings.accountType')}</span>
              <span className="hint">{t('accounts.typePerAccount')}</span>
            </div>
          )}
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

          <label className="checkbox" title={t('conv.toggleTooltip')}>
            <input
              type="checkbox"
              checked={!!config.conversationLog}
              onChange={e => onChangeConfig('conversationLog', e.target.checked)}
            />
            {t('conv.toggle')}
          </label>

          <label className="checkbox" title={t('settings.appendLargeContextSuffixTooltip')}>
            <input
              type="checkbox"
              checked={!!config.appendLargeContextSuffix}
              onChange={e => onChangeConfig('appendLargeContextSuffix', e.target.checked)}
            />
            {t('settings.appendLargeContextSuffix')}
          </label>

          <label className="checkbox checkbox-danger" title={t('settings.skipPermissionsTooltip')}>
            <input
              type="checkbox"
              checked={!!config.skipPermissions}
              onChange={e => {
                if (e.target.checked) {
                  // Show danger confirmation before enabling
                  setShowDangerDialog(true)
                } else {
                  onChangeConfig('skipPermissions', false)
                }
              }}
            />
            {t('settings.skipPermissions')}
          </label>
        </div>

        <div className="grid2" style={{ marginTop: 8 }}>
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

      {/* Danger confirmation dialog for enabling skipPermissions */}
      {showDangerDialog && (
        <DangerConfirmDialog
          title={t('danger.settingsTitle')}
          body={t('danger.settingsBody')}
          confirmLabel={t('danger.settingsConfirm')}
          onCancel={() => setShowDangerDialog(false)}
          onConfirm={() => {
            onChangeConfig('skipPermissions', true)
            setShowDangerDialog(false)
          }}
        />
      )}
    </div>
  )
}
