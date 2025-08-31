import React, { useState } from 'react';
import { Upload, Send, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { submitFriendStory } from '../services/friendStoriesService';

interface FriendStoryFormProps {
  martyrId: string;
  martyrName: string;
  onClose?: () => void;
}

const FriendStoryForm: React.FC<FriendStoryFormProps> = ({ martyrId, martyrName, onClose }) => {
  const { language, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState({
    submitterName: '',
    submitterRelation: '',
    originalStory: ''
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const relationOptions = [
    { value: 'friend', labelEn: 'Friend', labelAr: 'صديق' },
    { value: 'family', labelEn: 'Family Member', labelAr: 'فرد من العائلة' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 2) {
      setError(language === 'ar' ? 'يمكن رفع صورتين كحد أقصى' : 'Maximum 2 images allowed');
      return;
    }
    setImages([...images, ...files.slice(0, 2 - images.length)]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.submitterName || !formData.submitterRelation || !formData.originalStory) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const success = await submitFriendStory({
      martyrId,
      ...formData,
      images
    });

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose?.();
      }, 3000);
    } else {
      setError(language === 'ar' ? 'حدث خطأ أثناء الإرسال' : 'Error submitting story');
    }

    setIsSubmitting(false);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-primary-800 rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
            {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!'}
          </h3>
          <p className="text-primary-600 dark:text-primary-400">
            {language === 'ar' 
              ? 'شكراً لك على مشاركة قصتك. سيتم مراجعتها وإضافتها قريباً.'
              : 'Thank you for sharing your story. It will be reviewed and added soon.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-primary-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200 dark:border-primary-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            {language === 'ar' ? 'مشاركة قصة مع الشهيد' : 'Share Story with Martyr'}
          </h2>
          <button onClick={onClose} className="text-primary-500 hover:text-primary-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-primary-600 dark:text-primary-400">
              {language === 'ar' 
                ? `مشاركة قصتك مع الشهيد: ${martyrName}`
                : `Share your story with martyr: ${martyrName}`
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'الاسم *' : 'Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.submitterName}
                onChange={(e) => setFormData({...formData, submitterName: e.target.value})}
                className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500"
                placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
              />
            </div>

            {/* Relation */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'علاقتك بالشهيد *' : 'Your relationship with the martyr *'}
              </label>
              <select
                required
                value={formData.submitterRelation}
                onChange={(e) => setFormData({...formData, submitterRelation: e.target.value})}
                className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500"
              >
                <option value="">{language === 'ar' ? 'اختر العلاقة' : 'Select relationship'}</option>
                {relationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {language === 'ar' ? option.labelAr : option.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'قصتك مع الشهيد *' : 'Your story with the martyr *'}
              </label>
              <textarea
                required
                rows={6}
                value={formData.originalStory}
                onChange={(e) => setFormData({...formData, originalStory: e.target.value})}
                className="w-full px-4 py-3 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500"
                placeholder={language === 'ar' ? 'اكتب قصتك مع الشهيد...' : 'Write your story with the martyr...'}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                {language === 'ar' ? 'الصور (حتى صورتين)' : 'Images (up to 2)'}
              </label>
              
              {images.length < 2 && (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-700/50">
                    <Upload className="h-8 w-8 text-primary-400 mb-2" />
                    <span className="text-sm text-primary-600 dark:text-primary-400">
                      {language === 'ar' ? 'اضغط لرفع الصور' : 'Click to upload images'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>
                  {isSubmitting 
                    ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                    : (language === 'ar' ? 'إرسال القصة' : 'Submit Story')
                  }
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FriendStoryForm;