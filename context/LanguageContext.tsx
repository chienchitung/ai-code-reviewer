
import React, { createContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../constants';

type TranslationKey = keyof typeof translations[Language.EN];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || Language.EN;
  });

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations[Language.EN][key];
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
