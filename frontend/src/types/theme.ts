export interface ThemeColors {
  // Primary backgrounds
  backgroundMain: string;
  backgroundCard: string;
  backgroundElevated: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textAccent: string;
  
  // UI Elements
  borderPrimary: string;
  borderSecondary: string;
  
  // Interactive elements
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  
  // Sidebar
  sidebarBackground: string;
  sidebarText: string;
  sidebarActiveBackground: string;
  
  // Header
  headerBackground: string;
  headerText: string;
  
  // Links
  linkBackground: string;
  linkText: string;
  linkHover: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export type ThemeId = 'midnight' | 'ocean' | 'forest' | 'sunset' | 'lavender';

// Beautiful default themes with excellent contrast and color harmony
export const DEFAULT_THEMES: Record<ThemeId, ThemeDefinition> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Elegante e profissional com tons profundos de azul',
    colors: {
      backgroundMain: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      backgroundCard: 'rgba(30, 41, 59, 0.8)',
      backgroundElevated: 'rgba(51, 65, 85, 0.9)',
      
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      textAccent: '#60a5fa',
      
      borderPrimary: 'rgba(255, 255, 255, 0.1)',
      borderSecondary: 'rgba(255, 255, 255, 0.05)',
      
      buttonPrimary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      buttonPrimaryHover: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      buttonSecondary: 'rgba(59, 130, 246, 0.1)',
      buttonSecondaryHover: 'rgba(59, 130, 246, 0.2)',
      
      sidebarBackground: 'rgba(15, 23, 42, 0.95)',
      sidebarText: 'rgba(255, 255, 255, 0.8)',
      sidebarActiveBackground: 'rgba(59, 130, 246, 0.2)',
      
      headerBackground: 'rgba(15, 23, 42, 0.9)',
      headerText: 'rgba(255, 255, 255, 0.95)',
      
      linkBackground: 'rgba(59, 130, 246, 0.1)',
      linkText: 'rgba(255, 255, 255, 0.9)',
      linkHover: 'rgba(59, 130, 246, 0.2)',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    preview: {
      primary: '#0f172a',
      secondary: '#3b82f6',
      accent: '#60a5fa'
    }
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Inspirado nas profundezas do oceano com tons de teal e turquesa',
    colors: {
      backgroundMain: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      backgroundCard: 'rgba(32, 58, 67, 0.8)',
      backgroundElevated: 'rgba(44, 83, 100, 0.9)',
      
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      textAccent: '#20d7d2',
      
      borderPrimary: 'rgba(32, 215, 210, 0.2)',
      borderSecondary: 'rgba(32, 215, 210, 0.1)',
      
      buttonPrimary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      buttonPrimaryHover: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      buttonSecondary: 'rgba(6, 182, 212, 0.1)',
      buttonSecondaryHover: 'rgba(6, 182, 212, 0.2)',
      
      sidebarBackground: 'rgba(15, 32, 39, 0.95)',
      sidebarText: 'rgba(255, 255, 255, 0.8)',
      sidebarActiveBackground: 'rgba(6, 182, 212, 0.2)',
      
      headerBackground: 'rgba(15, 32, 39, 0.9)',
      headerText: 'rgba(255, 255, 255, 0.95)',
      
      linkBackground: 'rgba(6, 182, 212, 0.1)',
      linkText: 'rgba(255, 255, 255, 0.9)',
      linkHover: 'rgba(6, 182, 212, 0.2)',
      
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0891b2'
    },
    preview: {
      primary: '#0f2027',
      secondary: '#06b6d4',
      accent: '#20d7d2'
    }
  },
  
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Tons naturais de verde que trazem tranquilidade e foco',
    colors: {
      backgroundMain: 'linear-gradient(135deg, #0f1419 0%, #1a2e1a 50%, #2d4a2d 100%)',
      backgroundCard: 'rgba(26, 46, 26, 0.8)',
      backgroundElevated: 'rgba(45, 74, 45, 0.9)',
      
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      textAccent: '#4ade80',
      
      borderPrimary: 'rgba(74, 222, 128, 0.2)',
      borderSecondary: 'rgba(74, 222, 128, 0.1)',
      
      buttonPrimary: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      buttonPrimaryHover: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      buttonSecondary: 'rgba(22, 163, 74, 0.1)',
      buttonSecondaryHover: 'rgba(22, 163, 74, 0.2)',
      
      sidebarBackground: 'rgba(15, 20, 25, 0.95)',
      sidebarText: 'rgba(255, 255, 255, 0.8)',
      sidebarActiveBackground: 'rgba(22, 163, 74, 0.2)',
      
      headerBackground: 'rgba(15, 20, 25, 0.9)',
      headerText: 'rgba(255, 255, 255, 0.95)',
      
      linkBackground: 'rgba(22, 163, 74, 0.1)',
      linkText: 'rgba(255, 255, 255, 0.9)',
      linkHover: 'rgba(22, 163, 74, 0.2)',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    preview: {
      primary: '#0f1419',
      secondary: '#16a34a',
      accent: '#4ade80'
    }
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Tons calorosos de laranja e rosa inspirados no pôr do sol',
    colors: {
      backgroundMain: 'linear-gradient(135deg, #1a0b0f 0%, #2d1b1b 50%, #3d2424 100%)',
      backgroundCard: 'rgba(45, 27, 27, 0.8)',
      backgroundElevated: 'rgba(61, 36, 36, 0.9)',
      
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      textAccent: '#fb7185',
      
      borderPrimary: 'rgba(251, 113, 133, 0.2)',
      borderSecondary: 'rgba(251, 113, 133, 0.1)',
      
      buttonPrimary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      buttonPrimaryHover: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      buttonSecondary: 'rgba(249, 115, 22, 0.1)',
      buttonSecondaryHover: 'rgba(249, 115, 22, 0.2)',
      
      sidebarBackground: 'rgba(26, 11, 15, 0.95)',
      sidebarText: 'rgba(255, 255, 255, 0.8)',
      sidebarActiveBackground: 'rgba(249, 115, 22, 0.2)',
      
      headerBackground: 'rgba(26, 11, 15, 0.9)',
      headerText: 'rgba(255, 255, 255, 0.95)',
      
      linkBackground: 'rgba(249, 115, 22, 0.1)',
      linkText: 'rgba(255, 255, 255, 0.9)',
      linkHover: 'rgba(249, 115, 22, 0.2)',
      
      success: '#059669',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    preview: {
      primary: '#1a0b0f',
      secondary: '#f97316',
      accent: '#fb7185'
    }
  },
  
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    description: 'Tons suaves de roxo e lilás que inspiram criatividade',
    colors: {
      backgroundMain: 'linear-gradient(135deg, #1a0f1a 0%, #2d1b2d 50%, #3d243d 100%)',
      backgroundCard: 'rgba(45, 27, 45, 0.8)',
      backgroundElevated: 'rgba(61, 36, 61, 0.9)',
      
      textPrimary: 'rgba(255, 255, 255, 0.95)',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textTertiary: 'rgba(255, 255, 255, 0.6)',
      textAccent: '#c084fc',
      
      borderPrimary: 'rgba(192, 132, 252, 0.2)',
      borderSecondary: 'rgba(192, 132, 252, 0.1)',
      
      buttonPrimary: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      buttonPrimaryHover: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      buttonSecondary: 'rgba(147, 51, 234, 0.1)',
      buttonSecondaryHover: 'rgba(147, 51, 234, 0.2)',
      
      sidebarBackground: 'rgba(26, 15, 26, 0.95)',
      sidebarText: 'rgba(255, 255, 255, 0.8)',
      sidebarActiveBackground: 'rgba(147, 51, 234, 0.2)',
      
      headerBackground: 'rgba(26, 15, 26, 0.9)',
      headerText: 'rgba(255, 255, 255, 0.95)',
      
      linkBackground: 'rgba(147, 51, 234, 0.1)',
      linkText: 'rgba(255, 255, 255, 0.9)',
      linkHover: 'rgba(147, 51, 234, 0.2)',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6'
    },
    preview: {
      primary: '#1a0f1a',
      secondary: '#9333ea',
      accent: '#c084fc'
    }
  }
};