import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PageCategory {
  id?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class PageCategoriesService {
  private collectionName = 'pageCategories';

  async getActiveCategories(): Promise<PageCategory[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PageCategory));
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return [];
    }
  }

  async getAllCategories(): Promise<PageCategory[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('displayOrder', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PageCategory));
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return [];
    }
  }
}

export const pageCategoriesService = new PageCategoriesService();
