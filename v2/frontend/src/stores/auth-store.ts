'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'COLLABORATOR';

type AuthUserSector = {
  sectorId: string;
  isPrimary?: boolean;
  role?: string;
  userSectorUnits?: {
    unitId: string;
  }[] | null;
  sector?: {
    sectorUnits?: {
      unitId: string;
    }[] | null;
  } | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  unitId?: string;
  sectorId?: string;
  userSectors?: AuthUserSector[];
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  hasHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setHasHydrated: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hasHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'facilita-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
