import { useEffect } from 'react';

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const labels = { success: 'Done', error: 'Error', info: 'Info' };

  return (
    <div className={`toast ${toast.type}`} onClick={() => onRemove(toast.id)}>
      <span>{labels[toast.type] || 'Info'}</span>
      <span>{toast.message}</span>
    </div>
  );
}
