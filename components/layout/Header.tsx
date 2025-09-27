
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        {children}
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200 ml-2 lg:ml-0">{t('projectTitle')}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
