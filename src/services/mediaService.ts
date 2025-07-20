import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface MediaItem {
  url: string;
  name: string;
  type: 'image' | 'video';
  fullPath: string;
}

export const getMartyrMedia = async (martyrId: string): Promise<{ photos: MediaItem[], videos: MediaItem[] }> => {
  try {
    const photosRef = ref(storage, `martyrs/${martyrId}/photos`);
    const videosRef = ref(storage, `martyrs/${martyrId}/videos`);

    const [photosResult, videosResult] = await Promise.all([
      listAll(photosRef),
      listAll(videosRef)
    ]);

    const photos: MediaItem[] = await Promise.all(
      photosResult.items.map(async (item) => ({
        url: await getDownloadURL(item),
        name: item.name,
        type: 'image' as const,
        fullPath: item.fullPath
      }))
    );

    const videos: MediaItem[] = await Promise.all(
      videosResult.items.map(async (item) => ({
        url: await getDownloadURL(item),
        name: item.name,
        type: 'video' as const,
        fullPath: item.fullPath
      }))
    );

    return { photos, videos };
  } catch (error) {
    console.error('Error fetching media:', error);
    return { photos: [], videos: [] };
  }
}; 