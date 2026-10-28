import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete account', onCancel, onConfirm, busy = false }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <button className="icon-button confirm-close" type="button" aria-label="Close dialog" disabled={busy} onClick={onCancel}><X size={19} /></button>
        <div className="confirm-icon"><AlertTriangle size={22} /></div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} type="button" className="button button-quiet" disabled={busy} onClick={onCancel}>Keep account</button>
          <button type="button" className="button button-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
