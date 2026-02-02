'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type Props = {
  toasts: Toast[];
  removeToast: (id: string) => void;
};

export default function ToastManager({ toasts, removeToast }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000); 
    return () => clearTimeout(timer);
  }, [onRemove]);

  const styles = {
    success: 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-700 dark:text-emerald-400',
    error: 'bg-white dark:bg-slate-800 border-rose-500 text-rose-700 dark:text-rose-400',
    info: 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-700 dark:text-indigo-400',
  };

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <XCircle size={20} className="text-rose-500" />,
    info: <AlertCircle size={20} className="text-indigo-500" />,
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300 ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-200">{toast.message}</p>
      
      {/* FIXED: Added title and aria-label for accessibility */}
      <button 
        onClick={onRemove} 
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        title="Dismiss Notification"
        aria-label="Dismiss Notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}