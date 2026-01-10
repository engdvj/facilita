'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AppNav from '@/components/app-nav';
import MaxWidth from '@/components/max-width';
import ContactModal from '@/components/contact-modal';
import { useAuthStore } from '@/stores/auth-store';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((state) => state.user);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <AppHeader />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <div className="flex-1">
        <MaxWidth>
          <div
            className={`grid gap-6 pb-10 pt-6 ${
              user ? 'lg:grid-cols-[190px_1fr] lg:items-start lg:gap-10' : ''
            }`}
          >
            {user ? (
              <aside className="motion-fade-up hidden lg:block w-fit max-w-[200px] justify-self-start self-start space-y-4 text-sm lg:sticky lg:top-24">
                <AppNav />
              </aside>
            ) : null}

            <main
              key={pathname}
              className="motion-page motion-stagger space-y-6 min-w-0"
            >
              {children}
            </main>
          </div>
        </MaxWidth>
      </div>

      <footer className="mt-auto border-t border-border/70 bg-card/80 py-6 text-xs text-muted-foreground">
        <MaxWidth>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-display text-sm font-semibold text-foreground">
                Facilita
              </span>
              <span className="hidden sm:inline text-border/70">•</span>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="motion-press hover:text-foreground transition-colors"
              >
                Contato
              </button>
              {user && (
                <>
                  <span className="text-border/70">•</span>
                  <a
                    href="/dashboard"
                    className="motion-press hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </a>
                </>
              )}
              {user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                <>
                  <span className="text-border/70">•</span>
                  <a
                    href="/admin/links"
                    className="motion-press hover:text-foreground transition-colors"
                  >
                    Administração
                  </a>
                </>
              )}
            </div>
            <div className="text-xs">
              &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
          </div>
        </MaxWidth>
      </footer>
    </div>
  );
}
