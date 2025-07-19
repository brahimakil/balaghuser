import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Calendar, Info, Share } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import HeroBanner from '../components/HeroBanner';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { state, getLegendById } = useData();

  const location = state.locations.find(loc => loc.id === id);
  const legend = location ? getLegendById(location.legendId) : null;

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!location) {
    return (
      <div className="animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <MapPin className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
            {language === 'ar' ? 'الموقع غير موجود' : 'Location Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {language === 'ar' ? 'لم يتم العثور على الموقع المطلوب' : 'The requested location could not be found'}
          </p>
          <button
            onClick={() => navigate('/locations')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'ar' ? 'العودة للمواقع' : 'Back to Locations'}</span>
          </button>
        </div>
      </div>
    );
  }

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `${language === 'ar' ? 'استكشف موقع' : 'Explore location'} ${name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };
  const name = language === 'ar' ? location.nameAr : location.nameEn;
  const description = language === 'ar' ? location.descriptionAr : location.descriptionEn;
  const legendName = legend ? (language === 'ar' ? legend.nameAr : legend.nameEn) : '';
  const legendDescription = legend ? (language === 'ar' ? legend.descriptionAr : legend.descriptionEn) : '';


  const handleViewOnMap = () => {
    // Navigate to dashboard with location query parameter
    navigate(`/?location=${location.id}`);
  };

  const handleBackToLocations = () => {
    navigate('/locations');
  };
  

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] min-h-[300px] overflow-hidden">
        {location.mainImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${location.mainImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-800 via-accent-700 to-accent-900" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative h-full flex items-end px-4 sm:px-6 lg:px-8 pb-8">
          <div className={`max-w-4xl ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={handleBackToLocations}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">{language === 'ar' ? 'المواقع' : 'Locations'}</span>
                </button>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                {name}
              </h1>
              
              {legend && (
                <div className="flex items-center space-x-3">
                  {legend.mainIcon && (
                    <img src={legend.mainIcon} alt="" className="w-8 h-8 rounded-full border-2 border-white/50" />
                  )}
                  <span className="text-lg text-white/90 font-medium">{legendName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'حول هذا الموقع' : 'About This Location'}
              </h2>
              <p className={`text-primary-600 dark:text-primary-300 leading-relaxed text-lg ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {description}
              </p>
            </div>

            {/* Legend Information */}
            {legend && (
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  {legend.mainIcon && (
                    <img src={legend.mainIcon} alt="" className="w-12 h-12 rounded-full border border-primary-300 dark:border-primary-600" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">{legendName}</h3>
                    <p className="text-sm text-primary-500 dark:text-primary-400">
                      {language === 'ar' ? 'تصنيف الموقع' : 'Location Category'}
                    </p>
                  </div>
                </div>
                <p className={`text-primary-600 dark:text-primary-300 leading-relaxed ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {legendDescription}
                </p>
              </div>
            )}

            {/* Additional Images Section - Placeholder for future enhancement */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.mainImage && (
                  <img 
                    src={location.mainImage} 
                    alt={name}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                )}
                {/* Placeholder for additional images */}
                <div className="w-full h-32 bg-primary-100 dark:bg-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-primary-400 text-sm">
                    {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleViewOnMap}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'عرض على الخريطة' : 'View on Map'}</span>
                </button>
                
                <button 
                  onClick={handleShareLocation}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'مشاركة الموقع' : 'Share Location'}</span>
                </button>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل الموقع' : 'Location Details'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'خط العرض:' : 'Latitude:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'خط الطول:' : 'Longitude:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {location.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'التصنيف:' : 'Category:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {legendName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {location.createdAt?.toDate?.()?.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail; 