import type { ReactNode } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/app-header';
import MaxWidth from '@/components/max-width';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <AppHeader />

      <div className="flex-1">
        <MaxWidth>
          <div className="grid gap-6 pb-10 pt-8 xl:grid-cols-[220px_1fr] xl:gap-10">
            <aside className="surface h-fit space-y-6 px-4 py-5 text-sm xl:sticky xl:top-24">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Navegacao
                </p>
                <nav className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Dashboard
                  </Link>
                </nav>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Portal
                </p>
                <nav className="space-y-2">
                  <Link
                    href="/admin/categories"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Categorias
                  </Link>
                  <Link
                    href="/admin/links"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Links
                  </Link>
                  <Link
                    href="/admin/schedules"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Agendas/Documentos
                  </Link>
                </nav>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Administracao
                </p>
                <nav className="space-y-2">
                  <Link
                    href="/admin/companies"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Empresas
                  </Link>
                  <Link
                    href="/admin/units"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Unidades
                  </Link>
                  <Link
                    href="/admin/sectors"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Setores
                  </Link>
                  <Link
                    href="/admin/users"
                    className="block rounded-lg border border-transparent px-3 py-2 text-foreground transition hover:border-border/70 hover:bg-secondary/60"
                  >
                    Usuarios
                  </Link>
                </nav>
              </div>
            </aside>

            <main className="space-y-6 min-w-0">{children}</main>
          </div>
        </MaxWidth>
      </div>

      <footer className="mt-auto border-t border-border/70 bg-card/80 py-4 text-xs text-muted-foreground">
        <MaxWidth>Facilita V2 - Painel administrativo</MaxWidth>
      </footer>
    </div>
  );
}
