import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LocationPrayerTiming {
  locationId: string;
  prayerTiming: 'before_dohor' | 'after_dohor';
}

export interface Sector {
  id: string;
  nameEn: string;
  nameAr: string;
  locationIds: string[];
  locationPrayerTimings: LocationPrayerTiming[];
  createdAt: any;
  updatedAt: any;
}

export const getAllSectors = async (): Promise<Sector[]> => {
  try {
    const q = query(collection(db, 'sectors'), orderBy('nameEn', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Sector));
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return [];
  }
};

export const getSectorById = async (sectorId: string): Promise<Sector | null> => {
  try {
    const docRef = doc(db, 'sectors', sectorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Sector;
    }
    return null;
  } catch (error) {
    console.error('Error fetching sector:', error);
    return null;
  }
};
