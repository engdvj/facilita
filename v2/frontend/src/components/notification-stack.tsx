'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

const variantStyles = {
  success: {
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-200/60',
    label: 'Sucesso',
  },
  error: {
    accent: 'bg-destructive',
    ring: 'ring-destructive/30',
    label: 'Erro',
  },
  info: {
    accent: 'bg-foreground/40',
    ring: 'ring-border/70',
    label: 'Aviso',
  },
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
      {notifications.map((toast) => {
        const variant = variantStyles[toast.variant];
        const title = toast.title ?? variant.label;
        return (
        <div
          key={toast.id}
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-[0_12px_30px_rgba(16,32,36,0.12)] backdrop-blur ring-1 animate-in fade-in slide-in-from-top-2 ${variant.ring}`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-1 ${variant.accent}`}
            aria-hidden="true"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2.5 w-2.5 rounded-full ${variant.accent}`}
                aria-hidden="true"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {title}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {toast.message}
                </p>
              </div>
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
      );
      })}
    </div>
  );
}
