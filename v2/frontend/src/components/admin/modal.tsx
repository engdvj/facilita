'use client';

import type { ReactNode } from 'react';

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="Fechar modal"
      />
      <div className="surface-strong relative w-full max-w-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </p>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/70 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground"
          >
            Fechar
          </button>
        </div>
        <div className="mt-6 space-y-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}