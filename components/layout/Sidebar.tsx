import React from 'react';
import { View } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { CodeIcon, CogIcon, DashboardIcon } from '../ui/Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-2 text-base font-normal rounded-lg transition-colors duration-150 ${
        isActive
          ? 'bg-primary-500 text-white'
          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const { t } = useLanguage();

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    if(window.innerWidth < 1024) { // Close sidebar on mobile after navigation
      setIsOpen(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-30 w-64 h-full transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative lg:flex-shrink-0`}
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg lg:shadow-none">
        <div className="flex items-center pl-2.5 mb-5">
          <svg className="w-8 h-8 mr-2 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/>
          </svg>
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">{t('appName')}</span>
        </div>
        <ul className="space-y-2">
          <NavItem
            icon={DashboardIcon}
            label={t('dashboard')}
            isActive={currentView === View.Dashboard}
            onClick={() => handleNavClick(View.Dashboard)}
          />
          <NavItem
            icon={CodeIcon}
            label={t('newReview')}
            isActive={currentView === View.Reviewer}
            onClick={() => handleNavClick(View.Reviewer)}
          />
          <NavItem
            icon={CogIcon}
            label={t('settings')}
            isActive={currentView === View.Settings}
            onClick={() => handleNavClick(View.Settings)}
          />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
