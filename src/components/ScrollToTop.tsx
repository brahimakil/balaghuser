import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Don't scroll to top if we're on dashboard with a location parameter
    const isLocationQuery = pathname === '/' && search.includes('location=');
    
    if (!isLocationQuery) {
      // Multiple attempts to ensure scrolling works
      const scrollToTop = () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      };

      // Immediate scroll
      scrollToTop();
      
      // Scroll after a short delay
      setTimeout(scrollToTop, 10);
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
    }
  }, [pathname, search]);

  // Also add a scroll on mount
  useEffect(() => {
    const scrollToTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    
    scrollToTop();
  }, []);

  return null;
};

export default ScrollToTop; 