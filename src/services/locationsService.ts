import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
}

export interface Location {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  latitude: number;
  longitude: number;
  legendId: string;
  mainImage: string;
  createdAt: any;
  updatedAt: any;
  photos?: MediaFile[];
  videos?: MediaFile[];
  photos360?: MediaFile[];
}

export interface Legend {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  mainIcon: string;
  createdAt: any;
  updatedAt: any;
}

export const getLocations = async (): Promise<Location[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'locations'));
    const locations: Location[] = [];
    
    querySnapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() } as Location);
    });
    
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const getLegends = async (): Promise<Legend[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'legends'));
    const legends: Legend[] = [];
    
    querySnapshot.forEach((doc) => {
      legends.push({ id: doc.id, ...doc.data() } as Legend);
    });
    
    return legends;
  } catch (error) {
    console.error('Error fetching legends:', error);
    return [];
  }
};

export const getLegendById = async (legendId: string): Promise<Legend | null> => {
  try {
    const docRef = doc(db, 'legends', legendId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Legend;
    } else {
      console.log('No legend found with ID:', legendId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching legend:', error);
    return null;
  }
};

export const getLocationById = async (id: string): Promise<Location | null> => {
  try {
    const docRef = doc(db, 'locations', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Location;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}; 