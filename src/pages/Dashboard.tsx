import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import LazyInteractiveMap from '../components/LazyInteractiveMap';
import MartyrsGrid from '../components/MartyrsGrid';
import ActivitiesGrid from '../components/ActivitiesGrid';
import { useDashboardData } from '../hooks/useDashboardData';
import { getMainSettings } from '../services/websiteSettingsService';
import { scrollToElement } from '../utils/scrollUtils';
import DynamicPageSections from '../components/DynamicPageSections';
import { useDynamicPagesData } from '../hooks/useDynamicPagesData';

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { martyrs, activities, martyrsLoading, activitiesLoading, error } = useDashboardData();
  const [searchParams] = useSearchParams();
  
  // NEW: Section ordering state
  const [sectionOrder, setSectionOrder] = useState({
    map: 1,
    martyrs: 2,
    activities: 3,
    dynamicPages: 4 // NEW default
  });

  const { dynamicPages, dynamicPagesLoading } = useDynamicPagesData();

  // Load section order from website settings
  useEffect(() => {
    const loadSectionOrder = async () => {
      try {
        const settings = await getMainSettings();
        if (settings?.sectionOrder) {
          setSectionOrder(settings.sectionOrder);
        }
      } catch (error) {
        console.error('Error loading section order:', error);
      }
    };
    loadSectionOrder();
  }, []);

  // Check if we need to scroll to map
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      const timer = setTimeout(() => {
        const headerHeight = 80;
        const newsTickerHeight = 52;
        const extraPadding = 40;
        const totalOffset = headerHeight + newsTickerHeight + extraPadding;
        
        scrollToElement('interactive-map-section', totalOffset);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Create ordered sections
  const orderedSections = useMemo(() => {
    const sections = [
      {
        id: 'map',
        order: sectionOrder.map,
        component: (
          <div key="map" id="interactive-map-section" className="scroll-mt-32">
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
        )
      },
      {
        id: 'martyrs',
        order: sectionOrder.martyrs,
        component: (
          <div key="martyrs">
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
        )
      },
      {
        id: 'activities',
        order: sectionOrder.activities,
        component: (
          <div key="activities">
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
        )
      },
      // Add dynamic pages section
      { 
        id: 'dynamicPages', 
        order: sectionOrder.dynamicPages || 4, // Default order 4
        component: (
          <section key="dynamic-pages" className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold text-primary-900 dark:text-white ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {t('dashboard.customPagesTitle')}
                </h2>
              </div>
              <DynamicPageSections 
                pages={dynamicPages} 
                loading={dynamicPagesLoading} 
              />
            </div>
          </section>
        )
      }
    ];

    // Sort sections by order
    return sections.sort((a, b) => a.order - b.order);
  }, [sectionOrder, isRTL, martyrs, martyrsLoading, activities, activitiesLoading, dynamicPages, dynamicPagesLoading]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner - Always first */}
      <HeroBanner 
        pageId="home"
        fallbackTitle={t('dashboard.title')}
        fallbackDescription={t('dashboard.subtitle')}
      />

      {/* Dynamic Ordered Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {orderedSections.map(section => section.component)}
      </div>
    </div>
  );
};

export default Dashboard;
