import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
}

export interface ActivityType {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  createdAt: any;
  updatedAt: any;
}

export interface Activity {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  activityTypeId: string;
  villageId?: string; // NEW: Optional village reference
  date: any;
  time: string;
  durationHours: number;
  isActive: boolean;
  isManuallyReactivated: boolean;
  isPrivate: boolean;
  mainImage: string;
  createdAt: any;
  updatedAt: any;
  photos?: MediaFile[];
  videos?: MediaFile[];
  // Populated field
  activityTypeName?: string;
}

export const getAllActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'activityTypes'));
    const activityTypes: ActivityType[] = [];
    
    querySnapshot.forEach((doc) => {
      activityTypes.push({ id: doc.id, ...doc.data() } as ActivityType);
    });
    
    return activityTypes;
  } catch (error) {
    console.error('Error fetching activity types:', error);
    return [];
  }
};

export const getActivityTypeById = async (id: string): Promise<ActivityType | null> => {
  try {
    const docRef = doc(db, 'activityTypes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ActivityType;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching activity type:', error);
    return null;
  }
};

export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('isPrivate', '==', false),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as Activity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    // If orderBy fails, try without it
    try {
      const simpleQuery = query(
        collection(db, 'activities'),
        where('isPrivate', '==', false)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      const activities: Activity[] = [];
      
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() } as Activity);
      });
      
      // Sort manually
      activities.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      return activities;
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

export const getTodayActivities = async (): Promise<Activity[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const q = query(
      collection(db, 'activities'),
      where('isPrivate', '==', false),
      where('date', '>=', today),
      where('date', '<', tomorrow)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as Activity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error fetching today activities:', error);
    return [];
  }
};

export const getActivityById = async (id: string): Promise<Activity | null> => {
  try {
    const docRef = doc(db, 'activities', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Activity;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
}; 

// Improved slug generation with name + description
export const createActivitySlug = (activity: Activity): string => {
  // Get name part
  const namePart = (activity.nameEn || activity.nameAr || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Get description part (first few words)
  const descPart = (activity.descriptionEn || activity.descriptionAr || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .split('-')
    .slice(0, 3) // Take first 3 words
    .join('-');
  
  // Combine name and description with double dash
  if (namePart && descPart) {
    return `${namePart}--${descPart}`;
  } else if (namePart) {
    return namePart;
  } else if (descPart) {
    return descPart;
  } else if (activity.id) {
    return `activity-${activity.id.substring(0, 8)}`;
  } else {
    return 'activity';
  }
};

export const getActivityBySlug = async (slug: string): Promise<Activity | null> => {
  try {
    console.log('Looking for activity with slug:', slug);
    
    // Get all activities and find by matching slug
    const activities = await getAllActivities();
    
    console.log('Total activities found:', activities.length);
    
    const foundActivity = activities.find(activity => {
      const activitySlug = createActivitySlug(activity);
      console.log(`Comparing: "${activitySlug}" with "${slug}" for activity:`, activity.nameEn);
      return activitySlug === slug;
    });
    
    if (foundActivity) {
      console.log('Found matching activity:', foundActivity.nameEn);
    } else {
      console.log('No matching activity found for slug:', slug);
    }
    
    return foundActivity || null;
  } catch (error) {
    console.error('Error fetching activity by slug:', error);
    return null;
  }
}; 

// Simplified slug generation for ActivityType (name only, no description needed)
export const createActivityTypeSlug = (activityType: ActivityType): string => {
  const name = (activityType.nameEn || activityType.nameAr || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return name || (activityType.id ? `activity-type-${activityType.id.substring(0, 8)}` : 'activity-type');
};

export const getActivityTypeBySlug = async (slug: string): Promise<ActivityType | null> => {
  try {
    const activityTypes = await getAllActivityTypes();
    
    const foundType = activityTypes.find(type => {
      const typeSlug = createActivityTypeSlug(type);
      return typeSlug === slug;
    });
    
    // If slug lookup fails, try direct ID lookup for backward compatibility
    if (!foundType) {
      const typeById = activityTypes.find(t => t.id === slug);
      return typeById || null;
    }
    
    return foundType || null;
  } catch (error) {
    console.error('Error fetching activity type by slug:', error);
    return null;
  }
}; 