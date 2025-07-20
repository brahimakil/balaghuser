import React, { useEffect, useRef } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Maximize, RotateCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCORSProxyUrl } from '../utils/corsProxy';

interface Pannellum360ViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const Pannellum360Viewer: React.FC<Pannellum360ViewerProps> = ({ imageUrl, onClose }) => {
  const { language } = useLanguage();
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumViewerRef = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Dynamically import Pannellum
    const loadPannellum = async () => {
      try {
        // Import Pannellum CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);

        // Import Pannellum JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.onload = () => {
          initViewer();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Pannellum:', error);
      }
    };

    const initViewer = () => {
      if (viewerRef.current && (window as any).pannellum) {
        // Use the CORS proxy for the image URL
        const proxyImageUrl = getCORSProxyUrl(imageUrl);
        console.log('Loading 360° image from:', proxyImageUrl);

        pannellumViewerRef.current = (window as any).pannellum.viewer(viewerRef.current, {
          type: 'equirectangular',
          panorama: proxyImageUrl, // Use proxied URL
          autoLoad: true,
          autoRotate: -2,
          compass: true,
          northOffset: 0,
          showFullscreenCtrl: false,
          showZoomCtrl: false,
          showControls: false,
          mouseZoom: true,
          doubleClickZoom: true,
          draggable: true,
          keyboardZoom: true,
          disableKeyboardCtrl: false,
          crossOrigin: 'anonymous',
          hotSpots: [],
          minHfov: 50,
          maxHfov: 120,
          hfov: 100,
          pitch: 0,
          yaw: 0,
        });

        // Add event listeners
        pannellumViewerRef.current.on('load', () => {
          console.log('360° panorama loaded successfully');
        });

        pannellumViewerRef.current.on('error', (error: any) => {
          console.error('Pannellum error:', error);
          
          // Try fallback URLs if the proxy fails
          const fallbackUrls = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
            imageUrl // Last resort - original URL
          ];

          tryFallbackUrls(fallbackUrls, 0);
        });
      }
    };

    const tryFallbackUrls = (urls: string[], index: number) => {
      if (index >= urls.length) {
        console.error('All fallback URLs failed');
        return;
      }

      console.log(`Trying fallback URL ${index + 1}:`, urls[index]);
      
      if (pannellumViewerRef.current) {
        pannellumViewerRef.current.destroy();
      }

      if (viewerRef.current && (window as any).pannellum) {
        pannellumViewerRef.current = (window as any).pannellum.viewer(viewerRef.current, {
          type: 'equirectangular',
          panorama: urls[index],
          autoLoad: true,
          autoRotate: -2,
          compass: true,
          northOffset: 0,
          showFullscreenCtrl: false,
          showZoomCtrl: false,
          showControls: false,
          mouseZoom: true,
          doubleClickZoom: true,
          draggable: true,
          keyboardZoom: true,
          disableKeyboardCtrl: false,
          crossOrigin: 'anonymous',
          hotSpots: [],
          minHfov: 50,
          maxHfov: 120,
          hfov: 100,
          pitch: 0,
          yaw: 0,
        });

        pannellumViewerRef.current.on('load', () => {
          console.log(`Successfully loaded with fallback URL ${index + 1}`);
        });

        pannellumViewerRef.current.on('error', () => {
          console.log(`Fallback URL ${index + 1} failed, trying next...`);
          setTimeout(() => tryFallbackUrls(urls, index + 1), 1000);
        });
      }
    };

    loadPannellum();

    return () => {
      if (pannellumViewerRef.current) {
        pannellumViewerRef.current.destroy();
      }
    };
  }, [imageUrl]);

  const handleZoomIn = () => {
    if (pannellumViewerRef.current) {
      const currentHfov = pannellumViewerRef.current.getHfov();
      pannellumViewerRef.current.setHfov(Math.max(50, currentHfov - 10));
    }
  };

  const handleZoomOut = () => {
    if (pannellumViewerRef.current) {
      const currentHfov = pannellumViewerRef.current.getHfov();
      pannellumViewerRef.current.setHfov(Math.min(120, currentHfov + 10));
    }
  };

  const handleReset = () => {
    if (pannellumViewerRef.current) {
      pannellumViewerRef.current.setPitch(0);
      pannellumViewerRef.current.setYaw(0);
      pannellumViewerRef.current.setHfov(100);
    }
  };

  const toggleAutoRotate = () => {
    if (pannellumViewerRef.current) {
      const currentSpeed = pannellumViewerRef.current.getConfig().autoRotate;
      pannellumViewerRef.current.setAutoRotate(currentSpeed ? 0 : -2);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Pannellum Viewer Container */}
      <div 
        ref={viewerRef} 
        className="w-full h-full"
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      />

 

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-black/80 hover:bg-black backdrop-blur-md text-white p-3 rounded-lg transition-colors border border-gray-600"
          title={language === 'ar' ? 'تكبير' : 'Zoom In'}
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="bg-black/80 hover:bg-black backdrop-blur-md text-white p-3 rounded-lg transition-colors border border-gray-600"
          title={language === 'ar' ? 'تصغير' : 'Zoom Out'}
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        
        <button
          onClick={toggleAutoRotate}
          className="bg-black/80 hover:bg-black backdrop-blur-md text-white p-3 rounded-lg transition-colors border border-gray-600"
          title={language === 'ar' ? 'دوران تلقائي' : 'Auto Rotate'}
        >
          <RotateCw className="h-5 w-5" />
        </button>
        
        <button
          onClick={handleReset}
          className="bg-black/80 hover:bg-black backdrop-blur-md text-white p-3 rounded-lg transition-colors border border-gray-600"
          title={language === 'ar' ? 'إعادة تعيين' : 'Reset View'}
        >
          <Maximize className="h-5 w-5" />
        </button>
        
        <button
          onClick={onClose}
          className="bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-white p-3 rounded-lg transition-colors border border-red-500"
          title={language === 'ar' ? 'إغلاق' : 'Close'}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

     
    </div>
  );
};

export default Pannellum360Viewer; 