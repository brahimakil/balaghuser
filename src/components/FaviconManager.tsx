import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getMainSettings } from '../services/websiteSettingsService';

const FaviconManager: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const mainSettings = await getMainSettings();
        
        if (mainSettings && mainSettings.mainLogoLight && mainSettings.mainLogoDark) {
          // Select logo based on theme (opposite of header logic since favicon should contrast with browser UI)
          const logoUrl = theme === 'dark' ? mainSettings.mainLogoLight : mainSettings.mainLogoDark;
          
          // Remove existing favicon
          const existingFavicon = document.querySelector('link[rel="icon"]');
          if (existingFavicon) {
            existingFavicon.remove();
          }
          
          // Create new favicon
          const favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.type = 'image/png';
          favicon.href = logoUrl;
          
          // Add to head
          document.head.appendChild(favicon);
          
          console.log(`Favicon updated for ${theme} theme:`, logoUrl);
        }
      } catch (error) {
        console.error('Error updating favicon:', error);
        // Keep default favicon on error
      }
    };

    updateFavicon();
  }, [theme]);

  return null; // This component doesn't render anything
};

export default FaviconManager; 