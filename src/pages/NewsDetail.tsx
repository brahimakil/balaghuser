import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Radio, Share, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getNewsById, isNewsLiveNow, type NewsItem } from '../services/newsService';
import NewsMediaGallery from '../components/NewsMediaGallery';

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
        if (!newsData) {
          setError('News not found');
          return;
        }
        
        setNews(newsData);
        
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news data');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBackToNews = () => {
    navigate('/news');
  };

  const handleShareNews = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: language === 'ar' ? news?.titleAr : news?.titleEn,
        text: language === 'ar' ? news?.descriptionAr : news?.descriptionEn,
        url: currentUrl,
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
            {language === 'ar' ? 'الخبر غير موجود' : 'News Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {error || (language === 'ar' ? 'لا يمكن العثور على الخبر المطلوب' : 'The requested news could not be found')}
          </p>
          <button
            onClick={handleBackToNews}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'ar' ? 'العودة إلى الأخبار' : 'Back to News'}
          </button>
        </div>
      </div>
    );
  }

  const isLive = isNewsLiveNow(news);

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: news.mainImage ? `url(${news.mainImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        
        {/* Content - positioned at bottom left like other pages */}
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
                <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full mb-6">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-bold">{language === 'ar' ? 'مباشر' : 'LIVE'}</span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? news.titleAr : news.titleEn}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {language === 'ar' ? news.descriptionAr : news.descriptionEn}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {formatDate(news.publishDate)}
                  </span>
                </div>
                
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {news.publishTime}
                  </span>
                </div>
                
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Radio className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    {news.type === 'live' 
                      ? (language === 'ar' ? 'مباشر' : 'Live') 
                      : (language === 'ar' ? 'عادي' : 'Regular')
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* News Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل الخبر' : 'News Details'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'تاريخ النشر' : 'Publish Date'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {formatDate(news.publishDate)} - {news.publishTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Radio className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'نوع الخبر' : 'News Type'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {news.type === 'live' 
                        ? (language === 'ar' ? 'خبر مباشر' : 'Live News') 
                        : (language === 'ar' ? 'خبر عادي' : 'Regular News')
                      }
                    </p>
                  </div>
                </div>

                {news.type === 'live' && news.liveDurationHours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary-900 dark:text-white">
                        {language === 'ar' ? 'مدة البث المباشر' : 'Live Duration'}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400">
                        {news.liveDurationHours} {language === 'ar' ? 'ساعة' : 'hours'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media Section */}
            <NewsMediaGallery 
              photos={news.photos || []} 
              videos={news.videos || []}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
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

            {/* News Status */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'حالة الخبر' : 'News Status'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </span>
                  <span className={`font-semibold ${news.type === 'live' ? 'text-red-600' : 'text-blue-600'}`}>
                    {news.type === 'live' 
                      ? (language === 'ar' ? 'مباشر' : 'Live') 
                      : (language === 'ar' ? 'عادي' : 'Regular')
                    }
                  </span>
                </div>
                
                {news.type === 'live' && (
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </span>
                    <span className={`font-semibold ${isLive ? 'text-red-600' : 'text-gray-600'}`}>
                      {isLive 
                        ? (language === 'ar' ? 'مباشر الآن' : 'Live Now') 
                        : (language === 'ar' ? 'انتهى البث' : 'Ended')
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail; 