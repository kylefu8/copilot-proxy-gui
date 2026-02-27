import { useCallback, useEffect, useRef, useState } from 'react'
import { resizeWindow, detectAccountType } from '../../core/service-manager'

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

  // Login flow state
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [loginError, setLoginError] = useState('')

  // Auto-detect account type after login
  const autoDetect = useCallback(async () => {
    try {
      setLoginMessage('✅ 登录成功！正在检测账号类型...')
      const result = await detectAccountType()
      if (result.detected && result.accountType) {
        onChangeConfig('accountType', result.accountType)
        setLoginMessage(`✅ 登录成功！账号类型: ${result.accountType}`)
      } else {
        setLoginMessage('✅ 登录成功！（账号类型检测失败，请手动选择）')
      }
    } catch {
      setLoginMessage('✅ 登录成功！（账号类型检测失败，请手动选择）')
    }
  }, [onChangeConfig])

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
        onCheckAuth()
        autoDetect()
      } else if (result.status === 'canceled') {
        setLoginMessage('')
      } else if (result.status === 'expired') {
        setLoginError(result.message || '验证码已过期')
      } else if (result.status === 'error') {
        setLoginError(result.message || '登录出错')
      }
    }
    catch (err) {
      setLoginError(String(err))
    }
    finally {
      setLoginBusy(false)
    }
  }, [onStartDeviceCode, onCheckAuth, autoDetect])

  function handleSave() {
    onSaveConfig()
  }

  return (
    <div className="settings-page">
      <div className="settings-page-inner" ref={contentRef}>
      <header className="settings-header">
        <button type="button" className="back-btn" onClick={onBack}>← 返回</button>
        <h1>设置</h1>
      </header>

      {/* ── Section: GitHub Auth ─────────────────────── */}
      <section className="settings-section">
        <h2>GitHub 登录</h2>

        <div className="row gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {authStatus?.hasToken ? (
            <>
              <span className="success" style={{ margin: 0 }}>✅ 已登录</span>
              {authStatus.tokenPath && (
                <span className="hint" style={{ margin: 0, wordBreak: 'break-all' }}>Token: {authStatus.tokenPath}</span>
              )}
            </>
          ) : (
            <>
              <button type="button" onClick={startLogin} disabled={loginBusy}>
                {loginBusy ? '登录中...' : '开始登录'}
              </button>
              {loginMessage && <span className="success" style={{ margin: 0 }}>{loginMessage}</span>}
              {loginError && <span className="error" style={{ margin: 0 }}>❌ {loginError}</span>}
              {authStatus && !loginMessage && !loginError && (
                <span style={{ margin: 0 }}>⚠️ 未登录</span>
              )}
            </>
          )}
          {authLoading && <span style={{ margin: 0 }}>检查中...</span>}
        </div>
      </section>

      {/* ── Section: Service Config ──────────────────── */}
      <section className="settings-section">
        <h2>服务参数</h2>

        <div className="grid2" style={{ marginBottom: 8 }}>
          <div className="row gap-8">
            <label style={{ minWidth: 0 }} title="代理服务监听的端口号，默认 4399。">
              端口
              <input
                type="number"
                value={config.port}
                onChange={e => onChangeConfig('port', Number(e.target.value))}
                style={{ width: 90 }}
              />
            </label>

            <label style={{ minWidth: 0 }} title="每次请求之间的最小间隔秒数，防止过于频繁调用 API。留空表示不限制。">
              限流秒数
              <input
                type="number"
                value={config.rateLimitSeconds}
                onChange={e => onChangeConfig('rateLimitSeconds', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="不限"
                style={{ width: 90 }}
              />
            </label>
          </div>

          <label title="GitHub Copilot 订阅类型，影响可用模型和配额。">
            账号类型
            <select
              value={config.accountType}
              onChange={e => onChangeConfig('accountType', e.target.value)}
            >
              {accountTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid2">
          <label className="checkbox" title="开启后，当触发限流时请求会排队等待而不是直接拒绝（返回 429）。">
            <input
              type="checkbox"
              checked={config.rateLimitWait}
              onChange={e => onChangeConfig('rateLimitWait', e.target.checked)}
            />
            超限等待
          </label>

          <label className="checkbox" title="开启后，服务会输出更详细的日志信息，包括请求/响应的完整内容，便于调试问题。">
            <input
              type="checkbox"
              checked={config.verbose}
              onChange={e => onChangeConfig('verbose', e.target.checked)}
            />
            详细日志
          </label>

          <label className="checkbox" title="开启后，每次 API 请求都需要在终端手动确认后才会转发到 Copilot，适合调试或安全审计。">
            <input
              type="checkbox"
              checked={config.manualApprove}
              onChange={e => onChangeConfig('manualApprove', e.target.checked)}
            />
            手动审批
          </label>

          <label className="checkbox" title="开启后，服务会读取系统的 HTTP_PROXY / HTTPS_PROXY 环境变量，通过代理服务器访问 GitHub API。">
            <input
              type="checkbox"
              checked={config.proxyEnv}
              onChange={e => onChangeConfig('proxyEnv', e.target.checked)}
            />
            使用代理环境变量
          </label>

          <label className="checkbox" title="开启后，启动日志中会打印 Copilot Token 的完整内容，仅用于调试目的。">
            <input
              type="checkbox"
              checked={config.showToken}
              onChange={e => onChangeConfig('showToken', e.target.checked)}
            />
            显示 Token（调试）
          </label>

          <label className="checkbox" title="开启后，应用启动时会自动运行代理服务，无需手动点击启动按钮。">
            <input
              type="checkbox"
              checked={config.autoStart}
              onChange={e => onChangeConfig('autoStart', e.target.checked)}
            />
            启动时自动运行服务
          </label>
        </div>
      </section>

      <div className="settings-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" onClick={onResetConfig} style={{ background: 'transparent', borderColor: 'var(--red)', color: 'var(--red)' }}>恢复默认设置</button>
        <button type="button" onClick={handleSave}>保存所有配置</button>
      </div>
      </div>
    </div>
  )
}
