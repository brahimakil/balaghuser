import React from 'react';
import { Calendar, Heart, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { Martyr } from '../services/martyrsService';

interface MartyrsGridProps {
  martyrs: Martyr[];
  loading: boolean;
}

const MartyrsGrid: React.FC<MartyrsGridProps> = ({ martyrs, loading }) => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();

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

  const handleViewMartyr = (martyrId: string) => {
    navigate(`/martyrs/${martyrId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-4 animate-pulse">
            <div className="w-full h-32 bg-primary-200 dark:bg-primary-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded mb-2"></div>
            <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded mb-1"></div>
            <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {martyrs.map((martyr) => (
        <div
          key={martyr.id}
          className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 hover:shadow-md transition-all duration-300 overflow-hidden group"
        >
          <div className="relative">
            {martyr.mainIcon ? (
              <img
                src={martyr.mainIcon}
                alt={language === 'ar' ? martyr.nameAr : martyr.nameEn}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center">
                <User className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <div className="bg-red-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                <Heart className="h-3 w-3 inline mr-1" />
                {language === 'ar' ? 'شهيد' : 'Martyr'}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className={`font-semibold text-primary-900 dark:text-white mb-2 text-sm ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
              {language === 'ar' ? martyr.nameAr : martyr.nameEn}
            </h3>
            
            <div className="space-y-1 text-xs text-primary-600 dark:text-primary-400 mb-3">
              <div className="flex items-center justify-between">
                <span>{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                <span className="font-medium">{getFamilyStatusText(martyr.familyStatus)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>{language === 'ar' ? 'الحرب:' : 'War:'}</span>
                <span className="font-medium truncate ml-1 max-w-16" title={language === 'ar' ? martyr.warNameAr : martyr.warNameEn}>
                  {language === 'ar' ? martyr.warNameAr : martyr.warNameEn}
                </span>
              </div>
              
              {martyr.dateOfShahada && (
                <div className="flex items-center justify-between">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{formatDate(martyr.dateOfShahada)}</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => handleViewMartyr(martyr.id)}
              className="w-full flex items-center justify-center space-x-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors bg-red-50 dark:bg-red-900/20 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Eye className="h-3 w-3" />
              <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MartyrsGrid; 