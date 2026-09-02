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
        background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)});
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

function adjustColor(color, amount) {
  return color;
}

const pickupIcon = createCustomIcon('#2563EB', '📦', 36); // Blue
const dropoffIcon = createCustomIcon('#10B981', '📍', 36); // Emerald Green
const riderIcon = createCustomIcon('#E11D48', '🏍️', 38); // Brand Red

// POI Icons
const foodIcon = createCustomIcon('#F59E0B', '🍔', 28);
const storeIcon = createCustomIcon('#8B5CF6', '🛒', 28);
const pharmacyIcon = createCustomIcon('#06B6D4', '💊', 28);
const townIcon = createCustomIcon('#6366F1', '🏛️', 28);

// Popular Partner Stores and West Cebu Places
const WEST_CEBU_PLACES = [
  { id: 'p1', name: 'Balamban Liempo & Lechon House', category: 'Restaurant', coords: [10.5020, 123.7145], type: 'food', desc: 'World-famous herb & garlic liempo roll' },
  { id: 'p2', name: 'Jollibee Gaisano Grand Balamban', category: 'Fast Food', coords: [10.4990, 123.7175], type: 'food', desc: 'Langhap-sarap chickenjoy & burgers' },
  { id: 'p3', name: 'Gaisano Grand Mall Balamban', category: 'Shopping Mall', coords: [10.4995, 123.7180], type: 'store', desc: 'Department store & supermarket' },
  { id: 'p4', name: 'Balamban Public Market (Palengke)', category: 'Public Market', coords: [10.5015, 123.7150], type: 'store', desc: 'Fresh seafood, pork, vegetables & goods' },
  { id: 'p5', name: 'Kusina ni Nanay & Native Grill', category: 'Grill & Diners', coords: [10.5035, 123.7138], type: 'food', desc: 'Authentic Cebuano dishes & BBQ' },
  { id: 'p6', name: 'Red Ribbon & Julie\'s Bakeshop', category: 'Bakery', coords: [10.5000, 123.7160], type: 'food', desc: 'Cakes, pastries & fresh bread' },
  { id: 'p7', name: 'Mercury Drug & 360 Pharmacy', category: 'Pharmacy', coords: [10.5010, 123.7155], type: 'pharmacy', desc: 'Prescription medicines & vitamins' },
  { id: 'p8', name: 'Balamban Municipal Hall & Plaza', category: 'Gov Center', coords: [10.5030, 123.7140], type: 'town', desc: 'Balamban Town Plaza' },
  { id: 'p9', name: 'Tsuneishi / Buanoy Shipyard', category: 'Industrial Hub', coords: [10.4700, 123.7050], type: 'town', desc: 'Shipbuilding sector & Buanoy' },
  { id: 'p10', name: 'Asturias Town Proper & Market', category: 'Town Proper', coords: [10.5700, 123.7150], type: 'town', desc: 'Asturias Municipality' },
  { id: 'p11', name: 'Toledo Port & Gaisano Toledo', category: 'City Center & Port', coords: [10.3770, 123.6380], type: 'town', desc: 'Toledo Port terminal & hub' },
  { id: 'p12', name: 'Tuburan Public Market', category: 'Town Proper', coords: [10.7280, 123.8250], type: 'town', desc: 'Tuburan Municipality' },
  { id: 'p13', name: 'Pinamungajan Town Proper', category: 'Town Proper', coords: [10.2700, 123.5850], type: 'town', desc: 'Pinamungajan Municipality' }
];

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
        className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
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
                <p className="text-[11px] text-slate-600">On the way to destination in Balamban</p>
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
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">
                    {place.category}
                  </span>
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
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5">
        <div className="bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-800 text-[11px] text-zinc-300 font-bold flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>West Cebu Live GPS Active</span>
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