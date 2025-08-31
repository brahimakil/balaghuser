import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { useMapData } from '../hooks/useMapData';
import type { Location, Legend } from '../services/locationsService';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// South Lebanon (Janoub) coordinates - focused on South Lebanon
const SOUTH_LEBANON_CENTER: [number, number] = [33.31, 35.4];
const DEFAULT_ZOOM = 10.8;

// Custom hook to handle map center updates and location focusing
const MapController: React.FC<{ center: [number, number]; focusLocation?: Location }> = ({ center, focusLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusLocation) {
      map.setView([focusLocation.latitude, focusLocation.longitude], 15);
    } else {
      map.setView(center, DEFAULT_ZOOM); // Force the zoom level
    }
  }, [center, focusLocation, map]);

  return null;
};

// Create custom icon from base64 image
const createCustomIcon = (base64Image: string, size: [number, number] = [32, 32]) => {
  return new DivIcon({
    html: `<div style="
      width: ${size[0]}px; 
      height: ${size[1]}px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      overflow: hidden;
      background: white;
    ">
      <img src="${base64Image}" style="
        width: 100%; 
        height: 100%; 
        object-fit: cover;
      " />
    </div>`,
    className: 'custom-div-icon',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
};

// Legend component
const MapLegend: React.FC<{ 
  legends: Legend[]; 
  onLegendClick: (legendId: string) => void;
  selectedLegend: string | null;
}> = ({ legends, onLegendClick, selectedLegend }) => {
  const { language } = useLanguage();

  return (
    <div className="absolute bottom-4 right-4 z-30 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700 p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-primary-900 dark:text-white mb-3">
        {language === 'ar' ? 'دليل المواقع' : 'Location Legend'}
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {legends.map((legend) => (
          <button
            key={legend.id}
            onClick={() => onLegendClick(selectedLegend === legend.id ? '' : legend.id)}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
              selectedLegend === legend.id
                ? 'bg-accent-100 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-700'
                : 'hover:bg-primary-50 dark:hover:bg-primary-700/50'
            }`}
          >
            <div className="flex-shrink-0">
              {legend.mainIcon ? (
                <img 
                  src={legend.mainIcon} 
                  alt={language === 'ar' ? legend.nameAr : legend.nameEn}
                  className="w-6 h-6 rounded-full border border-primary-300 dark:border-primary-600 object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-accent-500 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-900 dark:text-white truncate">
                {language === 'ar' ? legend.nameAr : legend.nameEn}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 truncate">
                {language === 'ar' ? legend.descriptionAr : legend.descriptionEn}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const InteractiveMap: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, isRTL } = useLanguage();
  const { locations, legends, legendsMap, loading, error } = useMapData();
  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);
  
  // Always start with South Lebanon center, don't calculate from locations
  const [mapCenter] = useState<[number, number]>(SOUTH_LEBANON_CENTER);

  // Get focused location from URL params
  const focusLocationId = searchParams.get('location');
  const focusLocation = focusLocationId ? locations.find(loc => loc.id === focusLocationId) : undefined;

  // Filter locations based on selected legend
  const filteredLocations = selectedLegend 
    ? locations.filter(loc => loc.legendId === selectedLegend)
    : locations;

  // Handle loading state
  if (loading) {
    return (
      <div className="w-full h-96 lg:h-[500px] bg-primary-100 dark:bg-primary-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-600 dark:text-primary-400">
            {language === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full h-96 lg:h-[500px] bg-primary-100 dark:bg-primary-800 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            {language === 'ar' ? 'خطأ في تحميل الخريطة' : 'Error loading map'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg border border-primary-200 dark:border-primary-700">
      <MapContainer
        center={focusLocation ? [focusLocation.latitude, focusLocation.longitude] : mapCenter}
        zoom={focusLocation ? 15 : DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapController center={mapCenter} focusLocation={focusLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredLocations.map((location) => {
          const legend = legendsMap[location.legendId];
          const icon = legend?.mainIcon 
            ? createCustomIcon(legend.mainIcon, focusLocation?.id === location.id ? [40, 40] : [32, 32])
            : new Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: focusLocation?.id === location.id ? [31, 51] : [25, 41],
                iconAnchor: focusLocation?.id === location.id ? [15, 51] : [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              });

          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={icon}
            >
              <Popup className="map-popup">
                <div className={`p-2 popup-content ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
                  {location.mainImage && (
                    <img 
                      src={location.mainImage} 
                      alt={language === 'ar' ? location.nameAr : location.nameEn}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-primary-900 dark:text-white mb-2">
                    {language === 'ar' ? location.nameAr : location.nameEn}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-300 mb-3 line-clamp-2">
                    {language === 'ar' ? location.descriptionAr : location.descriptionEn}
                  </p>
                  {legend && (
                    <div className="flex items-center space-x-2 text-xs text-primary-500 dark:text-primary-400 mb-3">
                      {legend.mainIcon && (
                        <img src={legend.mainIcon} alt="" className="w-4 h-4 rounded-full" />
                      )}
                      <span>{language === 'ar' ? legend.nameAr : legend.nameEn}</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/locations/${location.id}`)}
                    className="w-full px-3 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors"
                  >
                    {language === 'ar' ? 'عرض المزيد' : 'View More'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <MapLegend 
        legends={legends}
        onLegendClick={setSelectedLegend}
        selectedLegend={selectedLegend}
      />
    </div>
  );
};

export default InteractiveMap; 