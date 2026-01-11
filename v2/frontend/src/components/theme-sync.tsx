'use client';

import { useEffect } from 'react';

const themeKey = 'theme';

const getThemePreference = () => {
  const stored = localStorage.getItem(themeKey);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export default function ThemeSync() {
  useEffect(() => {
    const applyTheme = (nextTheme: 'light' | 'dark') => {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    applyTheme(getThemePreference());

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== themeKey) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        applyTheme(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return null;
}
