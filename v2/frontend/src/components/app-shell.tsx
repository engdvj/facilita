'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import AppNav from '@/components/app-nav';
import UserProfileModal from '@/components/user-profile-modal';
import UserNavMenu from './user-nav-menu';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  NAV_WIDTH_DEFAULT,
  useUiStore,
} from '@/stores/ui-store';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navCollapsed = useUiStore((state) => state.navCollapsed);
  const navMode = useUiStore((state) => state.navMode);
  const navWidth = useUiStore((state) => state.navWidth);
  const toggleNavCollapsed = useUiStore((state) => state.toggleNavCollapsed);
  const toggleNavMode = useUiStore((state) => state.toggleNavMode);
  const setNavWidth = useUiStore((state) => state.setNavWidth);
  const resetNavWidth = useUiStore((state) => state.resetNavWidth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navResizing, setNavResizing] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const navResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

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

  useEffect(() => {
    if (!navResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!navResizeRef.current) return;
      const delta = event.clientX - navResizeRef.current.startX;
      setNavWidth(navResizeRef.current.startWidth + delta);
    };

    const handlePointerUp = () => {
      navResizeRef.current = null;
      setNavResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [navResizing, setNavWidth]);

  const handleNavResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (navMode === 'manual' && navCollapsed) return;

    navResizeRef.current = {
      startX: event.clientX,
      startWidth: navWidth,
    };
    setNavResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    event.preventDefault();
  };

  const navEffectiveCollapsed =
    navMode === 'auto' ? !(navHovered || navResizing) : navCollapsed;

  const mainGridStyle = user
    ? ({ '--fac-sidebar-width': `${navWidth}px` } as CSSProperties)
    : undefined;

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      {user ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden={!mobileMenuOpen}
            className={cn('fac-mobile-nav-backdrop lg:hidden', mobileMenuOpen && 'is-open')}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className={cn('fac-mobile-nav-drawer lg:hidden', mobileMenuOpen && 'is-open')}
            aria-hidden={!mobileMenuOpen}
          >
            <AppNav onNavigate={() => setMobileMenuOpen(false)} />
          </aside>
        </>
      ) : null}
      <div className={`fac-shell flex-1 ${user ? 'fac-shell-with-nav' : ''}`}>
        <div
          className={
            user
              ? `fac-main-grid ${navEffectiveCollapsed ? 'fac-main-grid-collapsed' : ''}`
              : ''
          }
          style={mainGridStyle}
        >
          {user ? (
            <aside
              className="hidden lg:block lg:relative lg:h-full"
              onMouseEnter={() => {
                if (navMode === 'auto') {
                  setNavHovered(true);
                }
              }}
              onMouseLeave={() => {
                if (navMode === 'auto') {
                  setNavHovered(false);
                }
              }}
            >
              <AppNav
                collapsed={navEffectiveCollapsed}
                onToggleCollapse={navMode === 'manual' ? toggleNavCollapsed : undefined}
                navMode={navMode}
              />
              {!navEffectiveCollapsed ? (
                <button
                  type="button"
                  className={cn('fac-nav-resizer', navResizing && 'is-resizing')}
                  onPointerDown={handleNavResizeStart}
                  onDoubleClick={resetNavWidth}
                  aria-label="Ajustar largura da barra lateral"
                  title={`Arraste para ajustar a largura. Duplo clique para voltar a ${NAV_WIDTH_DEFAULT}px.`}
                />
              ) : null}
            </aside>
          ) : null}
          <main className={`fac-outlet ${user ? 'fac-main-content' : ''}`}>{children}</main>
        </div>
      </div>

      <footer className="border-t border-border bg-white/85 dark:bg-background/90">
        <div className="flex min-h-[48px] w-full items-center justify-between px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span />
          <span>&copy; {new Date().getFullYear()} Todos os direitos reservados</span>
        </div>
      </footer>

      {user ? (
        <UserNavMenu
          navMode={navMode}
          mobileMenuOpen={mobileMenuOpen}
          onToggleNavMode={toggleNavMode}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          onOpenProfile={() => setProfileOpen(true)}
        />
      ) : null}
      {user ? <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} /> : null}
    </div>
  );
}
