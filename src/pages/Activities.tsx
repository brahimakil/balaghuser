import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Filter, Eye, Clock, Users, Tag } from 'lucide-react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { useLanguage } from '../contexts/LanguageContext';
import { useActivitiesData } from '../hooks/useActivitiesData';
import HeroBanner from '../components/HeroBanner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { activities, activityTypes, loading, error } = useActivitiesData();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('');

  // Filter activities based on activity type
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesType = selectedActivityType === '' || activity.activityTypeId === selectedActivityType;
      return matchesType;
    });
  }, [activities, selectedActivityType]);

  // Convert activities to calendar events
  const calendarEvents = useMemo(() => {
    return filteredActivities.map(activity => ({
      id: activity.id,
      title: language === 'ar' ? activity.nameAr : activity.nameEn,
      start: activity.date.toDate(),
      end: new Date(activity.date.toDate().getTime() + activity.durationHours * 60 * 60 * 1000),
      resource: activity
    }));
  }, [filteredActivities, language]);

  const handleViewActivity = (activityId: string) => {
    navigate(`/activities/${activityId}`);
  };

  const handleSelectEvent = (event: any) => {
    handleViewActivity(event.id);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    <div className="animate-fade-in">
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
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="">
                    {language === 'ar' ? 'جميع أنواع الأنشطة' : 'All Activity Types'}
                  </option>
                  {activityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
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
                                <span>{formatTime(activity.time)} ({activity.durationHours}h)</span>
                              </div>
                              <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
                                <Tag className="h-4 w-4" />
                                <span>{activity.activityTypeName}</span>
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
