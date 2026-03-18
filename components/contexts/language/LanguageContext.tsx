import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import {
  LanguageCode,
  LanguageInfo,
  TranslationKeys,
  translations,
  languages,
  getLanguageInfo,
  isRTL,
} from '@/i18n/translations';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Helper type for nested key paths
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

export interface LanguageContextType {
  language: LanguageCode;
  languageInfo: LanguageInfo | undefined;
  isRTL: boolean;
  translations: TranslationKeys;
  availableLanguages: LanguageInfo[];
  setLanguage: (code: LanguageCode) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const defaultContextValue: LanguageContextType = {
  language: 'fr',
  languageInfo: languages[0],
  isRTL: false,
  translations: translations.fr,
  availableLanguages: languages,
  setLanguage: async () => {},
  t: () => '',
  isLoading: true,
};

export const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: LanguageCode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'fr',
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);
  const previousLanguage = useRef<LanguageCode>(defaultLanguage);

  // Load saved language preference
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && translations[savedLanguage as LanguageCode]) {
          setLanguageState(savedLanguage as LanguageCode);
          previousLanguage.current = savedLanguage as LanguageCode;
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    loadLanguage();
  }, []);

  // Handle RTL changes
  const handleRTLChange = useCallback(async (newLang: LanguageCode, oldLang: LanguageCode) => {
    const newIsRTL = isRTL(newLang);
    const oldIsRTL = isRTL(oldLang);

    if (newIsRTL !== oldIsRTL) {
      I18nManager.allowRTL(newIsRTL);
      I18nManager.forceRTL(newIsRTL);

      // For RTL changes to take effect, we need to reload the app
      // This is a React Native limitation
      try {
        if (Updates.reloadAsync) {
          // In production, reload the app
          // await Updates.reloadAsync();
          console.log('RTL changed, app reload may be needed');
        }
      } catch (error) {
        console.log('Updates not available in development');
      }
    }
  }, []);

  // Set language
  const setLanguage = useCallback(async (code: LanguageCode) => {
    if (!translations[code]) {
      console.warn(`Language ${code} not supported`);
      return;
    }

    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);

      // Handle RTL changes
      await handleRTLChange(code, previousLanguage.current);

      previousLanguage.current = language;
      setLanguageState(code);

      console.log(`Language changed to: ${code}`);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [language, handleRTLChange]);

  // Translation function with interpolation support
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to French if key not found
        result = translations.fr;
        for (const fallbackKey of keys) {
          if (result && typeof result === 'object' && fallbackKey in result) {
            result = result[fallbackKey];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    if (typeof result !== 'string') {
      console.warn(`Translation key ${key} does not resolve to a string`);
      return key;
    }

    // Handle interpolation
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      }, result);
    }

    return result;
  }, [language]);

  // Memoized context value
  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    languageInfo: getLanguageInfo(language),
    isRTL: isRTL(language),
    translations: translations[language],
    availableLanguages: languages,
    setLanguage,
    t,
    isLoading,
  }), [language, setLanguage, t, isLoading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
