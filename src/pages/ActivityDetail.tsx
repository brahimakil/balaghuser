import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, Users, MapPin, Info, Share, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { state } = useData();

  const activity = state.activities.find(a => a.id === id);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!activity) {
    return (
      <div className="animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Calendar className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
            {language === 'ar' ? 'النشاط غير موجود' : 'Activity Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {language === 'ar' ? 'لم يتم العثور على النشاط المطلوب' : 'The requested activity could not be found'}
          </p>
          <button
            onClick={() => navigate('/activities')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'ar' ? 'العودة للأنشطة' : 'Back to Activities'}</span>
          </button>
        </div>
      </div>
    );
  }

  const name = language === 'ar' ? activity.nameAr : activity.nameEn;
  const description = language === 'ar' ? activity.descriptionAr : activity.descriptionEn;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive 
      ? { en: 'Active', ar: 'نشط', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
      : { en: 'Inactive', ar: 'غير نشط', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
  };

  const status = getStatusText(activity.isActive);

  const handleBackToActivities = () => {
    navigate('/activities');
  };

  const handleShareActivity = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `${language === 'ar' ? 'شاهد هذا النشاط:' : 'Check out this activity:'} ${name}`,
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
        {activity.mainImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${activity.mainImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative h-full flex items-end px-4 sm:px-6 lg:px-8 pb-8">
          <div className={`max-w-4xl ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={handleBackToActivities}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">{language === 'ar' ? 'الأنشطة' : 'Activities'}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${status.color}`}>
                  {status[language]}
                </span>
                <div className="bg-black/50 text-white px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
                  {formatTime(activity.time)}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                {name}
              </h1>
              
              <div className="flex items-center space-x-4 text-white/90">
                <span className="text-lg font-medium">
                  {formatDate(activity.date)}
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
            {/* Description */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'حول هذا النشاط' : 'About This Activity'}
              </h2>
              <p className={`text-primary-600 dark:text-primary-300 leading-relaxed text-lg ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {description}
              </p>
            </div>

            {/* Activity Type */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'نوع النشاط' : 'Activity Type'}
              </h3>
              <div className="flex items-center space-x-3">
                <Tag className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                <span className="text-lg font-medium text-primary-900 dark:text-white">
                  {activity.activityTypeName}
                </span>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-8">
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                    {language === 'ar' ? 'المدة:' : 'Duration:'}
                  </h4>
                  <p className="text-primary-600 dark:text-primary-300">
                    {activity.durationHours} {language === 'ar' ? 'ساعة' : 'hour(s)'}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status[language]}
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
                  onClick={handleShareActivity}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'مشاركة النشاط' : 'Share Activity'}</span>
                </button>
             
              </div>
            </div>

            {/* Activity Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل النشاط' : 'Activity Details'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'التاريخ:' : 'Date:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'الوقت:' : 'Time:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatTime(activity.time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'المدة:' : 'Duration:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {activity.durationHours} {language === 'ar' ? 'ساعة' : 'hour(s)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'النوع:' : 'Type:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {activity.activityTypeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {activity.createdAt?.toDate?.()?.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') || 'N/A'}
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

export default ActivityDetail; 