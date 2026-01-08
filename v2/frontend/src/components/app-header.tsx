'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import MaxWidth from '@/components/max-width';
import { useAuthStore } from '@/stores/auth-store';

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

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
    <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur">
      <MaxWidth>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-foreground"
            >
              Facilita V2
            </Link>
            <span className="text-xs text-muted-foreground">Painel</span>
          </div>
          {user ? (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="hidden max-w-[160px] truncate sm:inline text-foreground">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
            >
              Login
            </Link>
          )}
        </div>
      </MaxWidth>
    </header>
  );
}
