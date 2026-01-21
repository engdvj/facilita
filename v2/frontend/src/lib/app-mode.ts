export type AppMode = 'company' | 'user';

export const APP_MODE_STORAGE_KEY = 'facilita-app-mode';

const normalizeMode = (value?: string): AppMode => {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'user' ? 'user' : 'company';
};

const readStoredMode = (): AppMode | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
  return stored ? normalizeMode(stored) : null;
};

export const APP_MODE_DEFAULT: AppMode = normalizeMode(
  process.env.NEXT_PUBLIC_APP_MODE,
);

export const APP_MODE: AppMode = readStoredMode() ?? APP_MODE_DEFAULT;

export const isUserMode = APP_MODE === 'user';
export const isCompanyMode = APP_MODE === 'company';

export const getAppMode = (): AppMode => readStoredMode() ?? APP_MODE_DEFAULT;

export const setStoredAppMode = (mode: AppMode) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APP_MODE_STORAGE_KEY, normalizeMode(mode));
};
