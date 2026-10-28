import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`} role="status">
          {toast.type === 'error' ? <XCircle size={19} /> : <CheckCircle2 size={19} />}
          <span>{toast.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
