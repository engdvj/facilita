export type AppMode = 'company' | 'user';

const normalizeMode = (value?: string): AppMode => {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'user' ? 'user' : 'company';
};

export const APP_MODE: AppMode = normalizeMode(process.env.APP_MODE);

export const isUserMode = () => APP_MODE === 'user';
export const isCompanyMode = () => APP_MODE === 'company';
