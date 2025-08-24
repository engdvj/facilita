import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DEFAULT_THEMES, ThemeId, ThemeDefinition } from '../types/theme';

interface ThemeContextType {
  currentThemeId: ThemeId;
  currentTheme: ThemeDefinition;
  availableThemes: ThemeDefinition[];
  setTheme: (themeId: ThemeId) => void;
  applyTheme: (theme: ThemeDefinition) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('selectedTheme') as ThemeId;
    return saved && Object.keys(DEFAULT_THEMES).includes(saved) ? saved : 'midnight';
  });

  const currentTheme = DEFAULT_THEMES[currentThemeId];
  const availableThemes = Object.values(DEFAULT_THEMES);

  const applyTheme = (theme: ThemeDefinition) => {
    const root = document.documentElement;
    
    // Apply all theme colors as CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply theme-specific classes or attributes if needed
    root.setAttribute('data-theme', theme.id);
  };

  const setTheme = (themeId: ThemeId) => {
    setCurrentThemeId(themeId);
    localStorage.setItem('selectedTheme', themeId);
    applyTheme(DEFAULT_THEMES[themeId]);
  };

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentThemeId,
    currentTheme,
    availableThemes,
    setTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}