'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AppNav from '@/components/app-nav';
import MaxWidth from '@/components/max-width';
import NotificationBell from '@/components/notification-bell';
import { useAuthStore } from '@/stores/auth-store';

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-base sm:text-2xl font-display font-bold tracking-wide uppercase text-foreground whitespace-nowrap"
            >
              Facilita
            </Link>
          </div>
          {hasHydrated ? (
            user ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <NotificationBell />
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
                <span className="hidden max-w-[160px] truncate sm:inline text-foreground">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="motion-press rounded-full border border-border/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground hover:bg-card/80"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="motion-press rounded-full border border-border/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground hover:bg-card/80"
                >
                  Entrar
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
