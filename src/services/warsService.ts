import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
}

export interface War {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  startDate: any;
  endDate: any; // null = ongoing war
  mainImage: string;
  photos?: MediaFile[];
  videos?: MediaFile[];
  createdAt: any;
  updatedAt: any;
}

// Cache for wars to avoid refetching
let warsCache: War[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAllWars = async (): Promise<War[]> => {
  try {
    const now = Date.now();
    
    // Use cache if available and fresh
    if (warsCache && (now - lastFetchTime) < CACHE_DURATION) {
      return warsCache;
    }
    
    const q = query(collection(db, 'wars'), orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const wars: War[] = [];
    
    querySnapshot.forEach((doc) => {
      wars.push({ id: doc.id, ...doc.data() } as War);
    });
    
    // Update cache
    warsCache = wars;
    lastFetchTime = now;
    
    return wars;
  } catch (error) {
    console.error('Error fetching wars:', error);
    return [];
  }
};

export const getWarById = async (id: string): Promise<War | null> => {
  try {
    const docRef = doc(db, 'wars', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as War;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching war:', error);
    return null;
  }
};

export const getWarWithMartyrs = async (warId: string) => {
  // This will be implemented once we update the martyrs service
  // For now, return just the war data
  const war = await getWarById(warId);
  return war;
};
