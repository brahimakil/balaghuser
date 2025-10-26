import React, { useState, useEffect } from 'react';
import { Heart, Users, Plus, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getApprovedStoriesForMartyr, type FriendStory } from '../services/friendStoriesService';
import FriendStoryForm from './FriendStoryForm';

interface FriendStoriesSectionProps {
  martyrId: string;
  martyrName: string;
}

const FriendStoriesSection: React.FC<FriendStoriesSectionProps> = ({ martyrId, martyrName }) => {
  const { language, isRTL } = useLanguage();
  const [stories, setStories] = useState<FriendStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      const approvedStories = await getApprovedStoriesForMartyr(martyrId);
      setStories(approvedStories);
      setLoading(false);
    };
    loadStories();
  }, [martyrId]);

  const getRelationText = (relation: string) => {
    const relations = {
      friend: { en: 'Friend', ar: 'صديق' },
      family: { en: 'Family Member', ar: 'فرد من العائلة' }
    };
    return relations[relation as keyof typeof relations]?.[language] || relation;
  };

  // Get submitter name based on language
  const getSubmitterName = (story: FriendStory) => {
    if (language === 'ar') {
      // For Arabic: use Arabic name if exists and not empty, otherwise fallback to original
      return (story.submitterarName && story.submitterarName.trim() !== '') 
        ? story.submitterarName 
        : story.submitterName;
    } else {
      // For English: use English name if exists and not empty, otherwise fallback to original  
      return (story.submitterengName && story.submitterengName.trim() !== '') 
        ? story.submitterengName 
        : story.submitterName;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-primary-200 dark:bg-primary-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded"></div>
            <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              {language === 'ar' ? 'قصص مع الشهيد' : 'Stories with Martyr'}
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'مشاركة قصة' : 'Share Story'}
            </span>
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-primary-400 mx-auto mb-3" />
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              {language === 'ar' 
                ? 'لا توجد قصص مشتركة بعد. كن أول من يشارك قصة مع هذا الشهيد.'
                : 'No shared stories yet. Be the first to share a story with this martyr.'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              {language === 'ar' ? 'مشاركة قصة' : 'Share Story'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div key={story.id} className="border border-primary-200 dark:border-primary-700 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {getSubmitterName(story)}
                    </h3>
                    <span className="text-sm text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/30 px-2 py-1 rounded">
                      {getRelationText(story.submitterRelation)}
                    </span>
                  </div>
                </div>

                <div className={`text-primary-700 dark:text-primary-300 leading-relaxed mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? story.storyAr : story.storyEn}
                </div>

                {story.images && story.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {story.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`Story image ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                            {language === 'ar' ? 'عرض' : 'View'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <FriendStoryForm
          martyrId={martyrId}
          martyrName={martyrName}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Full Image */}
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FriendStoriesSection;

