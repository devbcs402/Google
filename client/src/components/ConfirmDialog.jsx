import { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  warningNotice,
  icon: CustomIcon,
  onCancel,
  onConfirm,
  busy = false
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel]);

  const IconComponent = CustomIcon || (confirmVariant === 'danger' ? AlertTriangle : ShieldAlert);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <button
          className="icon-button confirm-close"
          type="button"
          aria-label="Close dialog"
          disabled={busy}
          onClick={onCancel}
        >
          <X size={19} />
        </button>

        <div className={`confirm-icon ${confirmVariant === 'primary' ? 'confirm-icon-primary' : ''}`}>
          <IconComponent size={22} />
        </div>

        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>

        {warningNotice && (
          <div className="modal-warning-box">
            <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
            <span>{warningNotice}</span>
          </div>
        )}

        <div className="modal-actions">
          <button
            ref={cancelRef}
            type="button"
            className="button button-quiet"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button ${confirmVariant === 'primary' ? 'button-primary' : 'button-danger'}`}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
