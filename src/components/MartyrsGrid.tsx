import React from 'react';
import { Calendar, Heart, User, Eye, Swords, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getJihadistName, createMartyrSlug, type Martyr } from '../services/martyrsService';
import moment from 'moment';

interface MartyrsGridProps {
  martyrs: Martyr[];
  loading: boolean;
}

// Simple Hijri conversion function using algorithmic approximation
const toHijri = (gregorianDate: Date) => {
  const momentDate = moment(gregorianDate);
  const year = momentDate.year();
  const month = momentDate.month() + 1;
  const day = momentDate.date();
  
  // Algorithmic conversion (approximation)
  const totalDays = Math.floor((year - 622) * 365.25 + (month - 1) * 30.44 + day);
  const hijriYear = Math.floor(totalDays / 354.37) + 1;
  const remainingDays = totalDays - Math.floor((hijriYear - 1) * 354.37);
  const hijriMonth = Math.ceil(remainingDays / 29.53);
  const hijriDay = remainingDays - Math.floor((hijriMonth - 1) * 29.53);
  
  const hijriMonthsAr = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  const hijriMonthsEn = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
    'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  return {
    ar: `${Math.floor(hijriDay)} ${hijriMonthsAr[Math.min(hijriMonth - 1, 11)]} ${hijriYear}هـ`,
    en: `${Math.floor(hijriDay)} ${hijriMonthsEn[Math.min(hijriMonth - 1, 11)]} ${hijriYear}H`
  };
};

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

  // Format date of martyrdom - Hijri + Gregorian for both Arabic and English
  const formatDateOfMartyrdom = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const hijriDates = toHijri(date);
    
    // For Arabic: show Gregorian date in Arabic format but with Gregorian calendar
    const gregorianDate = language === 'ar' 
      ? date.toLocaleDateString('ar', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          calendar: 'gregory' // Force Gregorian calendar
        })
      : date.toLocaleDateString('en-US');
    
    return (
      <div className="text-right text-xs">
        <div className="font-medium">{language === 'ar' ? hijriDates.ar : hijriDates.en}</div>
        <div className="text-primary-500 dark:text-primary-400">{gregorianDate}</div>
      </div>
    );
  };

  const handleViewMartyr = (martyrId: string) => {
    const martyr = martyrs.find(m => m.id === martyrId);
    if (martyr) {
      const slug = createMartyrSlug(martyr);
      navigate(`/martyrs/${slug}`);
    } else {
      navigate(`/martyrs/${martyrId}`); // Fallback
    }
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
      {martyrs.map((martyr) => {
        const jihadistName = getJihadistName(martyr, language);
        
        return (
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
              
              {/* Jihadist Name */}
              {jihadistName && (
                <p className={`text-xs text-accent-600 dark:text-accent-400 mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  "{jihadistName}"
                </p>
              )}
              
              <div className="space-y-1 text-xs text-primary-600 dark:text-primary-400 mb-3">
          
                
             
                {/* War indicator */}
                {martyr.warId && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Swords className="h-3 w-3" />
                      <span>{language === 'ar' ? 'المعركة:' : 'War:'}</span>
                    </div>
                    <span className="font-medium text-accent-600 dark:text-accent-400">
                      {language === 'ar' ? 'موجود' : 'Assigned'}
                    </span>
                  </div>
                )}
                
                {martyr.dateOfShahada && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{language === 'ar' ? 'الشهادة:' : 'Martyrdom:'}</span>
                    </div>
                    <div>
                      {formatDateOfMartyrdom(martyr.dateOfShahada)}
                    </div>
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
        );
      })}
    </div>
  );
};

export default MartyrsGrid; 