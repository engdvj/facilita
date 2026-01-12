'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

const variantStyles = {
  success: {
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-200/60',
    glow: 'bg-emerald-400/20',
    badge: 'border-emerald-200/70 bg-emerald-50 text-emerald-800',
    label: 'Sucesso',
  },
  error: {
    accent: 'bg-destructive',
    ring: 'ring-destructive/30',
    glow: 'bg-destructive/15',
    badge: 'border-destructive/30 bg-destructive/10 text-destructive',
    label: 'Erro',
  },
  info: {
    accent: 'bg-foreground/40',
    ring: 'ring-border/70',
    glow: 'bg-foreground/10',
    badge: 'border-border/60 bg-muted/70 text-muted-foreground',
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
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-[0_18px_38px_rgba(16,44,50,0.16)] backdrop-blur ring-1 animate-in fade-in slide-in-from-top-2 ${variant.ring}`}
        >
          <span
            className={`absolute left-0 top-0 h-full w-[3px] ${variant.accent}`}
            aria-hidden="true"
          />
          <span
            className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${variant.glow}`}
            aria-hidden="true"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${variant.accent}`}
                  aria-hidden="true"
                />
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] ${variant.badge}`}
                >
                  {title}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="motion-press rounded-full border border-border/60 bg-card/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:bg-card hover:text-foreground"
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
