

import React, { useState, useEffect, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemeType, ThemeColors, ThemeContextType } from "./themeTypes";
import { defaultThemes } from "./defaultTheme";

// Clés de stockage
const THEME_STORAGE_KEY = "@app_theme_preference";
const CUSTOM_THEMES_STORAGE_KEY = "@app_custom_themes";
const THEME_CONFIG_STORAGE_KEY = "@app_theme_config";

// Valeurs par défaut du contexte
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
    preferDarkTheme: true,
  },
  setThemeConfig: () => {},
};

// Création du contexte
export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

// Type pour les props du Provider
type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: ThemeType;
  customThemes?: Record<string, Partial<ThemeColors>>;
  themeConfig?: Partial<ThemeContextType['themeConfig']>;
};

// Provider du thème
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "light",
  customThemes: initialCustomThemes = {},
  themeConfig: initialThemeConfig = {},
}) => {
  // État du système
  const systemColorScheme = useColorScheme();
  
  // États locaux
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);
  const [customThemes, setCustomThemes] = useState<Record<string, ThemeColors>>({});
  const [isAnimatingTheme, setIsAnimatingTheme] = useState(false);
  const [themeConfig, setThemeConfigState] = useState({
    animationDuration: 300,
    useSystemTheme: true,
    preferDarkTheme: true,
    ...initialThemeConfig,
  });

  // Chargement des données sauvegardées
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        // Chargement du thème
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setCurrentTheme(savedTheme as ThemeType);
        }

        // Chargement des thèmes personnalisés
        const savedCustomThemes = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
        if (savedCustomThemes !== null) {
          setCustomThemes(JSON.parse(savedCustomThemes));
        } else if (Object.keys(initialCustomThemes).length > 0) {
          // Utiliser les thèmes personnalisés initiaux si fournis
          const processedThemes: Record<string, ThemeColors> = {};
          
          Object.entries(initialCustomThemes).forEach(([name, partialTheme]) => {
            // Fusionner avec le thème sombre par défaut pour compléter les valeurs manquantes
            processedThemes[name] = {
              ...defaultThemes.dark,
              ...partialTheme,
            } as ThemeColors;
          });
          
          setCustomThemes(processedThemes);
        }

        // Chargement de la configuration du thème
        const savedThemeConfig = await AsyncStorage.getItem(THEME_CONFIG_STORAGE_KEY);
        if (savedThemeConfig !== null) {
          setThemeConfigState(prev => ({
            ...prev,
            ...JSON.parse(savedThemeConfig),
          }));
        }
      } catch (error) {
        console.log("Erreur lors du chargement des préférences de thème:", error);
      }
    };

    loadSavedPreferences();
  }, []);

  // Sauvegarde du thème actuel
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      } catch (error) {
        console.log("Erreur lors de l'enregistrement du thème:", error);
      }
    };

    if (currentTheme !== initialTheme) {
      saveTheme();
    }
  }, [currentTheme, initialTheme]);

  // Sauvegarde des thèmes personnalisés
  useEffect(() => {
    const saveCustomThemes = async () => {
      try {
        await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customThemes));
      } catch (error) {
        console.log("Erreur lors de l'enregistrement des thèmes personnalisés:", error);
      }
    };

    if (Object.keys(customThemes).length > 0) {
      saveCustomThemes();
    }
  }, [customThemes]);

  // Sauvegarde de la configuration du thème
  useEffect(() => {
    const saveThemeConfig = async () => {
      try {
        await AsyncStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(themeConfig));
      } catch (error) {
        console.log("Erreur lors de l'enregistrement de la configuration du thème:", error);
      }
    };

    saveThemeConfig();
  }, [themeConfig]);

  // Animation du changement de thème
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnimatingTheme) {
      timeout = setTimeout(() => {
        setIsAnimatingTheme(false);
      }, themeConfig.animationDuration);
    }
    return () => clearTimeout(timeout);
  }, [isAnimatingTheme, themeConfig.animationDuration]);

  const getActiveThemeColors = (): ThemeColors => {
    console.log('Current theme:', currentTheme); // Debug
    console.log('System color scheme:', systemColorScheme); // Debug
    
    // Si le thème est "system"
    if (currentTheme === "system") {
      const themeToUse = systemColorScheme === "dark" ? defaultThemes.light : defaultThemes.dark;
      console.log('Using system theme:', systemColorScheme, themeToUse); // Debug
      return themeToUse;
    }
    
    // Si c'est un thème personnalisé
    if (customThemes[currentTheme]) {
      console.log('Using custom theme:', currentTheme); // Debug
      return customThemes[currentTheme];
    }
    
    // Si c'est un thème par défaut
    if (defaultThemes[currentTheme]) {
      console.log('Using default theme:', currentTheme); // Debug
      return defaultThemes[currentTheme];
    }
    
    // Fallback
    console.log('Using fallback theme'); // Debug
    return themeConfig.preferDarkTheme ? defaultThemes.light : defaultThemes.dark;
  };

  const theme = getActiveThemeColors();
  
  // ✅ LOGIQUE CORRIGÉE pour déterminer isDark
  const getIsDark = (): boolean => {
    if (currentTheme === "system") {
      return systemColorScheme === "dark";
    }
    
    // Pour les thèmes nommés explicitement
    if (currentTheme === "dark" || currentTheme === "premium" || 
        currentTheme === "nightshift" || currentTheme === "materialYou") {
      return true;
    }
    
    if (currentTheme === "light" || currentTheme === "pastel") {
      return false;
    }
    
    // Pour les thèmes personnalisés, vérifier la couleur de fond
    if (customThemes[currentTheme]) {
      const bg = Array.isArray(theme.background) ? theme.background[0] : theme.background;
      // Convertir hex en RGB pour calculer la luminosité
      const hex = bg.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5; // Sombre si luminance < 50%
    }
    
    return themeConfig.preferDarkTheme;
  };

  const isDark = getIsDark();
  


  // ✅ FONCTION TOGGLE CORRIGÉE
  const toggleTheme = () => {
    console.log('Toggling theme from:', currentTheme); // Debug
    setIsAnimatingTheme(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (currentTheme === "system") {
      // Si on est en système, basculer vers l'opposé du système
      const newTheme = systemColorScheme === "dark" ? "light" : "dark";
      console.log('Switching from system to:', newTheme); // Debug
      setCurrentTheme(newTheme);
    } else if (currentTheme === "dark" || currentTheme === "premium" || 
               currentTheme === "nightshift" || currentTheme === "materialYou") {
      console.log('Switching to light'); // Debug
      setCurrentTheme("light");
    } else {
      console.log('Switching to dark'); // Debug
      setCurrentTheme("dark");
    }
  };

  // ✅ FONCTION SET THEME CORRIGÉE
  const setTheme = (newTheme: ThemeType) => {
    console.log('Setting theme to:', newTheme); // Debug
    if (newTheme !== currentTheme) {
      setIsAnimatingTheme(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentTheme(newTheme);
    }
  };




  // Ajouter un thème personnalisé
  const addCustomTheme = (name: string, colors: Partial<ThemeColors>) => {
    if (!name || name === "system" || name === "dark" || name === "light") {
      console.warn("Le nom du thème est invalide ou réservé");
      return;
    }
    
    // Créer un nouveau thème basé sur le thème sombre ou clair par défaut
    const baseTheme = isDark ? defaultThemes.dark : defaultThemes.light;
    const newTheme = { ...baseTheme, ...colors };
    
    // Garantir que background est toujours un tableau
    if (colors.background && !Array.isArray(colors.background)) {
      newTheme.background = [colors.background as unknown as string, colors.background as unknown as string];
    }
    
    setCustomThemes(prev => ({
      ...prev,
      [name]: newTheme
    }));
  };

  // Mettre à jour un thème personnalisé
  const updateCustomTheme = (name: string, colors: Partial<ThemeColors>) => {
    if (!customThemes[name]) {
      console.warn(`Le thème '${name}' n'existe pas`);
      return;
    }
    
    // Créer le thème mise à jour
    const updatedTheme = { ...customThemes[name], ...colors };
    
    // Garantir que background est toujours un tableau
    if (colors.background && !Array.isArray(colors.background)) {
      updatedTheme.background = [colors.background as unknown as string, colors.background as unknown as string];
    }
    
    setCustomThemes(prev => ({
      ...prev,
      [name]: updatedTheme
    }));
  };

  // Supprimer un thème personnalisé
  const removeCustomTheme = (name: string) => {
    if (!customThemes[name]) {
      console.warn(`Le thème '${name}' n'existe pas`);
      return;
    }
    
    if (currentTheme === name) {
      // Si le thème actuel est celui qu'on supprime, revenir au thème système
      setCurrentTheme("system");
    }
    
    setCustomThemes(prev => {
      const newThemes = { ...prev };
      delete newThemes[name];
      return newThemes;
    });
  };

  // Mise à jour de la configuration du thème
  const setThemeConfig = (config: Partial<ThemeContextType['themeConfig']>) => {
    setThemeConfigState(prev => ({
      ...prev,
      ...config
    }));
  };

  // Tous les thèmes disponibles
  const allThemes = { ...defaultThemes, ...customThemes };

  // Valeur du contexte
  const contextValue: ThemeContextType = {
    currentTheme,
    toggleTheme,
    setTheme,
    theme,
    themes: { ...defaultThemes, ...customThemes },
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    customThemes,
    isDark,
    isAnimatingTheme,
    themeConfig,
    setThemeConfig,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};