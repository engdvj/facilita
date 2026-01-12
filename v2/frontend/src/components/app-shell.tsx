'use client';

import { useState, type ReactNode } from 'react';
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

            <main className="motion-page motion-stagger space-y-6 min-w-0">
              {children}
            </main>
          </div>
        </MaxWidth>
      </div>

      <footer className="mt-auto border-t border-border/70 bg-card/80 py-5 text-xs text-muted-foreground">
        <MaxWidth>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="font-display text-sm font-semibold text-foreground uppercase"
              >
                Facilita
              </a>
              <span
                aria-hidden="true"
                className="hidden sm:inline-block h-4 w-px bg-border/70"
              />
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="motion-press text-[11px] uppercase tracking-[0.2em] hover:text-foreground transition-colors"
              >
                Contato
              </button>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em]">
              &copy; {new Date().getFullYear()} Todos os direitos reservados.
            </div>
          </div>
        </MaxWidth>
      </footer>
    </div>
  );
}
