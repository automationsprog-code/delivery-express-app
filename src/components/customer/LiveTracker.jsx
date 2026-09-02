import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BRAND, ORDER_STATUSES } from '../../lib/constants';
import DeliveryMap from '../map/DeliveryMap';
import { 
  Search, 
  Bike, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  MessageCircle, 
  Send, 
  Package, 
  ShieldCheck, 
  FileText,
  Camera,
  Share2,
  AlertCircle
} from 'lucide-react';

export default function LiveTracker() {
  const { orders, activeTrackingId, setActiveTrackingId } = useOrder();
  const [searchInput, setSearchInput] = useState('');

  // Find active tracked order
  const activeOrder = orders.find(o => o.trackingNumber === activeTrackingId || o.id === activeTrackingId) || orders[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = orders.find(o => 
      o.trackingNumber.toLowerCase() === searchInput.trim().toLowerCase() ||
      o.id.toLowerCase() === searchInput.trim().toLowerCase()
    );
    if (found) {
      setActiveTrackingId(found.trackingNumber);
    } else {
      alert(`No order found matching "${searchInput}".`);
    }
  };

  const getStatusBadge = (status) => {
    return ORDER_STATUSES[status] || { label: status, color: 'bg-zinc-800 text-zinc-300' };
  };

  const messengerUrl = `https://m.me/${BRAND.messengerUsername}?text=${encodeURIComponent(`Hi Delivery Express! Inquiring on my Balamban Order #${activeOrder?.trackingNumber || ''}`)}`;

  // Dynamic coordinates
  const pickupCoords = activeOrder?.pickupCoords || [10.5015, 123.7150];
  const dropoffCoords = activeOrder?.dropoffCoords || [10.4720, 123.7060];
  const riderCoords = activeOrder?.riderCoords || [10.4850, 123.7110];

  return (
    <div className="space-y-6">
      
      {/* Search Header Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Tracking Center (Balamban, Cebu)</h3>
            <p className="text-xs text-zinc-400">Real-time GPS tracking for active Delivery Express orders</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Tracking # (e.g. DE-2026-001)"
            className="bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 w-full sm:w-56"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {!activeOrder ? (
        <div className="p-12 text-center text-zinc-400 bg-zinc-900 rounded-3xl border border-zinc-800">
          <Package className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm font-semibold">No active orders yet.</p>
          <p className="text-xs text-zinc-500">Book a service to track your courier live in Balamban!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Map & Rider Status */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Map Preview with Dynamic Balamban Coordinates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block"></span>
                  Live Courier GPS & Route (Balamban)
                </span>
                <span className="text-zinc-500">{activeOrder.distanceKm} km trip</span>
              </div>
              
              <DeliveryMap 
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                riderCoords={activeOrder.riderName ? riderCoords : null}
                height="360px" 
              />
            </div>

            {/* Assigned Rider Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Rider Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 p-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {activeOrder.riderName || 'Assigning nearest Balamban rider...'}
                      </h4>
                      {activeOrder.riderName && (
                        <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                          ⭐ 4.9
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {activeOrder.riderName ? 'Balamban Delivery Express Rider • Honda Click' : 'Estimated dispatch time: < 3 mins'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions for Customer */}
                {activeOrder.riderPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeOrder.riderPhone}`}
                      className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      title="Call Rider"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                    <a
                      href={`sms:${activeOrder.riderPhone}`}
                      className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                      title="SMS Rider"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Direct Facebook Messenger Quick Button */}
              <a
                href={messengerUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat with Delivery Express Balamban on Messenger</span>
              </a>
            </div>

            {/* Proof of Delivery Card (If Delivered) */}
            {activeOrder.status === 'delivered' && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proof of Delivery (POD) Confirmed</span>
                </div>
                {activeOrder.proofOfDeliveryUrl ? (
                  <img
                    src={activeOrder.proofOfDeliveryUrl}
                    alt="Proof of Delivery"
                    className="w-full max-h-48 object-cover rounded-xl border border-emerald-500/20"
                  />
                ) : (
                  <div className="p-3 bg-zinc-900 rounded-xl text-xs text-zinc-400">
                    Handed over directly to customer in Balamban. Verified by Delivery Express courier.
                  </div>
                )}
                {activeOrder.deliveryNotes && (
                  <p className="text-xs text-zinc-300">
                    <strong>Rider Notes:</strong> {activeOrder.deliveryNotes}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Order Details & Timeline Stepper */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Summary Header */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    Tracking Number
                  </span>
                  <h3 className="text-lg font-black text-white font-mono">
                    {activeOrder.trackingNumber}
                  </h3>
                  <p className="text-xs font-semibold text-rose-400 mt-0.5">
                    {activeOrder.serviceName}
                  </p>
                </div>

                <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(activeOrder.status).color}`}>
                  {getStatusBadge(activeOrder.status).label}
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Delivery Progress Timeline
                </h4>

                <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {activeOrder.logs?.map((log, index) => (
                    <div key={index} className="relative flex items-start gap-3">
                      <div className={`absolute -left-5 mt-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                        log.done 
                          ? 'bg-rose-500 border-rose-400 shadow-sm shadow-rose-500' 
                          : 'bg-zinc-900 border-zinc-700'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${log.done ? 'text-white' : 'text-zinc-500'}`}>
                          {log.step}
                        </p>
                        <span className="text-[10px] text-zinc-500">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup & Drop-off Route Details */}
              <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
                <div className="flex items-start gap-2">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">1. Pickup / Store (Balamban)</span>
                    <p className="text-zinc-200 font-medium">{activeOrder.pickupAddress}</p>
                    {activeOrder.pickupLandmark && (
                      <span className="text-zinc-400 text-[11px]">Landmark: {activeOrder.pickupLandmark}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">2. Drop-off Destination (Balamban)</span>
                    <p className="text-zinc-200 font-medium">{activeOrder.dropoffAddress}</p>
                    {activeOrder.dropoffLandmark && (
                      <span className="text-zinc-400 text-[11px]">Landmark: {activeOrder.dropoffLandmark}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Errand Specific Details */}
              {activeOrder.details && Object.keys(activeOrder.details).length > 0 && (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Order / Item Specifications:
                  </span>
                  {Object.entries(activeOrder.details).map(([key, val]) => (
                    <div key={key} className="text-zinc-300">
                      <span className="text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                      <span className="font-medium whitespace-pre-line">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Payment Method</span>
                  <span className="font-bold text-zinc-200">{activeOrder.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 text-[10px] block">Total Amount Due</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    ₱{(activeOrder.estimatedFare + (activeOrder.itemCost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}