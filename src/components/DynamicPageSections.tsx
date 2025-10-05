import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, Video, ExternalLink, X, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { type DynamicPage, type DynamicPageSection, getSelectedSectionsFromPage } from '../services/dynamicPagesService';

interface DynamicPageSectionsProps {
  pages: DynamicPage[];
  loading: boolean;
}

const DynamicPageSections: React.FC<DynamicPageSectionsProps> = ({ pages, loading }) => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // NEW

  const handleViewFullPage = (slug: string) => {
    navigate(`/pages/${slug}`);
  };

  // Add photo click handler:
  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handleVideoClick = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5 text-accent-600" />;
      case 'photos':
        return <Image className="h-5 w-5 text-accent-600" />;
      case 'videos':
        return <Video className="h-5 w-5 text-accent-600" />;
      default:
        return <FileText className="h-5 w-5 text-accent-600" />;
    }
  };

  const renderSectionPreview = (section: DynamicPageSection) => {
    const title = language === 'ar' ? section.titleAr : section.titleEn;
    
    switch (section.type) {
      case 'text':
        const content = language === 'ar' ? section.contentAr : section.contentEn;
        const truncatedContent = content && content.length > 150 
          ? content.substring(0, 150) + '...' 
          : content;
        
        return (
          <div className="p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {getSectionIcon(section.type)}
              <h4 className="font-medium text-primary-900 dark:text-white text-sm">
                {title}
              </h4>
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-300 line-clamp-3 whitespace-pre-wrap">
              {truncatedContent}
            </p>
          </div>
        );
        
      case 'photos':
        const photoCount = section.media?.length || 0;
        const photoDescription = language === 'ar' ? section.contentAr : section.contentEn;
        return (
          <div className="p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {getSectionIcon(section.type)}
              <h4 className="font-medium text-primary-900 dark:text-white text-sm">
                {title}
              </h4>
            </div>
            
            {/* ✅ ADD: Show description if exists */}
            {photoDescription && (
              <p className="text-sm text-primary-600 dark:text-primary-300 mb-3 whitespace-pre-wrap">
                {photoDescription}
              </p>
            )}
            
            <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">
              {photoCount} {language === 'ar' ? 'صورة' : photoCount === 1 ? 'photo' : 'photos'}
            </p>
            {section.media && section.media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {section.media.slice(0, 6).map((media, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => handlePhotoClick(media.url)}
                  >
                    {/* Photo container with fixed aspect ratio */}
                    <div className="w-full aspect-square bg-primary-100 dark:bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={media.url}
                        alt=""
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200" // Changed from object-cover to object-contain
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                          <Image className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {photoCount > 6 && (
                  <div className="w-full aspect-square bg-primary-200 dark:bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      +{photoCount - 6} {language === 'ar' ? 'المزيد' : 'more'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      case 'videos':
        const videoCount = section.media?.length || 0;
        const videoDescription = language === 'ar' ? section.contentAr : section.contentEn;
        return (
          <div className="p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {getSectionIcon(section.type)}
              <h4 className="font-medium text-primary-900 dark:text-white text-sm">
                {title}
              </h4>
            </div>
            
            {/* ✅ ADD: Show description if exists */}
            {videoDescription && (
              <p className="text-sm text-primary-600 dark:text-primary-300 mb-3 whitespace-pre-wrap">
                {videoDescription}
              </p>
            )}
            
            <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">
              {videoCount} {language === 'ar' ? 'فيديو' : videoCount === 1 ? 'video' : 'videos'}
            </p>
            {section.media && section.media.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {section.media.slice(0, 2).map((media, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => handleVideoClick(media.url)}
                  >
                    {/* Video thumbnail container with proper aspect ratio */}
                    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                      <video
                        src={media.url}
                        className="w-full h-full object-contain" // Changed from object-cover to object-contain
                        preload="metadata"
                        muted
                        onLoadedData={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.currentTime = 2;
                        }}
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <div className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 text-primary-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                      
                      {/* Video label */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {language === 'ar' ? 'فيديو' : 'Video'}
                      </div>
                    </div>
                  </div>
                ))}
                {videoCount > 2 && (
                  <div className="w-full aspect-video bg-primary-200 dark:bg-primary-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      +{videoCount - 2} {language === 'ar' ? 'المزيد' : 'more'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-primary-200 dark:bg-primary-700 rounded mb-4 w-1/3"></div>
            <div className="space-y-3">
              <div className="h-20 bg-primary-200 dark:bg-primary-700 rounded"></div>
              <div className="h-20 bg-primary-200 dark:bg-primary-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {pages.map((page) => {
        const selectedSections = getSelectedSectionsFromPage(page);
        
        if (selectedSections.length === 0) {
          return null;
        }

        return (
          <div key={page.id} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700">
            {/* Page Header */}
            <div className="p-6 border-b border-primary-200 dark:border-primary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold text-primary-900 dark:text-white mb-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {language === 'ar' ? page.titleAr : page.titleEn}
                  </h3>
                  <p className={`text-primary-600 dark:text-primary-400 text-sm ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                    {selectedSections.length} {language === 'ar' ? 'قسم مختار' : selectedSections.length === 1 ? 'selected section' : 'selected sections'}
                  </p>
                </div>
                <button
                  onClick={() => handleViewFullPage(page.slug)}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{language === 'ar' ? 'عرض الصفحة كاملة' : 'View Full Page'}</span>
                </button>
              </div>
            </div>

            {/* Selected Sections */}
            <div className="p-6">
              <div className="space-y-4">
                {selectedSections.map((section) => (
                  <div key={section.id}>
                    {renderSectionPreview(section)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={closePhotoModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Photo */}
            <img
              src={selectedPhoto}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Video player */}
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] rounded-lg bg-black"
              onEnded={closeVideoModal}
              style={{ objectFit: 'contain' }} // Ensure full video is visible
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPageSections;
