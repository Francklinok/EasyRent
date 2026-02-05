import { useContext } from 'react';
import { LanguageContext, LanguageContextType, TranslationKey } from '../components/contexts/language/LanguageContext';

/**
 * Hook to access language context
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};

/**
 * Hook to get translation function only
 */
export const useTranslation = () => {
  const { t, language, isRTL } = useLanguage();
  return { t, language, isRTL };
};

/**
 * Hook to get available languages
 */
export const useAvailableLanguages = () => {
  const { availableLanguages, language, setLanguage } = useLanguage();
  return { availableLanguages, currentLanguage: language, setLanguage };
};

export type { TranslationKey };
