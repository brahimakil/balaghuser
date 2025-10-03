import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Calendar, Clock, Eye, Newspaper } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllNews, getLiveNews, type NewsItem, createNewsSlug } from '../services/newsService';
import HeroBanner from '../components/HeroBanner';

const DEFAULT_NEWS_IMAGE = '';
const ITEMS_PER_PAGE = 4; // Show 4 items at a time

const News: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [pressNewsPage, setPressNewsPage] = useState(1);
  const [regularNewsPage, setRegularNewsPage] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allNewsData, liveNewsData] = await Promise.all([
          getAllNews(),
          getLiveNews()
        ]);
        
        setAllNews(allNewsData);
        setLiveNews(liveNewsData);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Separate news into categories
  const pressNews = allNews.filter(news => news.isPressNews);
  const regularNews = allNews.filter(news => 
    !news.isPressNews && 
    news.type !== 'live' && 
    news.type !== 'regularLive'
  );

  // Paginated news
  const displayedPressNews = pressNews.slice(0, pressNewsPage * ITEMS_PER_PAGE);
  const displayedRegularNews = regularNews.slice(0, regularNewsPage * ITEMS_PER_PAGE);

  const hasMorePressNews = displayedPressNews.length < pressNews.length;
  const hasMoreRegularNews = displayedRegularNews.length < regularNews.length;

  const handleViewNews = (news: NewsItem) => {
    const slug = createNewsSlug(news);
    navigate(`/news/${slug}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  // Render news card component
  const renderNewsCard = (news: NewsItem, isLive = false, isPress = false) => {
    const title = language === 'ar' ? news.titleAr : news.titleEn;
    const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;

    return (
      <div 
        key={news.id}
        className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 hover:shadow-lg transition-all duration-300 overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={news.mainImage || DEFAULT_NEWS_IMAGE} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badge */}
          {isLive && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold">{language === 'ar' ? 'مباشر' : 'LIVE'}</span>
              </div>
            </div>
          )}
          
          {isPress && !isLive && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                <Newspaper className="h-3 w-3" />
                <span className="font-bold">{language === 'ar' ? 'صحافة' : 'PRESS'}</span>
              </div>
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
              {isLive ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(news.publishTime)}</span>
                </>
              ) : (
                <>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(news.publishDate)}</span>
                </>
              )}
            </div>
            
            <button
              onClick={() => handleViewNews(news)}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                isLive 
                  ? 'text-red-600 hover:text-red-700' 
                  : isPress 
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-accent-600 hover:text-accent-700'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{language === 'ar' ? (isLive ? 'مشاهدة' : 'قراءة') : (isLive ? 'View' : 'Read')}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 animate-pulse">
                <div className="h-48 bg-primary-200 dark:bg-primary-700 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-primary-200 dark:bg-primary-700 rounded mb-3"></div>
                  <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded mb-2"></div>
                  <div className="h-3 bg-primary-200 dark:bg-primary-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
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
          <div className="text-center py-16">
            <p className="text-primary-600 dark:text-primary-400">{error}</p>
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
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Live News Section */}
        {liveNews.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold">
                  {language === 'ar' ? 'البث المباشر' : 'Live News'}
                </h2>
              </div>
              <span className="text-sm text-primary-500 dark:text-primary-400">
                ({liveNews.length} {language === 'ar' ? 'خبر' : 'news'})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveNews.map((news) => renderNewsCard(news, true, false))}
            </div>
          </div>
        )}

        {/* Press News Section */}
        {pressNews.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                {language === 'ar' ? 'الأخبار الصحفية' : 'Press News'}
              </h2>
              <span className="text-sm text-primary-500 dark:text-primary-400">
                ({pressNews.length} {language === 'ar' ? 'خبر' : 'news'})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedPressNews.map((news) => renderNewsCard(news, false, true))}
            </div>

            {hasMorePressNews && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPressNewsPage(prev => prev + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {language === 'ar' ? 'عرض المزيد' : 'Show More'}
                </button>
              </div>
            )}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedRegularNews.map((news) => renderNewsCard(news, false, false))}
              </div>

              {hasMoreRegularNews && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setRegularNewsPage(prev => prev + 1)}
                    className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium"
                  >
                    {language === 'ar' ? 'عرض المزيد' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default News; 