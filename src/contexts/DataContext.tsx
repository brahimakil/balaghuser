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
    console.log('=== DEBUG: getTodayActivities called ===');
    
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    if (state.activities.length === 0) {
      console.log('❌ No activities found in state');
      return [];
    }

    console.log('Total activities to check:', state.activities.length);

    const filteredActivities = state.activities.filter((activity, index) => {
      console.log(`\n--- Activity ${index + 1}: ${activity.nameEn} ---`);
      
      if (activity.isPrivate) {
        console.log('❌ SKIP: Private activity');
        return false;
      }
      
      let activityStartDate: Date;
      
      try {
        // Parse the start date
        if (activity.date?.toDate) {
          activityStartDate = activity.date.toDate();
        } else if (activity.date instanceof Date) {
          activityStartDate = activity.date;
        } else if (typeof activity.date === 'string') {
          activityStartDate = new Date(activity.date);
        } else if (typeof activity.date === 'number') {
          activityStartDate = new Date(activity.date);
        } else {
          console.log('❌ SKIP: Invalid date format');
          return false;
        }
        
        if (isNaN(activityStartDate.getTime())) {
          console.log('❌ SKIP: Invalid date');
          return false;
        }
        
        // Calculate end date
        const durationHours = activity.durationHours || 1;
        const activityEndDate = new Date(activityStartDate.getTime() + (durationHours * 60 * 60 * 1000));
        
        console.log('Activity times:', {
          start: activityStartDate.toISOString(),
          end: activityEndDate.toISOString(),
          duration: durationHours + ' hours',
          now: now.toISOString()
        });
        
        // Simple check: is the activity running right now?
        const isCurrentlyRunning = now >= activityStartDate && now <= activityEndDate;
        
        console.log('Time check:', {
          nowAfterStart: now >= activityStartDate,
          nowBeforeEnd: now <= activityEndDate,
          isCurrentlyRunning
        });
        
        if (isCurrentlyRunning) {
          console.log('✅ INCLUDE: Activity is currently running');
        } else {
          console.log('❌ SKIP: Activity is not currently running');
        }
        
        return isCurrentlyRunning;
        
      } catch (error) {
        console.error('❌ SKIP: Error processing activity:', error);
        return false;
      }
    });

    console.log('=== RESULTS ===');
    console.log('Found', filteredActivities.length, 'currently running activities');
    filteredActivities.forEach(activity => {
      console.log('- ' + (activity.nameEn || activity.nameAr));
    });
    console.log('=== END DEBUG ===\n');

    return filteredActivities;
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