import { ThemeDefinition } from '../base';

export const forestTheme: ThemeDefinition = {
  id: 'forest',
  name: 'Forest Sage',
  description: 'Verde sábio e terroso que inspira tranquilidade e concentração',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #1c2e1c 0%, #2d5016 50%, #365314 100%)',
    backgroundCard: 'rgba(45, 80, 22, 0.95)',
    backgroundElevated: 'rgba(54, 83, 20, 0.9)',
    backgroundSurface: '#2d5016',
    backgroundGlass: 'rgba(45, 80, 22, 0.7)',
    backgroundOverlay: 'rgba(28, 46, 28, 0.8)',
    
    // TEXTOS
    textPrimary: '#f7fee7',
    textSecondary: '#ecfccb',
    textTertiary: '#d9f99d',
    textAccent: '#a3e635',
    textOnDark: '#f7fee7',
    textOnLight: '#1c2e1c',
    textMuted: '#84cc16',
    textInverse: '#1c2e1c',
    
    // BORDAS
    borderPrimary: 'rgba(217, 249, 157, 0.3)',
    borderSecondary: 'rgba(217, 249, 157, 0.15)',
    borderAccent: '#a3e635',
    borderFocus: '#65a30d',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(101, 163, 13, 0.15)',
    buttonSecondaryHover: 'rgba(101, 163, 13, 0.25)',
    buttonSecondaryActive: 'rgba(101, 163, 13, 0.35)',
    buttonSecondaryText: '#a3e635',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(28, 46, 28, 0.98)',
    sidebarText: '#ecfccb',
    sidebarActiveBackground: 'rgba(101, 163, 13, 0.2)',
    sidebarActiveText: '#f7fee7',
    sidebarBorder: 'rgba(217, 249, 157, 0.1)',
    sidebarHover: 'rgba(217, 249, 157, 0.1)',
    sidebarIcon: '#d9f99d',
    sidebarActiveIcon: '#a3e635',
    
    // HEADER
    headerBackground: 'rgba(28, 46, 28, 0.95)',
    headerText: '#f7fee7',
    headerBorder: 'rgba(217, 249, 157, 0.1)',
    headerIcon: '#d9f99d',
    headerHover: 'rgba(217, 249, 157, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(101, 163, 13, 0.1)',
    linkText: '#f7fee7',
    linkHover: 'rgba(101, 163, 13, 0.2)',
    linkActive: 'rgba(101, 163, 13, 0.3)',
    linkBorder: 'rgba(101, 163, 13, 0.3)',
    linkBorderHover: '#a3e635',
    linkIcon: '#a3e635',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #2d5016 0%, #1c2e1c 100%)',
    cardBorder: 'rgba(101, 163, 13, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(101, 163, 13, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #65a30d 0%, #84cc16 100%)',
    cardAccent: '#a3e635',
    cardTitle: '#f7fee7',
    cardSubtitle: '#ecfccb',
    cardFooter: 'rgba(217, 249, 157, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(28, 46, 28, 0.3)',
    dashboardStatBackground: 'rgba(45, 80, 22, 0.9)',
    dashboardStatBorder: 'rgba(101, 163, 13, 0.4)',
    dashboardStatIcon: '#a3e635',
    dashboardStatIconBg: 'rgba(101, 163, 13, 0.2)',
    dashboardStatText: '#f7fee7',
    dashboardStatNumber: '#a3e635',
    dashboardListItem: 'rgba(45, 80, 22, 0.7)',
    dashboardListItemHover: 'rgba(101, 163, 13, 0.15)',
    dashboardListBorder: 'rgba(217, 249, 157, 0.2)',
    dashboardListText: '#f7fee7',
    dashboardListSecondary: '#d9f99d',
    dashboardEmptyState: 'rgba(217, 249, 157, 0.1)',
    dashboardEmptyIcon: '#84cc16',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(45, 80, 22, 0.6)',
    inputBorder: 'rgba(217, 249, 157, 0.4)',
    inputFocus: '#a3e635',
    inputText: '#f7fee7',
    inputPlaceholder: '#d9f99d',
    labelText: '#ecfccb',
    selectBackground: 'rgba(45, 80, 22, 0.6)',
    selectBorder: 'rgba(217, 249, 157, 0.4)',
    selectArrow: '#d9f99d',
    checkboxBackground: 'rgba(45, 80, 22, 0.6)',
    checkboxBorder: 'rgba(217, 249, 157, 0.4)',
    checkboxChecked: '#a3e635',
    
    // MODAIS
    modalBackground: 'rgba(45, 80, 22, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(217, 249, 157, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(54, 83, 20, 0.8)',
    modalHeaderText: '#f7fee7',
    modalHeaderBorder: 'rgba(217, 249, 157, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(28, 46, 28, 0.9)',
    navText: '#ecfccb',
    navActive: 'rgba(101, 163, 13, 0.2)',
    navActiveText: '#f7fee7',
    navHover: 'rgba(217, 249, 157, 0.1)',
    navBorder: 'rgba(217, 249, 157, 0.1)',
    
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
    scrollbarTrack: 'rgba(45, 80, 22, 0.3)',
    scrollbarThumb: 'rgba(217, 249, 157, 0.3)',
    scrollbarThumbHover: 'rgba(217, 249, 157, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(28, 46, 28, 0.95)',
    tooltipText: '#f7fee7',
    tooltipBorder: 'rgba(217, 249, 157, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(45, 80, 22, 0.8)',
    badgeBorder: 'rgba(217, 249, 157, 0.3)',
    badgeText: '#f7fee7',
    badgeSuccess: '#65a30d',
    badgeWarning: '#ca8a04',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(45, 80, 22, 0.95)',
    dropdownBorder: 'rgba(217, 249, 157, 0.2)',
    dropdownHover: 'rgba(101, 163, 13, 0.8)',
    dropdownSelected: 'rgba(163, 230, 53, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(45, 80, 22, 0.9)',
    tableHeaderText: '#f7fee7',
    tableRow: 'rgba(45, 80, 22, 0.5)',
    tableRowAlt: 'rgba(101, 163, 13, 0.5)',
    tableRowHover: 'rgba(163, 230, 53, 0.1)',
    tableBorder: 'rgba(217, 249, 157, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(45, 80, 22, 0.6)',
    skeletonHighlight: 'rgba(101, 163, 13, 0.8)',
    loadingSpinner: '#a3e635',

    // PROGRESS BARS
    progressBackground: 'rgba(45, 80, 22, 0.8)',
    progressFill: '#a3e635',
    progressText: '#f7fee7',

    // SEARCH/FILTER
    searchBackground: 'rgba(45, 80, 22, 0.8)',
    searchBorder: 'rgba(217, 249, 157, 0.3)',
    searchFocus: '#a3e635',
    searchText: '#f7fee7',
    searchPlaceholder: '#d9f99d',
    filterChip: 'rgba(163, 230, 53, 0.2)',
    filterChipActive: 'rgba(163, 230, 53, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(163, 230, 53, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(45, 80, 22, 0.95)',
    customizerSidebar: 'rgba(101, 163, 13, 0.9)',
    customizerSection: 'rgba(45, 80, 22, 0.8)',
    customizerAccent: '#a3e635',
    customizerPreview: 'rgba(28, 46, 28, 0.8)'
  },
  preview: {
    primary: '#1c2e1c',
    secondary: '#65a30d',
    accent: '#a3e635'
  }
};