'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

const variantStyles = {
  success: {
    dot: 'bg-emerald-500',
    tone: 'text-emerald-700',
    title: 'Sucesso',
  },
  error: {
    dot: 'bg-destructive',
    tone: 'text-destructive',
    title: 'Erro',
  },
  info: {
    dot: 'bg-foreground/40',
    tone: 'text-muted-foreground',
    title: 'Aviso',
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
        const title = toast.title ?? variant.title;
        return (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-[0_10px_22px_rgba(16,32,36,0.08)] backdrop-blur animate-in fade-in slide-in-from-top-2"
        >
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${variant.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={`text-[10px] uppercase tracking-[0.2em] ${variant.tone}`}
            >
              {title}
            </p>
            <p className="text-sm font-medium text-foreground leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            className="motion-press text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            aria-label="Fechar notificacao"
          >
            Fechar
          </button>
        </div>
      );
      })}
    </div>
  );
}
