'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />
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
        <div className="flex min-h-[48px] w-full items-center justify-between px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {user ? (
            <button
              type="button"
              onClick={toggleNav}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-white/80 text-muted-foreground hover:bg-white hover:text-foreground dark:bg-secondary/70 dark:hover:bg-secondary"
              aria-label={navCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
              title={navCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {navCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          ) : <span />}
          <span>&copy; {new Date().getFullYear()} Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
