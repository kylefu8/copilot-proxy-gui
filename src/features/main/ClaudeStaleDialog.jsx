/**
 * Dialog shown on startup when a previous session left proxy config
 * in ~/.claude/settings.json. Lets the user choose to keep or remove it.
 */
import { useI18n } from '../../core/i18n'

export function ClaudeStaleDialog({ onKeep, onRemove, onDismiss }) {
  const { t } = useI18n()
  return (
    <div className="risk-overlay" onClick={onDismiss}>
      <div className="close-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="close-dialog-title">{t('claude.staleTitle')}</h2>
        <p className="close-dialog-msg">{t('claude.staleBody')}</p>
        <div className="close-dialog-actions">
          <button type="button" className="close-btn close-btn-tray" onClick={onKeep}>
            {t('claude.staleKeep')}
          </button>
          <button type="button" className="close-btn close-btn-quit" onClick={onRemove}>
            {t('claude.staleRemove')}
          </button>
          <button type="button" className="close-btn close-btn-cancel" onClick={onDismiss}>
            {t('claude.staleDismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
