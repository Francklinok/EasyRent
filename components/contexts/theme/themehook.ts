import { useContext } from 'react';
import { ThemeContext } from './themeContext';
import { ThemeColors, ThemeType, ThemeContextType } from './themeTypes';

// Hook principal pour accéder au contexte du thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
};

// Hook pour accéder uniquement aux couleurs du thème actuel

export const useThemeColors = (): ThemeColors => {
  const { theme } = useTheme();
  return theme;
};

// Hook pour vérifier si le thème actuel est sombre
export const useDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

// Hook pour accéder aux fonctions de contrôle du thème
export const useThemeControls = () => {
  const { toggleTheme, setTheme, currentTheme, isAnimatingTheme } = useTheme();
  
  return { 
    toggleTheme, 
    setTheme, 
    currentTheme, 
    isAnimatingTheme,
    // Fonctions d'aide pour les thèmes communs
    setLightTheme: () => setTheme('light'),
    setDarkTheme: () => setTheme('dark'),
    setSystemTheme: () => setTheme('system'),
  };
};

// Hook pour gérer les thèmes personnalisés
export const useCustomThemes = () => {
  const {
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    customThemes,
    themes
  } = useTheme();
  
  return {
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    customThemes,
    allThemes: themes,
    hasCustomThemes: Object.keys(customThemes).length > 0,
    customThemeNames: Object.keys(customThemes),
  };
};

// Hook pour gérer la configuration du thème
export const useThemeConfig = () => {
  const { themeConfig, setThemeConfig } = useTheme();
  
  return {
    themeConfig,
    setThemeConfig,
    // Fonctions d'aide pour la configuration
    enableSystemTheme: () => setThemeConfig({ useSystemTheme: true }),
    disableSystemTheme: () => setThemeConfig({ useSystemTheme: false }),
    setAnimationDuration: (duration: number) => setThemeConfig({ animationDuration: duration }),
    setPreferDarkTheme: (prefer: boolean) => setThemeConfig({ preferDarkTheme: prefer }),
    toggleSystemTheme: () => setThemeConfig({ useSystemTheme: !themeConfig.useSystemTheme }),
    togglePreferDarkTheme: () => setThemeConfig({ preferDarkTheme: !themeConfig.preferDarkTheme }),
  };
};

// Hook pour récupérer un thème spécifique par son nom
export const useThemeByName = (themeName: ThemeType) => {
  const { themes } = useTheme();
  return themes[themeName] || themes.light; // Retourne le thème spécifié ou le thème clair par défaut
};

// Hook pour la gestion des animations de transition de thème
export const useThemeTransition = () => {
  const { isAnimatingTheme, themeConfig } = useTheme();
  
  return {
    isAnimatingTheme,
    animationDuration: themeConfig.animationDuration,
    // Style pour les transitions CSS (si utilisé dans un contexte web)
    getTransitionStyle: () => ({
      transition: themeConfig.animationDuration > 0 
        ? `all ${themeConfig.animationDuration}ms ease-in-out` 
        : 'none'
    }),
    // Fonction pour attendre la fin de l'animation
    waitForTransition: () => new Promise(resolve => 
      setTimeout(resolve, themeConfig.animationDuration)
    ),
  };
};

// Hook pour obtenir des informations sur le thème actuel
export const useThemeInfo = () => {
  const { currentTheme, theme, isDark, themes } = useTheme();
  
  const isSystemTheme = currentTheme === 'system';
  const isCustomTheme = !Object.keys(themes).includes(currentTheme);
  const isDefaultTheme = Object.keys(themes).includes(currentTheme) && currentTheme !== 'system';
  
  return {
    currentTheme,
    theme,
    isDark,
    isSystemTheme,
    isCustomTheme,
    isDefaultTheme,
    themeDisplayName: currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1),
  };
};

// Hook pour les styles dynamiques basés sur le thème
export const useThemedStyles = () => {
  const { theme, isDark } = useTheme();
  
  return {
    // Styles de base
    container: {
      backgroundColor: Array.isArray(theme.background) ? theme.background[0] : theme.background,
      flex: 1,
    },
    text: {
      color: theme.text,
    },
    subtext: {
      color: theme.subtext,
    },
    surface: {
      backgroundColor: theme.surface,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.outline,
      borderWidth: 1,
    },
    // Styles de boutons
    primaryButton: {
      backgroundColor: theme.primary,
      color: theme.onSurface,
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
      color: theme.onSurface,
    },
    // Styles d'input
    input: {
      backgroundColor: theme.input.background,
      color: theme.input.text,
      borderColor: theme.input.border,
    },
    // Utilitaires
    divider: {
      backgroundColor: theme.divider,
      height: 1,
    },
    shadow: {
      shadowColor: theme.shadow.color,
      shadowOpacity: theme.shadow.opacity,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 4,
    },
  };
};

// Hook pour les utilitaires de thème
export const useThemeUtils = () => {
  const { themes, customThemes } = useTheme();
  
  return {
    // Obtenir tous les noms de thèmes disponibles
    getAllThemeNames: () => Object.keys(themes),
    
    // Obtenir les thèmes par catégorie
    getDefaultThemes: () => Object.keys(themes).filter(name => !customThemes[name]),
    getCustomThemes: () => Object.keys(customThemes),
    
    // Vérifier si un thème existe
    themeExists: (themeName: string) => Boolean(themes[themeName]),
    
    // Obtenir une couleur spécifique d'un thème
    getThemeColor: (themeName: string, colorKey: keyof ThemeColors) => {
      const theme = themes[themeName];
      return theme ? theme[colorKey] : null;
    },
    
    // Créer un thème basé sur un autre
    createThemeVariant: (baseName: string, modifications: Partial<ThemeColors>) => {
      const baseTheme = themes[baseName];
      if (!baseTheme) return null;
      
      return { ...baseTheme, ...modifications };
    },
  };
};