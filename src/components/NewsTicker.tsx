import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLiveNews, type NewsItem } from '../services/newsService';

const NewsTicker: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchLiveNews = async () => {
      const news = await getLiveNews();
      setLiveNews(news);
    };

    fetchLiveNews();
    
    // Refresh live news every minute to check for expired items
    const interval = setInterval(fetchLiveNews, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (liveNews.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [liveNews.length]);

  if (liveNews.length === 0) {
    return null;
  }

  const currentNews = liveNews[currentIndex];
  const title = language === 'ar' ? currentNews.titleAr : currentNews.titleEn;

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2">
          {/* LIVE Badge */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">
              {language === 'ar' ? 'مباشر' : 'LIVE'}
            </span>
          </div>

          {/* News Content */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div 
              className={`whitespace-nowrap ${isRTL ? 'animate-scroll-rtl' : 'animate-scroll-ltr'}`}
              key={currentIndex}
            >
              <span className="text-sm md:text-base font-medium">
                {title}
              </span>
            </div>
          </div>

          {/* News Counter */}
          {liveNews.length > 1 && (
            <div className="text-xs text-white/80">
              {currentIndex + 1}/{liveNews.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker; 