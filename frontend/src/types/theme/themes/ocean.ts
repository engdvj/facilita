import { ThemeDefinition } from '../base';

export const oceanTheme: ThemeDefinition = {
  id: 'ocean',
  name: 'Ocean Deep',
  description: 'Inspirado nas profundezas do oceano com tons vibrantes de teal e aqua',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #0a1a1f 0%, #164e63 50%, #0f766e 100%)',
    backgroundCard: 'rgba(20, 83, 97, 0.95)',
    backgroundElevated: 'rgba(15, 118, 110, 0.9)',
    backgroundSurface: '#164e63',
    backgroundGlass: 'rgba(20, 83, 97, 0.7)',
    backgroundOverlay: 'rgba(10, 26, 31, 0.8)',
    
    // TEXTOS
    textPrimary: '#f0fdfa',
    textSecondary: '#ccfbf1',
    textTertiary: '#5eead4',
    textAccent: '#2dd4bf',
    textOnDark: '#f0fdfa',
    textOnLight: '#0a1a1f',
    textMuted: '#14b8a6',
    textInverse: '#0a1a1f',
    
    // BORDAS
    borderPrimary: 'rgba(94, 234, 212, 0.3)',
    borderSecondary: 'rgba(94, 234, 212, 0.15)',
    borderAccent: '#2dd4bf',
    borderFocus: '#0d9488',
    borderError: '#f87171',
    borderSuccess: '#10b981',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(13, 148, 136, 0.15)',
    buttonSecondaryHover: 'rgba(13, 148, 136, 0.25)',
    buttonSecondaryActive: 'rgba(13, 148, 136, 0.35)',
    buttonSecondaryText: '#2dd4bf',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(10, 26, 31, 0.98)',
    sidebarText: '#ccfbf1',
    sidebarActiveBackground: 'rgba(13, 148, 136, 0.2)',
    sidebarActiveText: '#f0fdfa',
    sidebarBorder: 'rgba(94, 234, 212, 0.1)',
    sidebarHover: 'rgba(94, 234, 212, 0.1)',
    sidebarIcon: '#5eead4',
    sidebarActiveIcon: '#2dd4bf',
    
    // HEADER
    headerBackground: 'rgba(10, 26, 31, 0.95)',
    headerText: '#f0fdfa',
    headerBorder: 'rgba(94, 234, 212, 0.1)',
    headerIcon: '#5eead4',
    headerHover: 'rgba(94, 234, 212, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(13, 148, 136, 0.1)',
    linkText: '#f0fdfa',
    linkHover: 'rgba(13, 148, 136, 0.2)',
    linkActive: 'rgba(13, 148, 136, 0.3)',
    linkBorder: 'rgba(13, 148, 136, 0.3)',
    linkBorderHover: '#2dd4bf',
    linkIcon: '#2dd4bf',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #164e63 0%, #0a1a1f 100%)',
    cardBorder: 'rgba(13, 148, 136, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(13, 148, 136, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
    cardAccent: '#2dd4bf',
    cardTitle: '#f0fdfa',
    cardSubtitle: '#ccfbf1',
    cardFooter: 'rgba(94, 234, 212, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(10, 26, 31, 0.3)',
    dashboardStatBackground: 'rgba(20, 83, 97, 0.9)',
    dashboardStatBorder: 'rgba(13, 148, 136, 0.4)',
    dashboardStatIcon: '#2dd4bf',
    dashboardStatIconBg: 'rgba(13, 148, 136, 0.2)',
    dashboardStatText: '#f0fdfa',
    dashboardStatNumber: '#2dd4bf',
    dashboardListItem: 'rgba(20, 83, 97, 0.7)',
    dashboardListItemHover: 'rgba(13, 148, 136, 0.15)',
    dashboardListBorder: 'rgba(94, 234, 212, 0.2)',
    dashboardListText: '#f0fdfa',
    dashboardListSecondary: '#5eead4',
    dashboardEmptyState: 'rgba(94, 234, 212, 0.1)',
    dashboardEmptyIcon: '#14b8a6',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(20, 83, 97, 0.6)',
    inputBorder: 'rgba(94, 234, 212, 0.4)',
    inputFocus: '#2dd4bf',
    inputText: '#f0fdfa',
    inputPlaceholder: '#5eead4',
    labelText: '#ccfbf1',
    selectBackground: 'rgba(20, 83, 97, 0.6)',
    selectBorder: 'rgba(94, 234, 212, 0.4)',
    selectArrow: '#5eead4',
    checkboxBackground: 'rgba(20, 83, 97, 0.6)',
    checkboxBorder: 'rgba(94, 234, 212, 0.4)',
    checkboxChecked: '#2dd4bf',
    
    // MODAIS
    modalBackground: 'rgba(20, 83, 97, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(94, 234, 212, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(15, 118, 110, 0.8)',
    modalHeaderText: '#f0fdfa',
    modalHeaderBorder: 'rgba(94, 234, 212, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(10, 26, 31, 0.9)',
    navText: '#ccfbf1',
    navActive: 'rgba(13, 148, 136, 0.2)',
    navActiveText: '#f0fdfa',
    navHover: 'rgba(94, 234, 212, 0.1)',
    navBorder: 'rgba(94, 234, 212, 0.1)',
    
    // ESTADOS
    success: '#10b981',
    successLight: '#6ee7b7',
    successDark: '#059669',
    successBg: 'rgba(16, 185, 129, 0.15)',
    successBorder: 'rgba(16, 185, 129, 0.3)',
    
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
    
    info: '#0891b2',
    infoLight: '#22d3ee',
    infoDark: '#0e7490',
    infoBg: 'rgba(8, 145, 178, 0.15)',
    infoBorder: 'rgba(8, 145, 178, 0.3)',
    
    // SCROLLBARS
    scrollbarTrack: 'rgba(20, 83, 97, 0.3)',
    scrollbarThumb: 'rgba(94, 234, 212, 0.3)',
    scrollbarThumbHover: 'rgba(94, 234, 212, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(10, 26, 31, 0.95)',
    tooltipText: '#f0fdfa',
    tooltipBorder: 'rgba(94, 234, 212, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(20, 83, 97, 0.8)',
    badgeBorder: 'rgba(94, 234, 212, 0.3)',
    badgeText: '#f0fdfa',
    badgeSuccess: '#10b981',
    badgeWarning: '#f59e0b',
    badgeError: '#f87171',
    badgeInfo: '#0891b2',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(20, 83, 97, 0.95)',
    dropdownBorder: 'rgba(94, 234, 212, 0.2)',
    dropdownHover: 'rgba(13, 148, 136, 0.8)',
    dropdownSelected: 'rgba(45, 212, 191, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(20, 83, 97, 0.9)',
    tableHeaderText: '#f0fdfa',
    tableRow: 'rgba(20, 83, 97, 0.5)',
    tableRowAlt: 'rgba(13, 148, 136, 0.5)',
    tableRowHover: 'rgba(45, 212, 191, 0.1)',
    tableBorder: 'rgba(94, 234, 212, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(20, 83, 97, 0.6)',
    skeletonHighlight: 'rgba(13, 148, 136, 0.8)',
    loadingSpinner: '#2dd4bf',

    // PROGRESS BARS
    progressBackground: 'rgba(20, 83, 97, 0.8)',
    progressFill: '#2dd4bf',
    progressText: '#f0fdfa',

    // SEARCH/FILTER
    searchBackground: 'rgba(20, 83, 97, 0.8)',
    searchBorder: 'rgba(94, 234, 212, 0.3)',
    searchFocus: '#2dd4bf',
    searchText: '#f0fdfa',
    searchPlaceholder: '#5eead4',
    filterChip: 'rgba(45, 212, 191, 0.2)',
    filterChipActive: 'rgba(45, 212, 191, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(45, 212, 191, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(20, 83, 97, 0.95)',
    customizerSidebar: 'rgba(13, 148, 136, 0.9)',
    customizerSection: 'rgba(20, 83, 97, 0.8)',
    customizerAccent: '#2dd4bf',
    customizerPreview: 'rgba(10, 26, 31, 0.8)'
  },
  preview: {
    primary: '#0a1a1f',
    secondary: '#0d9488',
    accent: '#2dd4bf'
  }
};