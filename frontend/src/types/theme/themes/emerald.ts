import { ThemeDefinition } from '../base';

export const emeraldTheme: ThemeDefinition = {
  id: 'emerald',
  name: 'Emerald Forest',
  description: 'Tons exuberantes de verde esmeralda que trazem energia e natureza',
  colors: {
    // FUNDOS
    backgroundMain: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    backgroundCard: 'rgba(20, 83, 45, 0.95)',
    backgroundElevated: 'rgba(22, 101, 52, 0.9)',
    backgroundSurface: '#14532d',
    backgroundGlass: 'rgba(20, 83, 45, 0.7)',
    backgroundOverlay: 'rgba(5, 46, 22, 0.8)',
    
    // TEXTOS
    textPrimary: '#f0fdf4',
    textSecondary: '#dcfce7',
    textTertiary: '#bbf7d0',
    textAccent: '#34d399',
    textOnDark: '#f0fdf4',
    textOnLight: '#052e16',
    textMuted: '#10b981',
    textInverse: '#052e16',
    
    // BORDAS
    borderPrimary: 'rgba(187, 247, 208, 0.3)',
    borderSecondary: 'rgba(187, 247, 208, 0.15)',
    borderAccent: '#34d399',
    borderFocus: '#059669',
    borderError: '#f87171',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // BOTÕES
    buttonPrimary: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    buttonPrimaryHover: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    buttonPrimaryActive: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: 'rgba(5, 150, 105, 0.15)',
    buttonSecondaryHover: 'rgba(5, 150, 105, 0.25)',
    buttonSecondaryActive: 'rgba(5, 150, 105, 0.35)',
    buttonSecondaryText: '#34d399',
    buttonDanger: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    buttonDangerHover: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    buttonDangerText: '#ffffff',
    
    // SIDEBAR
    sidebarBackground: 'rgba(5, 46, 22, 0.98)',
    sidebarText: '#dcfce7',
    sidebarActiveBackground: 'rgba(5, 150, 105, 0.2)',
    sidebarActiveText: '#f0fdf4',
    sidebarBorder: 'rgba(187, 247, 208, 0.1)',
    sidebarHover: 'rgba(187, 247, 208, 0.1)',
    sidebarIcon: '#bbf7d0',
    sidebarActiveIcon: '#34d399',
    
    // HEADER
    headerBackground: 'rgba(5, 46, 22, 0.95)',
    headerText: '#f0fdf4',
    headerBorder: 'rgba(187, 247, 208, 0.1)',
    headerIcon: '#bbf7d0',
    headerHover: 'rgba(187, 247, 208, 0.1)',
    
    // LINKS
    linkBackground: 'rgba(5, 150, 105, 0.1)',
    linkText: '#f0fdf4',
    linkHover: 'rgba(5, 150, 105, 0.2)',
    linkActive: 'rgba(5, 150, 105, 0.3)',
    linkBorder: 'rgba(5, 150, 105, 0.3)',
    linkBorderHover: '#34d399',
    linkIcon: '#34d399',
    
    // CARDS
    cardBackground: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
    cardBorder: 'rgba(5, 150, 105, 0.3)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    cardHover: 'rgba(5, 150, 105, 0.1)',
    cardImageBackground: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    cardAccent: '#34d399',
    cardTitle: '#f0fdf4',
    cardSubtitle: '#dcfce7',
    cardFooter: 'rgba(187, 247, 208, 0.1)',
    
    // DASHBOARD
    dashboardBackground: 'rgba(5, 46, 22, 0.3)',
    dashboardStatBackground: 'rgba(20, 83, 45, 0.9)',
    dashboardStatBorder: 'rgba(5, 150, 105, 0.4)',
    dashboardStatIcon: '#34d399',
    dashboardStatIconBg: 'rgba(5, 150, 105, 0.2)',
    dashboardStatText: '#f0fdf4',
    dashboardStatNumber: '#34d399',
    dashboardListItem: 'rgba(20, 83, 45, 0.7)',
    dashboardListItemHover: 'rgba(5, 150, 105, 0.15)',
    dashboardListBorder: 'rgba(187, 247, 208, 0.2)',
    dashboardListText: '#f0fdf4',
    dashboardListSecondary: '#bbf7d0',
    dashboardEmptyState: 'rgba(187, 247, 208, 0.1)',
    dashboardEmptyIcon: '#10b981',
    
    // FORMULÁRIOS
    inputBackground: 'rgba(20, 83, 45, 0.6)',
    inputBorder: 'rgba(187, 247, 208, 0.4)',
    inputFocus: '#34d399',
    inputText: '#f0fdf4',
    inputPlaceholder: '#bbf7d0',
    labelText: '#dcfce7',
    selectBackground: 'rgba(20, 83, 45, 0.6)',
    selectBorder: 'rgba(187, 247, 208, 0.4)',
    selectArrow: '#bbf7d0',
    checkboxBackground: 'rgba(20, 83, 45, 0.6)',
    checkboxBorder: 'rgba(187, 247, 208, 0.4)',
    checkboxChecked: '#34d399',
    
    // MODAIS
    modalBackground: 'rgba(20, 83, 45, 0.95)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
    modalBorder: 'rgba(187, 247, 208, 0.2)',
    modalShadow: 'rgba(0, 0, 0, 0.4)',
    modalHeaderBackground: 'rgba(22, 101, 52, 0.8)',
    modalHeaderText: '#f0fdf4',
    modalHeaderBorder: 'rgba(187, 247, 208, 0.1)',
    
    // NAVEGAÇÃO
    navBackground: 'rgba(5, 46, 22, 0.9)',
    navText: '#dcfce7',
    navActive: 'rgba(5, 150, 105, 0.2)',
    navActiveText: '#f0fdf4',
    navHover: 'rgba(187, 247, 208, 0.1)',
    navBorder: 'rgba(187, 247, 208, 0.1)',
    
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
    scrollbarTrack: 'rgba(20, 83, 45, 0.3)',
    scrollbarThumb: 'rgba(187, 247, 208, 0.3)',
    scrollbarThumbHover: 'rgba(187, 247, 208, 0.5)',
    
    // TOOLTIPS
    tooltipBackground: 'rgba(5, 46, 22, 0.95)',
    tooltipText: '#f0fdf4',
    tooltipBorder: 'rgba(187, 247, 208, 0.2)',
    tooltipShadow: 'rgba(0, 0, 0, 0.4)',

    // BADGES/TAGS
    badgeBackground: 'rgba(20, 83, 45, 0.8)',
    badgeBorder: 'rgba(187, 247, 208, 0.3)',
    badgeText: '#f0fdf4',
    badgeSuccess: '#22c55e',
    badgeWarning: '#f59e0b',
    badgeError: '#f87171',
    badgeInfo: '#06b6d4',

    // DROPDOWN/SELECT
    dropdownBackground: 'rgba(20, 83, 45, 0.95)',
    dropdownBorder: 'rgba(187, 247, 208, 0.2)',
    dropdownHover: 'rgba(34, 197, 94, 0.8)',
    dropdownSelected: 'rgba(52, 211, 153, 0.2)',
    dropdownShadow: 'rgba(0, 0, 0, 0.5)',

    // TABLES
    tableHeader: 'rgba(20, 83, 45, 0.9)',
    tableHeaderText: '#f0fdf4',
    tableRow: 'rgba(20, 83, 45, 0.5)',
    tableRowAlt: 'rgba(34, 197, 94, 0.5)',
    tableRowHover: 'rgba(52, 211, 153, 0.1)',
    tableBorder: 'rgba(187, 247, 208, 0.2)',

    // LOADING/SKELETON
    skeletonBase: 'rgba(20, 83, 45, 0.6)',
    skeletonHighlight: 'rgba(34, 197, 94, 0.8)',
    loadingSpinner: '#34d399',

    // PROGRESS BARS
    progressBackground: 'rgba(20, 83, 45, 0.8)',
    progressFill: '#34d399',
    progressText: '#f0fdf4',

    // SEARCH/FILTER
    searchBackground: 'rgba(20, 83, 45, 0.8)',
    searchBorder: 'rgba(187, 247, 208, 0.3)',
    searchFocus: '#34d399',
    searchText: '#f0fdf4',
    searchPlaceholder: '#bbf7d0',
    filterChip: 'rgba(52, 211, 153, 0.2)',
    filterChipActive: 'rgba(52, 211, 153, 0.3)',

    // HOVER STATES
    hoverOverlay: 'rgba(52, 211, 153, 0.1)',
    hoverTransition: '0.2s ease-in-out',

    // THEME CUSTOMIZER
    customizerBackground: 'rgba(20, 83, 45, 0.95)',
    customizerSidebar: 'rgba(34, 197, 94, 0.9)',
    customizerSection: 'rgba(20, 83, 45, 0.8)',
    customizerAccent: '#34d399',
    customizerPreview: 'rgba(5, 46, 22, 0.8)'
  },
  preview: {
    primary: '#052e16',
    secondary: '#059669',
    accent: '#34d399'
  }
};