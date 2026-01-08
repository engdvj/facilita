'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'COORDINATOR'
  | 'MANAGER'
  | 'COLLABORATOR';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  unitId?: string;
  sectorId?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  hasHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
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
