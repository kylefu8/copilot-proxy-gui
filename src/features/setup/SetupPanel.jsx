import { useCallback, useEffect, useRef, useState } from 'react'

export function SetupPanel({
  authStatus,
  authLoading,
  onCheckAuth,
  onStartDeviceCode,
  onPollDeviceCode,
  service,
  serviceBusy,
  onStartService,
  models,
  modelsLoading,
  modelsError,
  onFetchModels,
  config,
  onChangeConfig,
  onSaveConfig,
}) {
  const modelOptions = models?.data ?? []

  // Device code flow state
  const [deviceCode, setDeviceCode] = useState(null)
  const [userCode, setUserCode] = useState('')
  const [verificationUri, setVerificationUri] = useState('')
  const [polling, setPolling] = useState(false)
  const [pollMessage, setPollMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState(false)
  const pollingRef = useRef(null)
  const intervalRef = useRef(5)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setPolling(false)
  }, [])

  const startLogin = useCallback(async () => {
    setAuthError('')
    setAuthSuccess(false)
    setPollMessage('')
    setUserCode('')
    setVerificationUri('')
    stopPolling()

    try {
      const result = await onStartDeviceCode()
      setDeviceCode(result.device_code)
      setUserCode(result.user_code)
      setVerificationUri(result.verification_uri)
      intervalRef.current = (result.interval || 5) + 1

      // Start polling
      setPolling(true)
      setPollMessage('等待授权...')

      const pollInterval = setInterval(async () => {
        try {
          const pollResult = await onPollDeviceCode(result.device_code)

          if (pollResult.status === 'success') {
            clearInterval(pollInterval)
            pollingRef.current = null
            setPolling(false)
            setAuthSuccess(true)
            setPollMessage('✅ 登录成功！Token 已保存。')
            setUserCode('')
            // Refresh auth status
            onCheckAuth()
          }
          else if (pollResult.status === 'expired' || pollResult.status === 'error') {
            clearInterval(pollInterval)
            pollingRef.current = null
            setPolling(false)
            setAuthError(pollResult.message)
            setPollMessage('')
          }
          else if (pollResult.status === 'slow_down') {
            // Increase interval
            intervalRef.current += 2
            setPollMessage(pollResult.message)
          }
          else {
            setPollMessage(pollResult.message || '等待授权...')
          }
        }
        catch (err) {
          setPollMessage(`Poll error: ${err}`)
        }
      }, intervalRef.current * 1000)

      pollingRef.current = pollInterval
    }
    catch (err) {
      setAuthError(String(err))
    }
  }, [onStartDeviceCode, onPollDeviceCode, onCheckAuth, stopPolling])

  const copyUserCode = useCallback(() => {
    if (userCode) {
      navigator.clipboard.writeText(userCode)
    }
  }, [userCode])

  return (
    <section className="card">
      <div className="card-header">
        <h2>登录与初始化向导</h2>
      </div>

      <div className="stack">
        {/* Step 1: GitHub Login */}
        <div className="wizard-step">
          <div className="row between">
            <p><strong>Step 1: GitHub 登录</strong></p>
            <div className="row">
              <button type="button" onClick={onCheckAuth} disabled={authLoading}>
                {authLoading ? '检查中...' : '检查登录'}
              </button>
              {!authSuccess && (
                <button type="button" onClick={startLogin} disabled={polling}>
                  {polling ? '等待授权中...' : '开始登录'}
                </button>
              )}
            </div>
          </div>

          {/* Device code display */}
          {userCode && (
            <div className="device-code-box">
              <p>请在浏览器中输入以下代码（浏览器已自动打开）：</p>
              <div className="device-code-display">
                <span className="user-code">{userCode}</span>
                <button type="button" className="copy-btn" onClick={copyUserCode}>复制</button>
              </div>
              <p className="hint">
                验证地址：
                <a href={verificationUri} target="_blank" rel="noreferrer">{verificationUri}</a>
              </p>
            </div>
          )}

          {/* Polling status */}
          {polling && <p className="poll-status">⏳ {pollMessage}</p>}

          {/* Success */}
          {authSuccess && <p className="success">{pollMessage}</p>}

          {/* Error */}
          {authError && <p className="error">❌ {authError}</p>}

          {/* Existing auth status */}
          {authStatus && !userCode && !authSuccess && (
            <p>
              {authStatus.hasToken ? '✅ 已检测到 GitHub token' : '⚠️ 未检测到 GitHub token'}
              {authStatus.tokenPath ? ` (${authStatus.tokenPath})` : ''}
            </p>
          )}
        </div>

        {/* Step 2: Start service */}
        <div className="wizard-step">
          <div className="row between">
            <p><strong>Step 2: 启动服务</strong></p>
            <button type="button" onClick={onStartService} disabled={serviceBusy || service.status === 'running'}>
              {service.status === 'running' ? '已运行' : '启动服务'}
            </button>
          </div>
          <p>当前状态：{service.status}</p>
        </div>

        {/* Step 3: Models */}
        <div className="wizard-step">
          <div className="row between">
            <p><strong>Step 3: 拉取模型并设置默认值</strong></p>
            <button type="button" onClick={onFetchModels} disabled={modelsLoading || service.status !== 'running'}>
              {modelsLoading ? '拉取中...' : '拉取模型'}
            </button>
          </div>

          {modelsError && <p className="error">{modelsError.key === 'tokenExpired' ? 'Token expired' : 'Failed to fetch models: ' + (modelsError.detail || '')}</p>}

          {modelOptions.length > 0 && (
            <div className="grid2 compact-grid">
              <label>
                默认模型
                <select
                  value={config.defaultModel}
                  onChange={e => onChangeConfig('defaultModel', e.target.value)}
                >
                  <option value="">请选择</option>
                  {modelOptions.map(model => (
                    <option key={model.id} value={model.id}>{model.id}</option>
                  ))}
                </select>
              </label>

              <label>
                小模型（可选）
                <select
                  value={config.defaultSmallModel}
                  onChange={e => onChangeConfig('defaultSmallModel', e.target.value)}
                >
                  <option value="">请选择</option>
                  {modelOptions.map(model => (
                    <option key={model.id} value={model.id}>{model.id}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="row">
            <button type="button" onClick={onSaveConfig}>保存向导配置</button>
            <span>
              {config.defaultModel
                ? `已选默认模型：${config.defaultModel}`
                : '尚未选择默认模型'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
