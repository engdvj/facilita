import type { ReactNode } from 'react';
import AppHeader from '@/components/app-header';
import MaxWidth from '@/components/max-width';
import AppNav from '@/components/app-nav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <AppHeader />

      <div className="flex-1">
        <MaxWidth>
          <div className="grid gap-6 pb-10 pt-6 lg:grid-cols-[190px_1fr] lg:items-start lg:gap-10">
            <aside className="w-fit max-w-[200px] justify-self-start self-start space-y-4 text-sm lg:sticky lg:top-24">
              <AppNav />
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
