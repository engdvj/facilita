import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DEFAULT_THEMES, ThemeId, ThemeDefinition } from '../types/theme';
import { themeService, CustomTheme } from '../services/themeService';

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
    // Check if there's a custom theme selected first
    const selectedCustomTheme = localStorage.getItem('selectedCustomTheme');
    if (selectedCustomTheme) {
      const customTheme = themeService.getThemeById(selectedCustomTheme);
      if (customTheme) {
        return 'midnight'; // Fallback, will be overridden by custom theme
      }
    }
    
    const saved = localStorage.getItem('selectedTheme') as ThemeId;
    return saved && Object.keys(DEFAULT_THEMES).includes(saved) ? saved : 'midnight';
  });

  const currentTheme = DEFAULT_THEMES[currentThemeId];
  const availableThemes = Object.values(DEFAULT_THEMES);

  const applyTheme = (theme: ThemeDefinition | CustomTheme) => {
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
    localStorage.removeItem('selectedCustomTheme'); // Remove custom theme selection
    applyTheme(DEFAULT_THEMES[themeId]);
  };

  // Apply theme on mount and change
  useEffect(() => {
    // Check for custom theme first
    const selectedCustomTheme = localStorage.getItem('selectedCustomTheme');
    if (selectedCustomTheme) {
      const customTheme = themeService.getThemeById(selectedCustomTheme);
      if (customTheme) {
        applyTheme(customTheme);
        return;
      } else {
        // Custom theme no longer exists, remove from localStorage
        localStorage.removeItem('selectedCustomTheme');
      }
    }
    
    // Apply default theme
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