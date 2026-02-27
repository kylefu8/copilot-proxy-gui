/**
 * Close confirmation dialog — themed to match the app's look.
 * Shows when user clicks the window close button.
 */
import { useI18n } from '../../core/i18n'

export function CloseDialog({ onMinimize, onQuit, onCancel }) {
  const { t } = useI18n()
  return (
    <div className="risk-overlay" onClick={onCancel}>
      <div className="close-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="close-dialog-title">{t('close.title')}</h2>
        <p className="close-dialog-msg">{t('close.message')}</p>
        <div className="close-dialog-actions">
          <button type="button" className="close-btn close-btn-tray" onClick={onMinimize}>
            <span className="close-btn-icon">🗕</span>
            {t('close.minimize')}
          </button>
          <button type="button" className="close-btn close-btn-quit" onClick={onQuit}>
            <span className="close-btn-icon">✕</span>
            {t('close.quit')}
          </button>
          <button type="button" className="close-btn close-btn-cancel" onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
