import React, { Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Lazy load the map component
const InteractiveMap = React.lazy(() => import('./InteractiveMap'));

const LazyInteractiveMap: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Suspense 
      fallback={
        <div className="w-full h-96 lg:h-[500px] bg-primary-100 dark:bg-primary-800 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
            <p className="text-primary-600 dark:text-primary-400">
              {language === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}
            </p>
          </div>
        </div>
      }
    >
      <InteractiveMap />
    </Suspense>
  );
};

export default LazyInteractiveMap; 