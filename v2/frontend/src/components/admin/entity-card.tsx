'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminEntityCardProps = {
  cover?: ReactNode;
  details: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
  onOpen?: () => void;
  className?: string;
  coverClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  dividerColor?: string;
  hideCover?: boolean;
  hoverClassName?: string;
};

export default function AdminEntityCard({
  cover,
  details,
  trailing,
  footer,
  onOpen,
  className,
  coverClassName,
  contentClassName,
  footerClassName,
  dividerColor,
  hideCover = false,
  hoverClassName = 'hover:-translate-y-1.5 hover:scale-[1.025] hover:shadow-[0_22px_38px_rgba(15,22,26,0.18)]',
}: AdminEntityCardProps) {
  const isInteractive = Boolean(onOpen);
  const coverMotionClassName =
    'h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:scale-[1.045]';

  return (
    <article
      className={cn(
        'fac-card group/entity-card isolate w-[220px] max-w-full transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hoverClassName,
        className,
      )}
    >
      {!hideCover
        ? isInteractive ? (
            <button
              type="button"
              className={cn(
                'relative block h-40 w-full overflow-hidden border-0 bg-muted p-0 text-left align-top',
                coverClassName,
              )}
              onClick={onOpen}
            >
              <div className={coverMotionClassName}>{cover}</div>
            </button>
          ) : (
            <div className={cn('relative block h-40 w-full overflow-hidden bg-muted', coverClassName)}>
              <div className={coverMotionClassName}>{cover}</div>
            </div>
          )
        : null}

      <div
        className={cn(
          'relative flex items-center justify-between overflow-hidden bg-white/92 px-3 py-2 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:translate-y-[-1px]',
          hideCover ? '' : 'border-t border-border',
          contentClassName,
        )}
        style={
          !hideCover && dividerColor
            ? {
                borderTopColor: dividerColor,
                borderTopWidth: 3,
                background: `linear-gradient(180deg, color-mix(in srgb, ${dividerColor} 16%, var(--card) 84%) 0%, color-mix(in srgb, ${dividerColor} 8%, var(--card) 92%) 100%)`,
              }
            : undefined
        }
      >
        {isInteractive ? (
          <button
            type="button"
            className="min-w-0 flex-1 pr-2 text-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:translate-x-0.5"
            onClick={onOpen}
          >
            {details}
          </button>
        ) : (
          <div className="min-w-0 flex-1 pr-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:translate-x-0.5">
            {details}
          </div>
        )}

        {trailing ? (
          <div className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:-translate-y-0.5">
            {trailing}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div
          className={cn(
            'border-t border-border bg-white/92 px-3 py-3 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:translate-y-[-1px]',
            footerClassName,
          )}
          style={
            dividerColor
              ? {
                  borderTopColor: `color-mix(in srgb, ${dividerColor} 28%, var(--border) 72%)`,
                  background: `linear-gradient(180deg, color-mix(in srgb, ${dividerColor} 12%, var(--card) 88%) 0%, color-mix(in srgb, ${dividerColor} 6%, var(--card) 94%) 100%)`,
                }
            : undefined
          }
        >
          <div className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/entity-card:translate-x-0.5">
            {footer}
          </div>
        </div>
      ) : null}
    </article>
  );
}
