import { ThemeDefinition } from '../base';

export const cosmicTheme: ThemeDefinition = {
  id: 'cosmic',
  name: 'Cosmic Nebula',
  description: 'Tons cósmicos profundos com acentos de roxo e azul galáctico',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    backgroundCard: 'rgba(49, 46, 129, 0.95)',
    backgroundElevated: 'rgba(67, 56, 202, 0.9)',
    backgroundSurface: '#312e81',
    backgroundGlass: 'rgba(49, 46, 129, 0.7)',
    backgroundOverlay: 'rgba(30, 27, 75, 0.8)',
    
    // TEXTOS
    textPrimary: '#f8fafc',
    textSecondary: '#e2e8f0',
    textTertiary: '#cbd5e1',
    textAccent: '#a5b4fc',
    textOnDark: '#f8fafc',
    textOnLight: '#1e1b4b',
    textMuted: '#6366f1',
    textInverse: '#1e1b4b',
    
    // BORDAS
    borderPrimary: 'rgba(203, 213, 225, 0.3)',
    borderSecondary: 'rgba(203, 213, 225, 0.15)',
    borderAccent: '#a5b4fc',
    borderFocus: '#4338ca',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #5b21b6 0%, #4338ca 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(67, 56, 202, 0.15)',
    buttonSecondaryHover: 'rgba(67, 56, 202, 0.25)',
    buttonSecondaryActive: 'rgba(67, 56, 202, 0.35)',
    buttonSecondaryText: '#a5b4fc',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(30, 27, 75, 0.98)',
    sidebarText: '#e2e8f0',
    sidebarActiveBackground: 'rgba(67, 56, 202, 0.2)',
    sidebarActiveText: '#f8fafc',
    sidebarBorder: 'rgba(203, 213, 225, 0.1)',
    sidebarHover: 'rgba(203, 213, 225, 0.1)',
    sidebarIcon: '#cbd5e1',
    sidebarActiveIcon: '#a5b4fc',
    
    // HEADER
    headerBackground: 'rgba(30, 27, 75, 0.95)',
    headerText: '#f8fafc',
    headerBorder: 'rgba(203, 213, 225, 0.1)',
    headerIcon: '#cbd5e1',
    headerHover: 'rgba(203, 213, 225, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(67, 56, 202, 0.1)',
    linkText: '#f8fafc',
    linkHover: 'rgba(67, 56, 202, 0.2)',
    linkActive: 'rgba(67, 56, 202, 0.3)',
    linkBorder: 'rgba(67, 56, 202, 0.3)',
    linkBorderHover: '#a5b4fc',
    linkIcon: '#a5b4fc',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    cardBorder: 'rgba(67, 56, 202, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    cardHover: 'rgba(67, 56, 202, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    cardAccent: '#a5b4fc',
    cardTitle: '#f8fafc',
    cardSubtitle: '#e2e8f0',
    cardFooter: 'rgba(203, 213, 225, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(30, 27, 75, 0.3)',
    dashboardStatBackground: 'rgba(49, 46, 129, 0.9)',
    dashboardStatBorder: 'rgba(67, 56, 202, 0.4)',
    dashboardStatIcon: '#a5b4fc',
    dashboardStatIconBg: 'rgba(67, 56, 202, 0.2)',
    dashboardStatText: '#f8fafc',
    dashboardStatNumber: '#a5b4fc',
    dashboardListItem: 'rgba(49, 46, 129, 0.7)',
    dashboardListItemHover: 'rgba(67, 56, 202, 0.15)',
    dashboardListBorder: 'rgba(203, 213, 225, 0.2)',
    dashboardListText: '#f8fafc',
    dashboardListSecondary: '#cbd5e1',
    dashboardEmptyState: 'rgba(203, 213, 225, 0.1)',
    dashboardEmptyIcon: '#6366f1',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(49, 46, 129, 0.6)',
    inputBorder: 'rgba(203, 213, 225, 0.4)',
    inputFocus: '#a5b4fc',
    inputText: '#f8fafc',
    inputPlaceholder: '#cbd5e1',
    labelText: '#e2e8f0',
    selectBackground: 'rgba(49, 46, 129, 0.6)',
    selectBorder: 'rgba(203, 213, 225, 0.4)',
    selectArrow: '#cbd5e1',
    checkboxBackground: 'rgba(49, 46, 129, 0.6)',
    checkboxBorder: 'rgba(203, 213, 225, 0.4)',
    checkboxChecked: '#a5b4fc',
    
    // MODAIS
    modalBackground: 'rgba(49, 46, 129, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(203, 213, 225, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.5)',
    modalHeaderBackground: 'rgba(67, 56, 202, 0.8)',
    modalHeaderText: '#f8fafc',
    modalHeaderBorder: 'rgba(203, 213, 225, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(30, 27, 75, 0.9)',
    navText: '#e2e8f0',
    navActive: 'rgba(67, 56, 202, 0.2)',
    navActiveText: '#f8fafc',
    navHover: 'rgba(203, 213, 225, 0.1)',
    navBorder: 'rgba(203, 213, 225, 0.1)',
    
    // ESTADOS
    success: '#22c55e',
    successLight: '#86efac',
    successDark: '#16a34a',
    successBg: 'rgba(34, 197, 94, 0.15)',
    successBorder: 'rgba(34, 197, 94, 0.3)',
    
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    
    error: '#f87171',
    errorLight: '#fca5a5',
    errorDark: '#ef4444',
    errorBg: 'rgba(248, 113, 113, 0.15)',
    errorBorder: 'rgba(248, 113, 113, 0.3)',
    
    info: '#06b6d4',
    infoLight: '#67e8f9',
    infoDark: '#0891b2',
    infoBg: 'rgba(6, 182, 212, 0.15)',
    infoBorder: 'rgba(6, 182, 212, 0.3)',
    
    // SCROLLBARS
    scrollbarTrack: 'rgba(49, 46, 129, 0.3)',
    scrollbarThumb: 'rgba(203, 213, 225, 0.3)',
    scrollbarThumbHover: 'rgba(203, 213, 225, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(30, 27, 75, 0.95)',
    tooltipText: '#f8fafc',
    tooltipBorder: 'rgba(203, 213, 225, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.5)',

    // BADGES/TAGS
    badgeBackground: 'rgba(49, 46, 129, 0.8)',
    badgeBorder: 'rgba(203, 213, 225, 0.3)',
    badgeText: '#f8fafc',
    badgeSuccess: '#059669',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(49, 46, 129, 0.95)',
    dropdownBorder: 'rgba(203, 213, 225, 0.2)',
    dropdownHover: 'rgba(67, 56, 202, 0.8)',
    dropdownSelected: 'rgba(129, 140, 248, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(49, 46, 129, 0.9)',
    tableHeaderText: '#f8fafc',
    tableRow: 'rgba(49, 46, 129, 0.5)',
    tableRowAlt: 'rgba(67, 56, 202, 0.5)',
    tableRowHover: 'rgba(129, 140, 248, 0.1)',
    tableBorder: 'rgba(203, 213, 225, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(49, 46, 129, 0.6)',
    skeletonHighlight: 'rgba(67, 56, 202, 0.8)',
    loadingSpinner: '#818cf8',

    // PROGRESS BARS
    progressBackground: 'rgba(49, 46, 129, 0.8)',
    progressFill: '#818cf8',
    progressText: '#f8fafc',

    // SEARCH/FILTER
    searchBackground: 'rgba(49, 46, 129, 0.8)',
    searchBorder: 'rgba(203, 213, 225, 0.3)',
    searchFocus: '#818cf8',
    searchText: '#f8fafc',
    searchPlaceholder: '#cbd5e1',
    filterChip: 'rgba(129, 140, 248, 0.2)',
    filterChipActive: 'rgba(129, 140, 248, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(129, 140, 248, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(49, 46, 129, 0.95)',
    customizerSidebar: 'rgba(67, 56, 202, 0.9)',
    customizerSection: 'rgba(49, 46, 129, 0.8)',
    customizerAccent: '#818cf8',
    customizerPreview: 'rgba(30, 27, 75, 0.8)'
  },
  preview: {
    primary: '#1e1b4b',
    secondary: '#4338ca',
    accent: '#a5b4fc'
  }
};