import { ThemeDefinition } from '../base';

export const sunsetTheme: ThemeDefinition = {
  id: 'sunset',
  name: 'Sunset Blaze',
  description: 'Tons calorosos e vibrantes de laranja e coral inspirados no pôr do sol',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #ea580c 100%)',
    backgroundCard: 'rgba(124, 45, 18, 0.95)',
    backgroundElevated: 'rgba(234, 88, 12, 0.9)',
    backgroundSurface: '#7c2d12',
    backgroundGlass: 'rgba(124, 45, 18, 0.7)',
    backgroundOverlay: 'rgba(67, 20, 7, 0.8)',
    
    // TEXTOS
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
    textTertiary: '#fdba74',
    textAccent: '#fb923c',
    textOnDark: '#fff7ed',
    textOnLight: '#431407',
    textMuted: '#f97316',
    textInverse: '#431407',
    
    // BORDAS
    borderPrimary: 'rgba(253, 186, 116, 0.3)',
    borderSecondary: 'rgba(253, 186, 116, 0.15)',
    borderAccent: '#fb923c',
    borderFocus: '#ea580c',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(234, 88, 12, 0.15)',
    buttonSecondaryHover: 'rgba(234, 88, 12, 0.25)',
    buttonSecondaryActive: 'rgba(234, 88, 12, 0.35)',
    buttonSecondaryText: '#fb923c',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(67, 20, 7, 0.98)',
    sidebarText: '#fed7aa',
    sidebarActiveBackground: 'rgba(234, 88, 12, 0.2)',
    sidebarActiveText: '#fff7ed',
    sidebarBorder: 'rgba(253, 186, 116, 0.1)',
    sidebarHover: 'rgba(253, 186, 116, 0.1)',
    sidebarIcon: '#fdba74',
    sidebarActiveIcon: '#fb923c',
    
    // HEADER
    headerBackground: 'rgba(67, 20, 7, 0.95)',
    headerText: '#fff7ed',
    headerBorder: 'rgba(253, 186, 116, 0.1)',
    headerIcon: '#fdba74',
    headerHover: 'rgba(253, 186, 116, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(234, 88, 12, 0.1)',
    linkText: '#fff7ed',
    linkHover: 'rgba(234, 88, 12, 0.2)',
    linkActive: 'rgba(234, 88, 12, 0.3)',
    linkBorder: 'rgba(234, 88, 12, 0.3)',
    linkBorderHover: '#fb923c',
    linkIcon: '#fb923c',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
    cardBorder: 'rgba(234, 88, 12, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(234, 88, 12, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    cardAccent: '#fb923c',
    cardTitle: '#fff7ed',
    cardSubtitle: '#fed7aa',
    cardFooter: 'rgba(253, 186, 116, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(67, 20, 7, 0.3)',
    dashboardStatBackground: 'rgba(124, 45, 18, 0.9)',
    dashboardStatBorder: 'rgba(234, 88, 12, 0.4)',
    dashboardStatIcon: '#fb923c',
    dashboardStatIconBg: 'rgba(234, 88, 12, 0.2)',
    dashboardStatText: '#fff7ed',
    dashboardStatNumber: '#fb923c',
    dashboardListItem: 'rgba(124, 45, 18, 0.7)',
    dashboardListItemHover: 'rgba(234, 88, 12, 0.15)',
    dashboardListBorder: 'rgba(253, 186, 116, 0.2)',
    dashboardListText: '#fff7ed',
    dashboardListSecondary: '#fdba74',
    dashboardEmptyState: 'rgba(253, 186, 116, 0.1)',
    dashboardEmptyIcon: '#f97316',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(124, 45, 18, 0.6)',
    inputBorder: 'rgba(253, 186, 116, 0.4)',
    inputFocus: '#fb923c',
    inputText: '#fff7ed',
    inputPlaceholder: '#fdba74',
    labelText: '#fed7aa',
    selectBackground: 'rgba(124, 45, 18, 0.6)',
    selectBorder: 'rgba(253, 186, 116, 0.4)',
    selectArrow: '#fdba74',
    checkboxBackground: 'rgba(124, 45, 18, 0.6)',
    checkboxBorder: 'rgba(253, 186, 116, 0.4)',
    checkboxChecked: '#fb923c',
    
    // MODAIS
    modalBackground: 'rgba(124, 45, 18, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(253, 186, 116, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(234, 88, 12, 0.8)',
    modalHeaderText: '#fff7ed',
    modalHeaderBorder: 'rgba(253, 186, 116, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(67, 20, 7, 0.9)',
    navText: '#fed7aa',
    navActive: 'rgba(234, 88, 12, 0.2)',
    navActiveText: '#fff7ed',
    navHover: 'rgba(253, 186, 116, 0.1)',
    navBorder: 'rgba(253, 186, 116, 0.1)',
    
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
    scrollbarTrack: 'rgba(124, 45, 18, 0.3)',
    scrollbarThumb: 'rgba(253, 186, 116, 0.3)',
    scrollbarThumbHover: 'rgba(253, 186, 116, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(67, 20, 7, 0.95)',
    tooltipText: '#fff7ed',
    tooltipBorder: 'rgba(253, 186, 116, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(124, 45, 18, 0.8)',
    badgeBorder: 'rgba(253, 186, 116, 0.3)',
    badgeText: '#fff7ed',
    badgeSuccess: '#16a34a',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(124, 45, 18, 0.95)',
    dropdownBorder: 'rgba(253, 186, 116, 0.2)',
    dropdownHover: 'rgba(217, 119, 6, 0.8)',
    dropdownSelected: 'rgba(251, 146, 60, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(124, 45, 18, 0.9)',
    tableHeaderText: '#fff7ed',
    tableRow: 'rgba(124, 45, 18, 0.5)',
    tableRowAlt: 'rgba(217, 119, 6, 0.5)',
    tableRowHover: 'rgba(251, 146, 60, 0.1)',
    tableBorder: 'rgba(253, 186, 116, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(124, 45, 18, 0.6)',
    skeletonHighlight: 'rgba(217, 119, 6, 0.8)',
    loadingSpinner: '#fb923c',

    // PROGRESS BARS
    progressBackground: 'rgba(124, 45, 18, 0.8)',
    progressFill: '#fb923c',
    progressText: '#fff7ed',

    // SEARCH/FILTER
    searchBackground: 'rgba(124, 45, 18, 0.8)',
    searchBorder: 'rgba(253, 186, 116, 0.3)',
    searchFocus: '#fb923c',
    searchText: '#fff7ed',
    searchPlaceholder: '#fdba74',
    filterChip: 'rgba(251, 146, 60, 0.2)',
    filterChipActive: 'rgba(251, 146, 60, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(251, 146, 60, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(124, 45, 18, 0.95)',
    customizerSidebar: 'rgba(217, 119, 6, 0.9)',
    customizerSection: 'rgba(124, 45, 18, 0.8)',
    customizerAccent: '#fb923c',
    customizerPreview: 'rgba(67, 20, 7, 0.8)'
  },
  preview: {
    primary: '#431407',
    secondary: '#ea580c',
    accent: '#fb923c'
  }
};