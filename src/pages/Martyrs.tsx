  import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Filter, Eye, Heart, Calendar, Swords } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMartyrsData } from '../hooks/useMartyrsData';
import { getJihadistName, getBirthPlace, getBurialPlace, createMartyrSlug } from '../services/martyrsService';
import { getAllWars, type War } from '../services/warsService';
import HeroBanner from '../components/HeroBanner';
import moment from 'moment';

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

const Martyrs: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { martyrs, loading, error } = useMartyrsData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarId, setSelectedWarId] = useState<string>('');
  const [selectedBirthPlace, setSelectedBirthPlace] = useState<string>(''); // NEW: Birth place filter
  const [selectedBurialPlace, setSelectedBurialPlace] = useState<string>(''); // NEW: Burial place filter
  const [wars, setWars] = useState<War[]>([]);
  const [birthPlaces, setBirthPlaces] = useState<string[]>([]); // NEW: Birth places list
  const [burialPlaces, setBurialPlaces] = useState<string[]>([]); // NEW: Burial places list

  // Load wars data and extract unique places
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load wars
        const warsData = await getAllWars();
        setWars(warsData);

        // Extract unique birth places and burial places from martyrs
        if (martyrs.length > 0) {
          const uniqueBirthPlaces = new Set<string>();
          const uniqueBurialPlaces = new Set<string>();

          martyrs.forEach(martyr => {
            const birthPlace = getBirthPlace(martyr, language);
            const burialPlace = getBurialPlace(martyr, language);
            
            if (birthPlace && birthPlace.trim()) {
              uniqueBirthPlaces.add(birthPlace.trim());
            }
            if (burialPlace && burialPlace.trim()) {
              uniqueBurialPlaces.add(burialPlace.trim());
            }
          });

          setBirthPlaces(Array.from(uniqueBirthPlaces).sort());
          setBurialPlaces(Array.from(uniqueBurialPlaces).sort());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [martyrs, language]);

  // Helper function to get war name by ID
  const getWarName = (warId: string): string => {
    const war = wars.find(w => w.id === warId);
    if (!war) return language === 'ar' ? 'غير محدد' : 'Unknown';
    return language === 'ar' ? war.nameAr : war.nameEn;
  };

  // Filter martyrs based on search, war, birth place, and burial place
  const filteredMartyrs = useMemo(() => {
    return martyrs.filter(martyr => {
      const matchesSearch = searchTerm === '' || 
        (language === 'ar' ? martyr.nameAr : martyr.nameEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (language === 'ar' ? martyr.storyAr : martyr.storyEn)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getJihadistName(martyr, language)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      // War filter
      const matchesWar = selectedWarId === '' || 
        martyr.warId === selectedWarId ||
        // Also check legacy war name fields for backward compatibility
        (language === 'ar' ? martyr.warNameAr : martyr.warNameEn)
          ?.toLowerCase()
          .includes(getWarName(selectedWarId).toLowerCase());
      
      // NEW: Birth place filter
      const matchesBirthPlace = selectedBirthPlace === '' || 
        getBirthPlace(martyr, language).toLowerCase().includes(selectedBirthPlace.toLowerCase());
      
      // NEW: Burial place filter
      const matchesBurialPlace = selectedBurialPlace === '' || 
        getBurialPlace(martyr, language).toLowerCase().includes(selectedBurialPlace.toLowerCase());
      
      return matchesSearch && matchesWar && matchesBirthPlace && matchesBurialPlace;
    });
  }, [martyrs, searchTerm, selectedWarId, selectedBirthPlace, selectedBurialPlace, language, wars]);

  const handleViewMartyr = (martyrId: string) => {
    const martyr = martyrs.find(m => m.id === martyrId);
    if (martyr) {
      const slug = createMartyrSlug(martyr);
      navigate(`/martyrs/${slug}`);
    } else {
      navigate(`/martyrs/${martyrId}`); // Fallback
    }
  };

  const getFamilyStatusText = (status: string) => {
    const statusMap = {
      single: { en: 'Single', ar: 'أعزب' },
      married: { en: 'Married', ar: 'متزوج' }
    };
    return statusMap[status as keyof typeof statusMap]?.[language] || status;
  };

  // Format date of birth - always use Gregorian (Miladi)
  const formatDateOfBirth = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
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
      <div className="text-right">
        <div className="font-medium text-xs">{language === 'ar' ? hijriDates.ar : hijriDates.en}</div>
        <div className="text-xs text-primary-500 dark:text-primary-400">{gregorianDate}</div>
      </div>
    );
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
          {/* First Row: Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 h-5 w-5" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في الشهداء...' : 'Search martyrs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white placeholder-primary-500 dark:placeholder-primary-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Second Row: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* War Filter */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'الحرب' : 'War'}
              </label>
              <select
                value={selectedWarId}
                onChange={(e) => setSelectedWarId(e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent text-sm"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الحروب' : 'All Wars'}
                </option>
                {wars.map((war) => (
                  <option key={war.id} value={war.id}>
                    {language === 'ar' ? war.nameAr : war.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW: Birth Place Filter */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'مكان الميلاد' : 'Birth Place'}
              </label>
              <select
                value={selectedBirthPlace}
                onChange={(e) => setSelectedBirthPlace(e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent text-sm"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الأماكن' : 'All Places'}
                </option>
                {birthPlaces.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>

            {/* NEW: Burial Place Filter */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'مكان الدفن' : 'Burial Place'}
              </label>
              <select
                value={selectedBurialPlace}
                onChange={(e) => setSelectedBurialPlace(e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent text-sm"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الأماكن' : 'All Places'}
                </option>
                {burialPlaces.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="w-full flex items-center justify-center px-4 py-2 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                <Filter className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {filteredMartyrs.length} {language === 'ar' ? 'شهيد' : 'martyrs'}
                </span>
              </div>
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
              const jihadistName = getJihadistName(martyr, language);
              const warName = martyr.warId ? getWarName(martyr.warId) : (
                getJihadistName(martyr, language) // Fallback to old war name fields
              );

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
                    
                    {/* Jihadist Name */}
                    {jihadistName && (
                      <p className={`text-sm text-accent-600 dark:text-accent-400 mb-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        "{jihadistName}"
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm mb-4">
                     
                      
                  
                      
                      {/* War name */}
                      {warName && (
                        <div className="flex items-center justify-between text-primary-600 dark:text-primary-400">
                          <div className="flex items-center space-x-1">
                            <Swords className="h-3 w-3" />
                            <span>{language === 'ar' ? 'المعركة:' : 'War:'}</span>
                          </div>
                          <span className="font-medium text-xs max-w-24 truncate" title={warName}>
                            {warName}
                          </span>
                        </div>
                      )}
                      
                      {martyr.dateOfShahada && (
                        <div className="flex items-center justify-between text-primary-600 dark:text-primary-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{language === 'ar' ? 'الشهادة:' : 'Martyrdom:'}</span>
                          </div>
                          <div className="text-xs">
                            {formatDateOfMartyrdom(martyr.dateOfShahada)}
                          </div>
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

