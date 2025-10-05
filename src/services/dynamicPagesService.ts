import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  url: string;
  fileName: string;
  fileType?: string;
  uploadedAt?: Timestamp;
}

export interface DynamicPageSection {
  id: string;
  type: 'text' | 'photos' | 'videos';
  titleEn: string;
  titleAr: string;
  contentEn?: string;
  contentAr?: string;
  media?: MediaFile[];
  order: number;
}

export interface DynamicPage {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  bannerImage: string;
  bannerTitleEn: string;
  bannerTitleAr: string;
  bannerTextEn: string;
  bannerTextAr: string;
  bannerColorOverlay?: string;
  showBannerOverlay?: boolean;
  showOnAdminDashboard?: boolean;
  selectedSectionsForAdmin?: string[];
  sections: DynamicPageSection[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  displayOrder: number;
  
  // ✅ NEW FIELDS FOR CATEGORIES
  displayInHeader?: boolean;  // If true: show directly in header, if false: show in category
  categoryId?: string;        // Category ID (only if displayInHeader = false)
}

export const getDynamicPages = async (): Promise<DynamicPage[]> => {
  try {
    const q = query(
      collection(db, 'dynamicPages'),
      where('isActive', '==', true),
      orderBy('displayOrder', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DynamicPage));
  } catch (error) {
    console.error('Error fetching dynamic pages:', error);
    return [];
  }
};

export const getDynamicPageBySlug = async (slug: string): Promise<DynamicPage | null> => {
  try {
    const q = query(
      collection(db, 'dynamicPages'),
      where('slug', '==', slug),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as DynamicPage;
  } catch (error) {
    console.error('Error fetching dynamic page by slug:', error);
    return null;
  }
};

export const getDynamicPageById = async (id: string): Promise<DynamicPage | null> => {
  try {
    const docRef = doc(db, 'dynamicPages', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as DynamicPage;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching dynamic page by ID:', error);
    return null;
  }
};

export const getDynamicPagesForAdminDashboard = async (): Promise<DynamicPage[]> => {
  try {
    const q = query(
      collection(db, 'dynamicPages'),
      where('isActive', '==', true),
      where('showOnAdminDashboard', '==', true),
      orderBy('displayOrder', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DynamicPage));
  } catch (error) {
    console.error('Error fetching dynamic pages for admin dashboard:', error);
    return [];
  }
};

export const getSelectedSectionsFromPage = (page: DynamicPage): DynamicPageSection[] => {
  if (!page.selectedSectionsForAdmin || page.selectedSectionsForAdmin.length === 0) {
    return [];
  }
  
  return page.sections.filter(section => 
    page.selectedSectionsForAdmin!.includes(section.id)
  ).sort((a, b) => a.order - b.order);
};

// ✅ NEW: Get pages that display directly in header
export const getHeaderPages = async (): Promise<DynamicPage[]> => {
  try {
    const q = query(
      collection(db, 'dynamicPages'),
      where('isActive', '==', true),
      where('displayInHeader', '==', true),
      orderBy('displayOrder', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DynamicPage));
  } catch (error) {
    console.error('Error fetching header pages:', error);
    return [];
  }
};

// ✅ NEW: Get pages by category
export const getPagesByCategory = async (categoryId: string): Promise<DynamicPage[]> => {
  try {
    const q = query(
      collection(db, 'dynamicPages'),
      where('isActive', '==', true),
      where('displayInHeader', '==', false),
      where('categoryId', '==', categoryId),
      orderBy('displayOrder', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DynamicPage));
  } catch (error) {
    console.error('Error fetching pages by category:', error);
    return [];
  }
};
