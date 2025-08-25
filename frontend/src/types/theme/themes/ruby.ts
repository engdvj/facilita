import { ThemeDefinition } from '../base';

export const rubyTheme: ThemeDefinition = {
  id: 'ruby',
  name: 'Ruby Fire',
  description: 'Tons intensos de rubi e carmesim que transmitem paixão e energia',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%)',
    backgroundCard: 'rgba(153, 27, 27, 0.95)',
    backgroundElevated: 'rgba(220, 38, 38, 0.9)',
    backgroundSurface: '#991b1b',
    backgroundGlass: 'rgba(153, 27, 27, 0.7)',
    backgroundOverlay: 'rgba(127, 29, 29, 0.8)',
    
    // TEXTOS
    textPrimary: '#fef2f2',
    textSecondary: '#fee2e2',
    textTertiary: '#fca5a5',
    textAccent: '#f87171',
    textOnDark: '#fef2f2',
    textOnLight: '#7f1d1d',
    textMuted: '#ef4444',
    textInverse: '#7f1d1d',
    
    // BORDAS
    borderPrimary: 'rgba(252, 165, 165, 0.3)',
    borderSecondary: 'rgba(252, 165, 165, 0.15)',
    borderAccent: '#f87171',
    borderFocus: '#dc2626',
    borderError: '#ef4444',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(220, 38, 38, 0.15)',
    buttonSecondaryHover: 'rgba(220, 38, 38, 0.25)',
    buttonSecondaryActive: 'rgba(220, 38, 38, 0.35)',
    buttonSecondaryText: '#f87171',
    buttonDanger: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(127, 29, 29, 0.98)',
    sidebarText: '#fee2e2',
    sidebarActiveBackground: 'rgba(220, 38, 38, 0.2)',
    sidebarActiveText: '#fef2f2',
    sidebarBorder: 'rgba(252, 165, 165, 0.1)',
    sidebarHover: 'rgba(252, 165, 165, 0.1)',
    sidebarIcon: '#fca5a5',
    sidebarActiveIcon: '#f87171',
    
    // HEADER
    headerBackground: 'rgba(127, 29, 29, 0.95)',
    headerText: '#fef2f2',
    headerBorder: 'rgba(252, 165, 165, 0.1)',
    headerIcon: '#fca5a5',
    headerHover: 'rgba(252, 165, 165, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(220, 38, 38, 0.1)',
    linkText: '#fef2f2',
    linkHover: 'rgba(220, 38, 38, 0.2)',
    linkActive: 'rgba(220, 38, 38, 0.3)',
    linkBorder: 'rgba(220, 38, 38, 0.3)',
    linkBorderHover: '#f87171',
    linkIcon: '#f87171',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    cardBorder: 'rgba(220, 38, 38, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(220, 38, 38, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    cardAccent: '#f87171',
    cardTitle: '#fef2f2',
    cardSubtitle: '#fee2e2',
    cardFooter: 'rgba(252, 165, 165, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(127, 29, 29, 0.3)',
    dashboardStatBackground: 'rgba(153, 27, 27, 0.9)',
    dashboardStatBorder: 'rgba(220, 38, 38, 0.4)',
    dashboardStatIcon: '#f87171',
    dashboardStatIconBg: 'rgba(220, 38, 38, 0.2)',
    dashboardStatText: '#fef2f2',
    dashboardStatNumber: '#f87171',
    dashboardListItem: 'rgba(153, 27, 27, 0.7)',
    dashboardListItemHover: 'rgba(220, 38, 38, 0.15)',
    dashboardListBorder: 'rgba(252, 165, 165, 0.2)',
    dashboardListText: '#fef2f2',
    dashboardListSecondary: '#fca5a5',
    dashboardEmptyState: 'rgba(252, 165, 165, 0.1)',
    dashboardEmptyIcon: '#ef4444',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(153, 27, 27, 0.6)',
    inputBorder: 'rgba(252, 165, 165, 0.4)',
    inputFocus: '#f87171',
    inputText: '#fef2f2',
    inputPlaceholder: '#fca5a5',
    labelText: '#fee2e2',
    selectBackground: 'rgba(153, 27, 27, 0.6)',
    selectBorder: 'rgba(252, 165, 165, 0.4)',
    selectArrow: '#fca5a5',
    checkboxBackground: 'rgba(153, 27, 27, 0.6)',
    checkboxBorder: 'rgba(252, 165, 165, 0.4)',
    checkboxChecked: '#f87171',
    
    // MODAIS
    modalBackground: 'rgba(153, 27, 27, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(252, 165, 165, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(220, 38, 38, 0.8)',
    modalHeaderText: '#fef2f2',
    modalHeaderBorder: 'rgba(252, 165, 165, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(127, 29, 29, 0.9)',
    navText: '#fee2e2',
    navActive: 'rgba(220, 38, 38, 0.2)',
    navActiveText: '#fef2f2',
    navHover: 'rgba(252, 165, 165, 0.1)',
    navBorder: 'rgba(252, 165, 165, 0.1)',
    
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
    
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    
    info: '#06b6d4',
    infoLight: '#67e8f9',
    infoDark: '#0891b2',
    infoBg: 'rgba(6, 182, 212, 0.15)',
    infoBorder: 'rgba(6, 182, 212, 0.3)',
    
    // SCROLLBARS
    scrollbarTrack: 'rgba(153, 27, 27, 0.3)',
    scrollbarThumb: 'rgba(252, 165, 165, 0.3)',
    scrollbarThumbHover: 'rgba(252, 165, 165, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(127, 29, 29, 0.95)',
    tooltipText: '#fef2f2',
    tooltipBorder: 'rgba(252, 165, 165, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(153, 27, 27, 0.8)',
    badgeBorder: 'rgba(252, 165, 165, 0.3)',
    badgeText: '#fef2f2',
    badgeSuccess: '#059669',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(153, 27, 27, 0.95)',
    dropdownBorder: 'rgba(252, 165, 165, 0.2)',
    dropdownHover: 'rgba(185, 28, 28, 0.8)',
    dropdownSelected: 'rgba(248, 113, 113, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(153, 27, 27, 0.9)',
    tableHeaderText: '#fef2f2',
    tableRow: 'rgba(153, 27, 27, 0.5)',
    tableRowAlt: 'rgba(185, 28, 28, 0.5)',
    tableRowHover: 'rgba(248, 113, 113, 0.1)',
    tableBorder: 'rgba(252, 165, 165, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(153, 27, 27, 0.6)',
    skeletonHighlight: 'rgba(185, 28, 28, 0.8)',
    loadingSpinner: '#f87171',

    // PROGRESS BARS
    progressBackground: 'rgba(153, 27, 27, 0.8)',
    progressFill: '#f87171',
    progressText: '#fef2f2',

    // SEARCH/FILTER
    searchBackground: 'rgba(153, 27, 27, 0.8)',
    searchBorder: 'rgba(252, 165, 165, 0.3)',
    searchFocus: '#f87171',
    searchText: '#fef2f2',
    searchPlaceholder: '#fca5a5',
    filterChip: 'rgba(248, 113, 113, 0.2)',
    filterChipActive: 'rgba(248, 113, 113, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(248, 113, 113, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(153, 27, 27, 0.95)',
    customizerSidebar: 'rgba(185, 28, 28, 0.9)',
    customizerSection: 'rgba(153, 27, 27, 0.8)',
    customizerAccent: '#f87171',
    customizerPreview: 'rgba(127, 29, 29, 0.8)'
  },
  preview: {
    primary: '#7f1d1d',
    secondary: '#dc2626',
    accent: '#f87171'
  }
};