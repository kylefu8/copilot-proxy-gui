/**
 * Risk acceptance dialog — shows the two WARNING messages from README.
 * Must be accepted before starting the proxy service.
 */
export function RiskDialog({ onAccept, onCancel }) {
  return (
    <div className="risk-overlay" onClick={onCancel}>
      <div className="risk-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="risk-title">⚠️ 使用风险提示</h2>

        <div className="risk-warning-box">
          <p className="risk-warning-label">警告 1</p>
          <p>
            This is a <strong>reverse-engineered</strong> proxy of GitHub Copilot API.
            It is <strong>not supported by GitHub</strong>, and may break unexpectedly.
            Use at your own risk.
          </p>
        </div>

        <div className="risk-warning-box">
          <p className="risk-warning-label">警告 2 — GitHub 安全提示</p>
          <p>
            Excessive automated or scripted use of Copilot (including rapid or bulk
            requests, such as via automated tools) may trigger GitHub's abuse-detection
            systems.
          </p>
          <p>
            You may receive a warning from GitHub Security, and further anomalous
            activity could result in <strong>temporary suspension</strong> of your
            Copilot access.
          </p>
          <p style={{ marginTop: 8 }}>
            GitHub prohibits use of their servers for excessive automated bulk activity
            or any activity that places undue burden on their infrastructure.
          </p>
          <p className="risk-links">
            <a href="https://docs.github.com/site-policy/acceptable-use-policies/github-acceptable-use-policies#4-spam-and-inauthentic-activity-on-github" target="_blank" rel="noreferrer">
              GitHub Acceptable Use Policies
            </a>
            {' · '}
            <a href="https://docs.github.com/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot" target="_blank" rel="noreferrer">
              GitHub Copilot Terms
            </a>
          </p>
        </div>

        <p className="risk-summary">
          点击「我接受风险」即表示你已阅读并理解上述警告，同意自行承担所有使用风险。
        </p>

        <div className="risk-actions">
          <button type="button" className="risk-btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="risk-btn-accept" onClick={onAccept}>
            我接受风险
          </button>
        </div>
      </div>
    </div>
  )
}
