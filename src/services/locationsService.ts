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

// Improved slug generation with name + description
export const createLocationSlug = (location: Location): string => {
  // Get name part
  const namePart = (location.nameEn || location.nameAr || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Get description part (first few words)
  const descPart = (location.descriptionEn || location.descriptionAr || '')
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
  } else if (location.id) {
    return `location-${location.id.substring(0, 8)}`;
  } else {
    return 'location';
  }
};

export const getLocationBySlug = async (slug: string): Promise<Location | null> => {
  try {
    console.log('Looking for location with slug:', slug);
    
    // Get all locations and find by matching slug
    const locations = await getLocations();
    
    console.log('Total locations found:', locations.length);
    
    const foundLocation = locations.find(location => {
      const locationSlug = createLocationSlug(location);
      console.log(`Comparing: "${locationSlug}" with "${slug}" for location:`, location.nameEn);
      return locationSlug === slug;
    });
    
    if (foundLocation) {
      console.log('Found matching location:', foundLocation.nameEn);
    } else {
      console.log('No matching location found for slug:', slug);
    }
    
    return foundLocation || null;
  } catch (error) {
    console.error('Error fetching location by slug:', error);
    return null;
  }
}; 