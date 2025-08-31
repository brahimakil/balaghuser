import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLiveNews, type NewsItem } from '../services/newsService';
import { getMainSettings } from '../services/websiteSettingsService';

const NewsTicker: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [tickerSettings, setTickerSettings] = useState({
    backgroundColor: '#ff0000',
    textColor: '#ffffff',
    fontSize: 16,
    height: 40
  });

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

  // NEW: Fetch ticker settings
  useEffect(() => {
    const fetchTickerSettings = async () => {
      try {
        const settings = await getMainSettings();
        if (settings) {
          setTickerSettings({
            backgroundColor: settings.newsTickerColor || '#ff0000',
            textColor: settings.newsTickerTextColor || '#ffffff',
            fontSize: settings.newsTickerFontSize || 16,
            height: settings.newsTickerHeight || 40
          });
        }
      } catch (error) {
        console.error('Error fetching ticker settings:', error);
      }
    };

    fetchTickerSettings();
  }, []);

  if (liveNews.length === 0) {
    return null;
  }

  // Create the continuous text content - each news item once with more spacing
  const getNewsContent = () => {
    return liveNews.map(news => {
      const title = language === 'ar' ? news.titleAr : news.titleEn;
      const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;
      return `${title}: ${description}`;
    }).join('    •    '); // More spaces around separator
  };

  const newsContent = getNewsContent();

  return (
    <div 
      className="sticky top-16 z-40 text-white shadow-lg"
      style={{
        backgroundColor: tickerSettings.backgroundColor,
        color: tickerSettings.textColor,
        height: `${tickerSettings.height}px`
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2" style={{ height: `${tickerSettings.height}px` }}>
          {/* LIVE Badge */}
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">
              {language === 'ar' ? 'مباشر' : 'LIVE'}
            </span>
          </div>

          {/* News Content - Continuous Scroll */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div 
              className={`whitespace-nowrap ${isRTL ? 'animate-scroll-rtl-continuous' : 'animate-scroll-ltr-continuous'}`}
            >
              <span 
                className="font-medium"
                style={{ fontSize: `${tickerSettings.fontSize}px` }}
              >
                {newsContent}
                {/* Only duplicate for seamless loop if we have content */}
                {newsContent && liveNews.length > 1 && (
                  <>
                    <span className="mx-8">•</span>
                    {newsContent}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* News Counter */}
          <div className="text-xs text-white/80">
            {liveNews.length} {language === 'ar' ? 'أخبار' : 'News'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker; 