import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getLocations, getLegends, type Location, type Legend } from '../services/locationsService';
import { getAllMartyrs, type Martyr } from '../services/martyrsService';
import { getAllActivities, getAllActivityTypes, type Activity, type ActivityType } from '../services/activitiesService';
import { getWebsiteSettings, type WebsiteSettings, type PageSettings } from '../services/websiteSettingsService';

// Types
interface DataState {
  locations: Location[];
  legends: Legend[];
  martyrs: Martyr[];
  activities: Activity[];
  activityTypes: ActivityType[];
  websiteSettings: WebsiteSettings | null;
  loading: {  
    locations: boolean;
    legends: boolean;
    martyrs: boolean;
    activities: boolean;
    activityTypes: boolean;
    websiteSettings: boolean;
  };
  error: string | null;
  lastFetched: {
    locations: number;
    legends: number;
    martyrs: number;
    activities: number;
    activityTypes: number;
    websiteSettings: number;
  };
}

type DataAction = 
  | { type: 'SET_LOADING'; payload: { key: keyof DataState['loading']; value: boolean } }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'SET_LEGENDS'; payload: Legend[] }
  | { type: 'SET_MARTYRS'; payload: Martyr[] }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'SET_ACTIVITY_TYPES'; payload: ActivityType[] }
  | { type: 'SET_WEBSITE_SETTINGS'; payload: WebsiteSettings | null }
  | { type: 'SET_ERROR'; payload: string | null };

interface DataContextType {
  state: DataState;
  getRandomMartyrs: (count?: number) => Martyr[];
  getTodayActivities: () => Activity[];
  getLegendById: (legendId: string) => Legend | null;
  getActivityTypeById: (activityTypeId: string) => ActivityType | null;
  getPageSettings: (pageId: string) => PageSettings | null;
  refreshData: (dataType: keyof DataState['loading']) => void;
}

// Initial state
const initialState: DataState = {
  locations: [],
  legends: [],
  martyrs: [],
  activities: [],
  activityTypes: [],
  websiteSettings: null,
  loading: {
    locations: false,
    legends: false,
    martyrs: false,
    activities: false,
    activityTypes: false,
    websiteSettings: false,
  },
  error: null,
  lastFetched: {
    locations: 0,
    legends: 0,
    martyrs: 0,
    activities: 0,
    activityTypes: 0,
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
    case 'SET_ACTIVITY_TYPES':
      return {
        ...state,
        activityTypes: action.payload,
        loading: { ...state.loading, activityTypes: false },
        lastFetched: { ...state.lastFetched, activityTypes: Date.now() }
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
    // Staggered loading for better performance
    const loadData = async () => {
      try {
        // Priority 1: Website Settings (for banner)
        setTimeout(() => fetchData('websiteSettings', getWebsiteSettings, 'SET_WEBSITE_SETTINGS'), 0);
        
        // Priority 2: Martyrs (for dashboard grid)
        setTimeout(() => fetchData('martyrs', getAllMartyrs, 'SET_MARTYRS'), 300);
        
        // Priority 3: Activities and Activity Types (for dashboard grid)
        setTimeout(() => {
          fetchData('activities', getAllActivities, 'SET_ACTIVITIES');
          fetchData('activityTypes', getAllActivityTypes, 'SET_ACTIVITY_TYPES');
        }, 600);
        
        // Priority 4: Locations and Legends (for map)
        setTimeout(() => {
          fetchData('locations', getLocations, 'SET_LOCATIONS');
          fetchData('legends', getLegends, 'SET_LEGENDS');
        }, 900);
        
      } catch (error) {
        console.error('Error in data loading:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      }
    };

    loadData();
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
        // Use createdAt as the actual start time
        if (activity.createdAt?.toDate) {
          activityStartDate = activity.createdAt.toDate();
        } else if (activity.createdAt instanceof Date) {
          activityStartDate = activity.createdAt;
        } else if (typeof activity.createdAt === 'string') {
          activityStartDate = new Date(activity.createdAt);
        } else if (typeof activity.createdAt === 'number') {
          activityStartDate = new Date(activity.createdAt);
        } else {
          console.log('❌ SKIP: Invalid createdAt format');
          return false;
        }
        
        if (isNaN(activityStartDate.getTime())) {
          console.log('❌ SKIP: Invalid createdAt date');
          return false;
        }
        
        // Calculate end date based on createdAt + duration
        const durationHours = activity.durationHours || 1;
        const activityEndDate = new Date(activityStartDate.getTime() + (durationHours * 60 * 60 * 1000));
        
        console.log('Activity times (using createdAt):', {
          actualStart: activityStartDate.toISOString(),
          end: activityEndDate.toISOString(),
          duration: durationHours + ' hours',
          now: now.toISOString()
        });
        
        // Simple check: is the activity running right now based on createdAt?
        const isCurrentlyRunning = now >= activityStartDate && now <= activityEndDate;
        
        console.log('Time check:', {
          nowAfterStart: now >= activityStartDate,
          nowBeforeEnd: now <= activityEndDate,
          isCurrentlyRunning
        });
        
        if (isCurrentlyRunning) {
          console.log('✅ INCLUDE: Activity is currently running (from createdAt)');
        } else {
          console.log('❌ SKIP: Activity is not currently running (from createdAt)');
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

  const getActivityTypeById = (activityTypeId: string): ActivityType | null => {
    return state.activityTypes.find(type => type.id === activityTypeId) || null;
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
      case 'activityTypes':
        fetchData('activityTypes', getAllActivityTypes, 'SET_ACTIVITY_TYPES');
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
      getActivityTypeById,
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