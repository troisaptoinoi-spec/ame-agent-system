import React from 'react';
import { useToastStore } from '../../store/toastStore';

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const TOAST_COLORS = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)'
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-label="Thông báo">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`} role="alert">
          <div className="toast-icon" style={{ color: TOAST_COLORS[toast.type] }}>
            {TOAST_ICONS[toast.type]}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Đóng thông báo">✕</button>
        </div>
      ))}
    </div>
  );
}
