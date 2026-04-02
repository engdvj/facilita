import { create } from 'zustand';

type Theme = 'light' | 'dark';
export type NavMode = 'manual' | 'auto';
export const NAV_WIDTH_DEFAULT = 272;
export const NAV_WIDTH_MIN = 200;
export const NAV_WIDTH_MAX = 420;

const clampNavWidth = (value: number) =>
  Math.min(NAV_WIDTH_MAX, Math.max(NAV_WIDTH_MIN, value));

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return stored === 'dark' || (stored !== 'light' && prefersDark) ? 'dark' : 'light';
};

const getInitialNavCollapsed = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('fac-nav-collapsed') === 'true';
};

const getInitialNavWidth = () => {
  if (typeof window === 'undefined') return NAV_WIDTH_DEFAULT;

  const stored = Number(localStorage.getItem('fac-nav-width'));
  return Number.isFinite(stored) ? clampNavWidth(stored) : NAV_WIDTH_DEFAULT;
};

const getInitialNavMode = (): NavMode => {
  if (typeof window === 'undefined') return 'manual';
  return localStorage.getItem('fac-nav-mode') === 'auto' ? 'auto' : 'manual';
};

type UiState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  navCollapsed: boolean;
  setNavCollapsed: (collapsed: boolean) => void;
  toggleNavCollapsed: () => void;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  toggleNavMode: () => void;
  navWidth: number;
  setNavWidth: (width: number) => void;
  resetNavWidth: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  navCollapsed: getInitialNavCollapsed(),
  setNavCollapsed: (collapsed) => {
    localStorage.setItem('fac-nav-collapsed', String(collapsed));
    set({ navCollapsed: collapsed });
  },
  toggleNavCollapsed: () =>
    set((state) => {
      const next = !state.navCollapsed;
      localStorage.setItem('fac-nav-collapsed', String(next));
      return { navCollapsed: next };
    }),
  navMode: getInitialNavMode(),
  setNavMode: (mode) => {
    localStorage.setItem('fac-nav-mode', mode);
    set({ navMode: mode });
  },
  toggleNavMode: () =>
    set((state) => {
      const next: NavMode = state.navMode === 'manual' ? 'auto' : 'manual';
      localStorage.setItem('fac-nav-mode', next);
      return { navMode: next };
    }),
  navWidth: getInitialNavWidth(),
  setNavWidth: (width) => {
    const next = clampNavWidth(width);
    localStorage.setItem('fac-nav-width', String(next));
    set({ navWidth: next });
  },
  resetNavWidth: () => {
    localStorage.setItem('fac-nav-width', String(NAV_WIDTH_DEFAULT));
    set({ navWidth: NAV_WIDTH_DEFAULT });
  },
  globalSearch: '',
  setGlobalSearch: (q) => set({ globalSearch: q }),
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      return { theme: nextTheme };
    }),
}));
