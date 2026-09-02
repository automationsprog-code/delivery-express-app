import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  Layers, 
  MapPin, 
  Store, 
  Utensils, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Check
} from 'lucide-react';

// Custom Map Marker Icons
const createCustomIcon = (color, emoji, size = 34) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${size * 0.44}px;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        ${emoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });
};

const pickupIcon = createCustomIcon('#2563EB', '📦', 36); // Blue
const dropoffIcon = createCustomIcon('#10B981', '📍', 36); // Emerald Green
const riderIcon = createCustomIcon('#E11D48', '🏍️', 38); // Brand Red

// POI Icons
const foodIcon = createCustomIcon('#F59E0B', '🍔', 28);
const storeIcon = createCustomIcon('#8B5CF6', '🛒', 28);
const pharmacyIcon = createCustomIcon('#06B6D4', '💊', 28);
const townIcon = createCustomIcon('#6366F1', '🏛️', 28);

// Popular Partner Stores and Comprehensive Places across ALL West Cebu Municipalities
const WEST_CEBU_PLACES = [
  // 1. Balamban Hub
  { id: 'bb1', name: 'Balamban Liempo & Lechon House', category: 'Restaurant', coords: [10.5020, 123.7145], type: 'food', desc: 'World-famous herb & garlic liempo roll', town: 'Balamban' },
  { id: 'bb2', name: 'Jollibee Gaisano Grand Balamban', category: 'Fast Food', coords: [10.4990, 123.7175], type: 'food', desc: 'Langhap-sarap chickenjoy & burgers', town: 'Balamban' },
  { id: 'bb3', name: 'Gaisano Grand Mall Balamban', category: 'Shopping Mall', coords: [10.4995, 123.7180], type: 'store', desc: 'Department store & supermarket', town: 'Balamban' },
  { id: 'bb4', name: 'Balamban Public Market (Palengke)', category: 'Public Market', coords: [10.5015, 123.7150], type: 'store', desc: 'Fresh seafood, pork, vegetables & goods', town: 'Balamban' },
  { id: 'bb5', name: 'Kusina ni Nanay & Native Grill', category: 'Grill & Diners', coords: [10.5035, 123.7138], type: 'food', desc: 'Authentic Cebuano dishes & BBQ', town: 'Balamban' },
  { id: 'bb6', name: 'Red Ribbon & Julie\'s Bakeshop', category: 'Bakery', coords: [10.5000, 123.7160], type: 'food', desc: 'Cakes, pastries & fresh bread', town: 'Balamban' },
  { id: 'bb7', name: 'Mercury Drug & 360 Pharmacy Balamban', category: 'Pharmacy', coords: [10.5010, 123.7155], type: 'pharmacy', desc: 'Prescription medicines & vitamins', town: 'Balamban' },
  { id: 'bb8', name: 'Balamban Municipal Hall & Town Plaza', category: 'Gov Center', coords: [10.5030, 123.7140], type: 'town', desc: 'Balamban Town Plaza & Municipal Hall', town: 'Balamban' },
  { id: 'bb9', name: 'Tsuneishi Shipyard / Buanoy Sector', category: 'Industrial Hub', coords: [10.4700, 123.7050], type: 'town', desc: 'Shipbuilding sector & Buanoy', town: 'Balamban' },

  // 2. Asturias Municipality
  { id: 'as1', name: 'Asturias Public Market & Poblacion', category: 'Public Market', coords: [10.5700, 123.7150], type: 'store', desc: 'Asturias Town Proper & Commercial Market', town: 'Asturias' },
  { id: 'as2', name: 'Asturias Municipal Hall & Plaza', category: 'Gov Center', coords: [10.5710, 123.7145], type: 'town', desc: 'Asturias Municipal Hall', town: 'Asturias' },
  { id: 'as3', name: '7-Eleven & Pharmacy Asturias', category: 'Convenience', coords: [10.5695, 123.7155], type: 'pharmacy', desc: 'Groceries, medicines & quick essentials', town: 'Asturias' },

  // 3. Toledo City
  { id: 'tc1', name: 'Gaisano Grand Mall Toledo', category: 'Shopping Mall', coords: [10.3780, 123.6390], type: 'store', desc: 'Supermarket, appliances & shopping', town: 'Toledo' },
  { id: 'tc2', name: 'Toledo City Port & Ferry Terminal', category: 'Port / Terminal', coords: [10.3750, 123.6360], type: 'town', desc: 'FastCraft & RORO Port terminal', town: 'Toledo' },
  { id: 'tc3', name: 'Toledo Public Market & Fast Food Hub', category: 'Food & Market', coords: [10.3770, 123.6380], type: 'food', desc: 'Toledo Town Center, Jollibee & Wet Market', town: 'Toledo' },
  { id: 'tc4', name: 'Lutopan / DAS Mining Hub', category: 'Commercial Hub', coords: [10.3200, 123.6800], type: 'town', desc: 'Don Andres Soriano Lutopan sector', town: 'Toledo' },

  // 4. Tuburan Municipality
  { id: 'tb1', name: 'Tuburan Public Market & Poblacion', category: 'Public Market', coords: [10.7280, 123.8250], type: 'store', desc: 'Tuburan Commercial Center & Palengke', town: 'Tuburan' },
  { id: 'tb2', name: 'Tuburan Municipal Hall & Plaza', category: 'Gov Center', coords: [10.7290, 123.8240], type: 'town', desc: 'Tuburan Poblacion & Town Hall', town: 'Tuburan' },
  { id: 'tb3', name: 'Molobolo Springs Sector', category: 'Hub & Stores', coords: [10.7400, 123.8300], type: 'town', desc: 'Molobolo area & community shops', town: 'Tuburan' },

  // 5. Pinamungajan Municipality
  { id: 'pm1', name: 'Pinamungajan Public Market', category: 'Public Market', coords: [10.2700, 123.5850], type: 'store', desc: 'Pinamungajan Town Palengke', town: 'Pinamungajan' },
  { id: 'pm2', name: 'Pinamungajan Municipal Hall & Plaza', category: 'Gov Center', coords: [10.2710, 123.5840], type: 'town', desc: 'Town proper and municipal offices', town: 'Pinamungajan' },

  // 6. Tabuelan Municipality
  { id: 'tl1', name: 'Tabuelan Port & Public Market', category: 'Port & Market', coords: [10.8250, 123.8750], type: 'town', desc: 'Tabuelan Port & Poblacion Market', town: 'Tabuelan' }
];

const TOWN_COORDS = {
  Balamban: [10.5015, 123.7150],
  Asturias: [10.5700, 123.7150],
  'Toledo City': [10.3770, 123.6380],
  Tuburan: [10.7280, 123.8250],
  Pinamungajan: [10.2700, 123.5850],
  Tabuelan: [10.8250, 123.8750]
};

// Helper to pan/recenter map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Zoom and Action Buttons Controller
function MapControls({ onRecenter, onZoomIn, onZoomOut }) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <button
        onClick={onZoomIn}
        className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors font-bold text-base"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors font-bold text-base"
        title="Zoom Out"
      >
        -
      </button>
      <button
        onClick={onRecenter}
        className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Re-center on Route"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function DeliveryMap({ 
  pickupCoords = [10.5015, 123.7150],
  dropoffCoords = [10.4720, 123.7060],
  riderCoords = [10.4850, 123.7110],
  showRider = true,
  height = "380px",
  zoom = 13,
  pickupLabel = "Pickup Location",
  dropoffLabel = "Drop-off Location"
}) {
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite'
  const [showPlaces, setShowPlaces] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const defaultCenter = riderCoords || pickupCoords || [10.5015, 123.7150];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (riderCoords && riderCoords[0]) {
      setMapCenter(riderCoords);
    }
  }, [riderCoords]);

  const polylinePositions = [pickupCoords, riderCoords, dropoffCoords].filter(p => p && p[0] && p[1]);

  const handleRecenter = () => {
    const center = riderCoords || pickupCoords || [10.5015, 123.7150];
    setMapCenter([...center]);
    setCurrentZoom(14);
  };

  const handleJumpToTown = (coords) => {
    setMapCenter([...coords]);
    setCurrentZoom(14);
  };

  const handleZoomIn = () => setCurrentZoom(prev => Math.min(18, prev + 1));
  const handleZoomOut = () => setCurrentZoom(prev => Math.max(10, prev - 1));

  return (
    <div style={{ height }} className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl relative z-0">
      
      <MapContainer 
        center={defaultCenter} 
        zoom={currentZoom} 
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      >
        <MapController center={mapCenter} zoom={currentZoom} />

        {/* Tile Layers: Standard Streets or Satellite */}
        {mapType === 'streets' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* 1. Pickup Pin */}
        {pickupCoords && pickupCoords[0] && (
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit">
                  Pickup Point
                </span>
                <strong className="text-slate-900 block font-bold text-xs">{pickupLabel}</strong>
                <p className="text-[11px] text-slate-500">Merchant / Store Dispatch Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Dropoff Pin */}
        {dropoffCoords && dropoffCoords[0] && (
          <Marker position={dropoffCoords} icon={dropoffIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit">
                  Drop-off Destination
                </span>
                <strong className="text-slate-900 block font-bold text-xs">{dropoffLabel}</strong>
                <p className="text-[11px] text-slate-500">Customer Delivery Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Live Courier Pin */}
        {showRider && riderCoords && riderCoords[0] && (
          <Marker position={riderCoords} icon={riderIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1">
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit animate-pulse">
                  Live Courier GPS
                </span>
                <strong className="text-rose-600 block font-extrabold text-xs">Delivery Express Courier</strong>
                <p className="text-[11px] text-slate-600">On the way across West Cebu</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 4. Interactive West Cebu Stores & Places (Google Maps Style) */}
        {showPlaces && WEST_CEBU_PLACES.map((place) => {
          const icon = place.type === 'food' ? foodIcon : place.type === 'pharmacy' ? pharmacyIcon : place.type === 'store' ? storeIcon : townIcon;
          return (
            <Marker key={place.id} position={place.coords} icon={icon}>
              <Popup>
                <div className="p-1.5 font-sans text-xs space-y-1 min-w-[160px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">
                      {place.category}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                      {place.town}
                    </span>
                  </div>
                  <strong className="text-slate-900 font-extrabold block text-xs">
                    {place.name}
                  </strong>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {place.desc}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline Line */}
        {polylinePositions.length >= 2 && (
          <Polyline 
            positions={polylinePositions} 
            pathOptions={{ 
              color: '#E11D48', 
              weight: 4, 
              dashArray: '6, 8', 
              opacity: 0.85 
            }} 
          />
        )}
      </MapContainer>

      {/* Floating Top Left Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 max-w-[calc(100%-100px)]">
        <div className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-800 text-[11px] text-zinc-300 font-bold flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>West Cebu Live GPS</span>
        </div>

        {/* Toggle Places Button */}
        <button
          onClick={() => setShowPlaces(prev => !prev)}
          className={`px-2.5 py-1.5 rounded-2xl text-[11px] font-bold border transition-all shadow-md flex items-center gap-1 ${
            showPlaces
              ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
              : 'bg-zinc-950/85 text-zinc-300 border-zinc-800'
          }`}
          title="Toggle Stores and Places on Map"
        >
          <Store className="w-3.5 h-3.5" />
          <span>{showPlaces ? '📍 Places: ON' : '📍 Places: OFF'}</span>
        </button>

        {/* Toggle Satellite / Street Layer */}
        <button
          onClick={() => setMapType(prev => prev === 'streets' ? 'satellite' : 'streets')}
          className="px-2.5 py-1.5 rounded-2xl text-[11px] font-bold bg-zinc-950/85 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 shadow-md flex items-center gap-1 transition-all"
          title="Switch Map Layers"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>{mapType === 'streets' ? '🛰️ Satellite' : '🗺️ Streets'}</span>
        </button>
      </div>

      {/* Municipality Jump Bar */}
      <div className="absolute top-14 left-3 z-[1000] flex items-center gap-1 overflow-x-auto max-w-[calc(100%-60px)] pb-1 no-scrollbar">
        {Object.entries(TOWN_COORDS).map(([townName, coords]) => (
          <button
            key={townName}
            onClick={() => handleJumpToTown(coords)}
            className="text-[10px] font-bold px-2 py-0.5 bg-zinc-950/80 hover:bg-rose-600 hover:text-white text-zinc-300 border border-zinc-700/80 rounded-lg whitespace-nowrap shadow-sm transition-all"
          >
            📍 {townName}
          </button>
        ))}
      </div>

      {/* Custom Zoom Controls */}
      <MapControls 
        onRecenter={handleRecenter} 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
      />

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-3 left-3 bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-3 z-[1000] shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Courier</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Drop-off</span>
        </div>
      </div>

    </div>
  );
}