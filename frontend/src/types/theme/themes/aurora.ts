import { ThemeDefinition } from '../base';

export const auroraTheme: ThemeDefinition = {
  id: 'aurora',
  name: 'Aurora Borealis',
  description: 'Cores mágicas da aurora boreal com tons de verde e azul vibrantes',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 50%, #0e7490 100%)',
    backgroundCard: 'rgba(22, 78, 99, 0.95)',
    backgroundElevated: 'rgba(14, 116, 144, 0.9)',
    backgroundSurface: '#164e63',
    backgroundGlass: 'rgba(22, 78, 99, 0.7)',
    backgroundOverlay: 'rgba(12, 74, 110, 0.8)',
    
    // TEXTOS
    textPrimary: '#f0f9ff',
    textSecondary: '#e0f2fe',
    textTertiary: '#bae6fd',
    textAccent: '#7dd3fc',
    textOnDark: '#f0f9ff',
    textOnLight: '#0c4a6e',
    textMuted: '#0ea5e9',
    textInverse: '#0c4a6e',
    
    // BORDAS
    borderPrimary: 'rgba(186, 230, 253, 0.3)',
    borderSecondary: 'rgba(186, 230, 253, 0.15)',
    borderAccent: '#7dd3fc',
    borderFocus: '#0284c7',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(2, 132, 199, 0.15)',
    buttonSecondaryHover: 'rgba(2, 132, 199, 0.25)',
    buttonSecondaryActive: 'rgba(2, 132, 199, 0.35)',
    buttonSecondaryText: '#7dd3fc',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(12, 74, 110, 0.98)',
    sidebarText: '#e0f2fe',
    sidebarActiveBackground: 'rgba(2, 132, 199, 0.2)',
    sidebarActiveText: '#f0f9ff',
    sidebarBorder: 'rgba(186, 230, 253, 0.1)',
    sidebarHover: 'rgba(186, 230, 253, 0.1)',
    sidebarIcon: '#bae6fd',
    sidebarActiveIcon: '#7dd3fc',
    
    // HEADER
    headerBackground: 'rgba(12, 74, 110, 0.95)',
    headerText: '#f0f9ff',
    headerBorder: 'rgba(186, 230, 253, 0.1)',
    headerIcon: '#bae6fd',
    headerHover: 'rgba(186, 230, 253, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(2, 132, 199, 0.1)',
    linkText: '#f0f9ff',
    linkHover: 'rgba(2, 132, 199, 0.2)',
    linkActive: 'rgba(2, 132, 199, 0.3)',
    linkBorder: 'rgba(2, 132, 199, 0.3)',
    linkBorderHover: '#7dd3fc',
    linkIcon: '#7dd3fc',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #164e63 0%, #0c4a6e 100%)',
    cardBorder: 'rgba(2, 132, 199, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(2, 132, 199, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    cardAccent: '#7dd3fc',
    cardTitle: '#f0f9ff',
    cardSubtitle: '#e0f2fe',
    cardFooter: 'rgba(186, 230, 253, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(12, 74, 110, 0.3)',
    dashboardStatBackground: 'rgba(22, 78, 99, 0.9)',
    dashboardStatBorder: 'rgba(2, 132, 199, 0.4)',
    dashboardStatIcon: '#7dd3fc',
    dashboardStatIconBg: 'rgba(2, 132, 199, 0.2)',
    dashboardStatText: '#f0f9ff',
    dashboardStatNumber: '#7dd3fc',
    dashboardListItem: 'rgba(22, 78, 99, 0.7)',
    dashboardListItemHover: 'rgba(2, 132, 199, 0.15)',
    dashboardListBorder: 'rgba(186, 230, 253, 0.2)',
    dashboardListText: '#f0f9ff',
    dashboardListSecondary: '#bae6fd',
    dashboardEmptyState: 'rgba(186, 230, 253, 0.1)',
    dashboardEmptyIcon: '#0ea5e9',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(22, 78, 99, 0.6)',
    inputBorder: 'rgba(186, 230, 253, 0.4)',
    inputFocus: '#7dd3fc',
    inputText: '#f0f9ff',
    inputPlaceholder: '#bae6fd',
    labelText: '#e0f2fe',
    selectBackground: 'rgba(22, 78, 99, 0.6)',
    selectBorder: 'rgba(186, 230, 253, 0.4)',
    selectArrow: '#bae6fd',
    checkboxBackground: 'rgba(22, 78, 99, 0.6)',
    checkboxBorder: 'rgba(186, 230, 253, 0.4)',
    checkboxChecked: '#7dd3fc',
    
    // MODAIS
    modalBackground: 'rgba(22, 78, 99, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(186, 230, 253, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(14, 116, 144, 0.8)',
    modalHeaderText: '#f0f9ff',
    modalHeaderBorder: 'rgba(186, 230, 253, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(12, 74, 110, 0.9)',
    navText: '#e0f2fe',
    navActive: 'rgba(2, 132, 199, 0.2)',
    navActiveText: '#f0f9ff',
    navHover: 'rgba(186, 230, 253, 0.1)',
    navBorder: 'rgba(186, 230, 253, 0.1)',
    
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
    scrollbarTrack: 'rgba(22, 78, 99, 0.3)',
    scrollbarThumb: 'rgba(186, 230, 253, 0.3)',
    scrollbarThumbHover: 'rgba(186, 230, 253, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(12, 74, 110, 0.95)',
    tooltipText: '#f0f9ff',
    tooltipBorder: 'rgba(186, 230, 253, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(22, 78, 99, 0.8)',
    badgeBorder: 'rgba(186, 230, 253, 0.3)',
    badgeText: '#f0f9ff',
    badgeSuccess: '#059669',
    badgeWarning: '#d97706',
    badgeError: '#dc2626',
    badgeInfo: '#0284c7',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(22, 78, 99, 0.95)',
    dropdownBorder: 'rgba(186, 230, 253, 0.2)',
    dropdownHover: 'rgba(2, 132, 199, 0.8)',
    dropdownSelected: 'rgba(56, 189, 248, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(22, 78, 99, 0.9)',
    tableHeaderText: '#f0f9ff',
    tableRow: 'rgba(22, 78, 99, 0.5)',
    tableRowAlt: 'rgba(2, 132, 199, 0.5)',
    tableRowHover: 'rgba(56, 189, 248, 0.1)',
    tableBorder: 'rgba(186, 230, 253, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(22, 78, 99, 0.6)',
    skeletonHighlight: 'rgba(2, 132, 199, 0.8)',
    loadingSpinner: '#38bdf8',

    // PROGRESS BARS
    progressBackground: 'rgba(22, 78, 99, 0.8)',
    progressFill: '#38bdf8',
    progressText: '#f0f9ff',

    // SEARCH/FILTER
    searchBackground: 'rgba(22, 78, 99, 0.8)',
    searchBorder: 'rgba(186, 230, 253, 0.3)',
    searchFocus: '#38bdf8',
    searchText: '#f0f9ff',
    searchPlaceholder: '#bae6fd',
    filterChip: 'rgba(56, 189, 248, 0.2)',
    filterChipActive: 'rgba(56, 189, 248, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(56, 189, 248, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(22, 78, 99, 0.95)',
    customizerSidebar: 'rgba(2, 132, 199, 0.9)',
    customizerSection: 'rgba(22, 78, 99, 0.8)',
    customizerAccent: '#38bdf8',
    customizerPreview: 'rgba(12, 74, 110, 0.8)'
  },
  preview: {
    primary: '#0c4a6e',
    secondary: '#0284c7',
    accent: '#7dd3fc'
  }
};