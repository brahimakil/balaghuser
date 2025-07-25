import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePageSettings } from '../hooks/usePageSettings';

interface HeroBannerProps {
  pageId: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  fallbackColor?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  pageId,
  fallbackTitle = 'Welcome',
  fallbackDescription = 'Welcome to our platform',
  fallbackImage = '',
  fallbackColor = '#1e293b'
}) => {
  // Always call hooks at the top level
  const { language, isRTL } = useLanguage();
  const { settings, loading, error } = usePageSettings(pageId);

  // Convert hex color to rgba for overlay
  const hexToRgba = (hex: string, alpha: number = 0.4) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(30, 41, 59, ${alpha})`; // fallback
  };

  // Determine what content to show
  const title = (settings && !loading) 
    ? (language === 'ar' ? settings.titleAr : settings.titleEn)
    : fallbackTitle;
    
  const description = (settings && !loading) 
    ? (language === 'ar' ? settings.descriptionAr : settings.descriptionEn)
    : fallbackDescription;
    
  const mainImage = (settings && !loading) ? settings.mainImage : fallbackImage;
  const colorOverlay = (settings && !loading) ? settings.colorOverlay : fallbackColor;

  const overlayColorLight = hexToRgba(colorOverlay, 0.2);
  const overlayColorMedium = hexToRgba(colorOverlay, 0.6);
  const overlayColorDark = hexToRgba(colorOverlay, 0.8);

  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      {mainImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${mainImage})` }}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
        />
      )}
      
      {/* Smooth Side Gradients */}
      <div className="absolute inset-0">
        {/* Left side gradient */}
        <div 
          className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-2/3 md:w-1/2 lg:w-2/5`}
          style={{ 
            background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${overlayColorDark} 0%, ${overlayColorMedium} 40%, ${overlayColorLight} 80%, transparent 100%)`
          }}
        />
        
        {/* Right side subtle gradient */}
        <div 
          className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} bottom-0 w-1/3 md:w-1/4`}
          style={{ 
            background: `linear-gradient(to ${isRTL ? 'right' : 'left'}, transparent 0%, ${overlayColorLight} 100%)`
          }}
        />
      </div>
      
      {/* Top and bottom subtle gradients for polish */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      {/* Content positioned to the side */}
      <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl ${isRTL ? 'mr-auto text-right font-arabic' : 'ml-0 text-left'}`}>
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight drop-shadow-2xl animate-fade-in">
              <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/95 leading-relaxed drop-shadow-lg animate-slide-up max-w-2xl">
              {description}
            </p>
            
            {/* Decorative Element */}
            <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <div className="w-40 h-1.5 bg-gradient-to-r from-white/70 via-white/90 to-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
    </div>
  );
};

export default HeroBanner; 