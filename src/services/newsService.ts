import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface NewsItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  mainImage: string;
  type: 'live' | 'regular';
  publishDate: any;
  publishTime: string;
  liveDurationHours?: number;
  liveStartTime?: any;
  createdAt: any;
  updatedAt: any;
}

export const getAllNews = async (): Promise<NewsItem[]> => {
  try {
    const q = query(
      collection(db, 'news'),
      orderBy('publishDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItem));
  } catch (error) {
    console.error('Error fetching news:', error);
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
    console.error('Error fetching news by id:', error);
    return null;
  }
};

export const getLiveNews = async (): Promise<NewsItem[]> => {
  try {
    const q = query(
      collection(db, 'news'),
      where('type', '==', 'live'),
      orderBy('liveStartTime', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filter out expired live news
    const now = new Date();
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as NewsItem))
      .filter(news => {
        if (!news.liveStartTime || !news.liveDurationHours) return false;
        
        const startTime = news.liveStartTime.toDate();
        const endTime = new Date(startTime.getTime() + (news.liveDurationHours * 60 * 60 * 1000));
        
        return now >= startTime && now <= endTime;
      });
  } catch (error) {
    console.error('Error fetching live news:', error);
    return [];
  }
};

export const getRegularNews = async (): Promise<NewsItem[]> => {
  try {
    const q = query(
      collection(db, 'news'),
      where('type', '==', 'regular'),
      orderBy('publishDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItem));
  } catch (error) {
    console.error('Error fetching regular news:', error);
    return [];
  }
};

export const isNewsLiveNow = (news: NewsItem): boolean => {
  if (news.type !== 'live' || !news.liveStartTime || !news.liveDurationHours) {
    return false;
  }
  
  const now = new Date();
  const startTime = news.liveStartTime.toDate();
  const endTime = new Date(startTime.getTime() + (news.liveDurationHours * 60 * 60 * 1000));
  
  return now >= startTime && now <= endTime;
}; 