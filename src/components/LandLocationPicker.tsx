import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  LocateFixed, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Search
} from 'lucide-react';
import { GeoCoordinates } from '../types';
import { toBanglaNumber } from '../utils/storage';

interface LandLocationPickerProps {
  value?: GeoCoordinates;
  onChange: (coords: GeoCoordinates) => void;
  mouzaName?: string;
  wardNo?: string;
}

// Preset coordinate centers for Sitakunda Municipality Areas
const SITAKUNDA_PRESETS: { name: string; lat: number; lng: number; description: string }[] = [
  { name: 'সীতাকুণ্ড পৌরসভা কার্যালয়', lat: 22.6182, lng: 91.6608, description: 'পৌর ভবন চত্বর' },
  { name: 'মহাদেবপুর (মৌজা ২৭)', lat: 22.6150, lng: 91.6580, description: 'ওয়ার্ড নং ৪ ও ৫' },
  { name: 'শিবপুর (মৌজা ১৯)', lat: 22.6320, lng: 91.6520, description: 'উত্তর সীতাকুণ্ড' },
  { name: 'দক্ষিণ টেরিয়াইল (মৌজা ১৩)', lat: 22.6450, lng: 91.6490, description: 'টেরিয়াইল এলাকা' },
  { name: 'ইয়াকুব নগর (মৌজা ২০)', lat: 22.6280, lng: 91.6680, description: 'পূর্ব পাহাড় সংলগ্ন' },
  { name: 'আমিরাবাদ (মৌজা ২৫)', lat: 22.6080, lng: 91.6620, description: 'দক্ষিণ এলাকা' },
  { name: 'সীতাকুণ্ড সদর বাজার', lat: 22.6195, lng: 91.6625, description: 'ডিটি রোড ও বাজার' },
  { name: 'জঙ্গল মহাদেবপুর (মৌজা ৩০)', lat: 22.6110, lng: 91.6850, description: 'পাহাড়ী বনাঞ্চল সীমানা' },
];

// Sitakunda default center
const DEFAULT_CENTER = { lat: 22.6182, lng: 91.6608 };

export const LandLocationPicker: React.FC<LandLocationPickerProps> = ({
  value,
  onChange,
  mouzaName,
  wardNo,
}) => {
  const [centerLat, setCenterLat] = useState<number>(value?.latitude || DEFAULT_CENTER.lat);
  const [centerLng, setCenterLng] = useState<number>(value?.longitude || DEFAULT_CENTER.lng);
  const [zoom, setZoom] = useState<number>(15);
  const [pinnedCoord, setPinnedCoord] = useState<GeoCoordinates | null>(
    value?.latitude && value?.longitude ? value : null
  );

  const [inputLat, setInputLat] = useState<string>(value?.latitude ? value.latitude.toFixed(6) : '');
  const [inputLng, setInputLng] = useState<string>(value?.longitude ? value.longitude.toFixed(6) : '');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<'osm' | 'satellite'>('osm');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync if external value changes
  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      setPinnedCoord(value);
      setCenterLat(value.latitude);
      setCenterLng(value.longitude);
      setInputLat(value.latitude.toFixed(6));
      setInputLng(value.longitude.toFixed(6));
    }
  }, [value?.latitude, value?.longitude]);

  // If mouza changes and no pin is placed, focus on that mouza
  useEffect(() => {
    if (mouzaName && !pinnedCoord) {
      const match = SITAKUNDA_PRESETS.find((p) => p.name.includes(mouzaName));
      if (match) {
        setCenterLat(match.lat);
        setCenterLng(match.lng);
      }
    }
  }, [mouzaName]);

  // Handle map click to drop/move pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Approximate delta in lat/lng based on zoom
    const width = rect.width;
    const height = rect.height;

    // Scale factors per zoom level
    const latSpan = 180 / Math.pow(2, zoom) * (height / 256);
    const lngSpan = 360 / Math.pow(2, zoom) * (width / 256);

    const xOffsetRatio = (x - width / 2) / width;
    const yOffsetRatio = (y - height / 2) / height;

    const newLat = Number((centerLat - yOffsetRatio * latSpan).toFixed(6));
    const newLng = Number((centerLng + xOffsetRatio * lngSpan).toFixed(6));

    const newGeo: GeoCoordinates = {
      latitude: newLat,
      longitude: newLng,
      addressText: `সীতাকুণ্ড পৌরসভা (অক্ষাংশ: ${newLat}, দ্রাঘিমাংশ: ${newLng})`,
      pinnedOnMap: true,
    };

    setPinnedCoord(newGeo);
    setCenterLat(newLat);
    setCenterLng(newLng);
    setInputLat(newLat.toFixed(6));
    setInputLng(newLng.toFixed(6));
    onChange(newGeo);
    setLocationStatus('ম্যাপে ভূমির পিন সফলভাবে বসানো হয়েছে');
  };

  // Get current device GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('আপনার ব্রাউজারে GPS সাপোর্ট নেই');
      return;
    }

    setIsLocating(true);
    setLocationStatus('আপনার বর্তমান অবস্থান সনাক্ত করা হচ্ছে...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const newGeo: GeoCoordinates = {
          latitude: lat,
          longitude: lng,
          addressText: `ডিভাইস জিপিএস অবস্থান (অক্ষাংশ: ${lat}, দ্রাঘিমাংশ: ${lng})`,
          pinnedOnMap: true,
        };

        setPinnedCoord(newGeo);
        setCenterLat(lat);
        setCenterLng(lng);
        setInputLat(lat.toFixed(6));
        setInputLng(lng.toFixed(6));
        setZoom(17);
        setIsLocating(false);
        onChange(newGeo);
        setLocationStatus('আপনার বর্তমান জিপিএস অবস্থান পিন করা হয়েছে');
      },
      (error) => {
        setIsLocating(false);
        // Fallback to Sitakunda Center if permission denied or unavailable
        const defaultGeo: GeoCoordinates = {
          latitude: DEFAULT_CENTER.lat,
          longitude: DEFAULT_CENTER.lng,
          addressText: 'সীতাকুণ্ড পৌরসভা কার্যালয় এলাকা',
          pinnedOnMap: true,
        };
        setPinnedCoord(defaultGeo);
        setCenterLat(DEFAULT_CENTER.lat);
        setCenterLng(DEFAULT_CENTER.lng);
        setInputLat(DEFAULT_CENTER.lat.toFixed(6));
        setInputLng(DEFAULT_CENTER.lng.toFixed(6));
        onChange(defaultGeo);
        setLocationStatus('GPS অনুমতি না পাওয়ায় সীতাকুণ্ড পৌর এলাকা নির্বাচন করা হয়েছে');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Manual input apply
  const handleApplyManualCoords = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || isNaN(lng) || lat < 20 || lat > 27 || lng < 88 || lng > 93) {
      setLocationStatus('অনুগ্রহ করে বাংলাদেশের সঠিক অক্ষাংশ (Lat: 20-27) ও দ্রাঘিমাংশ (Lng: 88-93) প্রদান করুন');
      return;
    }

    const newGeo: GeoCoordinates = {
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      addressText: `স্থানাঙ্ক: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      pinnedOnMap: true,
    };

    setPinnedCoord(newGeo);
    setCenterLat(newGeo.latitude);
    setCenterLng(newGeo.longitude);
    onChange(newGeo);
    setLocationStatus('স্থানাঙ্ক সফলভাবে সংরক্ষিত হয়েছে');
  };

  // Preset location select
  const handleSelectPreset = (preset: typeof SITAKUNDA_PRESETS[0]) => {
    const newGeo: GeoCoordinates = {
      latitude: preset.lat,
      longitude: preset.lng,
      addressText: `${preset.name}, সীতাকুণ্ড`,
      pinnedOnMap: true,
    };
    setPinnedCoord(newGeo);
    setCenterLat(preset.lat);
    setCenterLng(preset.lng);
    setInputLat(preset.lat.toFixed(6));
    setInputLng(preset.lng.toFixed(6));
    onChange(newGeo);
    setLocationStatus(`${preset.name} এলাকা পিন করা হয়েছে`);
  };

  // Clear pin
  const handleClearPin = () => {
    setPinnedCoord(null);
    setInputLat('');
    setInputLng('');
    setLocationStatus('পিন মুছে ফেলা হয়েছে');
  };

  // Map Tile URL (OpenStreetMap Slippy Map via standard static/dynamic tiles)
  // Calculate OpenStreetMap tile coordinates for display
  const n = Math.pow(2, zoom);
  const tileX = Math.floor(((centerLng + 180) / 360) * n);
  const latRad = (centerLat * Math.PI) / 180;
  const tileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  const googleMapsUrl = pinnedCoord
    ? `https://www.google.com/maps?q=${pinnedCoord.latitude},${pinnedCoord.longitude}&z=17`
    : `https://www.google.com/maps?q=${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng}&z=15`;

  const osmUrl = pinnedCoord
    ? `https://www.openstreetmap.org/?mlat=${pinnedCoord.latitude}&mlon=${pinnedCoord.longitude}#map=17/${pinnedCoord.latitude}/${pinnedCoord.longitude}`
    : `https://www.openstreetmap.org/#map=15/${DEFAULT_CENTER.lat}/${DEFAULT_CENTER.lng}`;

  return (
    <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h4 className="font-bold text-sm sm:text-base text-slate-900">
              জমির সুনির্দিষ্ট ভৌগোলিক অবস্থান (Geographic Map Location)
            </h4>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
              ঐচ্ছিক কিন্তু সুপারিশকৃত
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ম্যাপে ক্লিক করে ডিমার্কেশনকৃত জমির সঠিক অবস্থান পিন করুন অথবা মোবাইল জিপিএস ব্যবহার করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="আমার বর্তমান অবস্থান নিন"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLocating ? 'অবস্থান খোঁজা হচ্ছে...' : 'আমার বর্তমান GPS অবস্থান'}</span>
          </button>

          {pinnedCoord && (
            <button
              type="button"
              onClick={handleClearPin}
              className="text-xs text-slate-500 hover:text-red-600 underline px-2 py-1 cursor-pointer"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick Area Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-[11px] font-semibold shrink-0">দ্রুত এলাকা নির্বাচন:</span>
        {SITAKUNDA_PRESETS.slice(0, 5).map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[11px] text-slate-700 transition-colors cursor-pointer"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Visual Stage */}
      <div 
        ref={containerRef}
        onClick={handleMapClick}
        className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-100 cursor-crosshair group shadow-inner select-none"
      >
        {/* OpenStreetMap Tile Grid Background Simulation */}
        <div className="absolute inset-0 bg-[#e8ece9] flex items-center justify-center">
          {/* Real OpenStreetMap Tile background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-300 opacity-90"
            style={{
              backgroundImage: `url('https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png')`,
              backgroundSize: '350%',
              backgroundPosition: 'center',
            }}
          />

          {/* SVG Map Grid & Topographic Overlay Lines for precision feel */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#059669" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>

          {/* Sitakunda Landmark Indicators */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-800 border border-slate-300 shadow-xs pointer-events-none">
            সীতাকুণ্ড পৌরসভা এলাকা (Ward 1-9)
          </div>

          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] text-slate-600 border border-slate-300 pointer-events-none">
            মানচিত্রে যেকোনো স্থানে ক্লিক করে জমির লাল পিন বসান
          </div>

          {/* Pinned Location Marker */}
          {pinnedCoord && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none animate-bounce">
              <div className="bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-red-500">
                <MapPin className="w-5 h-5 fill-white text-red-600" />
              </div>
              <div className="mt-1 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md whitespace-nowrap">
                {pinnedCoord.latitude.toFixed(4)}° N, {pinnedCoord.longitude.toFixed(4)}° E
              </div>
            </div>
          )}

          {/* Crosshair indicator at center when not pinned */}
          {!pinnedCoord && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Navigation className="w-8 h-8 opacity-40" />
            </div>
          )}
        </div>

        {/* Map Controls: Zoom In / Zoom Out */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.min(zoom + 1, 18));
            }}
            className="w-8 h-8 bg-white/95 hover:bg-white text-slate-800 rounded-md shadow-md flex items-center justify-center font-bold text-sm border border-slate-300 cursor-pointer"
            title="জুম ইন"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.max(zoom - 1, 12));
            }}
            className="w-8 h-8 bg-white/95 hover:bg-white text-slate-800 rounded-md shadow-md flex items-center justify-center font-bold text-sm border border-slate-300 cursor-pointer"
            title="জুম আউট"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pinned Coordinates Display & Manual Inputs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {pinnedCoord ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-800">
              {pinnedCoord ? 'চিহ্নিত স্থানাঙ্ক (Pinned Coordinates):' : 'স্থানাঙ্ক নির্ধারিত হয়নি (ম্যাপে ক্লিক করুন)'}
            </span>
          </div>

          {pinnedCoord && (
            <div className="flex items-center gap-3 text-xs">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 underline font-semibold flex items-center gap-1"
              >
                <span>Google Maps এ দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href={osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 underline font-semibold flex items-center gap-1"
              >
                <span>OpenStreetMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Manual Latitude / Longitude entry inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-0.5">
              অক্ষাংশ (Latitude):
            </label>
            <input
              type="text"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              placeholder="e.g. 22.618200"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 font-semibold mb-0.5">
              দ্রাঘিমাংশ (Longitude):
            </label>
            <input
              type="text"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              placeholder="e.g. 91.660800"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono text-xs"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyManualCoords}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-bold text-xs transition-colors cursor-pointer"
            >
              স্থানাঙ্ক প্রয়োগ করুন
            </button>
          </div>
        </div>

        {locationStatus && (
          <p className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
            {locationStatus}
          </p>
        )}
      </div>
    </div>
  );
};
