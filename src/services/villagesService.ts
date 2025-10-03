import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Village {
  id?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  createdAt: any;
  updatedAt: any;
}

export const getAllVillages = async (): Promise<Village[]> => {
  try {
    const q = query(collection(db, 'villages'), orderBy('nameEn', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Village[];
  } catch (error) {
    console.error('Error fetching villages:', error);
    return [];
  }
};

export const getVillageById = async (villageId: string): Promise<Village | null> => {
  try {
    const docRef = doc(db, 'villages', villageId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Village;
    }
    return null;
  } catch (error) {
    console.error('Error fetching village:', error);
    return null;
  }
};

export const getVillageName = async (villageId: string): Promise<{nameEn: string, nameAr: string} | null> => {
  if (!villageId) return null;
  
  try {
    const villageDoc = await getDoc(doc(db, 'villages', villageId));
    if (villageDoc.exists()) {
      const data = villageDoc.data();
      return {
        nameEn: data.nameEn,
        nameAr: data.nameAr
      };
    }
  } catch (error) {
    console.error('Error fetching village:', error);
  }
  return null;
};

// Simplified slug generation for villages (name only, no description needed)
export const createVillageSlug = (village: Village): string => {
  const name = (village.nameEn || village.nameAr || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return name || (village.id ? `village-${village.id.substring(0, 8)}` : 'village');
};

export const getVillageBySlug = async (slug: string): Promise<Village | null> => {
  try {
    const villages = await getAllVillages();
    
    const foundVillage = villages.find(village => {
      const villageSlug = createVillageSlug(village);
      return villageSlug === slug;
    });
    
    // If slug lookup fails, try direct ID lookup for backward compatibility
    if (!foundVillage) {
      const villageById = villages.find(v => v.id === slug);
      return villageById || null;
    }
    
    return foundVillage || null;
  } catch (error) {
    console.error('Error fetching village by slug:', error);
    return null;
  }
};
