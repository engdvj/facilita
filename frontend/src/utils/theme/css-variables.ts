import { ThemeDefinition } from '../../types/theme/base';

/**
 * Applies theme colors to CSS custom properties
 */
export const applyThemeToCSS = (theme: ThemeDefinition) => {
  const root = document.documentElement;
  const colors = theme.colors;

  // Apply each color as a CSS custom property
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssKey}`, value);
  });
};

/**
 * Removes all theme-related CSS custom properties
 */
export const removeThemeFromCSS = () => {
  const root = document.documentElement;
  const style = root.style;
  
  // Remove all CSS custom properties that start with our theme prefixes
  const properties = Array.from(style);
  properties.forEach(property => {
    if (property.startsWith('--background-') ||
        property.startsWith('--text-') ||
        property.startsWith('--border-') ||
        property.startsWith('--button-') ||
        property.startsWith('--sidebar-') ||
        property.startsWith('--header-') ||
        property.startsWith('--link-') ||
        property.startsWith('--card-') ||
        property.startsWith('--dashboard-') ||
        property.startsWith('--input-') ||
        property.startsWith('--modal-') ||
        property.startsWith('--nav-') ||
        property.startsWith('--success') ||
        property.startsWith('--warning') ||
        property.startsWith('--error') ||
        property.startsWith('--info') ||
        property.startsWith('--scrollbar-') ||
        property.startsWith('--tooltip-') ||
        property.startsWith('--badge-') ||
        property.startsWith('--dropdown-') ||
        property.startsWith('--table-') ||
        property.startsWith('--skeleton-') ||
        property.startsWith('--loading-') ||
        property.startsWith('--progress-') ||
        property.startsWith('--search-') ||
        property.startsWith('--filter-') ||
        property.startsWith('--hover-') ||
        property.startsWith('--customizer-')) {
      root.style.removeProperty(property);
    }
  });
};

/**
 * Gets the current theme colors from CSS custom properties
 */
export const getThemeFromCSS = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const themeColors: Record<string, string> = {};
  
  // Get all CSS custom properties and filter theme-related ones
  Array.from(computedStyle).forEach(property => {
    if (property.startsWith('--')) {
      const value = computedStyle.getPropertyValue(property).trim();
      if (value) {
        // Convert kebab-case back to camelCase
        const camelKey = property
          .replace(/^--/, '')
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        themeColors[camelKey] = value;
      }
    }
  });
  
  return themeColors;
};