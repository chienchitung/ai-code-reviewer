import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CodeReviewer from './components/reviewer/CodeReviewer';
import Settings from './components/settings/Settings';
import { View, Review } from './types';
import { MenuIcon, XIcon } from './components/ui/Icons';

function App() {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const savedReviews = localStorage.getItem('codeReviewHistory');
      return savedReviews ? JSON.parse(savedReviews) : [];
    } catch (error) {
      console.error("Failed to parse reviews from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('codeReviewHistory', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (reviewData: Omit<Review, 'id' | 'timestamp'>) => {
    const newReview: Review = {
      ...reviewData,
      id: new Date().toISOString() + Math.random(),
      timestamp: Date.now(),
    };
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };


  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard reviews={reviews} />;
      case View.Reviewer:
        return <CodeReviewer addReview={addReview} />;
      case View.Settings:
        return <Settings />;
      default:
        return <Dashboard reviews={reviews} />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <div
            className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
              isSidebarOpen ? 'block' : 'hidden'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-500 dark:text-gray-400 focus:outline-none"
              >
                {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </Header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {renderView()}
            </main>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;