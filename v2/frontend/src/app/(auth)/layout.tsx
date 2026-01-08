import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground grid lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,178,107,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,44,50,0.18),_transparent_60%)]" />
        <div className="relative z-10 max-w-md space-y-6 px-10">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Facilita V2
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

      <div className="flex items-center justify-center px-6 py-12">
        <div className="surface-strong w-full max-w-md p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4">
          {children}
        </div>
      </div>
    </div>
  );
}
