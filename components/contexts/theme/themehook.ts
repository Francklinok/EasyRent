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
  const { toggleTheme, setTheme, currentTheme, isAnimatingTheme, isDark } = useTheme();
  return { toggleTheme, setTheme, currentTheme, isAnimatingTheme, isDark };
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
    allThemes: themes
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
    setPreferDarkTheme: (prefer: boolean) => setThemeConfig({ preferDarkTheme: prefer })
  };
};

// Hook pour récupérer le thème exact selon son nom
export const useThemeByName = (themeName: ThemeType) => {
  const { themes } = useTheme();
  return themes[themeName] || themes.dark; // Retourne le thème spécifié ou le thème sombre par défaut
};

// Hook pour la gestion des animations de transition de thème
export const useThemeTransition = () => {
  const { isAnimatingTheme, themeConfig } = useTheme();
  
  return {
    isAnimatingTheme,
    animationDuration: themeConfig.animationDuration,
    getTransitionStyle: () => ({
      transition: isAnimatingTheme ? `all ${themeConfig.animationDuration}ms ease-in-out` : 'none'
    })
  };
};