import { useData } from '../contexts/DataContext';

export const useDashboardData = () => {
  const { state, getRandomMartyrs, getTodayActivities } = useData();

  return {
    martyrs: getRandomMartyrs(8),
    activities: getTodayActivities(),
    martyrsLoading: state.loading.martyrs,
    activitiesLoading: state.loading.activities,
    error: state.error,
    refetch: () => {
      // This would trigger a refresh if needed
    },
  };
}; 