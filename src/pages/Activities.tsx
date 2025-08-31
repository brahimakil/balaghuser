import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Filter, Eye, Clock, Users, Tag, Lock, Share } from 'lucide-react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { useLanguage } from '../contexts/LanguageContext';
import { useActivitiesData } from '../hooks/useActivitiesData';
import HeroBanner from '../components/HeroBanner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getAllVillages, type Village } from '../services/villagesService';

const localizer = momentLocalizer(moment);

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // Move this BEFORE using it
  const { language, isRTL } = useLanguage();
  const { activities, activityTypes, loading, error } = useActivitiesData();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // NOW you can use searchParams:
  const [selectedActivityType, setSelectedActivityType] = useState<string>(searchParams.get('type') || '');
  const [selectedVillage, setSelectedVillage] = useState<string>(searchParams.get('village') || '');
  const [villages, setVillages] = useState<Village[]>([]);

  useEffect(() => {
    const loadVillages = async () => {
      const villagesData = await getAllVillages();
      setVillages(villagesData);
    };
    loadVillages();
  }, []);

  useEffect(() => {
    // Don't scroll to top when only search params change
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Restore scroll position
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      sessionStorage.removeItem('scrollPosition');
    }
    
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [searchParams]);

  // Filter activities based on activity type
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesType = selectedActivityType === '' || activity.activityTypeId === selectedActivityType;
      const matchesVillage = selectedVillage === '' || 
        (selectedVillage === 'no-village' ? !activity.villageId : activity.villageId === selectedVillage);
      // NO isPrivate filtering here!
      return matchesType && matchesVillage;
    });
  }, [activities, selectedActivityType, selectedVillage]);

  // Convert activities to calendar events with colors based on status
  const calendarEvents = useMemo(() => {
    return filteredActivities.map(activity => {
      let startDate;
      let endDate;
      
      try {
        // Handle different date formats
        if (activity.date?.toDate) {
          startDate = activity.date.toDate();
        } else if (activity.date) {
          startDate = new Date(activity.date);
        } else {
          startDate = new Date(); // fallback to today
        }
        
        endDate = new Date(startDate.getTime() + (activity.durationHours || 1) * 60 * 60 * 1000);
        
        return {
          id: activity.id,
          title: language === 'ar' ? activity.nameAr : activity.nameEn,
          start: startDate,
          end: endDate,
          resource: activity,
          // Add custom styling based on activity status
          style: {
            backgroundColor: activity.isActive ? '#10b981' : '#f59e0b', // Just green/orange
            borderColor: activity.isActive ? '#059669' : '#d97706',
            color: 'white'
          }
        };
      } catch (error) {
        console.error('Date parsing error for activity:', activity.id, error);
        return {
          id: activity.id,
          title: language === 'ar' ? activity.nameAr : activity.nameEn,
          start: new Date(),
          end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
          resource: activity,
          style: {
            backgroundColor: activity.isActive ? '#10b981' : '#f59e0b',
            borderColor: activity.isActive ? '#059669' : '#d97706',
            color: 'white'
          }
        };
      }
    });
  }, [filteredActivities, language]);

  const handleViewActivity = (activityId: string) => {
    navigate(`/activities/${activityId}`);
  };

  const handleSelectEvent = (event: any) => {
    handleViewActivity(event.id);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Invalid date';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'No time specified';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive 
      ? { en: 'Active', ar: 'نشط', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
      : { en: 'Inactive', ar: 'غير نشط', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' };
  };

  const getActivityTypeName = (activityTypeId: string) => {
    const activityType = activityTypes.find(type => type.id === activityTypeId);
    if (activityType) {
      return language === 'ar' ? activityType.nameAr : activityType.nameEn;
    }
    return activityTypeId;
  };

  if (error) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="activities"
          fallbackTitle={language === 'ar' ? 'الأنشطة والفعاليات' : 'Activities & Events'}
          fallbackDescription={language === 'ar' ? 'انضم إلينا في إحياء تراثنا من خلال الأنشطة والفعاليات المتنوعة' : 'Join us in commemorating our heritage through various activities and events'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-white dark:bg-primary-800 rounded-xl">
            <CalendarIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              {language === 'ar' ? 'خطأ في تحميل الأنشطة' : 'Error Loading Activities'}
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="activities"
          fallbackTitle={language === 'ar' ? 'الأنشطة والفعاليات' : 'Activities & Events'}
          fallbackDescription={language === 'ar' ? 'انضم إلينا في إحياء تراثنا من خلال الأنشطة والفعاليات المتنوعة' : 'Join us in commemorating our heritage through various activities and events'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-primary-200 dark:bg-primary-700 rounded mb-6"></div>
            <div className="h-96 bg-primary-200 dark:bg-primary-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ scrollBehavior: 'auto' }}>
      <HeroBanner 
        pageId="activities"
        fallbackTitle={language === 'ar' ? 'الأنشطة والفعاليات' : 'Activities & Events'}
        fallbackDescription={language === 'ar' ? 'انضم إلينا في إحياء تراثنا من خلال الأنشطة والفعاليات المتنوعة' : 'Join us in commemorating our heritage through various activities and events'}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Left side - Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Activity Type Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedActivityType}
                  onChange={(e) => {
                    setSelectedActivityType(e.target.value);
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) params.set('type', e.target.value);
                    else params.delete('type');
                    setSearchParams(params);
                  }}
                  className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="">
                    {language === 'ar' ? 'جميع أنواع الأنشطة' : 'All Activity Types'}
                  </option>
                  {activityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {language === 'ar' ? type.nameAr : type.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Village Filter */}
              <div className="sm:w-64">
                <select
                  value={selectedVillage}
                  onChange={(e) => {
                    setSelectedVillage(e.target.value);
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) params.set('village', e.target.value);
                    else params.delete('village');
                    setSearchParams(params);
                  }}
                  className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="">
                    {language === 'ar' ? 'جميع القرى' : 'All Villages'}
                  </option>
                  <option value="no-village">
                    {language === 'ar' ? 'بدون قرية' : 'No Village'}
                  </option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {language === 'ar' ? village.nameAr : village.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Results Count */}
              <div className="flex items-center px-4 py-3 bg-primary-50 dark:bg-primary-700/50 rounded-lg">
                <Filter className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {filteredActivities.length} {language === 'ar' ? 'نشاط' : 'activities'}
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'غير نشط' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - View Toggle */}
            <div className="flex bg-primary-100 dark:bg-primary-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-primary-800 text-primary-900 dark:text-white shadow-sm'
                    : 'text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                <span>{language === 'ar' ? 'تقويم' : 'Calendar'}</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-primary-800 text-primary-900 dark:text-white shadow-sm'
                    : 'text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                <span>{language === 'ar' ? 'قائمة' : 'List'}</span>
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href;
                  const title = language === 'ar' ? 'تقويم الأنشطة' : 'Activities Calendar';
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: title,
                        text: language === 'ar' ? 'شاهد الأنشطة المفلترة' : 'View filtered activities',
                        url: url
                      });
                    } catch (error) {
                      // User cancelled or error occurred
                      console.log('Share cancelled');
                    }
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(url);
                    alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Share className="h-4 w-4" />
                <span>{language === 'ar' ? 'مشاركة' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar or List View */}
        {viewMode === 'calendar' ? (
          <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                defaultView={Views.MONTH}
                className="react-big-calendar-custom"
                culture={language === 'ar' ? 'ar' : 'en'}
                eventPropGetter={(event) => ({
                  style: event.style
                })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-primary-800 rounded-xl">
                <CalendarIcon className="h-16 w-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
                  {language === 'ar' ? 'لا توجد أنشطة' : 'No Activities Found'}
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  {language === 'ar' ? 'جرب تغيير المرشحات' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const name = language === 'ar' ? activity.nameAr : activity.nameEn;
                const description = language === 'ar' ? activity.descriptionAr : activity.descriptionEn;
                const status = getStatusText(activity.isActive);

                return (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            {activity.mainImage ? (
                              <img 
                                src={activity.mainImage} 
                                alt={name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <CalendarIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold text-primary-900 dark:text-white ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                                {name}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status[language]}
                              </span>
                            </div>
                            
                            <p className={`text-primary-600 dark:text-primary-400 text-sm mb-3 line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                              {description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(activity.date)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(activity.time)} ({activity.durationHours || 1}h)</span>
                              </div>
                              <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
                                <Tag className="h-4 w-4" />
                                <span>{getActivityTypeName(activity.activityTypeId)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <button
                          onClick={() => handleViewActivity(activity.id)}
                          className="flex items-center space-x-2 px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">
                            {language === 'ar' ? 'عرض المزيد' : 'View More'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
