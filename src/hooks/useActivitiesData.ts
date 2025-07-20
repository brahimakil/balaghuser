import { useState, useEffect } from 'react';
import { getAllActivities, getAllActivityTypes, type Activity, type ActivityType } from '../services/activitiesService';

export const useActivitiesData = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both activities and activity types
        const [activitiesData, activityTypesData] = await Promise.all([
          getAllActivities(),
          getAllActivityTypes()
        ]);

        // Populate activity type names in activities
        const activitiesWithTypeNames = activitiesData.map(activity => ({
          ...activity,
          activityTypeName: activityTypesData.find(type => type.id === activity.activityTypeId)?.nameEn || activity.activityTypeId
        }));

        setActivities(activitiesWithTypeNames);
        setActivityTypes(activityTypesData);

      } catch (error) {
        console.error('Error fetching activities data:', error);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    activities,
    activityTypes,
    loading,
    error
  };
}; 