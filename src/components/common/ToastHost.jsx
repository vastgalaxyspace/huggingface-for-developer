"use client";

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { notificationEventName } from '../../lib/notifications';

const TOAST_TIMEOUT_MS = 3200;

const toastStyleByType = {
  success: {
    Icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  error: {
    Icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  info: {
    Icon: Info,
    className: 'border-[var(--border-soft)] bg-white text-[var(--text-main)]',
  },
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const payload = event?.detail;
      if (!payload?.message) return;
      setToasts((prev) => [payload, ...prev].slice(0, 4));
    };

    window.addEventListener(notificationEventName, handleToast);
    return () => window.removeEventListener(notificationEventName, handleToast);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return undefined;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, TOAST_TIMEOUT_MS)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[500] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((toast) => {
        const variant = toastStyleByType[toast.type] || toastStyleByType.info;
        const Icon = variant.Icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 shadow-[0_10px_26px_rgba(24,39,75,0.12)] ${variant.className}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              className="rounded-md p-1 opacity-70 transition hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
