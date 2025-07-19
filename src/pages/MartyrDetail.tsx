import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Calendar, Heart, Users, Info, Share, QrCode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getMartyrById, type Martyr } from '../services/martyrsService';

const MartyrDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [martyr, setMartyr] = useState<Martyr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMartyr = async () => {
      if (!id) {
        setError('Invalid martyr ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch ONLY this specific martyr directly from Firebase
        const fetchedMartyr = await getMartyrById(id);
        if (fetchedMartyr) {
          setMartyr(fetchedMartyr);
        } else {
          setError('Martyr not found');
        }
      } catch (err) {
        console.error('Error fetching martyr:', err);
        setError('Failed to load martyr data');
      } finally {
        setLoading(false);
      }
    };

    fetchMartyr();
  }, [id]); // Removed dependency on state.martyrs

  const handleBackToMartyrs = () => {
    navigate('/martyrs');
  };

  const handleShareMartyr = () => {
    if (navigator.share && martyr) {
      navigator.share({
        title: language === 'ar' ? martyr.nameAr : martyr.nameEn,
        text: language === 'ar' ? martyr.storyAr : martyr.storyEn,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-primary-600 dark:text-primary-400">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !martyr) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-primary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
            {language === 'ar' ? 'لم يتم العثور على الشهيد' : 'Martyr Not Found'}
          </h2>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {error || (language === 'ar' ? 'لا يمكن العثور على الشهيد المطلوب' : 'The requested martyr could not be found')}
          </p>
          <button
            onClick={handleBackToMartyrs}
            className="px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            {language === 'ar' ? 'العودة إلى الشهداء' : 'Back to Martyrs'}
          </button>
        </div>
      </div>
    );
  }

  // Rest of your existing component JSX...
  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: martyr.mainIcon ? `url(${martyr.mainIcon})` : `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23e2e8f0" width="1200" height="600"/><text x="50%" y="50%" font-family="Arial" font-size="48" fill="%23475569" text-anchor="middle" dy=".3em">No Image</text></svg>')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleBackToMartyrs}
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
                <span>{language === 'ar' ? 'العودة إلى الشهداء' : 'Back to Martyrs'}</span>
              </button>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? martyr.nameAr : martyr.nameEn}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {language === 'ar' ? martyr.storyAr : martyr.storyEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Details Card */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
                {language === 'ar' ? 'تفاصيل الشهيد' : 'Martyr Details'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-accent-600" />
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
                    </p>
                    <p className="font-medium text-primary-900 dark:text-white">
                      {martyr.dob?.toDate ? new Date(martyr.dob.toDate()).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Heart className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'تاريخ الشهادة' : 'Date of Martyrdom'}
                    </p>
                    <p className="font-medium text-primary-900 dark:text-white">
                      {martyr.dateOfShahada?.toDate ? new Date(martyr.dateOfShahada.toDate()).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-accent-600" />
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'الحالة الاجتماعية' : 'Family Status'}
                    </p>
                    <p className="font-medium text-primary-900 dark:text-white">
                      {language === 'ar' 
                        ? (martyr.familyStatus === 'married' ? 'متزوج' : 'أعزب')
                        : (martyr.familyStatus === 'married' ? 'Married' : 'Single')
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Info className="h-5 w-5 text-accent-600" />
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'اسم الحرب' : 'War Name'}
                    </p>
                    <p className="font-medium text-primary-900 dark:text-white">
                      {language === 'ar' ? martyr.warNameAr : martyr.warNameEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Section */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'قصة الشهيد' : 'Martyr\'s Story'}
              </h2>
              <p className="text-primary-700 dark:text-primary-300 leading-relaxed text-lg">
                {language === 'ar' ? martyr.storyAr : martyr.storyEn}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'رمز الاستجابة السريعة' : 'QR Code'}
              </h3>
              {martyr.qrCode ? (
                <div className="space-y-4">
                  <img 
                    src={martyr.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto border rounded-lg"
                  />
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {language === 'ar' ? 'امسح الرمز لمشاركة الصفحة' : 'Scan to share this page'}
                  </p>
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-primary-100 dark:bg-primary-700 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-primary-400" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleShareMartyr}
                className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
              >
                <Share className="h-5 w-5" />
                <span className="font-medium">{language === 'ar' ? 'مشاركة الشهيد' : 'Share Martyr'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MartyrDetail; 