import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.dashboard'), href: '/', key: 'dashboard' },
    { name: t('navigation.locations'), href: '/locations', key: 'locations' },
    { name: t('navigation.martyrs'), href: '/martyrs', key: 'martyrs' },
    { name: t('navigation.activities'), href: '/activities', key: 'activities' },
    { name: t('navigation.news'), href: '/news', key: 'news' }, // Add this line
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-200 dark:border-primary-700 bg-white/80 dark:bg-primary-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold text-primary-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              Balagh User
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                    : 'text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors flex items-center space-x-1"
              aria-label={t('common.language')}
            >
              <Globe size={20} />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-200 dark:border-primary-700 animate-slide-down">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                      : 'text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 hover:text-primary-900 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 