import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, Users, Share, Eye, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getActivityById, getActivityBySlug, getActivityTypeById, type Activity, type ActivityType } from '../services/activitiesService';
import ActivityMediaGallery from '../components/ActivityMediaGallery';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching activity with ID/slug:', id);
        
        // Try to fetch by slug first, then fall back to ID
        let activityData = await getActivityBySlug(id);
        
        // If slug lookup fails, try ID lookup (backward compatibility)
        if (!activityData) {
          console.log('Slug lookup failed, trying ID lookup...');
          activityData = await getActivityById(id);
        }
        
        if (!activityData) {
          console.error('No activity found for:', id);
          setError('Activity not found');
          return;
        }
        
        console.log('Activity found:', activityData.nameEn);
        setActivity(activityData);
        
        // Fetch activity type details
        if (activityData.activityTypeId) {
          const activityTypeData = await getActivityTypeById(activityData.activityTypeId);
          setActivityType(activityTypeData);
        }
        
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBackToActivities = () => {
    navigate('/activities');
  };

  const handleShareActivity = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: language === 'ar' ? activity?.nameAr : activity?.nameEn,
        text: language === 'ar' ? activity?.descriptionAr : activity?.descriptionEn,
        url: currentUrl,
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
            {language === 'ar' ? 'النشاط غير موجود' : 'Activity Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {error || (language === 'ar' ? 'لا يمكن العثور على النشاط المطلوب' : 'The requested activity could not be found')}
          </p>
          <button
            onClick={handleBackToActivities}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'ar' ? 'العودة إلى الأنشطة' : 'Back to Activities'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: activity.mainImage ? `url(${activity.mainImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        
        {/* Content - positioned at bottom left like other pages */}
        <div className="absolute inset-0 flex items-end">
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleBackToActivities}
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
                <span>{language === 'ar' ? 'العودة إلى الأنشطة' : 'Back to Activities'}</span>
              </button>

              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${
                activity.isActive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-orange-600 text-white'
              }`}>
                <div className={`w-3 h-3 rounded-full ${activity.isActive ? 'bg-green-200 animate-pulse' : 'bg-orange-200'}`}></div>
                <span className="font-bold">
                  {activity.isActive 
                    ? (language === 'ar' ? 'نشط' : 'ACTIVE') 
                    : (language === 'ar' ? 'غير نشط' : 'INACTIVE')
                  }
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? activity.nameAr : activity.nameEn}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {language === 'ar' ? activity.descriptionAr : activity.descriptionEn}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {formatDate(activity.date)}
                  </span>
                </div>
                
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {activity.time} ({activity.durationHours}h)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل النشاط' : 'Activity Details'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {formatDate(activity.date)} - {activity.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'المدة' : 'Duration'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {activity.durationHours} {language === 'ar' ? 'ساعة' : 'hours'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'نوع النشاط' : 'Activity Type'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {activityType 
                        ? (language === 'ar' ? activityType.nameAr : activityType.nameEn)
                        : activity.activityTypeId
                      }
                    </p>
                    {activityType && (
                      <p className="text-sm text-primary-500 dark:text-primary-500 mt-1">
                        {language === 'ar' ? activityType.descriptionAr : activityType.descriptionEn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <ActivityMediaGallery 
              photos={activity.photos || []} 
              videos={activity.videos || []}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
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

            {/* Activity Status */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'حالة النشاط' : 'Activity Status'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </span>
                  <span className={`font-semibold ${activity.isActive ? 'text-green-600' : 'text-orange-600'}`}>
                    {activity.isActive 
                      ? (language === 'ar' ? 'نشط' : 'Active') 
                      : (language === 'ar' ? 'غير نشط' : 'Inactive')
                    }
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