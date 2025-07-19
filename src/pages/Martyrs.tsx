  import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Filter, Eye, Heart, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMartyrsData } from '../hooks/useMartyrsData';
import HeroBanner from '../components/HeroBanner';

const Martyrs: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { martyrs, loading, error } = useMartyrsData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamilyStatus, setSelectedFamilyStatus] = useState<string>('');

  // Filter martyrs based on search and family status
  const filteredMartyrs = useMemo(() => {
    return martyrs.filter(martyr => {
      const matchesSearch = searchTerm === '' || 
        (language === 'ar' ? martyr.nameAr : martyr.nameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (language === 'ar' ? martyr.storyAr : martyr.storyEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (language === 'ar' ? martyr.warNameAr : martyr.warNameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchesFamilyStatus = selectedFamilyStatus === '' || martyr.familyStatus === selectedFamilyStatus;
      
      return matchesSearch && matchesFamilyStatus;
    });
  }, [martyrs, searchTerm, selectedFamilyStatus, language]);

  const handleViewMartyr = (martyrId: string) => {
    navigate(`/martyrs/${martyrId}`);
  };

  const getFamilyStatusText = (status: string) => {
    const statusMap = {
      single: { en: 'Single', ar: 'أعزب' },
      married: { en: 'Married', ar: 'متزوج' }
    };
    return statusMap[status as keyof typeof statusMap]?.[language] || status;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="martyrs"
          fallbackTitle={language === 'ar' ? 'شهداؤنا' : 'Our Martyrs'}
          fallbackDescription={language === 'ar' ? 'نتذكر الأرواح الشجاعة التي ضحت بحياتها من أجل حريتنا وكرامتنا' : 'Remembering the brave souls who sacrificed their lives for our freedom and dignity'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
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
        pageId="martyrs"
        fallbackTitle={language === 'ar' ? 'شهداؤنا' : 'Our Martyrs'}
        fallbackDescription={language === 'ar' ? 'نتذكر الأرواح الشجاعة التي ضحت بحياتها من أجل حريتنا وكرامتنا' : 'Remembering the brave souls who sacrificed their lives for our freedom and dignity'}
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
                placeholder={language === 'ar' ? 'البحث في الشهداء...' : 'Search martyrs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white placeholder-primary-500 dark:placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
            
            {/* Family Status Filter */}
            <div className="lg:w-64">
              <select
                value={selectedFamilyStatus}
                onChange={(e) => setSelectedFamilyStatus(e.target.value)}
                className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الحالات' : 'All Status'}
                </option>
                <option value="single">
                  {language === 'ar' ? 'أعزب' : 'Single'}
                </option>
                <option value="married">
                  {language === 'ar' ? 'متزوج' : 'Married'}
                </option>
              </select>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center px-4 py-3 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
              <Filter className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {filteredMartyrs.length} {language === 'ar' ? 'شهيد' : 'martyrs'}
              </span>
            </div>
          </div>
        </div>

        {/* Martyrs Grid */}
        {filteredMartyrs.length === 0 ? (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد شهداء' : 'No Martyrs Found'}
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              {language === 'ar' ? 'جرب تغيير مصطلحات البحث أو المرشحات' : 'Try adjusting your search terms or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMartyrs.map((martyr) => {
              const name = language === 'ar' ? martyr.nameAr : martyr.nameEn;
              const warName = language === 'ar' ? martyr.warNameAr : martyr.warNameEn;

              return (
                <div
                  key={martyr.id}
                  className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-48">
                    {martyr.mainIcon ? (
                      <img 
                        src={martyr.mainIcon} 
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center">
                        <User className="h-16 w-16 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    
                    {/* Martyr Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center space-x-1">
                        <Heart className="h-3 w-3 fill-current" />
                        <span>{language === 'ar' ? 'شهيد' : 'Martyr'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold text-primary-900 dark:text-white mb-2 line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                      {name}
                    </h3>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between text-primary-600 dark:text-primary-400">
                        <span>{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                        <span className="font-medium">{getFamilyStatusText(martyr.familyStatus)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-primary-600 dark:text-primary-400">
                        <span>{language === 'ar' ? 'الحرب:' : 'War:'}</span>
                        <span className="font-medium truncate ml-2 max-w-24" title={warName}>
                          {warName}
                        </span>
                      </div>
                      
                      {martyr.dateOfShahada && (
                        <div className="flex items-center justify-between text-primary-600 dark:text-primary-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{language === 'ar' ? 'الشهادة:' : 'Martyrdom:'}</span>
                          </div>
                          <span className="font-medium text-xs">{formatDate(martyr.dateOfShahada)}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleViewMartyr(martyr.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </span>
                    </button>
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

export default Martyrs; 

