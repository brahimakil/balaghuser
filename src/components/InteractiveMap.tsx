import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMapData } from '../hooks/useMapData';
import { getAllSectors, type Sector } from '../services/sectorsService';
import type { Location, Legend } from '../services/locationsService';
import { createLocationSlug } from '../services/locationsService';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// South Lebanon (Janoub) coordinates - focused on South Lebanon
const SOUTH_LEBANON_CENTER: [number, number] = [33.20, 35.4];
const DEFAULT_ZOOM = 10.5;

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
    <div className="absolute bottom-4 left-4 md:right-4 md:left-auto z-30 bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700 p-2 md:p-4 max-w-[200px] md:max-w-xs">
      <h3 className="text-xs md:text-sm font-semibold text-primary-900 dark:text-white mb-2 md:mb-3">
        {language === 'ar' ? 'دليل المواقع' : 'Legend'}
      </h3>
      <div className="space-y-1 md:space-y-2 max-h-32 md:max-h-64 overflow-y-auto">
        {legends.map((legend) => (
          <button
            key={legend.id}
            onClick={() => onLegendClick(selectedLegend === legend.id ? '' : legend.id)}
            className={`w-full flex items-center space-x-2 md:space-x-3 p-1 md:p-2 rounded-lg text-left transition-colors ${
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
                  className="w-4 h-4 md:w-6 md:h-6 rounded-full border border-primary-300 dark:border-primary-600 object-cover"
                />
              ) : (
                <div className="w-4 h-4 md:w-6 md:h-6 bg-accent-500 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-primary-900 dark:text-white truncate">
                {language === 'ar' ? legend.nameAr : legend.nameEn}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 truncate hidden md:block">
                {language === 'ar' ? legend.descriptionAr : legend.descriptionEn}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// NEW: Sectors Filter Component
const SectorsFilter: React.FC<{
  sectors: Sector[];
  selectedSectors: string[];
  selectedPrayerTiming: string;
  onSectorChange: (sectorIds: string[]) => void;
  onPrayerTimingChange: (timing: string) => void;
  onClose: () => void;
}> = ({ sectors, selectedSectors, selectedPrayerTiming, onSectorChange, onPrayerTimingChange, onClose }) => {
  const { language, isRTL } = useLanguage();

  const handleSectorToggle = (sectorId: string) => {
    if (selectedSectors.includes(sectorId)) {
      onSectorChange(selectedSectors.filter(id => id !== sectorId));
    } else {
      onSectorChange([...selectedSectors, sectorId]);
    }
  };

  return (
    <div className="absolute top-16 md:top-20 right-4 md:left-4 z-40 bg-white dark:bg-primary-800 rounded-lg shadow-2xl border-2 border-accent-200 dark:border-accent-700 p-3 md:p-6 w-72 md:w-80 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-sm md:text-lg font-bold text-primary-900 dark:text-white flex items-center space-x-1 md:space-x-2">
          <Filter className="h-4 w-4 md:h-5 md:w-5 text-accent-600" />
          <span>{language === 'ar' ? 'تصفية المسار' : 'Filter Path'}</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 md:p-2 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 md:h-5 md:w-5 text-primary-600 dark:text-primary-400" />
        </button>
      </div>

      {/* Prayer Timing Filter */}
      <div className="mb-4 md:mb-6">
        <label className="block text-xs md:text-sm font-semibold text-primary-700 dark:text-primary-300 mb-2 md:mb-3">
          {language === 'ar' ? 'توقيت الصلاة' : 'Prayer Timing'}
        </label>
        <select
          value={selectedPrayerTiming}
          onChange={(e) => onPrayerTimingChange(e.target.value)}
          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white font-medium focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
        >
          <option value="">{language === 'ar' ? 'أي وقت' : 'Anytime'}</option>
          <option value="before_dohor">{language === 'ar' ? 'قبل الظهر' : 'Before Dohor'}</option>
          <option value="after_dohor">{language === 'ar' ? 'بعد الظهر' : 'After Dohor'}</option>
        </select>
      </div>

      {/* Sectors List */}
      <div>
        <br />
        <br />
        <br />
        <br />
        <label className="block text-xs md:text-sm font-semibold text-primary-700 dark:text-primary-300 mb-2 md:mb-3">
          {language === 'ar' ? 'اختر المسار' : 'Choose Path'}
        </label>
        <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
          {sectors.map((sector) => (
            <label
              key={sector.id}
              className="flex items-center space-x-2 md:space-x-3 cursor-pointer p-2 md:p-3 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/20 border border-transparent hover:border-accent-200 dark:hover:border-accent-700 transition-all"
            >
              <input
                type="checkbox"
                checked={selectedSectors.includes(sector.id)}
                onChange={() => handleSectorToggle(sector.id)}
                className="w-4 h-4 md:w-5 md:h-5 rounded border-2 border-primary-300 text-accent-600 focus:ring-accent-500 focus:ring-2"
              />
              <span className="text-xs md:text-sm font-medium text-primary-900 dark:text-white">
                {language === 'ar' ? sector.nameAr : sector.nameEn}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      {(selectedSectors.length > 0 || selectedPrayerTiming) && (
        <button
          onClick={() => {
            onSectorChange([]);
            onPrayerTimingChange('');
          }}
          className="w-full mt-3 md:mt-4 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors"
        >
          {language === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      )}
    </div>
  );
};

const InteractiveMap: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, isRTL } = useLanguage();
  const { locations, legends, legendsMap, loading, error } = useMapData();
  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);
  
  // NEW: Sectors filtering state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [showSectorsFilter, setShowSectorsFilter] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedPrayerTiming, setSelectedPrayerTiming] = useState<string>('');
  
  // NEW: Legend visibility state
  const [showLegend, setShowLegend] = useState(true);
  
  // Always start with South Lebanon center, don't calculate from locations
  const [mapCenter] = useState<[number, number]>(SOUTH_LEBANON_CENTER);

  // Get focused location from URL params
  const focusLocationId = searchParams.get('location');
  const focusLocation = focusLocationId ? locations.find(loc => loc.id === focusLocationId) : undefined;

  // NEW: Load sectors
  useEffect(() => {
    const loadSectors = async () => {
      const sectorsData = await getAllSectors();
      setSectors(sectorsData);
    };
    loadSectors();
  }, []);

  // NEW: Filter locations based on selected sectors and prayer timing
  const filteredLocations = React.useMemo(() => {
    let filtered = locations;

    // First apply legend filter
    if (selectedLegend) {
      filtered = filtered.filter(loc => loc.legendId === selectedLegend);
    }

    // Then apply sectors filter
    if (selectedSectors.length > 0) {
      const allowedLocationIds = new Set<string>();
      
      selectedSectors.forEach(sectorId => {
        const sector = sectors.find(s => s.id === sectorId);
        if (sector) {
          sector.locationPrayerTimings.forEach(lpt => {
            // ✅ NEW: Include always_visible locations
            if (lpt.prayerTiming === 'always_visible') {
              allowedLocationIds.add(lpt.locationId);
            }
            // Filter by prayer timing if selected
            else if (!selectedPrayerTiming || lpt.prayerTiming === selectedPrayerTiming) {
              allowedLocationIds.add(lpt.locationId);
            }
          });
        }
      });

      filtered = filtered.filter(loc => allowedLocationIds.has(loc.id));
    }

    return filtered;
  }, [locations, selectedLegend, selectedSectors, selectedPrayerTiming, sectors]);

  // NEW: Search functionality
  const [sectorSearch, setSectorSearch] = useState('');
  
  // Filter sectors based on search
  const filteredSectors = useMemo(() => {
    if (!sectorSearch) return sectors;
    return sectors.filter(sector => 
      sector.nameEn.toLowerCase().includes(sectorSearch.toLowerCase()) ||
      sector.nameAr.toLowerCase().includes(sectorSearch.toLowerCase())
    );
  }, [sectors, sectorSearch]);

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
    <div className="space-y-4">
      {/* NEW: Sectors Filter Button - OUTSIDE the map */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowSectorsFilter(!showSectorsFilter)}
          className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg shadow-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105"
        >
          <Filter className="h-5 w-5" />
          <span>
            {language === 'ar' ? 'اختر المسار' : 'Choose Path'}
          </span>
        </button>
        
        {/* Active filters indicator */}
        {(selectedSectors.length > 0 || selectedPrayerTiming) && (
          <div className="bg-white dark:bg-primary-800 px-4 py-2 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700">
            <span className="text-sm font-medium text-accent-600 dark:text-accent-400">
              {language === 'ar' ? 'مفعل' : 'Active'} 
              {selectedSectors.length > 0 && ` • ${selectedSectors.length} ${language === 'ar' ? 'مسار' : 'paths'}`}
              {selectedPrayerTiming && ` • ${selectedPrayerTiming === 'before_dohor' ? (language === 'ar' ? 'قبل الظهر' : 'Before Dohor') : (language === 'ar' ? 'بعد الظهر' : 'After Dohor')}`}
            </span>
          </div>
        )}
      </div>

      {/* NEW: Sectors Filter Panel - OUTSIDE and scrollable with search */}
      {showSectorsFilter && (
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-2xl border-2 border-accent-200 dark:border-accent-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white flex items-center space-x-2">
              <Filter className="h-5 w-5 text-accent-600" />
              <span>{language === 'ar' ? 'تصفية المسار' : 'Filter Path'}</span>
            </h3>
            <button
              onClick={() => setShowSectorsFilter(false)}
              className="p-2 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Prayer Timing Filter */}
            <div>
              <label className="block text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3">
                {language === 'ar' ? 'توقيت الصلاة' : 'Prayer Timing'}
              </label>
              <select
                value={selectedPrayerTiming}
                onChange={(e) => setSelectedPrayerTiming(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white font-medium focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="">{language === 'ar' ? 'أي وقت' : 'Anytime'}</option>
                <option value="before_dohor">{language === 'ar' ? 'قبل الظهر' : 'Before Dohor'}</option>
                <option value="after_dohor">{language === 'ar' ? 'بعد الظهر' : 'After Dohor'}</option>
              </select>
            </div>

            {/* Sectors with Search */}
            <div>
              <label className="block text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3">
                {language === 'ar' ? 'اختر المسار' : 'Choose Path'}
              </label>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في المسارات...' : 'Search paths...'}
                  value={sectorSearch}
                  onChange={(e) => setSectorSearch(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border-2 border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Scrollable Sectors List */}
              <div className="space-y-3 max-h-80 overflow-y-auto border border-primary-200 dark:border-primary-600 rounded-lg p-4">
                {filteredSectors.length > 0 ? (
                  filteredSectors.map((sector) => (
                    <label
                      key={sector.id}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/20 border border-transparent hover:border-accent-200 dark:hover:border-accent-700 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSectors.includes(sector.id)}
                        onChange={() => {
                          if (selectedSectors.includes(sector.id)) {
                            setSelectedSectors(selectedSectors.filter(id => id !== sector.id));
                          } else {
                            setSelectedSectors([...selectedSectors, sector.id]);
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-primary-300 text-accent-600 focus:ring-accent-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-primary-900 dark:text-white">
                        {language === 'ar' ? sector.nameAr : sector.nameEn}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-center text-primary-500 dark:text-primary-400 py-4">
                    {language === 'ar' ? 'لا توجد مسارات مطابقة' : 'No matching paths'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          {(selectedSectors.length > 0 || selectedPrayerTiming) && (
            <button
              onClick={() => {
                setSelectedSectors([]);
                setSelectedPrayerTiming('');
                setSectorSearch('');
              }}
              className="w-full mt-6 px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors"
            >
              {language === 'ar' ? 'مسح الكل' : 'Clear All'}
            </button>
          )}
        </div>
      )}

      {/* Map Container - CLEAN without any overlay buttons */}
      <div className="relative w-full h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-lg border border-primary-200 dark:border-primary-700">
        {/* Legend Toggle Button - only this button remains inside */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute top-4 right-4 z-40 bg-white dark:bg-primary-800 p-2 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
          title={showLegend ? (language === 'ar' ? 'إخفاء الدليل' : 'Hide Legend') : (language === 'ar' ? 'إظهار الدليل' : 'Show Legend')}
        >
          {showLegend ? (
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.05 10.05 0 00-5.878 8.536c1.274 4.057 5.065 7 9.542 7 1.654 0 3.233-.398 4.608-1.107L9.878 9.878z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

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
                      onClick={() => {
                        const slug = createLocationSlug(location);
                        navigate(`/locations/${slug}`);
                      }}
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

        {/* Updated MapLegend with conditional rendering */}
        {showLegend && (
          <MapLegend 
            legends={legends}
            onLegendClick={setSelectedLegend}
            selectedLegend={selectedLegend}
          />
        )}
      </div>
    </div>
  );
};

export default InteractiveMap; 