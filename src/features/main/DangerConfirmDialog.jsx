/**
 * Reusable danger-confirmation dialog.
 * Used for both the settings-page "skip permissions" toggle
 * and the main-view "launch with skip permissions" confirmation.
 */
import { useI18n } from '../../core/i18n'

export function DangerConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }) {
  const { t } = useI18n()
  return (
    <div className="risk-overlay" onClick={onCancel}>
      <div className="danger-dialog" onClick={e => e.stopPropagation()}>
        <h2 className="danger-title">{title}</h2>

        <div className="danger-warning-box">
          {body.split('\n').map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i}>{line}</p>
          )}
        </div>

        <div className="risk-actions">
          <button type="button" className="risk-btn-cancel" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button type="button" className="danger-btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
