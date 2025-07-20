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