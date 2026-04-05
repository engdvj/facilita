'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  X,
} from 'lucide-react';
import UserNotificationsModal from '@/components/user-notifications-modal';
import UserAvatar from '@/components/user-avatar';
import api from '@/lib/api';
import { getUserRoleLabel } from '@/lib/user-role';
import { useAuthStore } from '@/stores/auth-store';
import { useRealtimeNotificationStore } from '@/stores/realtime-notification-store';
import { type NavMode, useUiStore } from '@/stores/ui-store';

type UserNavMenuProps = {
  navMode: NavMode;
  mobileMenuOpen: boolean;
  onToggleNavMode: () => void;
  onToggleMobileMenu: () => void;
  onOpenProfile: () => void;
};

export default function UserNavMenu(props: UserNavMenuProps) {
  const { navMode, onToggleNavMode, onOpenProfile } = props;
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const globalSearch = useUiStore((state) => state.globalSearch);
  const setGlobalSearch = useUiStore((state) => state.setGlobalSearch);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const unreadCount = useRealtimeNotificationStore((state) => state.unreadCount);
  const clearNotifications = useRealtimeNotificationStore((state) => state.clear);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearchOpen(false);
      return;
    }

    if (!searchOpen) return;

    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, searchOpen]);

  if (!user) return null;

  const closeMenu = () => {
    setOpen(false);
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();

    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors.
    } finally {
      clearNotifications();
      clearAuth();
      router.push('/login');
    }
  };

  const roleLabel = getUserRoleLabel(user.role);
  const hasActivity = unreadCount > 0;
  const hasSearchTerm = globalSearch.trim().length > 0;
  const nextThemeLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  const navModeLabel =
    navMode === 'manual'
      ? 'Ativar ajuste automatico da barra lateral'
      : 'Ativar ajuste manual da barra lateral';

  return (
    <div className="fac-floating-user-menu" ref={wrapperRef}>
      {open ? (
        <div
          className="fac-floating-user-panel"
          style={{ animation: 'popIn var(--duration-slow) var(--ease-spring) both' }}
        >
          <div className="fac-floating-user-summary">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onOpenProfile();
              }}
              className="fac-floating-user-profile"
              aria-label="Abrir perfil"
              title="Abrir perfil"
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="md"
                className="h-10 w-10 border-primary/15 bg-card/95 text-[10px] shadow-none"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-foreground">
                  {user.name || 'Usuário'}
                </span>
                <span className="mt-0.5 block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
            </button>
          </div>

          <div
            className="fac-floating-user-search-shell"
            data-open={searchOpen ? 'true' : 'false'}
          >
            <div className="fac-floating-user-search-shell-inner">
              <label className="fac-floating-user-search">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  placeholder="Buscar no portal"
                />
                {hasSearchTerm ? (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch('')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </label>
            </div>
          </div>

          <div className="fac-floating-user-grid">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className="fac-floating-user-action"
              data-active={searchOpen || hasSearchTerm ? 'true' : 'false'}
              aria-label="Buscar no portal"
              title="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                closeMenu();
                setNotificationsModalOpen(true);
              }}
              className="fac-floating-user-action"
              aria-label="Notificacoes"
              title={
                unreadCount > 0
                  ? `${unreadCount} notificacoes pendentes`
                  : 'Notificacoes'
              }
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="fac-floating-user-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="fac-floating-user-action"
              aria-label={nextThemeLabel}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleNavMode}
              className="fac-floating-user-action hidden lg:inline-flex"
              data-active={navMode === 'manual' ? 'true' : 'false'}
              aria-label={navModeLabel}
              title={navModeLabel}
            >
              {navMode === 'manual' ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="fac-floating-user-action"
              data-variant="danger"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fac-floating-user-trigger"
        data-open={open ? 'true' : 'false'}
        aria-label="Acoes do usuario"
        aria-expanded={open}
      >
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          size="md"
          className="h-12 w-12 border-white/50 bg-card/90 text-[12px] shadow-none"
        />
        {hasActivity ? (
          <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
        ) : null}
      </button>

      <UserNotificationsModal
        open={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
    </div>
  );
}
