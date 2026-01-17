// Export all translations
export { fr, TranslationKeys } from './fr';
export { en } from './en';
export { es } from './es';
export { de } from './de';
export { ar } from './ar';

import { fr, TranslationKeys } from './fr';
import { en } from './en';
import { es } from './es';
import { de } from './de';
import { ar } from './ar';

export type LanguageCode = 'fr' | 'en' | 'es' | 'de' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export const languages: LanguageInfo[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
];

export const translations: Record<LanguageCode, TranslationKeys> = {
  fr,
  en,
  es,
  de,
  ar,
};

export const getTranslation = (lang: LanguageCode): TranslationKeys => {
  return translations[lang] || translations.fr;
};

export const getLanguageInfo = (code: LanguageCode): LanguageInfo | undefined => {
  return languages.find(lang => lang.code === code);
};

export const isRTL = (code: LanguageCode): boolean => {
  const lang = getLanguageInfo(code);
  return lang?.rtl || false;
};
