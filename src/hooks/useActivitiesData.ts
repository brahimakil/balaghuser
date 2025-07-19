import { useData } from '../contexts/DataContext';
import { getActivityTypes } from '../services/activitiesService';

export const useActivitiesData = () => {
  const { state } = useData();

  const activityTypes = getActivityTypes(state.activities);

  return {
    activities: state.activities.filter(activity => !activity.isPrivate),
    activityTypes,
    loading: state.loading.activities,
    error: state.error,
  };
}; 