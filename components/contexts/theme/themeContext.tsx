import React, { useState, useEffect, createContext, useMemo, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemeType, ThemeColors, ThemeContextType } from "../../../types/themeTypes";
import { defaultThemes } from "./defaultTheme";

// Storage keys
const THEME_STORAGE_KEY = "@app_theme_preference";
const CUSTOM_THEMES_STORAGE_KEY = "@app_custom_themes";
const THEME_CONFIG_STORAGE_KEY = "@app_theme_config";

// Default context values
const defaultContextValue: ThemeContextType = {
  currentTheme: "system",
  theme: defaultThemes.light,
  isDark: false,
  isAnimatingTheme: false,
  toggleTheme: () => {},
  setTheme: () => {},
  themes: defaultThemes,
  customThemes: {},
  addCustomTheme: () => {},
  removeCustomTheme: () => {},
  updateCustomTheme: () => {},
  themeConfig: {
    animationDuration: 300,
    useSystemTheme: true,
    preferDarkTheme: false,
  },
  setThemeConfig: () => {},
};

// Context creation
export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

// Type for Provider props
type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: ThemeType;
  customThemes?: Record<string, Partial<ThemeColors>>;
  themeConfig?: Partial<ThemeContextType['themeConfig']>;
};

// Theme Provider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "system",
  customThemes: initialCustomThemes = {},
  themeConfig: initialThemeConfig = {},
}) => {
  // System state
  const systemColorScheme = useColorScheme();
  
  // Local states
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);
  const [customThemes, setCustomThemes] = useState<Record<string, ThemeColors>>({});
  const [isAnimatingTheme, setIsAnimatingTheme] = useState(false);
  const [themeConfig, setThemeConfigState] = useState({
    animationDuration: 300,
    useSystemTheme: true,
    preferDarkTheme: false,
    ...initialThemeConfig,
  });

  // Refs pour éviter les sauvegardes lors du chargement initial
  const isInitialized = useRef(false);
  const isLoadingInitial = useRef(true);

  // Function to resolve effective theme
  const resolveEffectiveTheme = useCallback((theme: ThemeType): ThemeType => {
    if (theme === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return theme;
  }, [systemColorScheme]);

  // Function to get current theme colors
  const getActiveThemeColors = useCallback((): ThemeColors => {
    const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
    // Check custom themes first
    if (customThemes[effectiveTheme]) {
      return customThemes[effectiveTheme];
    }
    
    // Then check default themes
    if (defaultThemes[effectiveTheme]) {
      return defaultThemes[effectiveTheme];
    }
    
    // Fallback to preferred theme
    return themeConfig.preferDarkTheme ? defaultThemes.dark : defaultThemes.light;
  }, [currentTheme, customThemes, resolveEffectiveTheme, themeConfig.preferDarkTheme]);

  // Function to determine if theme is dark
  const getIsDark = useCallback((): boolean => {
    const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
    // Explicitly dark themes
    const darkThemes = ["dark", "premium", "nightshift", "materialYou"];
    const lightThemes = ["light", "pastel"];
    
    if (darkThemes.includes(effectiveTheme)) {
      return true;
    }
    
    if (lightThemes.includes(effectiveTheme)) {
      return false;
    }
    
    // For custom themes, analyze background color
    if (customThemes[effectiveTheme]) {
      const theme = customThemes[effectiveTheme];
      const bg = Array.isArray(theme.background) ? theme.background[0] : theme.background;
      
      // Calculate luminance
      const hex = bg.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
      }
    }
    
    return false;
  }, [currentTheme, customThemes, resolveEffectiveTheme]);

  // Memoization of main values
  const theme = useMemo(() => getActiveThemeColors(), [getActiveThemeColors]);
  const isDark = useMemo(() => getIsDark(), [getIsDark]);

  // Load saved preferences (once only)
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        // Load theme
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          console.log('Loaded theme from storage:', savedTheme);
          setCurrentTheme(savedTheme as ThemeType);
        }

        // Load custom themes
        const savedCustomThemes = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
        if (savedCustomThemes !== null) {
          const parsed = JSON.parse(savedCustomThemes);
          console.log('Loaded custom themes from storage:', Object.keys(parsed));
          setCustomThemes(parsed);
        } else if (Object.keys(initialCustomThemes).length > 0) {
          // Process initial custom themes
          const processedThemes: Record<string, ThemeColors> = {};
          
          Object.entries(initialCustomThemes).forEach(([name, partialTheme]) => {
            processedThemes[name] = {
              ...defaultThemes.light,
              ...partialTheme,
            } as ThemeColors;
          });
          
          setCustomThemes(processedThemes);
        }

        // Load configuration
        const savedThemeConfig = await AsyncStorage.getItem(THEME_CONFIG_STORAGE_KEY);
        if (savedThemeConfig !== null) {
          const parsed = JSON.parse(savedThemeConfig);
          console.log('Loaded theme config from storage:', parsed);
          setThemeConfigState(prev => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (error) {
        console.error("Error loading theme preferences:", error);
      } finally {
        isLoadingInitial.current = false;
        isInitialized.current = true;
      }
    };

    if (!isInitialized.current) {
      loadSavedPreferences();
    }
  }, []); // Empty dependencies to run only once

  // Save current theme (only after initialization)
  useEffect(() => {
    const saveTheme = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, currentTheme);
        console.log('Theme saved to storage:', currentTheme);
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    };

    if (isInitialized.current) {
      saveTheme();
    }
  }, [currentTheme]);

  // Save custom themes (only after initialization)
  useEffect(() => {
    const saveCustomThemes = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customThemes));
        console.log('Custom themes saved to storage');
      } catch (error) {
        console.error("Error saving custom themes:", error);
      }
    };

    if (isInitialized.current && Object.keys(customThemes).length > 0) {
      saveCustomThemes();
    }
  }, [customThemes]);

  useEffect(() => {
    const saveThemeConfig = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(themeConfig));
        console.log('Theme config saved to storage');
      } catch (error) {
        console.error("Error saving theme configuration:", error);
      }
    };

    if (isInitialized.current) {
      saveThemeConfig();
    }
  }, [themeConfig]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnimatingTheme) {
      timeout = setTimeout(() => {
        setIsAnimatingTheme(false);
      }, themeConfig.animationDuration);
    }
    return () => clearTimeout(timeout);
  }, [isAnimatingTheme, themeConfig.animationDuration]);

  const toggleTheme = useCallback(() => {
    console.log('Toggle theme called, current:', currentTheme);
    setIsAnimatingTheme(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
    
    if (currentTheme === "system") {
      const newTheme = systemColorScheme === "dark" ? "light" : "dark";
      console.log('Switching from system to:', newTheme);
      setCurrentTheme(newTheme);
    } else {
      const newTheme = isDark ? "light" : "dark";
      console.log('Switching to:', newTheme);
      setCurrentTheme(newTheme);
    }
  }, [currentTheme, systemColorScheme, isDark]);

  const setTheme = useCallback((newTheme: ThemeType) => {
    console.log('Set theme called:', newTheme);
    if (newTheme !== currentTheme) {
      setIsAnimatingTheme(true);
      
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
      
      setCurrentTheme(newTheme);
    }
  }, [currentTheme]);

  // Add a custom theme with useCallback
  const addCustomTheme = useCallback((name: string, colors: Partial<ThemeColors>) => {
    const reservedNames = ["system", "dark", "light", "premium", "pastel", "nightshift", "materialYou"];
    
    if (!name || reservedNames.includes(name)) {
      console.warn("Invalid or reserved theme name:", name);
      return;
    }
    
    const baseTheme = isDark ? defaultThemes.dark : defaultThemes.light;
    const newTheme: ThemeColors = { ...baseTheme, ...colors };
    
    if (colors.background && !Array.isArray(colors.background)) {
      newTheme.background = [colors.background as string, colors.background as string];
    }
    
    setCustomThemes(prev => ({
      ...prev,
      [name]: newTheme
    }));
    
    console.log('Custom theme added:', name);
  }, [isDark]);

  const updateCustomTheme = useCallback((name: string, colors: Partial<ThemeColors>) => {
    setCustomThemes(prev => {
      if (!prev[name]) {
        console.warn(`Theme '${name}' does not exist`);
        return prev;
      }
      
      const updatedTheme = { ...prev[name], ...colors };
      
      if (colors.background && !Array.isArray(colors.background)) {
        updatedTheme.background = [colors.background as string, colors.background as string];
      }
      
      console.log('Custom theme updated:', name);
      
      return {
        ...prev,
        [name]: updatedTheme
      };
    });
  }, []);

  const removeCustomTheme = useCallback((name: string) => {
    setCustomThemes(prev => {
      if (!prev[name]) {
        console.warn(`Theme '${name}' does not exist`);
        return prev;
      }
      
      if (currentTheme === name) {
        setCurrentTheme("system");
      }
      
      const newThemes = { ...prev };
      delete newThemes[name];
      
      console.log('Custom theme removed:', name);
      return newThemes;
    });
  }, [currentTheme]);

  const setThemeConfig = useCallback((config: Partial<ThemeContextType['themeConfig']>) => {
    setThemeConfigState(prev => ({
      ...prev,
      ...config
    }));
    
    console.log('Theme config updated:', config);
  }, []);


  const contextValue: ThemeContextType = useMemo(() => ({
    currentTheme,
    theme,
    isDark,
    isAnimatingTheme,
    toggleTheme,
    setTheme,
    themes: { ...defaultThemes, ...customThemes },
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    themeConfig,
    setThemeConfig,
  }), [
    currentTheme,
    theme,
    isDark,
    isAnimatingTheme,
    toggleTheme,
    setTheme,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    themeConfig,
    setThemeConfig,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};