import { ThemeDefinition } from '../base';

export const lavenderTheme: ThemeDefinition = {
  id: 'lavender',
  name: 'Lavender Dream',
  description: 'Tons encantadores de roxo e lilás que despertam criatividade',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7c3aed 100%)',
    backgroundCard: 'rgba(88, 28, 135, 0.95)',
    backgroundElevated: 'rgba(124, 58, 237, 0.9)',
    backgroundSurface: '#581c87',
    backgroundGlass: 'rgba(88, 28, 135, 0.7)',
    backgroundOverlay: 'rgba(46, 16, 101, 0.8)',
    
    // TEXTOS
    textPrimary: '#faf5ff',
    textSecondary: '#e9d5ff',
    textTertiary: '#d8b4fe',
    textAccent: '#c084fc',
    textOnDark: '#faf5ff',
    textOnLight: '#2e1065',
    textMuted: '#a855f7',
    textInverse: '#2e1065',
    
    // BORDAS
    borderPrimary: 'rgba(216, 180, 254, 0.3)',
    borderSecondary: 'rgba(216, 180, 254, 0.15)',
    borderAccent: '#c084fc',
    borderFocus: '#7c3aed',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #9333ea 0%, #7c2d12 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(124, 58, 237, 0.15)',
    buttonSecondaryHover: 'rgba(124, 58, 237, 0.25)',
    buttonSecondaryActive: 'rgba(124, 58, 237, 0.35)',
    buttonSecondaryText: '#c084fc',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(46, 16, 101, 0.98)',
    sidebarText: '#e9d5ff',
    sidebarActiveBackground: 'rgba(124, 58, 237, 0.2)',
    sidebarActiveText: '#faf5ff',
    sidebarBorder: 'rgba(216, 180, 254, 0.1)',
    sidebarHover: 'rgba(216, 180, 254, 0.1)',
    sidebarIcon: '#d8b4fe',
    sidebarActiveIcon: '#c084fc',
    
    // HEADER
    headerBackground: 'rgba(46, 16, 101, 0.95)',
    headerText: '#faf5ff',
    headerBorder: 'rgba(216, 180, 254, 0.1)',
    headerIcon: '#d8b4fe',
    headerHover: 'rgba(216, 180, 254, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(124, 58, 237, 0.1)',
    linkText: '#faf5ff',
    linkHover: 'rgba(124, 58, 237, 0.2)',
    linkActive: 'rgba(124, 58, 237, 0.3)',
    linkBorder: 'rgba(124, 58, 237, 0.3)',
    linkBorderHover: '#c084fc',
    linkIcon: '#c084fc',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #581c87 0%, #2e1065 100%)',
    cardBorder: 'rgba(124, 58, 237, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(124, 58, 237, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    cardAccent: '#c084fc',
    cardTitle: '#faf5ff',
    cardSubtitle: '#e9d5ff',
    cardFooter: 'rgba(216, 180, 254, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(46, 16, 101, 0.3)',
    dashboardStatBackground: 'rgba(88, 28, 135, 0.9)',
    dashboardStatBorder: 'rgba(124, 58, 237, 0.4)',
    dashboardStatIcon: '#c084fc',
    dashboardStatIconBg: 'rgba(124, 58, 237, 0.2)',
    dashboardStatText: '#faf5ff',
    dashboardStatNumber: '#c084fc',
    dashboardListItem: 'rgba(88, 28, 135, 0.7)',
    dashboardListItemHover: 'rgba(124, 58, 237, 0.15)',
    dashboardListBorder: 'rgba(216, 180, 254, 0.2)',
    dashboardListText: '#faf5ff',
    dashboardListSecondary: '#d8b4fe',
    dashboardEmptyState: 'rgba(216, 180, 254, 0.1)',
    dashboardEmptyIcon: '#a855f7',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(88, 28, 135, 0.6)',
    inputBorder: 'rgba(216, 180, 254, 0.4)',
    inputFocus: '#c084fc',
    inputText: '#faf5ff',
    inputPlaceholder: '#d8b4fe',
    labelText: '#e9d5ff',
    selectBackground: 'rgba(88, 28, 135, 0.6)',
    selectBorder: 'rgba(216, 180, 254, 0.4)',
    selectArrow: '#d8b4fe',
    checkboxBackground: 'rgba(88, 28, 135, 0.6)',
    checkboxBorder: 'rgba(216, 180, 254, 0.4)',
    checkboxChecked: '#c084fc',
    
    // MODAIS
    modalBackground: 'rgba(88, 28, 135, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(216, 180, 254, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(124, 58, 237, 0.8)',
    modalHeaderText: '#faf5ff',
    modalHeaderBorder: 'rgba(216, 180, 254, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(46, 16, 101, 0.9)',
    navText: '#e9d5ff',
    navActive: 'rgba(124, 58, 237, 0.2)',
    navActiveText: '#faf5ff',
    navHover: 'rgba(216, 180, 254, 0.1)',
    navBorder: 'rgba(216, 180, 254, 0.1)',
    
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
    scrollbarTrack: 'rgba(88, 28, 135, 0.3)',
    scrollbarThumb: 'rgba(216, 180, 254, 0.3)',
    scrollbarThumbHover: 'rgba(216, 180, 254, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(46, 16, 101, 0.95)',
    tooltipText: '#faf5ff',
    tooltipBorder: 'rgba(216, 180, 254, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(88, 28, 135, 0.8)',
    badgeBorder: 'rgba(216, 180, 254, 0.3)',
    badgeText: '#faf5ff',
    badgeSuccess: '#059669',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(88, 28, 135, 0.95)',
    dropdownBorder: 'rgba(216, 180, 254, 0.2)',
    dropdownHover: 'rgba(126, 34, 206, 0.8)',
    dropdownSelected: 'rgba(168, 85, 247, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(88, 28, 135, 0.9)',
    tableHeaderText: '#faf5ff',
    tableRow: 'rgba(88, 28, 135, 0.5)',
    tableRowAlt: 'rgba(126, 34, 206, 0.5)',
    tableRowHover: 'rgba(168, 85, 247, 0.1)',
    tableBorder: 'rgba(216, 180, 254, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(88, 28, 135, 0.6)',
    skeletonHighlight: 'rgba(126, 34, 206, 0.8)',
    loadingSpinner: '#a855f7',

    // PROGRESS BARS
    progressBackground: 'rgba(88, 28, 135, 0.8)',
    progressFill: '#a855f7',
    progressText: '#faf5ff',

    // SEARCH/FILTER
    searchBackground: 'rgba(88, 28, 135, 0.8)',
    searchBorder: 'rgba(216, 180, 254, 0.3)',
    searchFocus: '#a855f7',
    searchText: '#faf5ff',
    searchPlaceholder: '#c4b5fd',
    filterChip: 'rgba(168, 85, 247, 0.2)',
    filterChipActive: 'rgba(168, 85, 247, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(168, 85, 247, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(88, 28, 135, 0.95)',
    customizerSidebar: 'rgba(126, 34, 206, 0.9)',
    customizerSection: 'rgba(88, 28, 135, 0.8)',
    customizerAccent: '#a855f7',
    customizerPreview: 'rgba(46, 16, 101, 0.8)'
  },
  preview: {
    primary: '#2e1065',
    secondary: '#7c3aed',
    accent: '#c084fc'
  }
};