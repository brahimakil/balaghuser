import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Calendar, Info, Share, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocationById, getLocationBySlug, getLegendById, type Location, type Legend } from '../services/locationsService';
import LocationMediaGallery from '../components/LocationMediaGallery';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [legend, setLegend] = useState<Legend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch by slug first, then fall back to ID
        let locationData = await getLocationBySlug(id);
        
        // If slug lookup fails, try ID lookup (backward compatibility)
        if (!locationData) {
          locationData = await getLocationById(id);
        }
        
        if (!locationData) {
          setError('Location not found');
          return;
        }
        
        setLocation(locationData);
        
        // Fetch legend data
        if (locationData.legendId) {
          const legendData = await getLegendById(locationData.legendId);
          setLegend(legendData);
        }
        
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Failed to load location data');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [id]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBackToLocations = () => {
    navigate('/locations');
  };

  // Updated: Open Google Maps with specific coordinates
  const handleViewOnGoogleMaps = () => {
    if (location) {
      const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=17`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const handleShareLocation = () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: language === 'ar' ? location?.nameAr : location?.nameEn,
        text: language === 'ar' ? location?.descriptionAr : location?.descriptionEn,
        url: currentUrl,
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  // Create custom marker icon
  const createLocationIcon = () => {
    if (legend?.mainIcon) {
      // Use legend icon if available
      return new Icon({
        iconUrl: legend.mainIcon,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: 'location-marker'
      });
    } else {
      // Default red marker
      return new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
            {language === 'ar' ? 'الموقع غير موجود' : 'Location Not Found'}
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            {error || (language === 'ar' ? 'لا يمكن العثور على الموقع المطلوب' : 'The requested location could not be found')}
          </p>
          <button
            onClick={handleBackToLocations}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'ar' ? 'العودة إلى المواقع' : 'Back to Locations'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: location.mainImage ? `url(${location.mainImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        
        {/* Content - positioned at bottom left like other pages */}
        <div className="absolute inset-0 flex items-end">
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleBackToLocations}
                className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180 ml-2' : 'mr-2'}`} />
                <span>{language === 'ar' ? 'العودة إلى المواقع' : 'Back to Locations'}</span>
              </button>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {language === 'ar' ? location.nameAr : location.nameEn}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {language === 'ar' ? location.descriptionAr : location.descriptionEn}
              </p>
              
              {legend && (
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  {legend.mainIcon && (
                    <img src={legend.mainIcon} alt="Legend" className="w-6 h-6" />
                  )}
                  <span className="text-white font-medium">
                    {language === 'ar' ? legend.nameAr : legend.nameEn}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location Details */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'تفاصيل الموقع' : 'Location Details'}
              </h2>
              
              <div className="space-y-4">

              {legend && (
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary-900 dark:text-white">
                        {language === 'ar' ? 'نوع الموقع' : 'Location Type'}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400">
                        {language === 'ar' ? legend.nameAr : legend.nameEn}
                      </p>
                      <p className="text-sm text-primary-500 dark:text-primary-500 mt-1">
                        {language === 'ar' ? legend.descriptionAr : legend.descriptionEn}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {language === 'ar' ? 'الإحداثيات' : 'Coordinates'}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

              
              </div>
            </div>

            {/* NEW: Location Map */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'موقع على الخريطة' : 'Location on Map'}
              </h2>
              
              <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg border border-primary-200 dark:border-primary-700">
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <Marker
                    position={[location.latitude, location.longitude]}
                    icon={createLocationIcon()}
                  >
                    <Popup>
                      <div className={`text-center ${isRTL ? 'text-right' : 'text-left'} min-w-48 p-2`}>
                        <h3 className="font-bold text-lg mb-2 text-gray-800">
                          {language === 'ar' ? location.nameAr : location.nameEn}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {language === 'ar' ? location.descriptionAr : location.descriptionEn}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Media Section */}
            <LocationMediaGallery 
              photos={location.photos || []} 
              videos={location.videos || []} 
              photos360={location.photos360 || []}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend Info */}
            {legend && (
              <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
                  {language === 'ar' ? 'معلومات الرمز' : 'Legend Information'}
                </h3>
                
                <div className="flex items-center space-x-3 mb-3">
                  {legend.mainIcon && (
                    <img src={legend.mainIcon} alt="Legend" className="w-8 h-8" />
                  )}
                  <h4 className="font-semibold text-primary-900 dark:text-white">
                    {language === 'ar' ? legend.nameAr : legend.nameEn}
                  </h4>
                </div>
                
                <p className="text-primary-600 dark:text-primary-400 text-sm">
                  {language === 'ar' ? legend.descriptionAr : legend.descriptionEn}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-primary-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
              
              <div className="space-y-3">
                {/* Updated: Google Maps button */}
                <button
                  onClick={handleViewOnGoogleMaps}
                  className="w-full flex items-center space-x-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}</span>
                </button>
                
                <button 
                  onClick={handleShareLocation}
                  className="w-full flex items-center space-x-3 p-3 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                >
                  <Share className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'مشاركة الموقع' : 'Share Location'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail; 