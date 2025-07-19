import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Martyr {
  id: string;
  nameEn: string;
  nameAr: string;
  storyEn: string;
  storyAr: string;
  familyStatus: 'single' | 'married';
  warNameEn: string;
  warNameAr: string;
  mainIcon: string;
  qrCode: string;
  dateOfShahada: any;
  dob: any;
  createdAt: any;
  updatedAt: any;
}

// Cache for martyrs to avoid refetching
let martyrsCache: Martyr[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getRandomMartyrs = async (count: number = 8): Promise<Martyr[]> => {
  try {
    const now = Date.now();
    
    // Use cache if available and fresh
    if (martyrsCache && (now - lastFetchTime) < CACHE_DURATION) {
      const shuffled = [...martyrsCache].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    
    // Fetch from Firebase
    const querySnapshot = await getDocs(collection(db, 'martyrs'));
    const martyrs: Martyr[] = [];
    
    querySnapshot.forEach((doc) => {
      martyrs.push({ id: doc.id, ...doc.data() } as Martyr);
    });
    
    // Update cache
    martyrsCache = martyrs;
    lastFetchTime = now;
    
    // Shuffle and return
    const shuffled = martyrs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching martyrs:', error);
    return [];
  }
};

export const getAllMartyrs = async (): Promise<Martyr[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'martyrs'));
    const martyrs: Martyr[] = [];
    
    querySnapshot.forEach((doc) => {
      martyrs.push({ id: doc.id, ...doc.data() } as Martyr);
    });
    
    return martyrs;
  } catch (error) {
    console.error('Error fetching all martyrs:', error);
    return [];
  }
}; 