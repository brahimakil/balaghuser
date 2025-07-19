import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PageSettings {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  mainImage: string;
  colorOverlay: string;
  createdAt: any;
  updatedAt: any;
}

export interface WebsiteSettings {
  main: {
    lastUpdated: any;
  };
  pages: {
    home: PageSettings;
    activities: PageSettings;
    locations: PageSettings;
    martyrs: PageSettings;
    news: PageSettings;
  };
}

export const getWebsiteSettings = async (): Promise<WebsiteSettings | null> => {
  try {
    const docRef = doc(db, 'websiteSettings', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as WebsiteSettings;
    } else {
      console.log('No website settings found!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching website settings:', error);
    return null;
  }
};

export const getPageSettings = async (pageId: string): Promise<PageSettings | null> => {
  try {
    const settings = await getWebsiteSettings();
    if (settings && settings.pages && settings.pages[pageId as keyof typeof settings.pages]) {
      return settings.pages[pageId as keyof typeof settings.pages];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching page settings for ${pageId}:`, error);
    return null;
  }
};