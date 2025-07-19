import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-primary-50 dark:bg-primary-900 border-t border-primary-200 dark:border-primary-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       

       
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-primary-500 dark:text-primary-400">
              © 2025 Balagh User. All rights reserved.
            </p>
          
          </div>
        </div>
  
    </footer>
  );
};

export default Footer; 