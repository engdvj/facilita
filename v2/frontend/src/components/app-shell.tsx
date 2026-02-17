'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/app-header';
import AppNav from '@/components/app-nav';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type AppShellProps = {
  children: ReactNode;
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return stored === 'dark' || (stored !== 'light' && prefersDark) ? 'dark' : 'light';
};

export default function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fac-nav-collapsed') === 'true';
  });

  useEffect(() => {
    if (!hasHydrated || !accessToken) return;
    let active = true;

    const syncUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (active) {
          setUser(response.data);
        }
      } catch {
        if (active) {
          clearAuth();
        }
      }
    };

    void syncUser();
    return () => {
      active = false;
    };
  }, [accessToken, clearAuth, hasHydrated, setUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const toggleNav = () => {
    setNavCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('fac-nav-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <AppHeader />
      <div className={`fac-shell flex-1 ${user ? 'fac-shell-with-nav' : ''}`}>
        <div className={user ? `fac-main-grid ${navCollapsed ? 'fac-main-grid-collapsed' : ''}` : ''}>
          {user ? (
            <aside className="hidden lg:block lg:h-full">
              <AppNav collapsed={navCollapsed} onToggleCollapse={toggleNav} />
            </aside>
          ) : null}
          <main className={`fac-outlet ${user ? 'fac-main-content' : ''}`}>{children}</main>
        </div>
      </div>

      <footer className="border-t border-border bg-white/85 dark:bg-background/90">
        <div className="relative mx-auto flex min-h-[64px] w-full max-w-[1600px] flex-col gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={toggleTheme}
            className="fac-button-secondary !h-8 !px-3 text-[10px] sm:justify-self-start"
          >
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>

          <Link
            href="/"
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground sm:absolute sm:left-1/2 sm:-translate-x-1/2"
          >
            FACILITA
          </Link>

          <span className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} Todos os direitos reservados
          </span>
        </div>
      </footer>
    </div>
  );
}
