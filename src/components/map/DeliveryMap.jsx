import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  RotateCcw,
  Navigation,
  Sparkles,
  Compass
} from 'lucide-react';

// Safe Coordinate Helper (Guarantees valid [lat, lng] numbers)
function safeCoord(coord, fallback = [10.5015, 123.7150]) {
  if (!coord) return fallback;
  if (Array.isArray(coord) && coord.length >= 2) {
    const lat = parseFloat(coord[0]);
    const lng = parseFloat(coord[1]);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      return [lat, lng];
    }
  }
  if (typeof coord === 'object') {
    const lat = parseFloat(coord.lat ?? coord.latitude ?? coord[0]);
    const lng = parseFloat(coord.lng ?? coord.longitude ?? coord.lon ?? coord[1]);
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      return [lat, lng];
    }
  }
  if (typeof coord === 'string') {
    try {
      const parsed = JSON.parse(coord);
      return safeCoord(parsed, fallback);
    } catch (_) {
      const parts = coord.split(',').map(s => parseFloat(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
      }
    }
  }
  return fallback;
}

// Custom Map Marker Icons using safe DivIcon
const createSafeIcon = (color, emoji, size = 36) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2.5px solid white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${Math.round(size * 0.45)}px;
        line-height: 1;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const TOWN_COORDS = {
  'Balamban': [10.5015, 123.7150],
  'Asturias': [10.5700, 123.7150],
  'Toledo City': [10.3770, 123.6380],
  'Tuburan': [10.7280, 123.8250],
  'Pinamungajan': [10.2700, 123.5850],
  'Tabuelan': [10.8250, 123.8750]
};

// Helper component to smoothly move map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length >= 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function DeliveryMap({ 
  pickupCoords = [10.5015, 123.7150],
  dropoffCoords = [10.4720, 123.7060],
  riderCoords = null,
  showRider = true,
  availableRiders = [],
  height = "380px",
  zoom = 14,
  pickupLabel = "Pickup Location",
  dropoffLabel = "Drop-off Location"
}) {
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite'
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [selectedTown, setSelectedTown] = useState('Balamban');

  // Safely normalize all coordinates
  const safePickup = useMemo(() => pickupCoords ? safeCoord(pickupCoords, [10.5015, 123.7150]) : null, [pickupCoords]);
  const safeDropoff = useMemo(() => dropoffCoords ? safeCoord(dropoffCoords, [10.4720, 123.7060]) : null, [dropoffCoords]);
  const safeRider = useMemo(() => riderCoords ? safeCoord(riderCoords, null) : null, [riderCoords]);

  // Filter available riders who are active, online, and have valid lat/lng
  const activeAvailableRiders = useMemo(() => {
    if (safeRider) return []; // If tracking an assigned order, hide generic riders
    return (availableRiders || []).filter(r => 
      r.isOnline !== false && 
      r.status !== 'offline' && 
      !isNaN(parseFloat(r.lat)) && 
      !isNaN(parseFloat(r.lng))
    );
  }, [availableRiders, safeRider]);

  const defaultCenter = safeRider || safePickup || (activeAvailableRiders[0] ? [parseFloat(activeAvailableRiders[0].lat), parseFloat(activeAvailableRiders[0].lng)] : [10.5015, 123.7150]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (safeRider) {
      setMapCenter(safeRider);
    }
  }, [safeRider]);

  // Safe icons
  const pickupIcon = useMemo(() => createSafeIcon('#2563EB', '📦', 36), []);
  const dropoffIcon = useMemo(() => createSafeIcon('#10B981', '📍', 36), []);
  const riderIcon = useMemo(() => createSafeIcon('#E11D48', '🏍️', 38), []);
  const availableRiderIcon = useMemo(() => createSafeIcon('#059669', '🏍️', 34), []);

  const polylinePositions = useMemo(() => {
    if (!safeRider) return [];
    return [safePickup, safeRider, safeDropoff].filter(Boolean);
  }, [safePickup, safeRider, safeDropoff]);

  const handleRecenter = () => {
    const center = safeRider || safePickup || (activeAvailableRiders[0] ? [parseFloat(activeAvailableRiders[0].lat), parseFloat(activeAvailableRiders[0].lng)] : [10.5015, 123.7150]);
    setMapCenter([...center]);
    setCurrentZoom(14);
  };

  const handleJumpToTown = (townName, coords) => {
    setSelectedTown(townName);
    setMapCenter([...coords]);
    setCurrentZoom(15);
  };

  const handleZoomIn = () => setCurrentZoom(prev => Math.min(18, prev + 1));
  const handleZoomOut = () => setCurrentZoom(prev => Math.max(10, prev - 1));

  return (
    <div className="w-full space-y-2.5">
      
      {/* Sleek Controls Bar (Placed OUTSIDE to keep map 100% clean & unobstructed) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs shadow-sm">
        
        {/* Municipality Quick Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar max-w-full">
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider pl-1 shrink-0">
            Towns:
          </span>
          {Object.entries(TOWN_COORDS).map(([townName, coords]) => (
            <button
              key={townName}
              onClick={() => handleJumpToTown(townName, coords)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all shrink-0 ${
                selectedTown === townName
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-rose-400'
              }`}
            >
              📍 {townName}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Satellite vs Streets */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            onClick={() => setMapType(prev => prev === 'streets' ? 'satellite' : 'streets')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
              mapType === 'satellite'
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{mapType === 'streets' ? 'Satellite View' : 'Street Map'}</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Map Container */}
      <div style={{ height }} className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-lg relative z-0">
        
        <MapContainer 
          center={defaultCenter} 
          zoom={currentZoom} 
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        >
          <MapController center={mapCenter} zoom={currentZoom} />

          {/* Accurate Standard OpenStreetMap with Real Streets & Buildings, or High-Res Satellite */}
          {mapType === 'streets' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* 1. Pickup Pin (Only if assigned order exists) */}
          {safePickup && safeRider && (
            <Marker position={safePickup} icon={pickupIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs space-y-1">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit">
                    Pickup Location
                  </span>
                  <strong className="text-slate-900 block font-bold text-xs">{pickupLabel}</strong>
                  <p className="text-[11px] text-slate-500">Merchant / Store Dispatch Point</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 2. Dropoff Pin (Only if assigned order exists) */}
          {safeDropoff && safeRider && (
            <Marker position={safeDropoff} icon={dropoffIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs space-y-1">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit">
                    Delivery Destination
                  </span>
                  <strong className="text-slate-900 block font-bold text-xs">{dropoffLabel}</strong>
                  <p className="text-[11px] text-slate-500">Customer Delivery Address</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 3. Assigned Live Courier Pin */}
          {showRider && safeRider && (
            <Marker position={safeRider} icon={riderIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs space-y-1">
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase block w-fit">
                    Live Assigned Courier GPS
                  </span>
                  <strong className="text-rose-600 block font-extrabold text-xs">Delivery Express Courier</strong>
                  <p className="text-[11px] text-slate-600">On the way across West Cebu</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* 4. Available Online Couriers (Visible for Customer Browsing when no order is assigned) */}
          {!safeRider && activeAvailableRiders.map((rider) => (
            <Marker 
              key={rider.id} 
              position={[parseFloat(rider.lat || 10.5015), parseFloat(rider.lng || 123.7150)]} 
              icon={availableRiderIcon}
            >
              <Popup>
                <div className="p-1.5 font-sans text-xs space-y-1 min-w-[160px]">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase inline-block">
                    🟢 Active On Duty
                  </span>
                  <strong className="text-slate-900 block font-extrabold text-sm">{rider.name}</strong>
                  <p className="text-[11px] text-slate-600">
                    Plate: <span className="font-mono font-bold text-slate-900">{rider.plate}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Zone: <strong className="text-rose-600">{rider.zone || 'Balamban Proper'}</strong>
                  </p>
                  <span className="text-[10px] font-bold text-amber-600 block">
                    ⭐ {rider.rating || 5.0} Rating
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}

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

        {/* Clean Zoom & Re-Center Floating Buttons (Top-Right) */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold text-base shadow-sm"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold text-base shadow-sm"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            title="Re-center Map"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Bottom Legend */}
        <div className="absolute bottom-3 left-3 bg-zinc-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-3 z-[1000] shadow-md">
          {safeRider ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Pickup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Assigned Courier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Drop-off</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Available Couriers in Balamban ({activeAvailableRiders.length})</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}