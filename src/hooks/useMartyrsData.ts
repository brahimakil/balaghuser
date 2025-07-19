import { useData } from '../contexts/DataContext';

export const useMartyrsData = () => {
  const { state } = useData();

  return {
    martyrs: state.martyrs,
    loading: state.loading.martyrs,
    error: state.error,
  };
};
