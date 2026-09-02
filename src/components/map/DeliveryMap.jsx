import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Marker Icons using SVGs
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const pickupIcon = createCustomIcon('#2563EB', '📦'); // Blue
const dropoffIcon = createCustomIcon('#10B981', '📍'); // Emerald Green
const riderIcon = createCustomIcon('#E11D48', '🏍️'); // Brand Red

export default function DeliveryMap({ 
  pickupCoords = [14.5995, 120.9842], 
  dropoffCoords = [14.6150, 121.0100], 
  riderCoords = [14.6050, 120.9950],
  showRider = true,
  height = "320px"
}) {
  const center = riderCoords || pickupCoords;
  const polylinePositions = [pickupCoords, riderCoords, dropoffCoords].filter(Boolean);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', background: '#18181b' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Pin */}
        <Marker position={pickupCoords} icon={pickupIcon}>
          <Popup>
            <div className="text-zinc-900 font-sans text-xs">
              <strong className="text-blue-600 block">Pickup Point</strong>
              Merchant / Sender Location
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Pin */}
        <Marker position={dropoffCoords} icon={dropoffIcon}>
          <Popup>
            <div className="text-zinc-900 font-sans text-xs">
              <strong className="text-emerald-600 block">Delivery Destination</strong>
              Customer Drop-off Location
            </div>
          </Popup>
        </Marker>

        {/* Active Rider Pin */}
        {showRider && riderCoords && (
          <Marker position={riderCoords} icon={riderIcon}>
            <Popup>
              <div className="text-zinc-900 font-sans text-xs">
                <strong className="text-rose-600 block">Delivery Express Courier</strong>
                Live Rider Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: '#E11D48', weight: 4, dashArray: '6, 8', opacity: 0.8 }} 
        />
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-3 z-[1000]">
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
