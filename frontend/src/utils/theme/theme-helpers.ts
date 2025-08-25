import { ThemeDefinition, ThemeId } from '../../types/theme/base';

/**
 * Validates if a theme ID is valid
 */
export const isValidThemeId = (id: string): id is ThemeId => {
  const validIds: ThemeId[] = [
    'midnight', 'ocean', 'forest', 'sunset', 'lavender', 
    'aurora', 'sakura', 'cosmic', 'emerald', 'ruby'
  ];
  return validIds.includes(id as ThemeId);
};

/**
 * Gets theme from localStorage with fallback
 */
export const getStoredTheme = (fallback: ThemeId = 'midnight'): ThemeId => {
  try {
    const stored = localStorage.getItem('selectedTheme') as ThemeId;
    return stored && isValidThemeId(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Stores theme in localStorage
 */
export const storeTheme = (themeId: ThemeId): void => {
  try {
    localStorage.setItem('selectedTheme', themeId);
  } catch (error) {
    console.warn('Failed to store theme preference:', error);
  }
};

/**
 * Creates a custom theme with user overrides
 */
export const createCustomTheme = (
  baseTheme: ThemeDefinition,
  overrides: Partial<ThemeDefinition['colors']>,
  metadata?: Partial<Pick<ThemeDefinition, 'name' | 'description'>>
): ThemeDefinition => {
  return {
    ...baseTheme,
    ...metadata,
    id: `custom-${baseTheme.id}`,
    colors: {
      ...baseTheme.colors,
      ...overrides
    }
  };
};

/**
 * Extracts preview colors from theme
 */
export const getThemePreview = (theme: ThemeDefinition) => {
  return {
    primary: theme.colors.backgroundMain,
    secondary: theme.colors.textAccent,
    accent: theme.colors.buttonPrimary
  };
};

/**
 * Checks if current system prefers dark mode
 */
export const prefersDarkMode = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Gets recommended theme based on system preference
 */
export const getRecommendedTheme = (): ThemeId => {
  return prefersDarkMode() ? 'midnight' : 'aurora';
};

/**
 * Generates CSS string from theme colors
 */
export const generateThemeCSS = (theme: ThemeDefinition): string => {
  const cssRules = Object.entries(theme.colors)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  --${cssKey}: ${value};`;
    })
    .join('\n');
    
  return `:root {\n${cssRules}\n}`;
};