import { ThemeDefinition } from '../base';

export const sakuraTheme: ThemeDefinition = {
  id: 'sakura',
  name: 'Sakura Bloom',
  description: 'Delicados tons de rosa cerejeira que trazem serenidade e elegância',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #881337 0%, #be185d 50%, #ec4899 100%)',
    backgroundCard: 'rgba(190, 24, 93, 0.95)',
    backgroundElevated: 'rgba(236, 72, 153, 0.9)',
    backgroundSurface: '#be185d',
    backgroundGlass: 'rgba(190, 24, 93, 0.7)',
    backgroundOverlay: 'rgba(136, 19, 55, 0.8)',
    
    // TEXTOS
    textPrimary: '#fdf2f8',
    textSecondary: '#fce7f3',
    textTertiary: '#f9a8d4',
    textAccent: '#f472b6',
    textOnDark: '#fdf2f8',
    textOnLight: '#881337',
    textMuted: '#ec4899',
    textInverse: '#881337',
    
    // BORDAS
    borderPrimary: 'rgba(249, 168, 212, 0.3)',
    borderSecondary: 'rgba(249, 168, 212, 0.15)',
    borderAccent: '#f472b6',
    borderFocus: '#db2777',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(219, 39, 119, 0.15)',
    buttonSecondaryHover: 'rgba(219, 39, 119, 0.25)',
    buttonSecondaryActive: 'rgba(219, 39, 119, 0.35)',
    buttonSecondaryText: '#f472b6',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(136, 19, 55, 0.98)',
    sidebarText: '#fce7f3',
    sidebarActiveBackground: 'rgba(219, 39, 119, 0.2)',
    sidebarActiveText: '#fdf2f8',
    sidebarBorder: 'rgba(249, 168, 212, 0.1)',
    sidebarHover: 'rgba(249, 168, 212, 0.1)',
    sidebarIcon: '#f9a8d4',
    sidebarActiveIcon: '#f472b6',
    
    // HEADER
    headerBackground: 'rgba(136, 19, 55, 0.95)',
    headerText: '#fdf2f8',
    headerBorder: 'rgba(249, 168, 212, 0.1)',
    headerIcon: '#f9a8d4',
    headerHover: 'rgba(249, 168, 212, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(219, 39, 119, 0.1)',
    linkText: '#fdf2f8',
    linkHover: 'rgba(219, 39, 119, 0.2)',
    linkActive: 'rgba(219, 39, 119, 0.3)',
    linkBorder: 'rgba(219, 39, 119, 0.3)',
    linkBorderHover: '#f472b6',
    linkIcon: '#f472b6',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
    cardBorder: 'rgba(219, 39, 119, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(219, 39, 119, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
    cardAccent: '#f472b6',
    cardTitle: '#fdf2f8',
    cardSubtitle: '#fce7f3',
    cardFooter: 'rgba(249, 168, 212, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(136, 19, 55, 0.3)',
    dashboardStatBackground: 'rgba(190, 24, 93, 0.9)',
    dashboardStatBorder: 'rgba(219, 39, 119, 0.4)',
    dashboardStatIcon: '#f472b6',
    dashboardStatIconBg: 'rgba(219, 39, 119, 0.2)',
    dashboardStatText: '#fdf2f8',
    dashboardStatNumber: '#f472b6',
    dashboardListItem: 'rgba(190, 24, 93, 0.7)',
    dashboardListItemHover: 'rgba(219, 39, 119, 0.15)',
    dashboardListBorder: 'rgba(249, 168, 212, 0.2)',
    dashboardListText: '#fdf2f8',
    dashboardListSecondary: '#f9a8d4',
    dashboardEmptyState: 'rgba(249, 168, 212, 0.1)',
    dashboardEmptyIcon: '#ec4899',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(190, 24, 93, 0.6)',
    inputBorder: 'rgba(249, 168, 212, 0.4)',
    inputFocus: '#f472b6',
    inputText: '#fdf2f8',
    inputPlaceholder: '#f9a8d4',
    labelText: '#fce7f3',
    selectBackground: 'rgba(190, 24, 93, 0.6)',
    selectBorder: 'rgba(249, 168, 212, 0.4)',
    selectArrow: '#f9a8d4',
    checkboxBackground: 'rgba(190, 24, 93, 0.6)',
    checkboxBorder: 'rgba(249, 168, 212, 0.4)',
    checkboxChecked: '#f472b6',
    
    // MODAIS
    modalBackground: 'rgba(190, 24, 93, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(249, 168, 212, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(236, 72, 153, 0.8)',
    modalHeaderText: '#fdf2f8',
    modalHeaderBorder: 'rgba(249, 168, 212, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(136, 19, 55, 0.9)',
    navText: '#fce7f3',
    navActive: 'rgba(219, 39, 119, 0.2)',
    navActiveText: '#fdf2f8',
    navHover: 'rgba(249, 168, 212, 0.1)',
    navBorder: 'rgba(249, 168, 212, 0.1)',
    
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
    scrollbarTrack: 'rgba(190, 24, 93, 0.3)',
    scrollbarThumb: 'rgba(249, 168, 212, 0.3)',
    scrollbarThumbHover: 'rgba(249, 168, 212, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(136, 19, 55, 0.95)',
    tooltipText: '#fdf2f8',
    tooltipBorder: 'rgba(249, 168, 212, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(190, 24, 93, 0.8)',
    badgeBorder: 'rgba(249, 168, 212, 0.3)',
    badgeText: '#fdf2f8',
    badgeSuccess: '#059669',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(190, 24, 93, 0.95)',
    dropdownBorder: 'rgba(249, 168, 212, 0.2)',
    dropdownHover: 'rgba(219, 39, 119, 0.8)',
    dropdownSelected: 'rgba(244, 114, 182, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(190, 24, 93, 0.9)',
    tableHeaderText: '#fdf2f8',
    tableRow: 'rgba(190, 24, 93, 0.5)',
    tableRowAlt: 'rgba(219, 39, 119, 0.5)',
    tableRowHover: 'rgba(244, 114, 182, 0.1)',
    tableBorder: 'rgba(249, 168, 212, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(190, 24, 93, 0.6)',
    skeletonHighlight: 'rgba(219, 39, 119, 0.8)',
    loadingSpinner: '#f472b6',

    // PROGRESS BARS
    progressBackground: 'rgba(190, 24, 93, 0.8)',
    progressFill: '#f472b6',
    progressText: '#fdf2f8',

    // SEARCH/FILTER
    searchBackground: 'rgba(190, 24, 93, 0.8)',
    searchBorder: 'rgba(249, 168, 212, 0.3)',
    searchFocus: '#f472b6',
    searchText: '#fdf2f8',
    searchPlaceholder: '#f9a8d4',
    filterChip: 'rgba(244, 114, 182, 0.2)',
    filterChipActive: 'rgba(244, 114, 182, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(244, 114, 182, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(190, 24, 93, 0.95)',
    customizerSidebar: 'rgba(219, 39, 119, 0.9)',
    customizerSection: 'rgba(190, 24, 93, 0.8)',
    customizerAccent: '#f472b6',
    customizerPreview: 'rgba(136, 19, 55, 0.8)'
  },
  preview: {
    primary: '#881337',
    secondary: '#db2777',
    accent: '#f472b6'
  }
};