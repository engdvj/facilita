import type { ReactNode } from 'react';
import MaxWidth from '@/components/max-width';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="motion-page relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute -top-40 left-[-8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(155,179,170,0.22),transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(155,179,170,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-48 right-[-12%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(16,44,50,0.16),transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(16,44,50,0.28),transparent_72%)]" />
      <MaxWidth>
        <div className="relative z-10 min-h-screen grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center lg:gap-6">
            <div className="motion-fade-up relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-10 shadow-[0_24px_50px_rgba(16,44,50,0.14)] backdrop-blur-sm dark:border-white/10 dark:bg-card/70 dark:shadow-[0_28px_60px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(155,179,170,0.22),transparent_70%)]" />
              <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(16,44,50,0.12),transparent_70%)]" />
              <div className="relative z-10 max-w-md space-y-6">
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                  Facilita
                </p>
                <h1 className="font-display text-4xl leading-tight text-foreground">
                  Centralize seus links, documentos e notas em um so lugar.
                </h1>
                <p className="text-base text-muted-foreground">
                  Plataforma user-only com autonomia por usuario e controle
                  administrativo simplificado.
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-center px-6 py-12 lg:px-0 lg:justify-end">
            <div className="relative w-full min-w-[280px] max-w-[360px] overflow-hidden rounded-[20px] border border-border/70 bg-card/90 p-8 shadow-[0_22px_50px_rgba(16,44,50,0.16)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 dark:border-white/10 dark:bg-card/80 dark:shadow-[0_28px_60px_rgba(0,0,0,0.6)] sm:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-size:64px_64px] bg-[linear-gradient(rgba(155,179,170,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(155,179,170,0.14)_1px,transparent_1px)] dark:opacity-[0.2]" />
              <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-3xl bg-[radial-gradient(circle,rgba(155,179,170,0.22),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(155,179,170,0.16),transparent_65%)]" />
              <div className="pointer-events-none absolute -left-16 -bottom-20 h-44 w-44 rounded-3xl bg-[radial-gradient(circle,rgba(16,44,50,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(0,0,0,0.4),transparent_70%)]" />
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </div>
        </div>
      </MaxWidth>
    </div>
  );
}
