import React from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { Activity } from '../services/activitiesService';
import { useData } from '../contexts/DataContext';
import { createActivitySlug } from '../services/activitiesService';

interface ActivitiesGridProps {
  activities: Activity[];
  loading: boolean;
}

const ActivitiesGrid: React.FC<ActivitiesGridProps> = ({ activities, loading }) => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { getActivityTypeById } = useData();

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive 
      ? { en: 'Active', ar: 'نشط', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
      : { en: 'Inactive', ar: 'غير نشط', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
  };

  const handleViewActivity = (activity: Activity) => {
    const slug = createActivitySlug(activity);
    navigate(`/activities/${slug}`);
  };

  if (loading) {
    return (
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
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-primary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-primary-900 dark:text-white mb-2">
          {language === 'ar' ? 'لا توجد أنشطة اليوم' : 'No activities today'}
        </h3>
        <p className="text-primary-600 dark:text-primary-400">
          {language === 'ar' ? 'لم يتم جدولة أي أنشطة لهذا اليوم' : 'No activities are scheduled for today'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => {
        const status = getStatusText(activity.isActive);
        
        return (
          <div
            key={activity.id}
            className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative">
              {activity.mainImage ? (
                <img
                  src={activity.mainImage}
                  alt={language === 'ar' ? activity.nameAr : activity.nameEn}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-accent-600 dark:text-accent-400" />
                </div>
              )}
              
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status[language]}
                </span>
              </div>
              
              <div className="absolute top-3 right-3">
                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                  {formatTime(activity.time)}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className={`text-lg font-semibold text-primary-900 dark:text-white mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {language === 'ar' ? activity.nameAr : activity.nameEn}
              </h3>
              
              <p className={`text-primary-600 dark:text-primary-400 text-sm mb-4 line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                {language === 'ar' ? activity.descriptionAr : activity.descriptionEn}
              </p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between text-primary-500 dark:text-primary-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{language === 'ar' ? 'المدة:' : 'Duration:'}</span>
                  </div>
                  <span className="font-medium">
                    {activity.durationHours} {language === 'ar' ? 'ساعة' : 'hour(s)'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-primary-500 dark:text-primary-400">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{language === 'ar' ? 'النوع:' : 'Type:'}</span>
                  </div>
                  <span className="font-medium">
                    {(() => {
                      const activityType = getActivityTypeById(activity.activityTypeId);
                      return activityType 
                        ? (language === 'ar' ? activityType.nameAr : activityType.nameEn)
                        : activity.activityTypeName || 'Unknown';
                    })()}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleViewActivity(activity)}
                className="w-full flex items-center justify-center space-x-2 text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 text-sm font-medium transition-colors bg-accent-50 dark:bg-accent-900/20 py-3 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/30"
              >
                <Eye className="h-4 w-4" />
                <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivitiesGrid; 