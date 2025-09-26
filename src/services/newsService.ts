import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MediaFile {
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
}

export interface NewsItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  mainImage: string;
  type: 'live' | 'regular' | 'regularLive';
  publishDate: any;
  publishTime: string;
  liveDurationHours?: number;
  liveStartTime?: any;
  isPressNews?: boolean;  // NEW: Press news flag
  createdAt: any;
  updatedAt: any;
  photos?: MediaFile[];
  videos?: MediaFile[];
}

export const getAllNews = async (): Promise<NewsItem[]> => {
  try {
    const q = query(
      collection(db, 'news'),
      orderBy('publishDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const news: NewsItem[] = [];
    
    querySnapshot.forEach((doc) => {
      news.push({ id: doc.id, ...doc.data() } as NewsItem);
    });
    
    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    // Fallback without orderBy
    try {
      const simpleQuery = collection(db, 'news');
      const querySnapshot = await getDocs(simpleQuery);
      const news: NewsItem[] = [];
      
      querySnapshot.forEach((doc) => {
        news.push({ id: doc.id, ...doc.data() } as NewsItem);
      });
      
      // Sort manually
      news.sort((a, b) => {
        const dateA = a.publishDate?.toDate ? a.publishDate.toDate() : new Date(a.publishDate);
        const dateB = b.publishDate?.toDate ? b.publishDate.toDate() : new Date(b.publishDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      return news;
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

export const getLiveNews = async (): Promise<NewsItem[]> => {
  try {
    const now = new Date();
    
    // Fetch all news and filter client-side for both 'live' and 'regularLive'
    const querySnapshot = await getDocs(collection(db, 'news'));
    const liveNews: NewsItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const newsItem = { id: doc.id, ...doc.data() } as NewsItem;
      
      console.log('News item type:', newsItem.type); // Debug log
      
      if (newsItem.type === 'live') {
        // Check if live news is still active
        if (newsItem.liveStartTime && newsItem.liveDurationHours) {
          const startTime = newsItem.liveStartTime.toDate ? newsItem.liveStartTime.toDate() : new Date(newsItem.liveStartTime);
          const endTime = new Date(startTime.getTime() + newsItem.liveDurationHours * 60 * 60 * 1000);
          
          if (now >= startTime && now <= endTime) {
            liveNews.push(newsItem);
          }
        }
      } else if (newsItem.type === 'regularLive') {  // Fixed: capital L
        // Include regularLive news directly (backend handles deletion)
        console.log('Found regularLive news:', newsItem.titleEn); // Debug log
        liveNews.push(newsItem);
      }
    });
    
    console.log('Live news fetched:', liveNews); // Debug log to see what's being fetched
    return liveNews;
  } catch (error) {
    console.error('Error fetching live news:', error);
    return [];
  }
};

export const getNewsById = async (id: string): Promise<NewsItem | null> => {
  try {
    const docRef = doc(db, 'news', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as NewsItem;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching news item:', error);
    return null;
  }
};

export const isNewsLiveNow = (news: NewsItem): boolean => {
  if (news.type === 'regularLive') {  // Fixed: capital L
    return true; // regularLive is always considered "live"
  }
  
  if (news.type !== 'live' || !news.liveStartTime || !news.liveDurationHours) {
    return false;
  }
  
  const now = new Date();
  const startTime = news.liveStartTime.toDate ? news.liveStartTime.toDate() : new Date(news.liveStartTime);
  const endTime = new Date(startTime.getTime() + news.liveDurationHours * 60 * 60 * 1000);
  
  return now >= startTime && now <= endTime;
}; 