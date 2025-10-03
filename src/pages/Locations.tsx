import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Filter, Eye, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocationsData } from '../hooks/useLocationsData';
import HeroBanner from '../components/HeroBanner';
import { createLocationSlug } from '../services/locationsService';

const Locations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, isRTL } = useLanguage();
  const { locations, legends, getLegendById, loading, error } = useLocationsData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLegend, setSelectedLegend] = useState<string>('');

  // Filter locations based on search and legend
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = searchTerm === '' || 
        (language === 'ar' ? location.nameAr : location.nameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (language === 'ar' ? location.descriptionAr : location.descriptionEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchesLegend = selectedLegend === '' || location.legendId === selectedLegend;
      
      return matchesSearch && matchesLegend;
    });
  }, [locations, searchTerm, selectedLegend, language]);

  const handleViewOnMap = (locationId: string) => {
    navigate(`/?location=${locationId}`);
  };

  const handleViewLocation = (location: Location) => {
    const slug = createLocationSlug(location);
    navigate(`/locations/${slug}`);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="locations"
          fallbackTitle={language === 'ar' ? 'المواقع التاريخية' : 'Historic Locations'}
          fallbackDescription={language === 'ar' ? 'استكشف الأماكن المهمة التي شكلت تاريخنا وتراثنا' : 'Explore the significant places that shaped our history and heritage'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 animate-pulse">
                <div className="h-48 bg-primary-200 dark:bg-primary-700 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded mb-3"></div>
                  <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded mb-2"></div>
                  <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <HeroBanner 
        pageId="locations"
        fallbackTitle={language === 'ar' ? 'المواقع التاريخية' : 'Historic Locations'}
        fallbackDescription={language === 'ar' ? 'استكشف الأماكن المهمة التي شكلت تاريخنا وتراثنا' : 'Explore the significant places that shaped our history and heritage'}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في المواقع...' : 'Search locations...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white placeholder-primary-500 dark:placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
            
            {/* Legend Filter */}
            <div className="lg:w-64">
              <select
                value={selectedLegend}
                onChange={(e) => setSelectedLegend(e.target.value)}
                className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="">
                  {language === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
                </option>
                {legends.map((legend) => (
                  <option key={legend.id} value={legend.id}>
                    {language === 'ar' ? legend.nameAr : legend.nameEn}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center px-4 py-3 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
              <Filter className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {filteredLocations.length} {language === 'ar' ? 'موقع' : 'locations'}
              </span>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد مواقع' : 'No Locations Found'}
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              {language === 'ar' ? 'جرب تغيير مصطلحات البحث أو المرشحات' : 'Try adjusting your search terms or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => {
              const legend = getLegendById(location.legendId);
              const name = language === 'ar' ? location.nameAr : location.nameEn;
              const description = language === 'ar' ? location.descriptionAr : location.descriptionEn;
              const legendName = legend ? (language === 'ar' ? legend.nameAr : legend.nameEn) : '';

              return (
                <div
                  key={location.id}
                  className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-48">
                    {location.mainImage ? (
                      <img 
                        src={location.mainImage} 
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-accent-600 dark:text-accent-400" />
                      </div>
                    )}
                    
                    {/* Legend Badge */}
                    {legend && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center space-x-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                          {legend.mainIcon && (
                            <img src={legend.mainIcon} alt="" className="w-4 h-4 rounded-full" />
                          )}
                          <span className="font-medium">{legendName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-lg font-semibold text-primary-900 dark:text-white line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        {name}
                      </h3>
                    </div>
                    
                    <p className={`text-primary-600 dark:text-primary-400 text-sm mb-4 line-clamp-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-primary-500 dark:text-primary-400 mb-4">
                      <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewLocation(location)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {language === 'ar' ? 'عرض' : 'View'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleViewOnMap(location)}
                        className="flex items-center justify-center px-4 py-2 bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-600 transition-colors"
                        title={language === 'ar' ? 'عرض على الخريطة' : 'View on Map'}
                      >
                        <Navigation className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;