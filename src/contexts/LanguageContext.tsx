import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKey, supportedLanguages } from '@/i18n/translations';
import { useLanguageDirection } from '@/hooks/useLanguageDirection';
import { useLanguageFont } from '@/hooks/useLanguageFont';
import { saveLanguagePreference, useLanguageSync } from '@/hooks/useLanguagePreference';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const validCodes = new Set(supportedLanguages.map(l => l.code));

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dhyaan-lang');
    if (saved && validCodes.has(saved as Language)) return saved as Language;
    return 'hi';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      // Try current language, fallback to English, fallback to key
      const langTranslations = translations[language as keyof typeof translations];
      if (langTranslations && key in langTranslations) {
        return (langTranslations as any)[key];
      }
      return (translations.en as any)[key] || key;
    },
    [language]
  );

  // Apply RTL direction and font loading
  useLanguageDirection(language);
  useLanguageFont(language);
  
  // Sync with Supabase on auth
  useLanguageSync(setLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
