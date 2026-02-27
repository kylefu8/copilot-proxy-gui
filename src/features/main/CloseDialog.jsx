/**
 * Close confirmation dialog — themed to match the app's look.
 * Shows when user clicks the window close button.
 */
export function CloseDialog({ onMinimize, onQuit, onCancel }) {
  return (
    <div className="risk-overlay" onClick={onCancel}>
      <div className="close-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="close-dialog-title">关闭窗口</h2>
        <p className="close-dialog-msg">请选择操作</p>
        <div className="close-dialog-actions">
          <button type="button" className="close-btn close-btn-tray" onClick={onMinimize}>
            <span className="close-btn-icon">🗕</span>
            最小化到托盘
          </button>
          <button type="button" className="close-btn close-btn-quit" onClick={onQuit}>
            <span className="close-btn-icon">✕</span>
            退出程序
          </button>
          <button type="button" className="close-btn close-btn-cancel" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
