import { useData } from '../contexts/DataContext';

export const useLocationsData = () => {
  const { state, getLegendById } = useData();

  return {
    locations: state.locations,
    legends: state.legends,
    getLegendById,
    loading: state.loading.locations || state.loading.legends,
    error: state.error,
  };
};
