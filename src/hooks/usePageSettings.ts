import { useData } from '../contexts/DataContext';

export const usePageSettings = (pageId: string) => {
  const { state, getPageSettings } = useData();

  return {
    settings: getPageSettings(pageId),
    loading: state.loading.websiteSettings,
    error: state.error,
  };
}; 