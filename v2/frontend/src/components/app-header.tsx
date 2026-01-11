'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AppNav from '@/components/app-nav';
import MaxWidth from '@/components/max-width';
import { useAuthStore } from '@/stores/auth-store';

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme =
      stored === 'dark' || (stored !== 'light' && prefersDark) ? 'dark' : 'light';
    setTheme(nextTheme);
  }, []);

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

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors and clear local session.
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <header className="motion-header sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur">
      <MaxWidth>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg sm:text-2xl font-display font-bold tracking-wide uppercase text-foreground whitespace-nowrap"
            >
              Facilita
            </Link>
          </div>
          {hasHydrated ? (
            user ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-expanded={menuOpen}
                  aria-controls="app-mobile-nav"
                  className="motion-press flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground lg:hidden"
                >
                  <span className="flex flex-col gap-1">
                    <span className="block h-0.5 w-4 rounded-full bg-foreground" />
                    <span className="block h-0.5 w-4 rounded-full bg-foreground" />
                    <span className="block h-0.5 w-4 rounded-full bg-foreground" />
                  </span>
                  Menu
                </button>
                <button
                  type="button"
                  onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="motion-press rounded-lg border border-border/70 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                >
                  {theme === 'dark' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                    </svg>
                  )}
                </button>
                <span className="hidden max-w-[160px] truncate sm:inline text-foreground">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="motion-press rounded-lg border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="motion-press rounded-lg border border-border/70 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                >
                  {theme === 'dark' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                    </svg>
                  )}
                </button>
                <Link
                  href="/login"
                  className="motion-press rounded-lg border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
                >
                  Login
                </Link>
              </div>
            )
          ) : null}
        </div>
      </MaxWidth>
      {hasHydrated && user ? (
        <div
          id="app-mobile-nav"
          data-state={menuOpen ? 'open' : 'closed'}
          aria-hidden={!menuOpen}
          className="mobile-nav-panel bg-card/95 lg:hidden"
        >
          <MaxWidth>
            <div className="py-4">
              <AppNav />
            </div>
          </MaxWidth>
        </div>
      ) : null}
    </header>
  );
}
