'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

const toastIcons = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: 'border-status-done text-status-done',
  error: 'border-status-failed text-status-failed',
  info: 'border-teal-muted text-teal-muted',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 bg-base border-l-4 px-5 py-4 shadow-xl ${toastColors[toast.type]}`}
              style={{ animation: 'toast-in 0.3s ease-out' }}
            >
              <Icon size={20} className="shrink-0" />
              <span className="text-sm font-bold text-text-primary flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 cursor-pointer hover:opacity-70">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
