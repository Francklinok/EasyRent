import { useContext } from 'react';
import { ThemeContext } from '../components/contexts/theme/themeContext';
import { ThemeColors, ThemeType, ThemeContextType } from '../types/themeTypes';

// Hook to  access  theme  context  
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};

// Hook to  access the  current  theme  colors  and  properties
export const useThemeColors = (): ThemeColors => {
  const { theme } = useTheme();
  return theme;
};

// Hook to  verify  if  the  actual  theme  is  dark
export const useDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

// Hook to manage  theme switching and  state
export const useThemeControls = () => {
  const { toggleTheme, setTheme, currentTheme, isAnimatingTheme } = useTheme();
  
  return { 
    toggleTheme, 
    setTheme, 
    currentTheme, 
    isAnimatingTheme,
    // helper functions for common theme changes
    setLightTheme: () => setTheme('light'),
    setDarkTheme: () => setTheme('dark'),
    setSystemTheme: () => setTheme('system'),
  };
};

// Hook to  manage  custom  themes
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

// Hook to manage  the  theme  configuration options
export const useThemeConfig = () => {
  const { themeConfig, setThemeConfig } = useTheme();
  return {
    themeConfig,
    setThemeConfig,
    enableSystemTheme: () => setThemeConfig({ useSystemTheme: true }),
    disableSystemTheme: () => setThemeConfig({ useSystemTheme: false }),
    setAnimationDuration: (duration: number) => setThemeConfig({ animationDuration: duration }),
    setPreferDarkTheme: (prefer: boolean) => setThemeConfig({ preferDarkTheme: prefer }),
    toggleSystemTheme: () => setThemeConfig({ useSystemTheme: !themeConfig.useSystemTheme }),
    togglePreferDarkTheme: () => setThemeConfig({ preferDarkTheme: !themeConfig.preferDarkTheme }),
  };
};

// Hook to retrieve  a  specific theme by  name
export const useThemeByName = (themeName: ThemeType) => {
  const { themes } = useTheme();
  return themes[themeName] || themes.light; 
};

// Hook to  manage theme transition  and  animation
export const useThemeTransition = () => {
  const { isAnimatingTheme, themeConfig } = useTheme();
  
  return {
    isAnimatingTheme,
    animationDuration: themeConfig.animationDuration,
    getTransitionStyle: () => ({
      transition: themeConfig.animationDuration > 0 
        ? `all ${themeConfig.animationDuration}ms ease-in-out` 
        : 'none'
    }),
    // function  to  wait  to  the  end  of  the  theme  transition
    waitForTransition: () => new Promise(resolve => 
      setTimeout(resolve, themeConfig.animationDuration)
    ),
  };
};

// Hook  to  obtain detailed  information  about the current  theme
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

// Hook  for  dynamique  theme  styles
export const useThemedStyles = () => {
  const { theme, isDark } = useTheme();
  
  return {
    // Base  style
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
    // Bouton  styles
    primaryButton: {
      backgroundColor: theme.primary,
      color: theme.onSurface,
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
      color: theme.onSurface,
    },
    // Input  styles
    input: {
      backgroundColor: theme.input.background,
      color: theme.input.text,
      borderColor: theme.input.border,
    },
    // auther  specific  component  style  
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

// Hook for  theme  utilities and  helper  
export const useThemeUtils = () => {
  const { themes, customThemes } = useTheme();
  
  return {
    // Get all the  available  theme  names
    getAllThemeNames: () => Object.keys(themes),
    
    //get  theme  by   catgory
    getDefaultThemes: () => Object.keys(themes).filter(name => !customThemes[name]),
    getCustomThemes: () => Object.keys(customThemes),
    
    // Check if  a  theme  exists
    themeExists: (themeName: string) => Boolean(themes[themeName]),
    
    // Obtain   a  specific color  from  a  theme
    getThemeColor: (themeName: string, colorKey: keyof ThemeColors) => {
      const theme = themes[themeName];
      return theme ? theme[colorKey] : null;
    },
    
    // Create  a  variant  of  a  theme
    createThemeVariant: (baseName: string, modifications: Partial<ThemeColors>) => {
      const baseTheme = themes[baseName];
      if (!baseTheme) return null;
      
      return { ...baseTheme, ...modifications };
    },
  };
};