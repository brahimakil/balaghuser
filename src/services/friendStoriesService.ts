import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface FriendStoryImage {
  fileName: string;
  url: string;
  uploadedAt: any;
}

export interface FriendStory {
  id: string;
  martyrId: string;
  
  // Submitter Info
  submitterName: string; // Original submitted name
  submitterengName: string; // Admin-edited English name (lowercase 'eng')
  submitterarName: string; // Admin-edited Arabic name (lowercase 'ar')
  submitterRelation: 'friend' | 'family';
  
  // Stories
  originalStory: string;
  storyEn: string;
  storyAr: string;
  
  // Images
  images: FriendStoryImage[];
  
  // Status and admin fields
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
  reviewNotes?: string;
  displayOrder: number;
  updatedAt: any;
}

export interface FriendStorySubmission {
  martyrId: string;
  submitterName: string;
  submitterRelation: string;
  originalStory: string;
  images: File[];
}

// Submit a new friend story
export const submitFriendStory = async (submission: FriendStorySubmission): Promise<boolean> => {
  try {
    // Upload images first
    const uploadedImages: FriendStoryImage[] = [];
    
    for (let i = 0; i < Math.min(submission.images.length, 2); i++) {
      const file = submission.images[i];
      const fileName = `story_${Date.now()}_${i + 1}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `friend-stories/${submission.martyrId}/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      uploadedImages.push({
        fileName,
        url: downloadURL,
        uploadedAt: new Date()
      });
    }
    
    // Create story document
    const storyData = {
      martyrId: submission.martyrId,
      submitterName: submission.submitterName, // Original name
      submitterEngName: '', // Empty - admin will fill
      submitterArName: '', // Empty - admin will fill
      submitterRelation: submission.submitterRelation,
      originalStory: submission.originalStory,
      storyEn: '',
      storyAr: '',
      images: uploadedImages,
      status: 'pending',
      submittedAt: new Date(),
      updatedAt: new Date()
    };
    
    await addDoc(collection(db, 'martyrFriendStories'), storyData);
    return true;
  } catch (error) {
    console.error('Error submitting friend story:', error);
    return false;
  }
};

// Get approved stories for a martyr (public)
export const getApprovedStoriesForMartyr = async (martyrId: string): Promise<FriendStory[]> => {
  try {
    const q = query(
      collection(db, 'martyrFriendStories'),
      where('martyrId', '==', martyrId),
      where('status', '==', 'approved'),
      orderBy('displayOrder', 'asc'),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const stories: FriendStory[] = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() } as FriendStory);
    });
    
    return stories;
  } catch (error) {
    console.error('Error fetching approved stories:', error);
    return [];
  }
};
