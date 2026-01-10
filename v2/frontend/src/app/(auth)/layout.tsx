import type { ReactNode } from 'react';
import MaxWidth from '@/components/max-width';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="motion-page relative min-h-screen text-foreground overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-[-8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(244,178,107,0.3),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-48 right-[-12%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(16,44,50,0.18),transparent_72%)] blur-2xl" />
      <MaxWidth>
        <div className="relative z-10 min-h-screen grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div className="hidden items-center justify-center lg:flex">
            <div className="motion-fade-up relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-10 shadow-[0_20px_50px_rgba(16,44,50,0.12)] backdrop-blur">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(244,178,107,0.25),transparent_70%)]" />
              <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(16,44,50,0.12),transparent_70%)]" />
              <div className="relative z-10 max-w-md space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                Facilita
              </p>
              <h1 className="font-display text-4xl leading-tight text-foreground">
                Controle tudo em um painel feito para times que crescem.
              </h1>
              <p className="text-base text-muted-foreground">
                Links, agendas e setores organizados com uma camada de permissoes
                clara e workflows prontos para operacao.
              </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-12 lg:px-0 lg:justify-end">
            <div className="surface-strong w-full min-w-[280px] max-w-[360px] p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4">
              {children}
            </div>
          </div>
        </div>
      </MaxWidth>
    </div>
  );
}
