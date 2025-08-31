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
  showOverlay?: boolean; // NEW: Optional boolean for overlay toggle
  createdAt: any;
  updatedAt: any;
}

export interface MainSettings {
  lastUpdated: any;
  mainLogoDark: string;
  mainLogoLight: string;
  // News ticker settings
  newsTickerColor?: string;
  newsTickerTextColor?: string;
  newsTickerFontSize?: number;
  newsTickerHeight?: number;
  // NEW: Header menu colors
  headerMenuColor?: string;
  headerMenuHoverColor?: string;
}

export interface WebsiteSettings {
  main: MainSettings;
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
      const data = docSnap.data();
      console.log('Website settings data:', data); // Debug log
      return data as WebsiteSettings;
    } else {
      console.log('No website settings document found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching website settings:', error);
    return null;
  }
};

export const getPageSettings = async (pageId: string): Promise<PageSettings | null> => {
  try {
    const websiteSettings = await getWebsiteSettings();
    if (websiteSettings && websiteSettings.pages && websiteSettings.pages[pageId as keyof typeof websiteSettings.pages]) {
      return websiteSettings.pages[pageId as keyof typeof websiteSettings.pages];
    }
    return null;
  } catch (error) {
    console.error('Error fetching page settings:', error);
    return null;
  }
};

export const getMainSettings = async (): Promise<MainSettings | null> => {
  try {
    const websiteSettings = await getWebsiteSettings();
    if (websiteSettings && websiteSettings.main) {
      console.log('Main settings:', websiteSettings.main); // Debug log
      return websiteSettings.main;
    }
    
    // If the structure is flat (fields directly in the document)
    const docRef = doc(db, 'websiteSettings', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Direct document data:', data); // Debug log
      
      // Return all the fields that might be directly in the document
      return {
        lastUpdated: data.lastUpdated,
        mainLogoDark: data.mainLogoDark,
        mainLogoLight: data.mainLogoLight,
        // News ticker fields
        newsTickerColor: data.newsTickerColor,
        newsTickerTextColor: data.newsTickerTextColor,
        newsTickerFontSize: data.newsTickerFontSize,
        newsTickerHeight: data.newsTickerHeight,
        // NEW: Header menu color fields
        headerMenuColor: data.headerMenuColor,
        headerMenuHoverColor: data.headerMenuHoverColor
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching main settings:', error);
    return null;
  }
};