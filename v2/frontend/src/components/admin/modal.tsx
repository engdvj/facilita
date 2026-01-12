'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
};

export default function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  panelClassName,
}: AdminModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalState = open ? 'open' : 'closed';

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalMarkup = (
    <div
      className="modal-root fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-8"
      data-state={modalState}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        data-state={modalState}
        aria-label="Fechar modal"
      />
      <div
        className={`modal-panel surface-strong relative flex w-full max-w-lg flex-col overflow-hidden p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] ${panelClassName ?? ''}`}
        data-state={modalState}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              id="admin-modal-title"
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
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
            className="motion-press rounded-lg border border-border/70 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-foreground"
          >
            Fechar
          </button>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalMarkup, document.body);
}
