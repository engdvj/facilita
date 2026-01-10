'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
  info: 'border-border/70 bg-card/90 text-foreground',
};

export default function NotificationStack() {
  const notifications = useNotificationStore((state) => state.notifications);
  const remove = useNotificationStore((state) => state.remove);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const activeIds = new Set(notifications.map((toast) => toast.id));

    Object.keys(timers.current).forEach((id) => {
      if (!activeIds.has(id)) {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
    });

    notifications.forEach((toast) => {
      if (timers.current[toast.id]) return;
      timers.current[toast.id] = window.setTimeout(() => {
        remove(toast.id);
        delete timers.current[toast.id];
      }, toast.duration);
    });
  }, [notifications, remove]);

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach((timer) => clearTimeout(timer));
      timers.current = {};
    };
  }, []);

  if (!notifications.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {notifications.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(16,32,36,0.12)] backdrop-blur animate-in fade-in slide-in-from-top-2 ${variantStyles[toast.variant]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {toast.title}
                </p>
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="motion-press rounded-full border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
              aria-label="Fechar notificacao"
            >
              X
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
