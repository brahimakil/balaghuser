import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image, Video, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDynamicPageBySlug, type DynamicPage as DynamicPageType, type DynamicPageSection } from '../services/dynamicPagesService';
import MediaGallery from '../components/MediaGallery';

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [page, setPage] = useState<DynamicPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number = 0.4) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(0, 0, 0, ${alpha})`; // fallback to black
  };

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError('Invalid page slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const pageData = await getDynamicPageBySlug(slug);
        setPage(pageData);
      } catch (error) {
        console.error('Error fetching dynamic page:', error);
        setError('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
            {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  // Sort sections by order
  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);

  const renderSection = (section: DynamicPageSection) => {
    const title = language === 'ar' ? section.titleAr : section.titleEn;
    
    switch (section.type) {
      case 'text':
        const content = language === 'ar' ? section.contentAr : section.contentEn;
        return (
          <div key={section.id} className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-accent-600" />
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                {title}
              </h2>
            </div>
            <div 
              className="text-primary-700 dark:text-primary-300 leading-relaxed text-lg whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: content || '' }}
            />
          </div>
        );
        
      case 'photos':
        return (
          <div key={section.id} className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Image className="h-6 w-6 text-accent-600" />
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                {title}
              </h2>
            </div>
            <MediaGallery 
              photos={section.media || []} 
              videos={[]} 
            />
          </div>
        );
        
      case 'videos':
        return (
          <div key={section.id} className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="h-6 w-6 text-accent-600" />
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                {title}
              </h2>
            </div>
            <MediaGallery 
              photos={[]} 
              videos={section.media || []} 
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      {/* Custom Hero Banner for Dynamic Page */}
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        {page.bannerImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${page.bannerImage})` }}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900"
          />
        )}
        
        {/* Conditional Color Overlay - only show if showBannerOverlay is true */}
        {page.showBannerOverlay && page.bannerColorOverlay && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: hexToRgba(page.bannerColorOverlay, 0.6) }}
          />
        )}
        
        {/* Default overlay if no custom overlay is set */}
        {!page.showBannerOverlay && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        
        {/* Optional: Keep subtle gradients for visual polish */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        {/* Content positioned to the side */}
        <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl ${isRTL ? 'mr-auto text-right font-arabic' : 'ml-0 text-left'}`}>
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight drop-shadow-2xl animate-fade-in">
                <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                  {language === 'ar' ? page.bannerTitleAr : page.bannerTitleEn}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/95 leading-relaxed drop-shadow-lg animate-slide-up max-w-2xl">
                {language === 'ar' ? page.bannerTextAr : page.bannerTextEn}
              </p>
              
              {/* Decorative Element */}
              <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <div className="w-40 h-1.5 bg-gradient-to-r from-white/70 via-white/90 to-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-50 dark:from-primary-900 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className={`flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
        >
          {isRTL ? (
            <ArrowRight className="h-5 w-5" />
          ) : (
            <ArrowLeft className="h-5 w-5" />
          )}
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Page Title and Description */}
          <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6 mb-8">
            <h1 className={`text-3xl font-bold text-primary-900 dark:text-white mb-4 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
              {language === 'ar' ? page.titleAr : page.titleEn}
            </h1>
            <p className={`text-primary-700 dark:text-primary-300 leading-relaxed text-lg ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
              {language === 'ar' ? page.descriptionAr : page.descriptionEn}
            </p>
          </div>

          {/* Dynamic Sections */}
          <div className="space-y-8">
            {sortedSections.map(renderSection)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
