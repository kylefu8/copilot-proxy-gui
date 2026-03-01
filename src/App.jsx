import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AboutPage } from './features/about/AboutPage'
import { CloseDialog } from './features/main/CloseDialog'
import { MainView } from './features/main/MainView'
import { RiskDialog } from './features/main/RiskDialog'
import { SettingsPage } from './features/settings/SettingsPage'
import { applyTheme, configFingerprint, loadConfig, needsRiskAcceptance, resetConfig, saveConfig, toCliArgs } from './core/config-store'
import { I18nProvider, useI18n } from './core/i18n'
import { getUsage, waitForReady } from './core/proxy-api'
import {
  deleteToken,
  fetchModelsFromCopilot,
  getAuthStatus,
  getServiceState,
  markServiceRunning,
  markServiceStopped,
  startDeviceCodeAuth,
  startService,
  stopService,
} from './core/service-manager'

function AppInner() {
  const { t } = useI18n()
  const [page, setPage] = useState('main') // 'main' | 'settings' | 'about'
  const [config, setConfig] = useState(() => loadConfig())
  const [service, setService] = useState(() => getServiceState())
  const [serviceBusy, setServiceBusy] = useState(false)

  const [authStatus, setAuthStatus] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  const [models, setModels] = useState(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState(null)
  const [showRiskDialog, setShowRiskDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const pendingStartRef = useRef(false)
  const triggerStartRef = useRef(() => {})
  const configRef = useRef(config)

  // Toast notification
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const showToast = useCallback((msg, duration = 3000) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), duration)
  }, [])

  const baseUrl = useMemo(() => `http://localhost:${config.port}`, [config.port])

  // Apply theme on load and whenever it changes
  useEffect(() => {
    applyTheme(config.theme || 'frost')
  }, [config.theme])

  // Keep configRef in sync so event listeners always see latest config
  useEffect(() => { configRef.current = config }, [config])

  // Listen for close-requested from main process (tray close confirmation)
  useEffect(() => {
    const cleanups = []

    if (window.copilotProxyDesktop?.onCloseRequested) {
      const unsub = window.copilotProxyDesktop.onCloseRequested(() => {
        // If user previously saved a close action, apply it immediately
        const saved = configRef.current.closeAction
        if (saved === 'minimize' || saved === 'quit') {
          window.copilotProxyDesktop.invoke('close_confirm_response', { action: saved })
          return
        }
        setShowCloseDialog(true)
      })
      if (unsub) cleanups.push(unsub)
    }
    // Listen for tray-initiated service start/stop so UI stays in sync
    if (window.copilotProxyDesktop?.onServiceStateChanged) {
      const unsub = window.copilotProxyDesktop.onServiceStateChanged((action) => {
        if (action === 'started') markServiceRunning()
        else if (action === 'stopped') markServiceStopped()
        setService(getServiceState())
      })
      if (unsub) cleanups.push(unsub)
    }
    // Listen for tray requesting a full start (when no saved config exists)
    if (window.copilotProxyDesktop?.onTriggerStart) {
      const unsub = window.copilotProxyDesktop.onTriggerStart(() => {
        triggerStartRef.current()
      })
      if (unsub) cleanups.push(unsub)
    }

    return () => cleanups.forEach(fn => fn())
  }, [])

  const handleCloseResponse = useCallback((action, remember = false) => {
    setShowCloseDialog(false)
    if (remember && (action === 'minimize' || action === 'quit')) {
      const updated = { ...config, closeAction: action }
      setConfig(updated)
      saveConfig(updated)
    }
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('close_confirm_response', { action })
    }
  }, [config])

  // Auto-fetch models on mount if logged in
  useEffect(() => {
    getAuthStatus().then(auth => {
      setAuthStatus(auth)
      if (auth.hasToken) {
        refreshModels()
      }
    }).catch(e => console.warn('Initial auth check failed:', e))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateConfig = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  // Atomically update one key and persist immediately (avoids stale-closure race)
  const updateAndSaveConfig = useCallback((key, value) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value }
      saveConfig(next)
      return next
    })
  }, [])

  const persistConfig = useCallback(() => {
    saveConfig(config)
    showToast(t('config.saved'))
  }, [config, showToast, t])

  const handleResetConfig = useCallback(async () => {
    if (confirm(t('config.resetConfirm'))) {
      // Stop service first if running
      const svcState = getServiceState()
      if (svcState.status === 'running') {
        setServiceBusy(true)
        await stopService()
        setService(getServiceState())
        setServiceBusy(false)
      }
      const currentTheme = config.theme
      const newConfig = resetConfig()
      newConfig.theme = currentTheme
      setConfig(newConfig)
      saveConfig(newConfig)
      setAuthStatus(null)
      setModels(null)
      try { await deleteToken() } catch { /* ignore */ }
    }
  }, [config.theme])

  const checkAuth = useCallback(async (clearExpired = false) => {
    setAuthLoading(true)
    try {
      const result = await getAuthStatus()
      setAuthStatus(prev => ({
        ...result,
        tokenExpired: clearExpired ? false : (prev?.tokenExpired && result.hasToken) || false,
      }))
    }
    catch (error) {
      setAuthStatus({ hasToken: false, message: String(error) })
    }
    finally {
      setAuthLoading(false)
    }
  }, [])

  const refreshModels = useCallback(async () => {
    setModelsLoading(true)
    setModelsError(null)
    try {
      const data = await fetchModelsFromCopilot(config.accountType)
      setModels(data)
      // Token is valid — clear any previous expired flag
      setAuthStatus(prev => prev?.tokenExpired ? { ...prev, tokenExpired: false } : prev)
    }
    catch (error) {
      setModels(null)
      const msg = error.message || String(error)
      // 401 = token expired, suggest re-login
      if (msg.includes('401')) {
        setModelsError({ key: 'tokenExpired' })
        setAuthStatus(prev => ({ ...prev, tokenExpired: true }))
      } else {
        setModelsError({ key: 'fetchError', detail: msg })
      }
    }
    finally {
      setModelsLoading(false)
    }
  }, [config.accountType])

  const runStart = useCallback(async () => {
    // Check auth — if neither cached state nor loaded models confirm auth, re-check via IPC
    if (!authStatus?.hasToken && (!models || models.length === 0)) {
      try {
        const auth = await getAuthStatus()
        setAuthStatus(auth)
        if (!auth.hasToken) {
          setService(prev => ({ ...prev, status: 'error', lastError: t('svc.needLogin') }))
          return
        }
      }
      catch {
        setService(prev => ({ ...prev, status: 'error', lastError: t('svc.cannotCheckAuth') }))
        return
      }
    }

    // Check model selection
    if (!config.defaultModel) {
      setService(prev => ({ ...prev, status: 'error', lastError: t('svc.needModel') }))
      return
    }

    // Check risk acceptance
    if (needsRiskAcceptance(config)) {
      setShowRiskDialog(true)
      return
    }

    // Actually start
    setServiceBusy(true)
    const args = toCliArgs(config)
    await startService(args, config.defaultModel)
    try {
      await waitForReady(baseUrl)
    }
    catch (e) {
      console.warn('Service readiness check timed out:', e.message || e)
    }
    setService(getServiceState())
    setServiceBusy(false)
  }, [config, baseUrl, authStatus, models])

  // Keep triggerStartRef in sync so tray-initiated start uses latest runStart
  useEffect(() => { triggerStartRef.current = runStart }, [runStart])

  const handleRiskAccept = useCallback(() => {
    setShowRiskDialog(false)
    // Record acceptance timestamp and config fingerprint, then trigger start
    setConfig(prev => {
      const next = {
        ...prev,
        riskAcceptedAt: new Date().toISOString(),
        riskConfigFingerprint: configFingerprint(prev),
      }
      saveConfig(next)
      return next
    })
    pendingStartRef.current = true
  }, [])

  // When config updates after risk acceptance, actually start the service
  useEffect(() => {
    if (!pendingStartRef.current) return
    if (needsRiskAcceptance(config)) return // config not yet settled
    pendingStartRef.current = false
    ;(async () => {
      setServiceBusy(true)
      const args = toCliArgs(config)
      await startService(args, config.defaultModel)
      try {
        await waitForReady(baseUrl)
      }
      catch (e) {
        console.warn('Service readiness check timed out:', e.message || e)
      }
      setService(getServiceState())
      setServiceBusy(false)
    })()
  }, [config, baseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  const runStop = useCallback(async () => {
    setServiceBusy(true)
    await stopService()
    setService(getServiceState())
    setServiceBusy(false)
  }, [])

  if (page === 'about') {
    return (
      <>
      <AboutPage
        onBack={() => setPage('main')}
      />
      {showCloseDialog && (
        <CloseDialog
          onMinimize={(remember) => handleCloseResponse('minimize', remember)}
          onQuit={(remember) => handleCloseResponse('quit', remember)}
          onCancel={() => handleCloseResponse('cancel')}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
      </>
    )
  }

  if (page === 'settings') {
    return (
      <>
      <SettingsPage
        config={config}
        onChangeConfig={updateConfig}
        onSaveConfig={persistConfig}
        onResetConfig={handleResetConfig}
        authStatus={authStatus}
        authLoading={authLoading}
        onCheckAuth={checkAuth}
        onStartDeviceCode={(payload) => startDeviceCodeAuth(payload)}
        onBack={() => {
          setPage('main')
          // Clear stale errors and refresh auth (user may have just logged in)
          setService(prev => prev.lastError ? { ...prev, status: 'idle', lastError: null } : prev)
          getAuthStatus().then(auth => {
            setAuthStatus(prev => ({
              ...auth,
              tokenExpired: prev?.tokenExpired && auth.hasToken ? true : false,
            }))
            if (auth.hasToken && !models) refreshModels()
          }).catch(e => console.warn('Auth refresh failed:', e))
        }}
      />
      {showCloseDialog && (
        <CloseDialog
          onMinimize={(remember) => handleCloseResponse('minimize', remember)}
          onQuit={(remember) => handleCloseResponse('quit', remember)}
          onCancel={() => handleCloseResponse('cancel')}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
      </>
    )
  }

  return (
    <>
    <MainView
      config={config}
      service={service}
      serviceBusy={serviceBusy}
      onStart={runStart}
      onStop={runStop}
      baseUrl={baseUrl}
      onOpenSettings={() => setPage('settings')}
      onOpenAbout={() => setPage('about')}
      getUsage={getUsage}
      models={models}
      modelsLoading={modelsLoading}
      modelsError={modelsError}
      onFetchModels={refreshModels}
      onChangeConfig={updateConfig}
      onChangeAndSaveConfig={updateAndSaveConfig}
      onSaveConfig={persistConfig}
      showToast={showToast}
      authStatus={authStatus}
    />
    {showRiskDialog && (
      <RiskDialog
        onAccept={handleRiskAccept}
        onCancel={() => setShowRiskDialog(false)}
      />
    )}
    {showCloseDialog && (
      <CloseDialog
        onMinimize={(remember) => handleCloseResponse('minimize', remember)}
        onQuit={(remember) => handleCloseResponse('quit', remember)}
        onCancel={() => handleCloseResponse('cancel')}
      />
    )}
    {toast && <div className="toast">{toast}</div>}
    </>
  )
}

export default function App() {
  const [config] = useState(() => loadConfig())

  // Sync language to main process (tray menu etc.)
  useEffect(() => {
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('set_lang', { lang: config.lang || 'zh' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeLang = useCallback((newLang) => {
    const current = loadConfig()
    saveConfig({ ...current, lang: newLang })
    // Notify main process so tray menu updates
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('set_lang', { lang: newLang })
    }
  }, [])

  return (
    <I18nProvider lang={config.lang || 'zh'} onChangeLang={handleChangeLang}>
      <AppInner />
    </I18nProvider>
  )
}
