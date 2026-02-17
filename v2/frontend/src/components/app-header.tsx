'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Search, Sun } from 'lucide-react';
import api from '@/lib/api';
import AppNav from '@/components/app-nav';
import NotificationBell from '@/components/notification-bell';
import UserAvatar from '@/components/user-avatar';
import UserProfileModal from '@/components/user-profile-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

type AppHeaderProps = {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
};

export default function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const globalSearch = useUiStore((state) => state.globalSearch);
  const setGlobalSearch = useUiStore((state) => state.setGlobalSearch);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
      setProfileOpen(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors.
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const userLabel = user?.role === 'SUPERADMIN' ? 'Super Admin' : user?.name || 'Usuario';

  return (
    <header className="fac-topbar">
      <div className="fac-topbar-inner">
        <span className="font-display text-[22px] italic leading-none text-foreground shrink-0">
          Facilita
        </span>

        {user ? (
          <div className="fac-topbar-search">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/80 outline-none"
              placeholder="Buscar..."
            />
          </div>
        ) : null}

        {hasHydrated ? (
          user ? (
            <div className="fac-topbar-actions">
              {onToggleTheme ? (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="fac-icon-button"
                  aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                  title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              ) : null}
              <NotificationBell />

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="fac-avatar-chip"
                aria-label="Abrir perfil"
              >
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  size="sm"
                  className="!h-full !w-full border-0 bg-transparent shadow-none"
                />
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="hidden sm:inline text-[15px] text-foreground"
              >
                {userLabel}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="fac-button-secondary !h-9 !px-4 text-[11px]"
              >
                Sair
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="fac-button-secondary !h-9 !px-4 text-[11px] lg:!hidden"
                aria-expanded={menuOpen}
                aria-controls="app-mobile-nav"
              >
                Menu
              </button>
            </div>
          ) : (
            <div className="fac-topbar-actions">
              <Link href="/login" className="fac-button-secondary !h-9 !px-4 text-[11px]">
                Entrar
              </Link>
            </div>
          )
        ) : null}
      </div>

      {hasHydrated && user ? (
        <div
          id="app-mobile-nav"
          className={menuOpen ? 'border-t border-border bg-white/95 dark:bg-background/95 lg:hidden' : 'hidden'}
        >
          <div className="mx-auto w-full px-6 py-4">
            <AppNav />
          </div>
        </div>
      ) : null}

      {hasHydrated && user ? (
        <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      ) : null}
    </header>
  );
}
