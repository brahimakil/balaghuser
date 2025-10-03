import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import LazyInteractiveMap from '../components/LazyInteractiveMap';
import MartyrsGrid from '../components/MartyrsGrid';
import ActivitiesGrid from '../components/ActivitiesGrid';
import { useDashboardData } from '../hooks/useDashboardData';
import { getDashboardSections, type DashboardSection } from '../services/websiteSettingsService';
import { getDynamicPageById, getSelectedSectionsFromPage, type DynamicPage } from '../services/dynamicPagesService';
import { scrollToElement } from '../utils/scrollUtils';
import DynamicPageSections from '../components/DynamicPageSections';

const Dashboard: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { martyrs, activities, martyrsLoading, activitiesLoading, error } = useDashboardData();
  const [searchParams] = useSearchParams();
  
  // NEW: Dashboard sections configuration
  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>([]);
  const [dynamicPagesCache, setDynamicPagesCache] = useState<Record<string, DynamicPage>>({});
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Load dashboard sections configuration
  useEffect(() => {
    const loadDashboardSections = async () => {
      try {
        setSectionsLoading(true);
        const sections = await getDashboardSections();
        setDashboardSections(sections);
        
        // Preload dynamic pages that are referenced
        const pageIds = new Set<string>();
        sections.forEach(section => {
          if (section.dynamicPageId) {
            pageIds.add(section.dynamicPageId);
          }
          if (section.parentPageId) {
            pageIds.add(section.parentPageId);
          }
        });
        
        // Fetch all referenced dynamic pages
        const pagesData: Record<string, DynamicPage> = {};
        await Promise.all(
          Array.from(pageIds).map(async (pageId) => {
            const page = await getDynamicPageById(pageId);
            if (page) {
              pagesData[pageId] = page;
            }
          })
        );
        
        setDynamicPagesCache(pagesData);
      } catch (error) {
        console.error('Error loading dashboard sections:', error);
      } finally {
        setSectionsLoading(false);
      }
    };
    loadDashboardSections();
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

  // Render a single section based on its configuration
  const renderSection = (section: DashboardSection) => {
    if (!section.isVisible) return null;

    switch (section.type) {
      case 'fixed':
        return renderFixedSection(section);
      
      case 'dynamicPage':
        return renderDynamicPage(section);
      
      case 'dynamicSection':
        return renderDynamicSection(section);
      
      default:
        return null;
    }
  };

  // Render fixed sections (map, martyrs, activities)
  const renderFixedSection = (section: DashboardSection) => {
    switch (section.fixedSectionId) {
      case 'map':
        return (
          <div key={section.id} id="interactive-map-section" className="scroll-mt-32">
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
        );
      
      case 'martyrs':
        return (
          <div key={section.id}>
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
        );
      
      case 'activities':
        return (
          <div key={section.id}>
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
        );
      
      default:
        return null;
    }
  };

  // Render a full dynamic page
  const renderDynamicPage = (section: DashboardSection) => {
    if (!section.dynamicPageId) return null;
    
    const page = dynamicPagesCache[section.dynamicPageId];
    if (!page) return null;

    // Create a modified page object with all sections selected
    const pageWithAllSections: DynamicPage = {
      ...page,
      selectedSectionsForAdmin: page.sections.map(s => s.id)
    };

    return (
      <div key={section.id}>
        <DynamicPageSections 
          pages={[pageWithAllSections]} 
          loading={false} 
        />
      </div>
    );
  };

  // Render a specific section from a dynamic page
  const renderDynamicSection = (section: DashboardSection) => {
    if (!section.parentPageId || !section.dynamicSectionId) return null;
    
    const page = dynamicPagesCache[section.parentPageId];
    if (!page) return null;

    // Create a modified page object with only the selected section
    const pageWithSelectedSection: DynamicPage = {
      ...page,
      selectedSectionsForAdmin: [section.dynamicSectionId]
    };

    return (
      <div key={section.id}>
        <DynamicPageSections 
          pages={[pageWithSelectedSection]} 
          loading={false} 
        />
      </div>
    );
  };

  // Sort visible sections by order
  const sortedSections = useMemo(() => {
    return dashboardSections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order);
  }, [dashboardSections]);

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
        {sectionsLoading ? (
          // Loading skeleton
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-8 bg-primary-200 dark:bg-primary-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-primary-200 dark:bg-primary-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          sortedSections.map(section => renderSection(section))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
