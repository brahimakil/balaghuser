import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getLocations, getLegends, type Location, type Legend } from '../services/locationsService';
import { getAllMartyrs, type Martyr } from '../services/martyrsService';
import { getAllActivities, type Activity } from '../services/activitiesService';
import { getWebsiteSettings, type WebsiteSettings, type PageSettings } from '../services/websiteSettingsService';

// Types
interface DataState {
  locations: Location[];
  legends: Legend[];
  martyrs: Martyr[];
  activities: Activity[];
  websiteSettings: WebsiteSettings | null;
  loading: {
    locations: boolean;
    legends: boolean;
    martyrs: boolean;
    activities: boolean;
    websiteSettings: boolean;
  };
  error: string | null;
  lastFetched: {
    locations: number;
    legends: number;
    martyrs: number;
    activities: number;
    websiteSettings: number;
  };
}

type DataAction = 
  | { type: 'SET_LOADING'; payload: { key: keyof DataState['loading']; value: boolean } }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'SET_LEGENDS'; payload: Legend[] }
  | { type: 'SET_MARTYRS'; payload: Martyr[] }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'SET_WEBSITE_SETTINGS'; payload: WebsiteSettings | null }
  | { type: 'SET_ERROR'; payload: string | null };

interface DataContextType {
  state: DataState;
  getRandomMartyrs: (count?: number) => Martyr[];
  getTodayActivities: () => Activity[];
  getLegendById: (legendId: string) => Legend | null;
  getPageSettings: (pageId: string) => PageSettings | null;
  refreshData: (dataType: keyof DataState['loading']) => void;
}

// Initial state
const initialState: DataState = {
  locations: [],
  legends: [],
  martyrs: [],
  activities: [],
  websiteSettings: null,
  loading: {
    locations: false,
    legends: false,
    martyrs: false,
    activities: false,
    websiteSettings: false,
  },
  error: null,
  lastFetched: {
    locations: 0,
    legends: 0,
    martyrs: 0,
    activities: 0,
    websiteSettings: 0,
  },
};

// Reducer
const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'SET_LOCATIONS':
      return {
        ...state,
        locations: action.payload,
        loading: { ...state.loading, locations: false },
        lastFetched: { ...state.lastFetched, locations: Date.now() },
      };
    case 'SET_LEGENDS':
      return {
        ...state,
        legends: action.payload,
        loading: { ...state.loading, legends: false },
        lastFetched: { ...state.lastFetched, legends: Date.now() },
      };
    case 'SET_MARTYRS':
      return {
        ...state,
        martyrs: action.payload,
        loading: { ...state.loading, martyrs: false },
        lastFetched: { ...state.lastFetched, martyrs: Date.now() },
      };
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload,
        loading: { ...state.loading, activities: false },
        lastFetched: { ...state.lastFetched, activities: Date.now() },
      };
    case 'SET_WEBSITE_SETTINGS':
      return {
        ...state,
        websiteSettings: action.payload,
        loading: { ...state.loading, websiteSettings: false },
        lastFetched: { ...state.lastFetched, websiteSettings: Date.now() },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache duration (10 minutes for website settings since they change less frequently)
const CACHE_DURATION = 10 * 60 * 1000;

// Provider
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Check if data needs refresh
  const needsRefresh = (dataType: keyof DataState['loading']) => {
    return Date.now() - state.lastFetched[dataType] > CACHE_DURATION;
  };

  // Fetch data functions
  const fetchData = async (
    dataType: keyof DataState['loading'],
    fetchFunction: () => Promise<any>,
    actionType: DataAction['type']
  ) => {
    if (state.loading[dataType] || (!needsRefresh(dataType) && 
        (dataType === 'websiteSettings' ? state.websiteSettings : state[dataType as keyof DataState].length > 0))) {
      return; // Already loading or data is fresh
    }

    dispatch({ type: 'SET_LOADING', payload: { key: dataType, value: true } });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = await fetchFunction();
      dispatch({ type: actionType as any, payload: data });
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to load ${dataType}` });
      dispatch({ type: 'SET_LOADING', payload: { key: dataType, value: false } });
    }
  };

  // Auto-fetch essential data on mount
  useEffect(() => {
    // Fetch website settings first (needed for banners immediately)
    fetchData('websiteSettings', getWebsiteSettings, 'SET_WEBSITE_SETTINGS');
    
    // Fetch legends (needed for map and other components)
    setTimeout(() => {
      fetchData('legends', getLegends, 'SET_LEGENDS');
    }, 50);
    
    // Then fetch locations
    setTimeout(() => {
      fetchData('locations', getLocations, 'SET_LOCATIONS');
    }, 100);

    // Fetch martyrs
    setTimeout(() => {
      fetchData('martyrs', getAllMartyrs, 'SET_MARTYRS');
    }, 200);

    // Fetch activities
    setTimeout(() => {
      fetchData('activities', getAllActivities, 'SET_ACTIVITIES');
    }, 300);
  }, []);

  // Helper functions
  const getRandomMartyrs = (count: number = 8): Martyr[] => {
    if (state.martyrs.length === 0) return [];
    const shuffled = [...state.martyrs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getTodayActivities = (): Activity[] => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return state.activities.filter(activity => {
      if (activity.isPrivate) return false;
      const activityDate = activity.date.toDate();
      return activityDate >= startOfDay && activityDate < endOfDay;
    });
  };

  const getLegendById = (legendId: string): Legend | null => {
    return state.legends.find(legend => legend.id === legendId) || null;
  };

  const getPageSettings = (pageId: string): PageSettings | null => {
    if (!state.websiteSettings || !state.websiteSettings.pages) return null;
    return state.websiteSettings.pages[pageId as keyof typeof state.websiteSettings.pages] || null;
  };

  const refreshData = (dataType: keyof DataState['loading']) => {
    switch (dataType) {
      case 'locations':
        fetchData('locations', getLocations, 'SET_LOCATIONS');
        break;
      case 'legends':
        fetchData('legends', getLegends, 'SET_LEGENDS');
        break;
      case 'martyrs':
        fetchData('martyrs', getAllMartyrs, 'SET_MARTYRS');
        break;
      case 'activities':
        fetchData('activities', getAllActivities, 'SET_ACTIVITIES');
        break;
      case 'websiteSettings':
        fetchData('websiteSettings', getWebsiteSettings, 'SET_WEBSITE_SETTINGS');
        break;
    }
  };

  return (
    <DataContext.Provider value={{
      state,
      getRandomMartyrs,
      getTodayActivities,
      getLegendById,
      getPageSettings,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 