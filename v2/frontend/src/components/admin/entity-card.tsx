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
}: AdminEntityCardProps) {
  const isInteractive = Boolean(onOpen);

  return (
    <article
      className={cn(
        'fac-card w-[220px] max-w-full transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_32px_rgba(15,22,26,0.16)]',
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
              {cover}
            </button>
          ) : (
            <div className={cn('relative block h-40 w-full overflow-hidden bg-muted', coverClassName)}>
              {cover}
            </div>
          )
        : null}

      <div
        className={cn(
          'relative flex items-center justify-between overflow-hidden bg-white/92 px-3 py-2',
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
            className="min-w-0 flex-1 pr-2 text-left"
            onClick={onOpen}
          >
            {details}
          </button>
        ) : (
          <div className="min-w-0 flex-1 pr-2">{details}</div>
        )}

        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>

      {footer ? (
        <div
          className={cn(
            'border-t border-border bg-white/92 px-3 py-3',
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
          {footer}
        </div>
      ) : null}
    </article>
  );
}
