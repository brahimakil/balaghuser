import React from 'react';
import { Heart, Instagram, Youtube, Facebook, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Custom TikTok icon
const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.53v-3.4a4.85 4.85 0 0 1-1-.00z"/>
  </svg>
);



const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const socialMediaLinks = [
    { name: 'Instagram', url: '#', icon: Instagram },
    { name: 'TikTok', url: '#', icon: TikTokIcon },
    { name: 'YouTube', url: '#', icon: Youtube },
    { name: 'Facebook', url: '#', icon: Facebook },
    { name: 'Telegram', url: '#', icon: Send }
  ];

  return (
    <footer className="bg-primary-50 dark:bg-primary-900 border-t border-primary-200 dark:border-primary-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          
          {/* Social Media Section - Centered */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-4">
              {t('footer.followUs')}
            </h3>
            <div className="flex justify-center gap-4">
              {socialMediaLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-full transition-all duration-200 hover:scale-110"
                    title={social.name}
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright Section - Centered */}
          <div className="border-t border-primary-200 dark:border-primary-700 pt-6 w-full">
            <p className="text-center text-sm text-primary-500 dark:text-primary-400">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 