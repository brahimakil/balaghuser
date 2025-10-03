import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DashboardSection {
  id: string;
  type: 'fixed' | 'dynamicPage' | 'dynamicSection';
  label: string;
  icon: string;
  order: number;
  isVisible: boolean;
  
  // For fixed sections
  fixedSectionId?: 'map' | 'martyrs' | 'activities';
  
  // For dynamic pages
  dynamicPageId?: string;
  dynamicPageTitle?: string;
  
  // For dynamic sections
  dynamicSectionId?: string;
  dynamicSectionTitle?: string;
  parentPageId?: string;
  parentPageTitle?: string;
}

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
  // Header menu colors
  headerMenuColor?: string;
  headerMenuHoverColor?: string;
  // Section ordering (OLD - deprecated but kept for backwards compatibility)
  sectionOrder?: {
    map: number;
    martyrs: number;
    activities: number;
    dynamicPages?: number;
  };
  // NEW: Flexible dashboard sections
  dashboardSections?: DashboardSection[];
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
      console.log('Main settings:', websiteSettings.main);
      return websiteSettings.main;
    }
    
    // If the structure is flat (fields directly in the document)
    const docRef = doc(db, 'websiteSettings', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Direct document data:', data);
      
      return {
        lastUpdated: data.lastUpdated,
        mainLogoDark: data.mainLogoDark,
        mainLogoLight: data.mainLogoLight,
        // News ticker fields
        newsTickerColor: data.newsTickerColor,
        newsTickerTextColor: data.newsTickerTextColor,
        newsTickerFontSize: data.newsTickerFontSize,
        newsTickerHeight: data.newsTickerHeight,
        // Header menu color fields
        headerMenuColor: data.headerMenuColor,
        headerMenuHoverColor: data.headerMenuHoverColor,
        // NEW: Section order
        sectionOrder: data.sectionOrder,
        dashboardSections: data.dashboardSections // NEW
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching main settings:', error);
    return null;
  }
};

// NEW: Get dashboard sections with automatic migration from old format
export const getDashboardSections = async (): Promise<DashboardSection[]> => {
  try {
    const mainSettings = await getMainSettings();
    
    if (!mainSettings) {
      // Return default sections if no settings exist
      return [
        {
          id: 'fixed_map',
          type: 'fixed',
          fixedSectionId: 'map',
          label: 'Interactive Map',
          icon: '🗺️',
          order: 1,
          isVisible: true
        },
        {
          id: 'fixed_martyrs',
          type: 'fixed',
          fixedSectionId: 'martyrs',
          label: 'Martyrs',
          icon: '👥',
          order: 2,
          isVisible: true
        },
        {
          id: 'fixed_activities',
          type: 'fixed',
          fixedSectionId: 'activities',
          label: 'Activities',
          icon: '📅',
          order: 3,
          isVisible: true
        }
      ];
    }
    
    // If new format exists, use it
    if (mainSettings.dashboardSections && mainSettings.dashboardSections.length > 0) {
      return mainSettings.dashboardSections;
    }
    
    // Migrate from old format
    if (mainSettings.sectionOrder) {
      const { map, martyrs, activities } = mainSettings.sectionOrder;
      return [
        {
          id: 'fixed_map',
          type: 'fixed',
          fixedSectionId: 'map',
          label: 'Interactive Map',
          icon: '🗺️',
          order: map,
          isVisible: true
        },
        {
          id: 'fixed_martyrs',
          type: 'fixed',
          fixedSectionId: 'martyrs',
          label: 'Martyrs',
          icon: '👥',
          order: martyrs,
          isVisible: true
        },
        {
          id: 'fixed_activities',
          type: 'fixed',
          fixedSectionId: 'activities',
          label: 'Activities',
          icon: '📅',
          order: activities,
          isVisible: true
        }
      ];
    }
    
    // Fallback to default
    return [
      {
        id: 'fixed_map',
        type: 'fixed',
        fixedSectionId: 'map',
        label: 'Interactive Map',
        icon: '🗺️',
        order: 1,
        isVisible: true
      },
      {
        id: 'fixed_martyrs',
        type: 'fixed',
        fixedSectionId: 'martyrs',
        label: 'Martyrs',
        icon: '👥',
        order: 2,
        isVisible: true
      },
      {
        id: 'fixed_activities',
        type: 'fixed',
        fixedSectionId: 'activities',
        label: 'Activities',
        icon: '📅',
        order: 3,
        isVisible: true
      }
    ];
  } catch (error) {
    console.error('Error fetching dashboard sections:', error);
    return [];
  }
};