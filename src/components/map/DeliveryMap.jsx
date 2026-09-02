import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Marker Icons using SVGs
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 15px;
        font-weight: bold;
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34]
  });
};

const pickupIcon = createCustomIcon('#2563EB', '📦'); // Blue
const dropoffIcon = createCustomIcon('#10B981', '📍'); // Emerald Green
const riderIcon = createCustomIcon('#E11D48', '🏍️'); // Brand Red

// Helper component to smoothly re-center map when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function DeliveryMap({ 
  pickupCoords = [10.5015, 123.7150], // Balamban Market
  dropoffCoords = [10.4720, 123.7060], // Buanoy
  riderCoords = [10.4850, 123.7110], // En route in Balamban
  showRider = true,
  height = "340px",
  zoom = 13
}) {
  const center = riderCoords || pickupCoords || [10.5015, 123.7150];
  const polylinePositions = [pickupCoords, riderCoords, dropoffCoords].filter(p => p && p[0] && p[1]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', background: '#18181b' }}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (Balamban, Cebu)'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Pin */}
        {pickupCoords && pickupCoords[0] && (
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <div className="text-zinc-900 font-sans text-xs">
                <strong className="text-blue-600 block">Pickup Point (Balamban)</strong>
                Merchant / Store Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoffCoords && dropoffCoords[0] && (
          <Marker position={dropoffCoords} icon={dropoffIcon}>
            <Popup>
              <div className="text-zinc-900 font-sans text-xs">
                <strong className="text-emerald-600 block">Drop-off Destination</strong>
                Customer Delivery Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Rider Pin */}
        {showRider && riderCoords && riderCoords[0] && (
          <Marker position={riderCoords} icon={riderIcon}>
            <Popup>
              <div className="text-zinc-900 font-sans text-xs">
                <strong className="text-rose-600 block">Delivery Express Courier</strong>
                Live Rider GPS Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {polylinePositions.length >= 2 && (
          <Polyline 
            positions={polylinePositions} 
            pathOptions={{ color: '#E11D48', weight: 4, dashArray: '6, 8', opacity: 0.85 }} 
          />
        )}
      </MapContainer>

      {/* Floating Map Location Badge & Legend */}
      <div className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 font-semibold z-[1000] flex items-center gap-1.5 shadow-md">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <span>📍 Balamban, Cebu GPS Active</span>
      </div>

      <div className="absolute bottom-3 left-3 bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-3 z-[1000] shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Pickup
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Courier
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Drop-off
        </div>
      </div>
    </div>
  );
}