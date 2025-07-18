// import React, { useState, useEffect, createContext,useMemo} from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useColorScheme } from "react-native";
// import * as Haptics from "expo-haptics";
// import { ThemeType, ThemeColors, ThemeContextType } from "./themeTypes";
// import { defaultThemes } from "./defaultTheme";

// // Clés de stockage
// const THEME_STORAGE_KEY = "@app_theme_preference";
// const CUSTOM_THEMES_STORAGE_KEY = "@app_custom_themes";
// const THEME_CONFIG_STORAGE_KEY = "@app_theme_config";

// // Valeurs par défaut du contexte
// const defaultContextValue: ThemeContextType = {
//   currentTheme: "system",
//   theme: defaultThemes.light,
//   isDark: false,
//   isAnimatingTheme: false,
//   toggleTheme: () => {},
//   setTheme: () => {},
//   themes: defaultThemes,
//   customThemes: {},
//   addCustomTheme: () => {},
//   removeCustomTheme: () => {},
//   updateCustomTheme: () => {},
//   themeConfig: {
//     animationDuration: 300,
//     useSystemTheme: true,
//     preferDarkTheme: false,
//   },
//   setThemeConfig: () => {},
// };

// // Création du contexte
// export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

// // Type pour les props du Provider
// type ThemeProviderProps = {
//   children: React.ReactNode;
//   initialTheme?: ThemeType;
//   customThemes?: Record<string, Partial<ThemeColors>>;
//   themeConfig?: Partial<ThemeContextType['themeConfig']>;
// };

// // Provider du thème
// export const ThemeProvider: React.FC<ThemeProviderProps> = ({
//   children,
//   initialTheme = "system",
//   customThemes: initialCustomThemes = {},
//   themeConfig: initialThemeConfig = {},
// }) => {
//   // État du système
//   const systemColorScheme = useColorScheme();
  
//   // États locaux
//   const [currentTheme, setCurrentTheme] = useState<ThemeType>(initialTheme);
//   const [customThemes, setCustomThemes] = useState<Record<string, ThemeColors>>({});
//   const [isAnimatingTheme, setIsAnimatingTheme] = useState(false);
//   const [themeConfig, setThemeConfigState] = useState({
//     animationDuration: 300,
//     useSystemTheme: true,
//     preferDarkTheme: false,
//     ...initialThemeConfig,
//   });

//   // Fonction pour résoudre le thème effectif
//   const resolveEffectiveTheme = (theme: ThemeType): ThemeType => {
//     if (theme === "system") {
//       return systemColorScheme === "dark" ? "dark" : "light";
//     }
//     return theme;
//   };

//   // Fonction pour obtenir les couleurs du thème actuel
//   const getActiveThemeColors = (): ThemeColors => {
//     const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
//     console.log('Current theme:', currentTheme);
//     console.log('Effective theme:', effectiveTheme);
//     console.log('System color scheme:', systemColorScheme);
    
//     // Vérifier d'abord les thèmes personnalisés
//     if (customThemes[effectiveTheme]) {
//       console.log('Using custom theme:', effectiveTheme);
//       return customThemes[effectiveTheme];
//     }
    
//     // Ensuite les thèmes par défaut
//     if (defaultThemes[effectiveTheme]) {
//       console.log('Using default theme:', effectiveTheme);
//       return defaultThemes[effectiveTheme];
//     }
    
//     // Fallback sur le thème préféré
//     console.log('Using fallback theme');
//     return themeConfig.preferDarkTheme ? defaultThemes.dark : defaultThemes.light;
//   };

//   // Fonction pour déterminer si le thème est sombre
//   const getIsDark = (): boolean => {
//     const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
//     // Thèmes explicitement sombres
//     const darkThemes = ["dark", "premium", "nightshift", "materialYou"];
//     const lightThemes = ["light", "pastel"];
    
//     if (darkThemes.includes(effectiveTheme)) {
//       return true;
//     }
    
//     if (lightThemes.includes(effectiveTheme)) {
//       return false;
//     }
    
//     // Pour les thèmes personnalisés, analyser la couleur de fond
//     if (customThemes[effectiveTheme]) {
//       const theme = customThemes[effectiveTheme];
//       const bg = Array.isArray(theme.background) ? theme.background[0] : theme.background;

//       // Calculer la luminosité
//       const hex = bg.replace('#', '');
//       if (hex.length === 6) {
//         const r = parseInt(hex.substr(0, 2), 16);
//         const g = parseInt(hex.substr(2, 2), 16);
//         const b = parseInt(hex.substr(4, 2), 16);
//         const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
//         return luminance < 0.5;
//       }
//     }
//     return false;
//   };
//   const theme = useMemo(() => getActiveThemeColors(), [
//   currentTheme,
//   customThemes,
//   systemColorScheme,
//   themeConfig.preferDarkTheme,
// ]);

// const isDark = useMemo(() => getIsDark(), [
//   currentTheme,
//   customThemes,
//   systemColorScheme,
// ]);

//   // const theme = getActiveThemeColors();
//   // const isDark = getIsDark();

//   // Chargement des données sauvegardées
//   useEffect(() => {
//     const loadSavedPreferences = async () => {
//       try {
//         // Chargement du thème
//         const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
//         if (savedTheme !== null) {
//           console.log('Loaded theme from storage:', savedTheme);
//           setCurrentTheme(savedTheme as ThemeType);
//         }

//         // Chargement des thèmes personnalisés
//         const savedCustomThemes = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
//         if (savedCustomThemes !== null) {
//           const parsed = JSON.parse(savedCustomThemes);
//           console.log('Loaded custom themes from storage:', Object.keys(parsed));
//           setCustomThemes(parsed);
//         } else if (Object.keys(initialCustomThemes).length > 0) {
//           // Traitement des thèmes personnalisés initiaux
//           const processedThemes: Record<string, ThemeColors> = {};
//           Object.entries(initialCustomThemes).forEach(([name, partialTheme]) => {
//             processedThemes[name] = {
//               ...defaultThemes.light,
//               ...partialTheme,
//             } as ThemeColors;
//           });
//           setCustomThemes(processedThemes);
//         }

//         // Chargement de la configuration
//         const savedThemeConfig = await AsyncStorage.getItem(THEME_CONFIG_STORAGE_KEY);
//         if (savedThemeConfig !== null) {
//           const parsed = JSON.parse(savedThemeConfig);
//           console.log('Loaded theme config from storage:', parsed);
//           setThemeConfigState(prev => ({
//             ...prev,
//             ...parsed,
//           }));
//         }
//       } catch (error) {
//         console.error("Erreur lors du chargement des préférences de thème:", error);
//       }
//     };

//     loadSavedPreferences();
//   }, []);

//   // Sauvegarde du thème actuel
//   useEffect(() => {
//     const saveTheme = async () => {
//       try {
//         await AsyncStorage.setItem(THEME_STORAGE_KEY, currentTheme);
//         console.log('Theme saved to storage:', currentTheme);
//       } catch (error) {
//         console.error("Erreur lors de l'enregistrement du thème:", error);
//       }
//     };

//     saveTheme();
//   }, [currentTheme]);

//   // Sauvegarde des thèmes personnalisés
//   useEffect(() => {
//     const saveCustomThemes = async () => {
//       try {
//         await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customThemes));
//         console.log('Custom themes saved to storage');
//       } catch (error) {
//         console.error("Erreur lors de l'enregistrement des thèmes personnalisés:", error);
//       }
//     };

//     if (Object.keys(customThemes).length > 0) {
//       saveCustomThemes();
//     }
//   }, [customThemes]);

//   // Sauvegarde de la configuration
//   useEffect(() => {
//     const saveThemeConfig = async () => {
//       try {
//         await AsyncStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(themeConfig));
//         console.log('Theme config saved to storage');
//       } catch (error) {
//         console.error("Erreur lors de l'enregistrement de la configuration:", error);
//       }
//     };

//     saveThemeConfig();
//   }, [themeConfig]);

//   // Gestion de l'animation
//   useEffect(() => {
//     let timeout: NodeJS.Timeout;
//     if (isAnimatingTheme) {
//       timeout = setTimeout(() => {
//         setIsAnimatingTheme(false);
//       }, themeConfig.animationDuration);
//     }
//     return () => clearTimeout(timeout);
//   }, [isAnimatingTheme, themeConfig.animationDuration]);

//   // Fonction toggle corrigée
//   const toggleTheme = () => {
//     console.log('Toggle theme called, current:', currentTheme);
//     setIsAnimatingTheme(true);
    
//     try {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     } catch (error) {
//       console.warn('Haptics not available:', error);
//     }
    
//     if (currentTheme === "system") {
//       // Basculer vers l'opposé du système
//       const newTheme = systemColorScheme === "dark" ? "light" : "dark";
//       console.log('Switching from system to:', newTheme);
//       setCurrentTheme(newTheme);
//     } else {
//       // Basculer entre light et dark
//       const newTheme = isDark ? "light" : "dark";
//       console.log('Switching to:', newTheme);
//       setCurrentTheme(newTheme);
//     }
//   };

//   // Fonction setTheme corrigée
//   const setTheme = (newTheme: ThemeType) => {
//     console.log('Set theme called:', newTheme);
//     if (newTheme !== currentTheme) {
//       setIsAnimatingTheme(true);
      
//       try {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       } catch (error) {
//         console.warn('Haptics not available:', error);
//       }
      
//       setCurrentTheme(newTheme);
//     }
//   };

//   // Ajouter un thème personnalisé
//   const addCustomTheme = (name: string, colors: Partial<ThemeColors>) => {
//     const reservedNames = ["system", "dark", "light", "premium", "pastel", "nightshift", "materialYou"];
    
//     if (!name || reservedNames.includes(name)) {
//       console.warn("Le nom du thème est invalide ou réservé:", name);
//       return;
//     }
    
//     const baseTheme = isDark ? defaultThemes.dark : defaultThemes.light;
//     const newTheme: ThemeColors = { ...baseTheme, ...colors };
    
//     // Garantir que background est un tableau
//     if (colors.background && !Array.isArray(colors.background)) {
//       newTheme.background = [colors.background as string, colors.background as string];
//     }
    
//     setCustomThemes(prev => ({
//       ...prev,
//       [name]: newTheme
//     }));
    
//     console.log('Custom theme added:', name);
//   };

//   // Mettre à jour un thème personnalisé
//   const updateCustomTheme = (name: string, colors: Partial<ThemeColors>) => {
//     if (!customThemes[name]) {
//       console.warn(`Le thème '${name}' n'existe pas`);
//       return;
//     }
    
//     const updatedTheme = { ...customThemes[name], ...colors };
    
//     if (colors.background && !Array.isArray(colors.background)) {
//       updatedTheme.background = [colors.background as string, colors.background as string];
//     }
    
//     setCustomThemes(prev => ({
//       ...prev,
//       [name]: updatedTheme
//     }));
    
//     console.log('Custom theme updated:', name);
//   };

//   // Supprimer un thème personnalisé
//   const removeCustomTheme = (name: string) => {
//     if (!customThemes[name]) {
//       console.warn(`Le thème '${name}' n'existe pas`);
//       return;
//     }
    
//     if (currentTheme === name) {
//       setCurrentTheme("system");
//     }
    
//     setCustomThemes(prev => {
//       const newThemes = { ...prev };
//       delete newThemes[name];
//       return newThemes;
//     });
    
//     console.log('Custom theme removed:', name);
//   };

//   // Mise à jour de la configuration
//   const setThemeConfig = (config: Partial<ThemeContextType['themeConfig']>) => {
//     setThemeConfigState(prev => ({
//       ...prev,
//       ...config
//     }));
    
//     console.log('Theme config updated:', config);
//   };

//   // Valeur du contexte
//   const contextValue: ThemeContextType = {
//     currentTheme,
//     theme,
//     isDark,
//     isAnimatingTheme,
//     toggleTheme,
//     setTheme,
//     themes: { ...defaultThemes, ...customThemes },
//     customThemes,
//     addCustomTheme,
//     removeCustomTheme,
//     updateCustomTheme,
//     themeConfig,
//     setThemeConfig,
//   };

//   return (
//     <ThemeContext.Provider value={contextValue}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

import React, { useState, useEffect, createContext, useMemo, useCallback, useRef } from "react";
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
    preferDarkTheme: false,
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
  initialTheme = "system",
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
    preferDarkTheme: false,
    ...initialThemeConfig,
  });

  // Refs pour éviter les sauvegardes lors du chargement initial
  const isInitialized = useRef(false);
  const isLoadingInitial = useRef(true);

  // Fonction pour résoudre le thème effectif
  const resolveEffectiveTheme = useCallback((theme: ThemeType): ThemeType => {
    if (theme === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return theme;
  }, [systemColorScheme]);

  // Fonction pour obtenir les couleurs du thème actuel
  const getActiveThemeColors = useCallback((): ThemeColors => {
    const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
    // Vérifier d'abord les thèmes personnalisés
    if (customThemes[effectiveTheme]) {
      return customThemes[effectiveTheme];
    }
    
    // Ensuite les thèmes par défaut
    if (defaultThemes[effectiveTheme]) {
      return defaultThemes[effectiveTheme];
    }
    
    // Fallback sur le thème préféré
    return themeConfig.preferDarkTheme ? defaultThemes.dark : defaultThemes.light;
  }, [currentTheme, customThemes, resolveEffectiveTheme, themeConfig.preferDarkTheme]);

  // Fonction pour déterminer si le thème est sombre
  const getIsDark = useCallback((): boolean => {
    const effectiveTheme = resolveEffectiveTheme(currentTheme);
    
    // Thèmes explicitement sombres
    const darkThemes = ["dark", "premium", "nightshift", "materialYou"];
    const lightThemes = ["light", "pastel"];
    
    if (darkThemes.includes(effectiveTheme)) {
      return true;
    }
    
    if (lightThemes.includes(effectiveTheme)) {
      return false;
    }
    
    // Pour les thèmes personnalisés, analyser la couleur de fond
    if (customThemes[effectiveTheme]) {
      const theme = customThemes[effectiveTheme];
      const bg = Array.isArray(theme.background) ? theme.background[0] : theme.background;
      
      // Calculer la luminosité
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

  // Memoisation des valeurs principales
  const theme = useMemo(() => getActiveThemeColors(), [getActiveThemeColors]);
  const isDark = useMemo(() => getIsDark(), [getIsDark]);

  // Chargement des données sauvegardées (une seule fois)
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        // Chargement du thème
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          console.log('Loaded theme from storage:', savedTheme);
          setCurrentTheme(savedTheme as ThemeType);
        }

        // Chargement des thèmes personnalisés
        const savedCustomThemes = await AsyncStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
        if (savedCustomThemes !== null) {
          const parsed = JSON.parse(savedCustomThemes);
          console.log('Loaded custom themes from storage:', Object.keys(parsed));
          setCustomThemes(parsed);
        } else if (Object.keys(initialCustomThemes).length > 0) {
          // Traitement des thèmes personnalisés initiaux
          const processedThemes: Record<string, ThemeColors> = {};
          
          Object.entries(initialCustomThemes).forEach(([name, partialTheme]) => {
            processedThemes[name] = {
              ...defaultThemes.light,
              ...partialTheme,
            } as ThemeColors;
          });
          
          setCustomThemes(processedThemes);
        }

        // Chargement de la configuration
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
        console.error("Erreur lors du chargement des préférences de thème:", error);
      } finally {
        isLoadingInitial.current = false;
        isInitialized.current = true;
      }
    };

    if (!isInitialized.current) {
      loadSavedPreferences();
    }
  }, []); // Dépendances vides pour ne s'exécuter qu'une fois

  // Sauvegarde du thème actuel (seulement après l'initialisation)
  useEffect(() => {
    const saveTheme = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, currentTheme);
        console.log('Theme saved to storage:', currentTheme);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du thème:", error);
      }
    };

    if (isInitialized.current) {
      saveTheme();
    }
  }, [currentTheme]);

  // Sauvegarde des thèmes personnalisés (seulement après l'initialisation)
  useEffect(() => {
    const saveCustomThemes = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(customThemes));
        console.log('Custom themes saved to storage');
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des thèmes personnalisés:", error);
      }
    };

    if (isInitialized.current && Object.keys(customThemes).length > 0) {
      saveCustomThemes();
    }
  }, [customThemes]);

  // Sauvegarde de la configuration (seulement après l'initialisation)
  useEffect(() => {
    const saveThemeConfig = async () => {
      if (isLoadingInitial.current) return;
      
      try {
        await AsyncStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(themeConfig));
        console.log('Theme config saved to storage');
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la configuration:", error);
      }
    };

    if (isInitialized.current) {
      saveThemeConfig();
    }
  }, [themeConfig]);

  // Gestion de l'animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isAnimatingTheme) {
      timeout = setTimeout(() => {
        setIsAnimatingTheme(false);
      }, themeConfig.animationDuration);
    }
    return () => clearTimeout(timeout);
  }, [isAnimatingTheme, themeConfig.animationDuration]);

  // Fonction toggle avec useCallback
  const toggleTheme = useCallback(() => {
    console.log('Toggle theme called, current:', currentTheme);
    setIsAnimatingTheme(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
    
    if (currentTheme === "system") {
      // Basculer vers l'opposé du système
      const newTheme = systemColorScheme === "dark" ? "light" : "dark";
      console.log('Switching from system to:', newTheme);
      setCurrentTheme(newTheme);
    } else {
      // Basculer entre light et dark
      const newTheme = isDark ? "light" : "dark";
      console.log('Switching to:', newTheme);
      setCurrentTheme(newTheme);
    }
  }, [currentTheme, systemColorScheme, isDark]);

  // Fonction setTheme avec useCallback
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

  // Ajouter un thème personnalisé
  const addCustomTheme = useCallback((name: string, colors: Partial<ThemeColors>) => {
    const reservedNames = ["system", "dark", "light", "premium", "pastel", "nightshift", "materialYou"];
    
    if (!name || reservedNames.includes(name)) {
      console.warn("Le nom du thème est invalide ou réservé:", name);
      return;
    }
    
    const baseTheme = isDark ? defaultThemes.dark : defaultThemes.light;
    const newTheme: ThemeColors = { ...baseTheme, ...colors };
    
    // Garantir que background est un tableau
    if (colors.background && !Array.isArray(colors.background)) {
      newTheme.background = [colors.background as string, colors.background as string];
    }
    
    setCustomThemes(prev => ({
      ...prev,
      [name]: newTheme
    }));
    
    console.log('Custom theme added:', name);
  }, [isDark]);

  // Mettre à jour un thème personnalisé
  const updateCustomTheme = useCallback((name: string, colors: Partial<ThemeColors>) => {
    setCustomThemes(prev => {
      if (!prev[name]) {
        console.warn(`Le thème '${name}' n'existe pas`);
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

  // Supprimer un thème personnalisé
  const removeCustomTheme = useCallback((name: string) => {
    setCustomThemes(prev => {
      if (!prev[name]) {
        console.warn(`Le thème '${name}' n'existe pas`);
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

  // Mise à jour de la configuration
  const setThemeConfig = useCallback((config: Partial<ThemeContextType['themeConfig']>) => {
    setThemeConfigState(prev => ({
      ...prev,
      ...config
    }));
    
    console.log('Theme config updated:', config);
  }, []);

  // Valeur du contexte memoized
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