import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, Radio } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLiveNews, getRegularNews, isNewsLiveNow, type NewsItem } from '../services/newsService';
import HeroBanner from '../components/HeroBanner';

const News: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [regularNews, setRegularNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const [live, regular] = await Promise.all([
          getLiveNews(),
          getRegularNews()
        ]);
        
        setLiveNews(live);
        setRegularNews(regular);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNewsClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const NewsCard: React.FC<{ news: NewsItem; isLive?: boolean }> = ({ news, isLive = false }) => {
    const title = language === 'ar' ? news.titleAr : news.titleEn;
    const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;
    
    return (
      <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
           onClick={() => handleNewsClick(news.id)}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {news.mainImage ? (
            <img
              src={news.mainImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-700 dark:to-accent-700 flex items-center justify-center">
              <Radio className="h-12 w-12 text-primary-400" />
            </div>
          )}
          
          {/* Live Badge */}
          {isLive && isNewsLiveNow(news) && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>{language === 'ar' ? 'مباشر' : 'LIVE'}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-2 line-clamp-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-primary-600 dark:text-primary-400 text-sm mb-4 line-clamp-3">
            {description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-primary-500 dark:text-primary-400">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(news.publishDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{news.publishTime}</span>
            </div>
            
            <button className="flex items-center space-x-1 text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors">
              <Eye className="h-4 w-4" />
              <span>{language === 'ar' ? 'قراءة المزيد' : 'Read More'}</span>
            </button>
          </div>
        </div>
      </div>
    );
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 overflow-hidden">
                <div className="h-48 bg-primary-100 dark:bg-primary-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-primary-200 dark:bg-primary-600 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-primary-200 dark:bg-primary-600 rounded mb-4 animate-pulse"></div>
                  <div className="h-3 bg-primary-100 dark:bg-primary-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
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
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold">{language === 'ar' ? 'الأخبار المباشرة' : 'Live News'}</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {liveNews.map((news) => (
                <NewsCard key={news.id} news={news} isLive={true} />
              ))}
            </div>
          </div>
        )}

        {/* Regular News Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              {language === 'ar' ? 'الأخبار العامة' : 'Regular News'}
            </h2>
          </div>
          
          {regularNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Radio className="h-16 w-16 text-primary-400 mx-auto mb-4" />
              <p className="text-primary-600 dark:text-primary-400">
                {language === 'ar' ? 'لا توجد أخبار متاحة حالياً' : 'No news available at the moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News; 