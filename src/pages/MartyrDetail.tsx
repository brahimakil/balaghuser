import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Calendar, Heart, Users, Info, Share, QrCode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

const MartyrDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { state } = useData();

  const martyr = state.martyrs.find(m => m.id === id);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!martyr) {
    return (
      <div className="animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <User className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
            {language === 'ar' ? 'الشهيد غير موجود' : 'Martyr Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {language === 'ar' ? 'لم يتم العثور على بيانات الشهيد المطلوب' : 'The requested martyr could not be found'}
          </p>
          <button
            onClick={() => navigate('/martyrs')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'ar' ? 'العودة للشهداء' : 'Back to Martyrs'}</span>
          </button>
        </div>
      </div>
    );
  }

  const name = language === 'ar' ? martyr.nameAr : martyr.nameEn;
  const story = language === 'ar' ? martyr.storyAr : martyr.storyEn;
  const warName = language === 'ar' ? martyr.warNameAr : martyr.warNameEn;

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
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dob: any, dateOfDeath: any) => {
    if (!dob || !dateOfDeath) return null;
    const birthDate = dob.toDate();
    const deathDate = dateOfDeath.toDate();
    const age = deathDate.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const age = calculateAge(martyr.dob, martyr.dateOfShahada);

  const handleBackToMartyrs = () => {
    navigate('/martyrs');
  };

  const handleShareMartyr = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `${language === 'ar' ? 'نتذكر الشهيد' : 'Remembering martyr'} ${name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] min-h-[300px] overflow-hidden">
        {martyr.mainIcon ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${martyr.mainIcon})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-700 to-red-900" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative h-full flex items-end px-4 sm:px-6 lg:px-8 pb-8">
          <div className={`max-w-4xl ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={handleBackToMartyrs}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">{language === 'ar' ? 'الشهداء' : 'Martyrs'}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm flex items-center space-x-2">
                  <Heart className="h-4 w-4 fill-current" />
                  <span>{language === 'ar' ? 'شهيد' : 'Martyr'}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                {name}
              </h1>
              
              <div className="flex items-center space-x-4 text-white/90">
                {age && (
                  <span className="text-lg font-medium">
                    {language === 'ar' ? `العمر: ${age} سنة` : `Age: ${age} years`}
                  </span>
                )}
                <span className="text-lg font-medium">
                  {getFamilyStatusText(martyr.familyStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Story */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'قصة الشهيد' : 'Martyr\'s Story'}
              </h2>
              <p className={`text-primary-600 dark:text-primary-300 leading-relaxed text-lg ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {story}
              </p>
            </div>

            {/* War Information */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'معلومات الحرب' : 'War Information'}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                    {language === 'ar' ? 'الحرب/الصراع:' : 'War/Conflict:'}
                  </h4>
                  <p className={`text-primary-600 dark:text-primary-300 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {warName}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                    {language === 'ar' ? 'تاريخ الشهادة:' : 'Date of Martyrdom:'}
                  </h4>
                  <p className="text-primary-600 dark:text-primary-300">
                    {formatDate(martyr.dateOfShahada)}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {martyr.mainIcon && (
                  <img 
                    src={martyr.mainIcon} 
                    alt={name}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                )}
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
            {/* QR Code */}
            {martyr.qrCode && (
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4 flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>{language === 'ar' ? 'رمز الاستجابة السريعة' : 'QR Code'}</span>
                </h3>
                <div className="text-center">
                  <img 
                    src={martyr.qrCode} 
                    alt={`QR Code for ${name}`}
                    className="w-full max-w-48 mx-auto rounded-lg border border-primary-200 dark:border-primary-600"
                  />
                  <p className="text-sm text-primary-500 dark:text-primary-400 mt-3">
                    {language === 'ar' ? 'امسح الرمز للوصول السريع' : 'Scan for quick access'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleShareMartyr}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'مشاركة الشهيد' : 'Share Martyr'}</span>
                </button>
                
              
              </div>
            </div>

            {/* Martyr Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل الشهيد' : 'Martyr Details'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'الحالة الاجتماعية:' : 'Family Status:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {getFamilyStatusText(martyr.familyStatus)}
                  </span>
                </div>
                {age && (
                  <div className="flex justify-between">
                    <span className="text-primary-500 dark:text-primary-400">
                      {language === 'ar' ? 'العمر:' : 'Age:'}
                    </span>
                    <span className="font-medium text-primary-900 dark:text-white">
                      {age} {language === 'ar' ? 'سنة' : 'years'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ الميلاد:' : 'Date of Birth:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatDate(martyr.dob)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ الشهادة:' : 'Date of Martyrdom:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatDate(martyr.dateOfShahada)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'الحرب/الصراع:' : 'War/Conflict:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {warName}
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

export default MartyrDetail; 