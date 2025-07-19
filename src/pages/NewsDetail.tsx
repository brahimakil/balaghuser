import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Radio, Share, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getNewsById, isNewsLiveNow, type NewsItem } from '../services/newsService';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const newsData = await getNewsById(id);
        setNews(newsData);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        {/* Loading Hero */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] min-h-[300px] bg-gradient-to-br from-rose-600 via-red-600 to-rose-700">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <div className="h-8 bg-white/20 rounded mb-4 animate-pulse"></div>
                <div className="h-12 bg-white/20 rounded mb-2 animate-pulse"></div>
                <div className="h-6 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-accent-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-primary-600 dark:text-primary-400">
              {language === 'ar' ? 'جاري تحميل الخبر...' : 'Loading news...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Radio className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
            {language === 'ar' ? 'لم يتم العثور على الخبر' : 'News Not Found'}
          </h2>
          <button
            onClick={() => navigate('/news')}
            className="text-accent-600 dark:text-accent-400 hover:underline"
          >
            {language === 'ar' ? 'العودة إلى الأخبار' : 'Back to News'}
          </button>
        </div>
      </div>
    );
  }

  const title = language === 'ar' ? news.titleAr : news.titleEn;
  const description = language === 'ar' ? news.descriptionAr : news.descriptionEn;
  const isLive = isNewsLiveNow(news);

  const handleBackToNews = () => {
    navigate('/news');
  };

  const handleShareNews = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] min-h-[300px] overflow-hidden">
        {news.mainImage ? (
          <img
            src={news.mainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 flex items-center justify-center">
            <Radio className="h-20 w-20 text-white opacity-50" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
        
             {/* Content - positioned at bottom like other pages */}
        <div className="absolute inset-0 flex items-end">
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleBackToNews}
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
                <span>{language === 'ar' ? 'العودة إلى الأخبار' : 'Back to News'}</span>
              </button>
              
              {/* Live Badge */}
              {isLive && (
                <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-bold">{language === 'ar' ? 'مباشر' : 'LIVE'}</span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-shadow-lg">
                {title}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 leading-relaxed text-shadow">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* News Image */}
            {news.mainImage && (
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 overflow-hidden">
                <img
                  src={news.mainImage}
                  alt={title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل الخبر' : 'News Details'}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-primary-700 dark:text-primary-300 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Live News Status */}
            {news.type === 'live' && (
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                  {language === 'ar' ? 'حالة البث المباشر' : 'Live Broadcast Status'}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </span>
                    <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                      isLive 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
                    }`}>
                      {isLive 
                        ? (language === 'ar' ? 'مباشر الآن' : 'Live Now')
                        : (language === 'ar' ? 'انتهى البث' : 'Broadcast Ended')
                      }
                    </span>
                  </div>
                  
                  {news.liveStartTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 dark:text-primary-400">
                        {language === 'ar' ? 'بدء البث' : 'Broadcast Start'}
                      </span>
                      <span className="font-medium text-primary-900 dark:text-white">
                        {formatTime(news.liveStartTime)}
                      </span>
                    </div>
                  )}
                  
                  {news.liveDurationHours && (
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 dark:text-primary-400">
                        {language === 'ar' ? 'مدة البث' : 'Duration'}
                      </span>
                      <span className="font-medium text-primary-900 dark:text-white">
                        {news.liveDurationHours} {language === 'ar' ? 'ساعة' : 'hours'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleShareNews}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'مشاركة الخبر' : 'Share News'}</span>
                </button>
              </div>
            </div>

            {/* News Information */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm border border-primary-200 dark:border-primary-700 p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'معلومات الخبر' : 'News Information'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    news.type === 'live'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-primary-400'
                  }`}>
                    {news.type === 'live' 
                      ? (language === 'ar' ? 'مباشر' : 'Live')
                      : (language === 'ar' ? 'عادي' : 'Regular')
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ النشر' : 'Published'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatDate(news.publishDate)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'الوقت' : 'Time'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {news.publishTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
                  </span>
                  <span className="font-medium text-primary-900 dark:text-white">
                    {formatDate(news.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail; 