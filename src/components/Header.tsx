import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getMainSettings } from '../services/websiteSettingsService';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrls, setLogoUrls] = useState<{
    light: string;
    dark: string;
  } | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [menuColors, setMenuColors] = useState({
    normal: '#64748b', hover: '#3b82f6'
  });
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const location = useLocation();

  // Fetch logos from Firebase
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        setLogoLoading(true);
        console.log('Fetching main settings...'); // Debug log
        
        const mainSettings = await getMainSettings();
        console.log('Main settings result:', mainSettings); // Debug log
        
        if (mainSettings && mainSettings.mainLogoLight && mainSettings.mainLogoDark) {
          console.log('Setting logo URLs:', {
            light: mainSettings.mainLogoLight,
            dark: mainSettings.mainLogoDark
          }); // Debug log
          
          setLogoUrls({
            light: mainSettings.mainLogoLight,
            dark: mainSettings.mainLogoDark
          });
          setLogoError(false);
        } else {
          console.log('No logo URLs found in main settings');
          setLogoError(true);
        }
        if (mainSettings) {
          setMenuColors({
            normal: mainSettings.headerMenuColor || '#64748b',
            hover: mainSettings.headerMenuHoverColor || '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
        setLogoError(true);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogos();
  }, []);

  const navItems = [
    { key: 'dashboard', path: '/' },
    { key: 'locations', path: '/locations' },
    { key: 'martyrs', path: '/martyrs' },
    { key: 'activities', path: '/activities' },
    { key: 'news', path: '/news' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Determine which logo to use based on theme
  const getCurrentLogo = () => {
    if (!logoUrls) {
      return null;
    }
    
    // Use light logo for dark theme (light logo on dark background)
    // Use dark logo for light theme (dark logo on light background)
    const selectedLogo = theme === 'dark' ? logoUrls.light : logoUrls.dark;
    console.log(`Current theme: ${theme}, Selected logo: ${selectedLogo}`); // Debug log
    return selectedLogo;
  };

  const currentLogo = getCurrentLogo();

  const handleLogoLoadSuccess = () => {
    console.log('Logo loaded successfully');
    setLogoError(false);
  };

  const handleLogoLoadError = (e: any) => {
    console.error('Logo failed to load:', e);
    setLogoError(true);
  };

  // Show loading state
  if (logoLoading) {
    console.log('Logo is loading...');
  }

  // Debug: log current state
  console.log('Header render state:', {
    logoLoading,
    logoError,
    logoUrls,
    currentLogo,
    theme
  });

  return (
    <header className="bg-white dark:bg-primary-900 shadow-sm border-b border-primary-200 dark:border-primary-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {currentLogo && !logoError && !logoLoading ? (
              <img 
                src={currentLogo} 
                alt="Logo" 
                className="h-12 w-auto object-contain"
                onLoad={handleLogoLoadSuccess}
                onError={handleLogoLoadError}
              />
            ) : (
              <span className="text-xl font-bold text-primary-900 dark:text-white">
                {logoLoading ? 'Loading...' : 'Balagh User'}
              </span>
            )}
          </Link>

          {/* Navigation - Desktop */}
          <nav className={`hidden md:flex ${isRTL ? 'gap-8' : 'space-x-8'}`}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`font-medium transition-colors relative group ${
                  isActivePath(item.path) ? '' : ''
                }`}
                style={{ 
                  color: isActivePath(item.path) ? menuColors.hover : menuColors.normal 
                }}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label="Toggle language"
            >
              <div className="flex items-center space-x-1">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'EN' : 'ع'}
                </span>
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-200 dark:border-primary-700">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-medium'
                      : 'text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                  }`}
                >
                  {t(`navigation.${item.key}`)}
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