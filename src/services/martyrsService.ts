import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getWarById, type War } from './warsService';

export interface MediaFile {
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
}

export interface Martyr {
  id: string;
  nameEn: string;
  nameAr: string;
  jihadistNameEn: string;    // NEW: Renamed from warNameEn
  jihadistNameAr: string;    // NEW: Renamed from warNameAr
  warId: string;             // NEW: Reference to Wars collection
  familyStatus: 'single' | 'married';
  numberOfChildren?: number; // NEW: Number of children if married
  dob: any;
  placeOfBirthEn?: string;   // NEW: Birth location (English)
  placeOfBirthAr?: string;   // NEW: Birth location (Arabic)
  dateOfShahada: any;
  burialPlaceEn?: string;    // NEW: Burial location (English)
  burialPlaceAr?: string;    // NEW: Burial location (Arabic)
  storyEn: string;
  storyAr: string;
  mainIcon: string;
  qrCode: string;
  createdAt: any;
  updatedAt: any;
  photos?: MediaFile[];
  videos?: MediaFile[];
  
  // Backward compatibility fields (deprecated)
  warNameEn?: string;
  warNameAr?: string;
  placeOfBirth?: string;
  burialPlace?: string;
  
  // Runtime fields (not stored in DB)
  war?: War | null;
}

// Cache for martyrs to avoid refetching
let martyrsCache: Martyr[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to handle backward compatibility
const processLegacyMartyr = (martyr: any): Martyr => {
  return {
    ...martyr,
    // Use new fields if available, fallback to old fields
    jihadistNameEn: martyr.jihadistNameEn || martyr.warNameEn || '',
    jihadistNameAr: martyr.jihadistNameAr || martyr.warNameAr || '',
    placeOfBirthEn: martyr.placeOfBirthEn || martyr.placeOfBirth || '',
    placeOfBirthAr: martyr.placeOfBirthAr || '',
    burialPlaceEn: martyr.burialPlaceEn || martyr.burialPlace || '',
    burialPlaceAr: martyr.burialPlaceAr || '',
  };
};

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
      const martyrData = processLegacyMartyr({ id: doc.id, ...doc.data() });
      martyrs.push(martyrData);
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
      const martyrData = processLegacyMartyr({ id: doc.id, ...doc.data() });
      martyrs.push(martyrData);
    });
    
    return martyrs;
  } catch (error) {
    console.error('Error fetching all martyrs:', error);
    return [];
  }
};

export const getMartyrById = async (id: string): Promise<Martyr | null> => {
  try {
    const docRef = doc(db, 'martyrs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const martyrData = processLegacyMartyr({
        id: docSnap.id,
        ...docSnap.data()
      });
      
      // Fetch war information if warId exists
      if (martyrData.warId) {
        try {
          const war = await getWarById(martyrData.warId);
          martyrData.war = war;
        } catch (error) {
          console.warn('Error fetching war data for martyr:', error);
          martyrData.war = null;
        }
      }
      
      return martyrData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching martyr:', error);
    return null;
  }
};

export const getMartyrsForWar = async (warId: string): Promise<Martyr[]> => {
  try {
    const q = query(collection(db, 'martyrs'), where('warId', '==', warId));
    const querySnapshot = await getDocs(q);
    const martyrs: Martyr[] = [];
    
    querySnapshot.forEach((doc) => {
      const martyrData = processLegacyMartyr({ id: doc.id, ...doc.data() });
      martyrs.push(martyrData);
    });
    
    return martyrs;
  } catch (error) {
    console.error('Error fetching martyrs for war:', error);
    return [];
  }
};

// Helper functions for backward compatibility
export const getJihadistName = (martyr: Martyr, language: 'en' | 'ar'): string => {
  if (language === 'ar') {
    return martyr.jihadistNameAr || martyr.warNameAr || "غير محدد";
  }
  return martyr.jihadistNameEn || martyr.warNameEn || "Unknown";
};

export const getBirthPlace = (martyr: Martyr, language: 'en' | 'ar'): string => {
  if (language === 'ar') {
    return martyr.placeOfBirthAr || "";
  }
  return martyr.placeOfBirthEn || martyr.placeOfBirth || "";
};

export const getBurialPlace = (martyr: Martyr, language: 'en' | 'ar'): string => {
  if (language === 'ar') {
    return martyr.burialPlaceAr || "";
  }
  return martyr.burialPlaceEn || martyr.burialPlace || "";
}; 

// Update the createMartyrSlug function to match backend format:
export const createMartyrSlug = (martyr: Martyr): string => {
  // Clean the main name
  const mainName = (martyr.nameEn || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .trim();
  
  // Clean the jihadist name if it exists
  const jihadistName = (martyr.jihadistNameEn || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .trim();
  
  // Combine: nameofmartyr--jihadistname (double dashes)
  if (jihadistName) {
    return `${mainName}--${jihadistName}`;
  } else {
    return mainName;
  }
};

// Update helper to extract martyr info from new slug format
export const extractMartyrFromSlug = (slug: string): { mainName: string; jihadistName?: string } => {
  const parts = slug.split('--'); // Split on double dashes
  
  if (parts.length === 2) {
    return {
      mainName: parts[0],
      jihadistName: parts[1]
    };
  } else {
    return {
      mainName: slug
    };
  }
};

// New function to find martyr by slug instead of ID
export const getMartyrBySlug = async (slug: string): Promise<Martyr | null> => {
  try {
    const { mainName, jihadistName } = extractMartyrFromSlug(slug);
    
    // Get all martyrs and search by name match
    const martyrs = await getAllMartyrs();
    
    const foundMartyr = martyrs.find(martyr => {
      const martyrMainName = (martyr.nameEn || '').toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const martyrJihadistName = (martyr.jihadistNameEn || '').toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Match main name and jihadist name
      return martyrMainName === mainName && 
             (jihadistName ? martyrJihadistName === jihadistName : true);
    });
    
    if (foundMartyr) {
      // Fetch war information if warId exists
      if (foundMartyr.warId) {
        try {
          const war = await getWarById(foundMartyr.warId);
          foundMartyr.war = war;
        } catch (error) {
          console.warn('Error fetching war data for martyr:', error);
          foundMartyr.war = null;
        }
      }
      
      return foundMartyr;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching martyr by slug:', error);
    return null;
  }
};

// Keep the old function for backward compatibility
export const extractIdFromSlug = (slug: string): string => {
  // Try new format first (double dashes)
  if (slug.includes('--')) {
    return slug; // Return the full slug for new format
  }
  
  // Old format fallback (single dash with ID at end)
  const parts = slug.split('-');
  return parts[parts.length - 1];
}; 