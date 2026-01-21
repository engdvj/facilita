'use client';

import { useEffect, useState, type ReactNode } from 'react';
import AppHeader from '@/components/app-header';
import AppNav from '@/components/app-nav';
import MaxWidth from '@/components/max-width';
import ContactModal from '@/components/contact-modal';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme =
      stored === 'dark' || (stored !== 'light' && prefersDark) ? 'dark' : 'light';
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !accessToken) return;
    let active = true;

    const syncUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (active) {
          setUser(response.data);
        }
      } catch (error) {
        if (active) {
          clearAuth();
        }
      }
    };

    syncUser();
    return () => {
      active = false;
    };
  }, [accessToken, clearAuth, hasHydrated, setUser]);

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    root.classList.toggle('dark', nextTheme === 'dark');
    window.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 220);
  };

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
            className={`grid gap-4 pb-8 pt-4 sm:gap-6 sm:pb-10 sm:pt-6 ${
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

      <footer className="mt-auto border-t border-border/70 bg-card/80 py-4 sm:py-5 text-xs text-muted-foreground">
        <MaxWidth>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
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
              <button
                type="button"
                onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
                className="motion-press rounded-full border border-border/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground hover:bg-card/80"
                aria-pressed={theme === 'dark'}
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
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
