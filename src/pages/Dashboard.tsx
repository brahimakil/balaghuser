import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import LazyInteractiveMap from '../components/LazyInteractiveMap';
import MartyrsGrid from '../components/MartyrsGrid';
import ActivitiesGrid from '../components/ActivitiesGrid';
import { useDashboardData } from '../hooks/useDashboardData';
import { scrollToElement } from '../utils/scrollUtils';

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { martyrs, activities, martyrsLoading, activitiesLoading, error } = useDashboardData();
  const [searchParams] = useSearchParams();

  // Check if we need to scroll to map
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      // Small delay to ensure the page is fully loaded and lazy components are mounted
      const timer = setTimeout(() => {
        // Calculate offset to show the section title and some spacing
        const headerHeight = 80; // Header height
        const newsTickerHeight = 52; // News ticker height
        const extraPadding = 40; // Extra padding to show the section title nicely
        const totalOffset = headerHeight + newsTickerHeight + extraPadding;
        
        scrollToElement('interactive-map-section', totalOffset);
      }, 800); // Increased delay for lazy loading

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner - Loads first with page settings */}
      <HeroBanner 
        pageId="home"
        fallbackTitle={t('dashboard.title')}
        fallbackDescription={t('dashboard.subtitle')}
      />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Interactive Map Section - RIGHT AFTER BANNER */}
        <div id="interactive-map-section" className="scroll-mt-32">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
              {isRTL ? 'خريطة المواقع' : 'Locations Map'}
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              {isRTL ? 'استكشف المواقع المهمة على الخريطة' : 'Explore important locations on the map'}
            </p>
          </div>
          <LazyInteractiveMap />
        </div>

        {/* Martyrs Section - After map */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
              {isRTL ? 'شهداؤنا' : 'Our Martyrs'}
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              {isRTL ? 'نتذكر الأرواح الشجاعة التي ضحت من أجل حريتنا' : 'Remembering the brave souls who sacrificed for our freedom'}
            </p>
          </div>
          <MartyrsGrid martyrs={martyrs} loading={martyrsLoading} />
        </div>

        {/* Today's Activities Section - After martyrs */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
              {isRTL ? 'أنشطة اليوم' : 'Today\'s Activities'}
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              {isRTL ? 'الأنشطة والفعاليات المجدولة لهذا اليوم' : 'Activities and events scheduled for today'}
            </p>
          </div>
          <ActivitiesGrid activities={activities} loading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
