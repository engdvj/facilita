import { ThemeDefinition } from '../base';

export const midnightTheme: ThemeDefinition = {
  id: 'midnight',
  name: 'Midnight Blue',
  description: 'Elegante tema escuro com tons profundos de azul e acentos vibrantes',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #0c1426 0%, #1e293b 50%, #334155 100%)',
    backgroundCard: 'rgba(30, 41, 59, 0.95)',
    backgroundElevated: 'rgba(51, 65, 85, 0.9)',
    backgroundSurface: '#1e293b',
    backgroundGlass: 'rgba(30, 41, 59, 0.7)',
    backgroundOverlay: 'rgba(15, 23, 42, 0.8)',
    
    // TEXTOS
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textAccent: '#60a5fa',
    textOnDark: '#f8fafc',
    textOnLight: '#0f172a',
    textMuted: '#64748b',
    textInverse: '#0f172a',
    
    // BORDAS
    borderPrimary: 'rgba(148, 163, 184, 0.2)',
    borderSecondary: 'rgba(203, 213, 225, 0.15)',
    borderAccent: '#60a5fa',
    borderFocus: '#3b82f6',
    borderError: '#ef4444',
    borderSuccess: '#10b981',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: '#3b82f6',
    buttonPrimaryHover: '#2563eb',
    buttonPrimaryActive: '#1d4ed8',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(51, 65, 85, 0.8)',
    buttonSecondaryHover: 'rgba(51, 65, 85, 1)',
    buttonSecondaryActive: 'rgba(71, 85, 105, 1)',
    buttonSecondaryText: '#f8fafc',
    buttonDanger: '#ef4444',
    buttonDangerHover: '#dc2626',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(15, 23, 42, 0.95)',
    sidebarText: '#cbd5e1',
    sidebarActiveBackground: 'rgba(59, 130, 246, 0.2)',
    sidebarActiveText: '#60a5fa',
    sidebarBorder: 'rgba(148, 163, 184, 0.2)',
    sidebarHover: 'rgba(51, 65, 85, 0.5)',
    sidebarIcon: '#94a3b8',
    sidebarActiveIcon: '#60a5fa',
    
    // HEADER
    headerBackground: 'rgba(30, 41, 59, 0.95)',
    headerText: '#f8fafc',
    headerBorder: 'rgba(148, 163, 184, 0.2)',
    headerIcon: '#94a3b8',
    headerHover: 'rgba(51, 65, 85, 0.8)',
    
    // LINKS
    linkBackground: 'rgba(30, 41, 59, 0.8)',
    linkText: '#f8fafc',
    linkHover: 'rgba(96, 165, 250, 0.1)',
    linkActive: 'rgba(96, 165, 250, 0.2)',
    linkBorder: 'rgba(148, 163, 184, 0.2)',
    linkBorderHover: '#60a5fa',
    linkIcon: '#60a5fa',
    
    // CARDS
    cardBackground: 'rgba(30, 41, 59, 0.9)',
    cardBorder: 'rgba(148, 163, 184, 0.2)',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    cardHover: 'rgba(51, 65, 85, 0.9)',
    cardImageBackground: 'rgba(51, 65, 85, 0.8)',
    cardAccent: '#60a5fa',
    cardTitle: '#f8fafc',
    cardSubtitle: '#cbd5e1',
    cardFooter: 'rgba(15, 23, 42, 0.8)',
    
    // DASHBOARD
    dashboardBackground: 'linear-gradient(135deg, #0c1426 0%, #1e293b 50%, #334155 100%)',
    dashboardStatBackground: 'rgba(30, 41, 59, 0.9)',
    dashboardStatBorder: 'rgba(148, 163, 184, 0.2)',
    dashboardStatIcon: '#60a5fa',
    dashboardStatIconBg: 'rgba(96, 165, 250, 0.2)',
    dashboardStatText: '#cbd5e1',
    dashboardStatNumber: '#f8fafc',
    dashboardListItem: 'rgba(51, 65, 85, 0.6)',
    dashboardListItemHover: 'rgba(96, 165, 250, 0.1)',
    dashboardListBorder: 'rgba(148, 163, 184, 0.2)',
    dashboardListText: '#f8fafc',
    dashboardListSecondary: '#94a3b8',
    dashboardEmptyState: 'rgba(51, 65, 85, 0.3)',
    dashboardEmptyIcon: '#64748b',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(30, 41, 59, 0.8)',
    inputBorder: 'rgba(148, 163, 184, 0.3)',
    inputFocus: '#60a5fa',
    inputText: '#f8fafc',
    inputPlaceholder: '#94a3b8',
    labelText: '#cbd5e1',
    selectBackground: 'rgba(30, 41, 59, 0.9)',
    selectBorder: 'rgba(148, 163, 184, 0.3)',
    selectArrow: '#94a3b8',
    checkboxBackground: 'rgba(30, 41, 59, 0.8)',
    checkboxBorder: 'rgba(148, 163, 184, 0.3)',
    checkboxChecked: '#60a5fa',
    
    // MODAIS
    modalBackground: 'rgba(30, 41, 59, 0.95)',
    modalOverlay: 'rgba(15, 23, 42, 0.8)',
    modalBorder: 'rgba(148, 163, 184, 0.3)',
    modalShadow: 'rgba(0, 0, 0, 0.6)',
    modalHeaderBackground: 'rgba(51, 65, 85, 0.8)',
    modalHeaderText: '#f8fafc',
    modalHeaderBorder: 'rgba(148, 163, 184, 0.2)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(30, 41, 59, 0.95)',
    navText: '#cbd5e1',
    navActive: 'rgba(96, 165, 250, 0.2)',
    navActiveText: '#60a5fa',
    navHover: 'rgba(51, 65, 85, 0.5)',
    navBorder: 'rgba(148, 163, 184, 0.2)',
    
    // ESTADOS
    success: '#10b981',
    successLight: '#6ee7b7',
    successDark: '#047857',
    successBg: 'rgba(16, 185, 129, 0.1)',
    successBorder: 'rgba(16, 185, 129, 0.3)',
    
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    
    info: '#60a5fa',
    infoLight: '#93c5fd',
    infoDark: '#3b82f6',
    infoBg: 'rgba(96, 165, 250, 0.1)',
    infoBorder: 'rgba(96, 165, 250, 0.3)',
    
    // SCROLLBARS
    scrollbarTrack: 'rgba(30, 41, 59, 0.3)',
    scrollbarThumb: 'rgba(148, 163, 184, 0.3)',
    scrollbarThumbHover: 'rgba(148, 163, 184, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(15, 23, 42, 0.95)',
    tooltipText: '#f8fafc',
    tooltipBorder: 'rgba(148, 163, 184, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(30, 41, 59, 0.8)',
    badgeBorder: 'rgba(148, 163, 184, 0.3)',
    badgeText: '#f8fafc',
    badgeSuccess: '#22c55e',
    badgeWarning: '#f59e0b',
    badgeError: '#ef4444',
    badgeInfo: '#60a5fa',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(30, 41, 59, 0.95)',
    dropdownBorder: 'rgba(148, 163, 184, 0.2)',
    dropdownHover: 'rgba(51, 65, 85, 0.8)',
    dropdownSelected: 'rgba(96, 165, 250, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(30, 41, 59, 0.9)',
    tableHeaderText: '#f8fafc',
    tableRow: 'rgba(30, 41, 59, 0.5)',
    tableRowAlt: 'rgba(51, 65, 85, 0.5)',
    tableRowHover: 'rgba(96, 165, 250, 0.1)',
    tableBorder: 'rgba(148, 163, 184, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(30, 41, 59, 0.6)',
    skeletonHighlight: 'rgba(51, 65, 85, 0.8)',
    loadingSpinner: '#60a5fa',

    // PROGRESS BARS
    progressBackground: 'rgba(30, 41, 59, 0.8)',
    progressFill: '#60a5fa',
    progressText: '#f8fafc',

    // SEARCH/FILTER
    searchBackground: 'rgba(30, 41, 59, 0.8)',
    searchBorder: 'rgba(148, 163, 184, 0.3)',
    searchFocus: '#60a5fa',
    searchText: '#f8fafc',
    searchPlaceholder: '#94a3b8',
    filterChip: 'rgba(96, 165, 250, 0.2)',
    filterChipActive: 'rgba(96, 165, 250, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(96, 165, 250, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(30, 41, 59, 0.95)',
    customizerSidebar: 'rgba(51, 65, 85, 0.9)',
    customizerSection: 'rgba(30, 41, 59, 0.8)',
    customizerAccent: '#60a5fa',
    customizerPreview: 'rgba(15, 23, 42, 0.8)'
  },
  preview: {
    primary: '#0c1426',
    secondary: '#3b82f6',
    accent: '#60a5fa'
  }
};