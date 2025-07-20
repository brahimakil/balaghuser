import React, { useState } from 'react';
import { X, Image, Video, Globe, ZoomIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Simple360Viewer from './Simple360Viewer';
import type { MediaFile } from '../services/locationsService';

interface LocationMediaGalleryProps {
  photos: MediaFile[];
  videos: MediaFile[];
  photos360: MediaFile[];
}

const LocationMediaGallery: React.FC<LocationMediaGalleryProps> = ({ 
  photos = [], 
  videos = [], 
  photos360 = [] 
}) => {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'photos360'>('photos');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [show360Viewer, setShow360Viewer] = useState<string | null>(null);

  const hasPhotos = photos && photos.length > 0;
  const hasVideos = videos && videos.length > 0;
  const hasPhotos360 = photos360 && photos360.length > 0;

  // Set default tab to first available content
  React.useEffect(() => {
    if (hasPhotos) setActiveTab('photos');
    else if (hasVideos) setActiveTab('videos');
    else if (hasPhotos360) setActiveTab('photos360');
  }, [hasPhotos, hasVideos, hasPhotos360]);

  if (!hasPhotos && !hasVideos && !hasPhotos360) {
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
      <div className="flex space-x-1 mb-6 bg-primary-100 dark:bg-primary-700 rounded-lg p-1 overflow-x-auto">
        {hasPhotos && (
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
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

        {hasPhotos360 && (
          <button
            onClick={() => setActiveTab('photos360')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === 'photos360'
                ? 'bg-white dark:bg-primary-600 text-primary-900 dark:text-white shadow-sm'
                : 'text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>
              {language === 'ar' ? `صور 360° (${photos360.length})` : `360° Photos (${photos360.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Regular Photos Grid */}
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

      {/* 360 Photos Grid */}
      {activeTab === 'photos360' && hasPhotos360 && (
        <div>
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>
                {language === 'ar' 
                  ? '🎯 انقر على أي صورة 360° لتجربة العرض البانورامي التفاعلي الكامل' 
                  : '🎯 Click on any 360° photo for a full interactive panoramic viewing experience'}
              </span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos360.map((photo, index) => (
              <div 
                key={index}
                className="relative group aspect-square bg-primary-100 dark:bg-primary-700 rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105"
                onClick={() => setShow360Viewer(photo.url)}
              >
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-2 text-white">
                    <Globe className="h-8 w-8 animate-pulse" />
                    <span className="text-xs font-medium">
                      {language === 'ar' ? 'عرض 360°' : 'View 360°'}
                    </span>
                  </div>
                </div>
                {/* 360° Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                  <Globe className="h-3 w-3" />
                  <span className="font-bold">360°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white hover:text-primary-300 z-10 bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
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

      {/* 360° Photo Viewer */}
      {show360Viewer && (
        <Simple360Viewer
          imageUrl={show360Viewer}
          onClose={() => setShow360Viewer(null)}
        />
      )}
    </div>
  );
};

export default LocationMediaGallery; 