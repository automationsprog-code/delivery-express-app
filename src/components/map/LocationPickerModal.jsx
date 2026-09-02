import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Check, MapPin, LocateFixed, Search, Navigation } from 'lucide-react';
import { BALAMBAN_LANDMARKS } from '../../lib/constants';

// Custom Pin Icon
const pinIcon = new L.DivIcon({
  className: 'custom-pin-marker',
  html: `<div style="background-color: #E11D48; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(225,29,72,0.4);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

function MapEventsHandler({ onLocationSelect, currentPos }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
      map.panTo([lat, lng]);
    }
  });

  useEffect(() => {
    if (currentPos) {
      map.setView(currentPos, map.getZoom());
    }
  }, [currentPos, map]);

  return null;
}

export default function LocationPickerModal({
  title = "Pin Location on Map",
  initialCoords = [10.5015, 123.7150],
  initialAddress = "",
  onSelectLocation,
  onClose
}) {
  const [coords, setCoords] = useState(initialCoords);
  const [addressName, setAddressName] = useState(initialAddress || "Balamban, Cebu");
  const [isLocating, setIsLocating] = useState(false);

  const handleSelectCoords = (newCoords) => {
    setCoords(newCoords);
    setAddressName(`Pinned Location (${newCoords[0].toFixed(4)}, ${newCoords[1].toFixed(4)}) Balamban`);
  };

  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        setAddressName(`My Exact GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setIsLocating(false);
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        alert('Could not retrieve GPS location.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLandmarkClick = (landmark) => {
    setCoords([landmark.lat, landmark.lng]);
    setAddressName(landmark.name);
  };

  const handleConfirm = () => {
    onSelectLocation({
      coords,
      address: addressName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[620px]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">{title}</h3>
              <p className="text-[11px] text-rose-100">Tap anywhere on map or drag to set pin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Landmark Chips */}
        <div className="p-2 bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={handleUseCurrentGps}
            disabled={isLocating}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 shadow-sm"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>Use My GPS</span>
          </button>

          {BALAMBAN_LANDMARKS.slice(0, 6).map((lm, i) => (
            <button
              key={i}
              onClick={() => handleLandmarkClick(lm)}
              className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-200 dark:border-zinc-700 whitespace-nowrap shrink-0 text-[11px] font-medium shadow-sm"
            >
              📍 {lm.name.split(' ')[0]} {lm.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={coords}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords} icon={pinIcon} />
            <MapEventsHandler onLocationSelect={handleSelectCoords} currentPos={coords} />
          </MapContainer>

          {/* Floating Instructions Bubble */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[1000] bg-zinc-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/20 pointer-events-none">
            📍 Tap anywhere on map to move pin
          </div>
        </div>

        {/* Selected Address Name & Confirm Button */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 space-y-3 shrink-0">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1">
              Pinned Address Label:
            </label>
            <input
              type="text"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              placeholder="e.g. Near Gaisano Balamban / My Home"
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location Pin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
