import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, Radio } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLiveNews, getAllNews, isNewsLiveNow, type NewsItem } from '../services/newsService';
import HeroBanner from '../components/HeroBanner';

const News: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [regularNews, setRegularNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all news and separate into live and regular
        const [allNews, liveNewsData] = await Promise.all([
          getAllNews(),
          getLiveNews()
        ]);

        // Filter regular news (non-live)
        const regularNewsData = allNews.filter(news => news.type === 'regular');

        setLiveNews(liveNewsData);
        setRegularNews(regularNewsData);

      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleViewNews = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Invalid date';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'No time specified';
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="news"
          fallbackTitle={language === 'ar' ? 'الأخبار' : 'News'}
          fallbackDescription={language === 'ar' ? 'آخر الأخبار والتحديثات' : 'Latest news and updates'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-primary-200 dark:bg-primary-700 rounded mb-6"></div>
            <div className="h-96 bg-primary-200 dark:bg-primary-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <HeroBanner 
          pageId="news"
          fallbackTitle={language === 'ar' ? 'الأخبار' : 'News'}
          fallbackDescription={language === 'ar' ? 'آخر الأخبار والتحديثات' : 'Latest news and updates'}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-white dark:bg-primary-800 rounded-xl">
            <Radio className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              {language === 'ar' ? 'خطأ في تحميل الأخبار' : 'Error Loading News'}
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <HeroBanner 
        pageId="news"
        fallbackTitle={language === 'ar' ? 'الأخبار' : 'News'}
        fallbackDescription={language === 'ar' ? 'آخر الأخبار والتحديثات' : 'Latest news and updates'}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Live News Section */}
        {liveNews.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold">{language === 'ar' ? 'أخبار مباشرة' : 'LIVE NEWS'}</span>
              </div>
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                {language === 'ar' ? 'الأخبار المباشرة' : 'Live News'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveNews.map((news) => {
                const title = language === 'ar' ? news.titleAr : news.titleEn;
                const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;

                return (
                  <div
                    key={news.id}
                    className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-primary-100 dark:bg-primary-700">
                      {news.mainImage ? (
                        <img 
                          src={news.mainImage} 
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Radio className="h-12 w-12 text-primary-400" />
                        </div>
                      )}
                      
                      {/* Live Badge */}
                      <div className="absolute top-3 left-3 flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold">{language === 'ar' ? 'مباشر' : 'LIVE'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className={`text-lg font-semibold text-primary-900 dark:text-white mb-2 line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        {title}
                      </h3>
                      
                      <p className={`text-primary-600 dark:text-primary-400 text-sm mb-4 line-clamp-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-primary-500 dark:text-primary-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(news.publishTime)}</span>
                        </div>
                        
                        <button
                          onClick={() => handleViewNews(news.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{language === 'ar' ? 'مشاهدة' : 'View'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular News Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              {language === 'ar' ? 'الأخبار العامة' : 'Regular News'}
            </h2>
            <span className="text-sm text-primary-500 dark:text-primary-400">
              ({regularNews.length} {language === 'ar' ? 'خبر' : 'news'})
            </span>
          </div>

          {regularNews.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-primary-800 rounded-xl">
              <Radio className="h-16 w-16 text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد أخبار' : 'No News Found'}
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                {language === 'ar' ? 'لم يتم نشر أي أخبار بعد' : 'No news have been published yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNews.map((news) => {
                const title = language === 'ar' ? news.titleAr : news.titleEn;
                const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;

                return (
                  <div
                    key={news.id}
                    className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-primary-100 dark:bg-primary-700">
                      {news.mainImage ? (
                        <img 
                          src={news.mainImage} 
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Radio className="h-12 w-12 text-primary-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className={`text-lg font-semibold text-primary-900 dark:text-white mb-2 line-clamp-2 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        {title}
                      </h3>
                      
                      <p className={`text-primary-600 dark:text-primary-400 text-sm mb-4 line-clamp-3 ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                        {description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-primary-500 dark:text-primary-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(news.publishDate)}</span>
                        </div>
                        
                        <button
                          onClick={() => handleViewNews(news.id)}
                          className="flex items-center space-x-1 text-accent-600 hover:text-accent-700 text-sm font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{language === 'ar' ? 'قراءة' : 'Read'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News; 