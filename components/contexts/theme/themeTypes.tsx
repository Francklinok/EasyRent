
export type ThemeType = "dark" | "light" | "system" | "premium" | "pastel" | string;

export type ThemeColors = {
  // Couleurs de base
  background: [string, string, ...string[]];
  cardGradient: [string, string, ...string[]];

  // cardGradient: string[];
  text: string;
  subtext: string;
  cardBorder: string;
  buttonGradient: [string, string, ...string[]];
  priceGradient: [string, string, ...string[]];
  statusBar: "light-content" | "dark-content";
  tagBg: string;
  reviewBg: string;
  
  // Couleurs sémantiques
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  star:string
  
  // Interface utilisateur
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  outline: string;
  
  // Élévation et ombres
  elevation: {
    small: string;
    medium: string;
    large: string;
  };
  
  // Composants d'interface
  input: {
    background: string;
    text: string;
    border: string;
    placeholder: string;
    focus: string;
    disabled: string;
  };
  
  // Divers
  divider: string;
  backdrop: string;
  shadow: {
    color: string;
    opacity: number;
  };
  
  // Typographie
  typography: {
    heading: string;
    body: string;
    caption: string;
  };
  
  // États
  states: {
    hover: string;
    pressed: string;
    focused: string;
    disabled: string;
  };
  gray100: string; 
  gray600: string; 
  blue100: string; 
  blue600: string; 
  green100: string; 
  green500: string; 
  green800: string; 
  purple100: string; 
  purple600: string; 
  white: string; 
  textPrimary: string; 
  textSecondary: string; 
  iconInactive: string; 
  iconPrimary: string; 
  iconDanger: string; 
  backgroundSecondary: string; 
  border: string; 
  yellow100: string; 
  yellow800: string; 
  red100: string; 
  red500: string; 
  red700: string; 
  blue50: string; 
  blue200: string; 
  blue700: string; 
[key: string]: unknown;
};

export type ThemeContextType = {
  // États du thème
  currentTheme: ThemeType;
  theme: ThemeColors;
  isDark: boolean;
  isAnimatingTheme: boolean;
  
  // Actions de thème
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  
  // Gestion des thèmes
  themes: Record<string, ThemeColors>;
  customThemes: Record<string, ThemeColors>;
  addCustomTheme: (name: string, colors: Partial<ThemeColors>) => void;
  removeCustomTheme: (name: string) => void;
  updateCustomTheme: (name: string, colors: Partial<ThemeColors>) => void;
  
  // Configuration avancée
  themeConfig: {
    animationDuration: number;
    useSystemTheme: boolean;
    preferDarkTheme: boolean;
  };
  setThemeConfig: (config: Partial<ThemeContextType['themeConfig']>) => void;
};