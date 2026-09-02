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
    return ORDER_STATUSES[status] || { label: status, color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300' };
  };

  const messengerUrl = `https://m.me/${BRAND.messengerUsername}?text=${encodeURIComponent(`Hi Delivery Express! Inquiring on my Balamban Order #${activeOrder?.trackingNumber || ''}`)}`;

  const pickupCoords = activeOrder?.pickupCoords || [10.5015, 123.7150];
  const dropoffCoords = activeOrder?.dropoffCoords || [10.4720, 123.7060];
  const riderCoords = activeOrder?.riderCoords || [10.4850, 123.7110];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Search Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Live Tracking Center</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Real-time GPS tracking for active Balamban couriers</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter Tracking # (e.g. DE-2026-001)"
            className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 w-full sm:w-60 shadow-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            Track
          </button>
        </form>
      </div>

      {!activeOrder ? (
        <div className="p-12 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-zinc-600" />
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No active orders yet.</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">Book a service to track your courier live in Balamban!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Column: Interactive Map & Rider Status */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Live Map Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block"></span>
                  Live Courier GPS & Route (Balamban)
                </span>
                <span className="text-slate-500 dark:text-zinc-400 font-semibold">{activeOrder.distanceKm} km trip</span>
              </div>
              
              <DeliveryMap 
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                riderCoords={activeOrder.riderName ? riderCoords : null}
                height="380px" 
              />
            </div>

            {/* Assigned Rider Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 card-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Rider Avatar"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {activeOrder.riderName || 'Assigning nearest Balamban rider...'}
                      </h4>
                      {activeOrder.riderName && (
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20">
                          ⭐ 4.9
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                      {activeOrder.riderName ? 'Balamban Delivery Express Rider • Motorcycle' : 'Estimated dispatch time: < 3 mins'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                {activeOrder.riderPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeOrder.riderPhone}`}
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-all shadow-sm"
                      title="Call Rider"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                    <a
                      href={`sms:${activeOrder.riderPhone}`}
                      className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 transition-all shadow-sm"
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
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat with Delivery Express Balamban on Messenger</span>
              </a>
            </div>

            {/* Proof of Delivery Card (If Delivered) */}
            {activeOrder.status === 'delivered' && (
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proof of Delivery (POD) Confirmed</span>
                </div>
                {activeOrder.proofOfDeliveryUrl ? (
                  <img
                    src={activeOrder.proofOfDeliveryUrl}
                    alt="Proof of Delivery"
                    className="w-full max-h-56 object-cover rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-md"
                  />
                ) : (
                  <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl text-xs text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                    Handed over directly to customer in Balamban. Verified by Delivery Express courier.
                  </div>
                )}
                {activeOrder.deliveryNotes && (
                  <p className="text-xs text-slate-700 dark:text-zinc-300">
                    <strong>Rider Notes:</strong> {activeOrder.deliveryNotes}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Order Details & Timeline Stepper */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 card-float">
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                    Tracking Number
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {activeOrder.trackingNumber}
                  </h3>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {activeOrder.serviceName}
                  </p>
                </div>

                <div className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getStatusBadge(activeOrder.status).color}`}>
                  {getStatusBadge(activeOrder.status).label}
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                  Delivery Progress Timeline
                </h4>

                <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
                  {activeOrder.logs?.map((log, index) => (
                    <div key={index} className="relative flex items-start gap-3">
                      <div className={`absolute -left-5 mt-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                        log.done 
                          ? 'bg-rose-600 border-rose-400 shadow-md shadow-rose-600/30' 
                          : 'bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${log.done ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
                          {log.step}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">1. Pickup / Store (Balamban)</span>
                    <p className="text-slate-800 dark:text-zinc-200 font-semibold">{activeOrder.pickupAddress}</p>
                    {activeOrder.pickupLandmark && (
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Landmark: {activeOrder.pickupLandmark}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">2. Drop-off Destination (Balamban)</span>
                    <p className="text-slate-800 dark:text-zinc-200 font-semibold">{activeOrder.dropoffAddress}</p>
                    {activeOrder.dropoffLandmark && (
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Landmark: {activeOrder.dropoffLandmark}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Errand Specific Details */}
              {activeOrder.details && Object.keys(activeOrder.details).length > 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Order / Item Specifications:
                  </span>
                  {Object.entries(activeOrder.details).map(([key, val]) => (
                    <div key={key} className="text-slate-700 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                      <span className="font-bold whitespace-pre-line">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] block font-bold">Payment Method</span>
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200">{activeOrder.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] block font-bold">Total Amount Due</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
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