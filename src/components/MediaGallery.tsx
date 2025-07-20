import React, { useState } from 'react';
import { X, Image, Video, ZoomIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { MediaFile } from '../services/martyrsService';

interface MediaGalleryProps {
  photos: MediaFile[];
  videos: MediaFile[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ photos = [], videos = [] }) => {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const hasPhotos = photos && photos.length > 0;
  const hasVideos = videos && videos.length > 0;

  if (!hasPhotos && !hasVideos) {
    return (
      <div className="text-center py-8 text-primary-600 dark:text-primary-400">
        {language === 'ar' ? 'لا توجد ملفات وسائط متاحة' : 'No media files available'}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-4 mb-6">
        <h3 className="text-xl font-bold text-primary-900 dark:text-white">
          {language === 'ar' ? 'الوسائط' : 'Media'}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-primary-100 dark:bg-primary-700 rounded-lg p-1">
        {hasPhotos && (
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-white dark:bg-primary-600 text-primary-900 dark:text-white shadow-sm'
                : 'text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
            }`}
          >
            <Image className="h-4 w-4" />
            <span>
              {language === 'ar' ? `الصور (${photos.length})` : `Photos (${photos.length})`}
            </span>
          </button>
        )}
        
        {hasVideos && (
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-white dark:bg-primary-600 text-primary-900 dark:text-white shadow-sm'
                : 'text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>
              {language === 'ar' ? `الفيديوهات (${videos.length})` : `Videos (${videos.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Photos Grid */}
      {activeTab === 'photos' && hasPhotos && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={index}
              className="relative group aspect-square bg-primary-100 dark:bg-primary-700 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setFullscreenImage(photo.url)}
            >
              <img
                src={photo.url}
                alt={photo.fileName}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {activeTab === 'videos' && hasVideos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <div key={index} className="bg-primary-50 dark:bg-primary-700 rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-auto max-h-64 object-cover"
                preload="metadata"
              >
                <source src={video.url} type="video/mp4" />
                {language === 'ar' ? 'متصفحك لا يدعم عرض الفيديو' : 'Your browser does not support the video tag.'}
              </video>
              <div className="p-3">
                <p className="text-sm text-primary-600 dark:text-primary-300 truncate">
                  {video.fileName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white hover:text-primary-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={() => setFullscreenImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery; 