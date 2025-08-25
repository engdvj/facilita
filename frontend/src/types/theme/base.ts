export interface ThemeColors {
  // FUNDOS
  backgroundMain: string;
  backgroundCard: string;
  backgroundElevated: string;
  backgroundSurface: string;
  backgroundGlass: string;
  backgroundOverlay: string;
  
  // TEXTOS
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textAccent: string;
  textOnDark: string;
  textOnLight: string;
  textMuted: string;
  textInverse: string;
  
  // BORDAS
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;
  borderFocus: string;
  borderError: string;
  borderSuccess: string;
  borderWarning: string;
  
  // BOTÕES
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonPrimaryActive: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonSecondaryActive: string;
  buttonSecondaryText: string;
  buttonDanger: string;
  buttonDangerHover: string;
  buttonDangerText: string;
  
  // SIDEBAR
  sidebarBackground: string;
  sidebarText: string;
  sidebarActiveBackground: string;
  sidebarActiveText: string;
  sidebarBorder: string;
  sidebarHover: string;
  sidebarIcon: string;
  sidebarActiveIcon: string;
  
  // HEADER
  headerBackground: string;
  headerText: string;
  headerBorder: string;
  headerIcon: string;
  headerHover: string;
  
  // LINKS
  linkBackground: string;
  linkText: string;
  linkHover: string;
  linkActive: string;
  linkBorder: string;
  linkBorderHover: string;
  linkIcon: string;
  
  // CARDS
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  cardHover: string;
  cardImageBackground: string;
  cardAccent: string;
  cardTitle: string;
  cardSubtitle: string;
  cardFooter: string;
  
  // DASHBOARD
  dashboardBackground: string;
  dashboardStatBackground: string;
  dashboardStatBorder: string;
  dashboardStatIcon: string;
  dashboardStatIconBg: string;
  dashboardStatText: string;
  dashboardStatNumber: string;
  dashboardListItem: string;
  dashboardListItemHover: string;
  dashboardListBorder: string;
  dashboardListText: string;
  dashboardListSecondary: string;
  dashboardEmptyState: string;
  dashboardEmptyIcon: string;
  
  // FORMULÁRIOS
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;
  inputText: string;
  inputPlaceholder: string;
  labelText: string;
  selectBackground: string;
  selectBorder: string;
  selectArrow: string;
  checkboxBackground: string;
  checkboxBorder: string;
  checkboxChecked: string;
  
  // MODAIS
  modalBackground: string;
  modalOverlay: string;
  modalBorder: string;
  modalShadow: string;
  modalHeaderBackground: string;
  modalHeaderText: string;
  modalHeaderBorder: string;
  
  // NAVEGAÇÃO
  navBackground: string;
  navText: string;
  navActive: string;
  navActiveText: string;
  navHover: string;
  navBorder: string;
  
  // ESTADOS
  success: string;
  successLight: string;
  successDark: string;
  successBg: string;
  successBorder: string;
  
  warning: string;
  warningLight: string;
  warningDark: string;
  warningBg: string;
  warningBorder: string;
  
  error: string;
  errorLight: string;
  errorDark: string;
  errorBg: string;
  errorBorder: string;
  
  info: string;
  infoLight: string;
  infoDark: string;
  infoBg: string;
  infoBorder: string;
  
  // SCROLLBARS
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  
  // TOOLTIPS
  tooltipBackground: string;
  tooltipText: string;
  tooltipBorder: string;
  tooltipShadow: string;

  // BADGES/TAGS
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
  badgeSuccess: string;
  badgeWarning: string;
  badgeError: string;
  badgeInfo: string;

  // DROPDOWN/SELECT
  dropdownBackground: string;
  dropdownBorder: string;
  dropdownHover: string;
  dropdownSelected: string;
  dropdownShadow: string;

  // TABLES
  tableHeader: string;
  tableHeaderText: string;
  tableRow: string;
  tableRowAlt: string;
  tableRowHover: string;
  tableBorder: string;

  // LOADING/SKELETON
  skeletonBase: string;
  skeletonHighlight: string;
  loadingSpinner: string;

  // PROGRESS BARS
  progressBackground: string;
  progressFill: string;
  progressText: string;

  // SEARCH/FILTER
  searchBackground: string;
  searchBorder: string;
  searchFocus: string;
  searchText: string;
  searchPlaceholder: string;
  filterChip: string;
  filterChipActive: string;

  // HOVER STATES
  hoverOverlay: string;
  hoverTransition: string;

  // THEME CUSTOMIZER
  customizerBackground: string;
  customizerSidebar: string;
  customizerSection: string;
  customizerAccent: string;
  customizerPreview: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export type ThemeId = 'midnight' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'aurora' | 'sakura' | 'cosmic' | 'emerald' | 'ruby';