import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AboutPage } from './features/about/AboutPage'
import { CloseDialog } from './features/main/CloseDialog'
import { MainView } from './features/main/MainView'
import { RiskDialog } from './features/main/RiskDialog'
import { SettingsPage } from './features/settings/SettingsPage'
import { applyTheme, configFingerprint, loadConfig, needsRiskAcceptance, resetConfig, saveConfig, toCliArgs } from './core/config-store'
import { getUsage, waitForReady } from './core/proxy-api'
import {
  deleteToken,
  fetchModelsFromCopilot,
  getAuthStatus,
  getServiceLogs,
  getServiceState,
  markServiceRunning,
  markServiceStopped,
  startDeviceCodeAuth,
  startService,
  stopService,
} from './core/service-manager'

export default function App() {
  const [page, setPage] = useState('main') // 'main' | 'settings' | 'about'
  const [config, setConfig] = useState(() => loadConfig())
  const [service, setService] = useState(() => getServiceState())
  const [serviceBusy, setServiceBusy] = useState(false)

  const [authStatus, setAuthStatus] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)

  const [models, setModels] = useState(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [showRiskDialog, setShowRiskDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const pendingStartRef = useRef(false)
  const triggerStartRef = useRef(() => {})

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
    applyTheme(config.theme || 'midnight')
  }, [config.theme])

  // Listen for close-requested from main process (tray close confirmation)
  useEffect(() => {
    const cleanups = []

    if (window.copilotProxyDesktop?.onCloseRequested) {
      const unsub = window.copilotProxyDesktop.onCloseRequested(() => {
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

  const handleCloseResponse = useCallback((action) => {
    setShowCloseDialog(false)
    if (window.copilotProxyDesktop?.invoke) {
      window.copilotProxyDesktop.invoke('close_confirm_response', { action })
    }
  }, [])

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
    showToast('配置已保存，重启 Proxy 后生效')
  }, [config, showToast])

  const handleResetConfig = useCallback(async () => {
    if (confirm('确定要恢复所有默认设置、停止正在运行的服务并删除登录 Token 吗？')) {
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

  const checkAuth = useCallback(async () => {
    setAuthLoading(true)
    try {
      const result = await getAuthStatus()
      setAuthStatus(result)
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
    setModelsError('')
    try {
      const data = await fetchModelsFromCopilot(config.accountType)
      setModels(data)
    }
    catch (error) {
      setModels(null)
      setModelsError(String(error))
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
          setService(prev => ({ ...prev, status: 'error', lastError: '请先在设置中登录 GitHub' }))
          return
        }
      }
      catch {
        setService(prev => ({ ...prev, status: 'error', lastError: '无法检查登录状态' }))
        return
      }
    }

    // Check model selection
    if (!config.defaultModel) {
      setService(prev => ({ ...prev, status: 'error', lastError: '请先选择默认模型' }))
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
          onMinimize={() => handleCloseResponse('minimize')}
          onQuit={() => handleCloseResponse('quit')}
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
            setAuthStatus(auth)
            if (auth.hasToken && !models) refreshModels()
          }).catch(e => console.warn('Auth refresh failed:', e))
        }}
      />
      {showCloseDialog && (
        <CloseDialog
          onMinimize={() => handleCloseResponse('minimize')}
          onQuit={() => handleCloseResponse('quit')}
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
      getServiceLogs={getServiceLogs}
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
        onMinimize={() => handleCloseResponse('minimize')}
        onQuit={() => handleCloseResponse('quit')}
        onCancel={() => handleCloseResponse('cancel')}
      />
    )}
    {toast && <div className="toast">{toast}</div>}
    </>
  )
}
