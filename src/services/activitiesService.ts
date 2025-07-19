import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Activity {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  activityTypeId: string;
  activityTypeName: string;
  date: any;
  time: string;
  durationHours: number;
  isActive: boolean;
  isPrivate: boolean;
  isManuallyReactivated: boolean;
  mainImage: string;
  createdAt: any;
  updatedAt: any;
}

export interface ActivityType {
  id: string;
  name: string;
}

export const getTodayActivities = async (): Promise<Activity[]> => {
  try {
    // Get today's date in the same format as stored in Firebase
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const querySnapshot = await getDocs(collection(db, 'activities'));
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Activity;
      const activityDate = data.date.toDate();
      
      // Check if activity is for today and not private
      if (activityDate >= startOfDay && activityDate < endOfDay && !data.isPrivate) {
        activities.push({ id: doc.id, ...data });
      }
    });
    
    // Sort by time
    return activities.sort((a, b) => a.time.localeCompare(b.time));
  } catch (error) {
    console.error('Error fetching today activities:', error);
    return [];
  }
};

export const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'activities'));
    const activities: Activity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Activity;
      // Only include non-private activities
      if (!data.isPrivate) {
        activities.push({ id: doc.id, ...data });
      }
    });
    
    return activities;
  } catch (error) {
    console.error('Error fetching all activities:', error);
    return [];
  }
};

export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  try {
    const docRef = doc(db, 'activities', activityId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as Activity;
      return { id: docSnap.id, ...data };
    } else {
      console.log('No activity found with ID:', activityId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
};

// Get unique activity types from activities
export const getActivityTypes = (activities: Activity[]): ActivityType[] => {
  const typesMap = new Map<string, string>();
  
  activities.forEach(activity => {
    if (activity.activityTypeId && activity.activityTypeName) {
      typesMap.set(activity.activityTypeId, activity.activityTypeName);
    }
  });
  
  return Array.from(typesMap.entries()).map(([id, name]) => ({ id, name }));
}; 