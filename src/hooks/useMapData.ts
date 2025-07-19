import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const useMapData = () => {
  const { state, getLegendById } = useData();

  // Create a map of legend IDs to legend objects for easy lookup
  const legendsMap = useMemo(() => {
    return state.legends.reduce((map, legend) => {
      map[legend.id] = legend;
      return map;
    }, {} as Record<string, any>);
  }, [state.legends]);

  return {
    locations: state.locations,
    legends: state.legends,
    legendsMap,
    loading: state.loading.locations || state.loading.legends,
    error: state.error,
  };
}; 