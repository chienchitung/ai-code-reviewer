
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || Theme.System;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (newTheme: Theme) => {
      if (newTheme === Theme.System) {
        root.classList.toggle('dark', systemPrefersDark.matches);
      } else {
        root.classList.toggle('dark', newTheme === Theme.Dark);
      }
    };
    
    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === Theme.System) {
        root.classList.toggle('dark', e.matches);
      }
    };

    systemPrefersDark.addEventListener('change', handleChange);
    return () => systemPrefersDark.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
