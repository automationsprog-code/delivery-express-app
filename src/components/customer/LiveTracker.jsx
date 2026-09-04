import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BRAND, ORDER_STATUSES } from '../../lib/constants';
import DeliveryMap from '../map/DeliveryMap';
import OrderChatModal from '../common/OrderChatModal';
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
  AlertCircle,
  MessagesSquare,
  XCircle,
  X,
  Layers,
  Star,
  Sparkles,
  ThumbsUp
} from 'lucide-react';

export default function LiveTracker() {
  const { orders, riders, activeTrackingId, setActiveTrackingId, cancelOrder, rateRider, currentUser, activeRole } = useOrder();
  const [searchInput, setSearchInput] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of mind / plans');

  // Customer Star Rating State
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  // STRICT CUSTOMER ORDER ISOLATION (Only show the logged-in customer's own orders)
  const myOrders = orders.filter(o => {
    // Admin and Riders can inspect all orders
    if (currentUser?.role === 'admin' || currentUser?.role === 'rider') return true;

    // If no logged in user, only show what was booked in guest mode or actively searched
    if (!currentUser) {
      let localMyOrders = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('delivery_express_my_orders') || '[]');
        localMyOrders = Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        localMyOrders = [];
      }
      const localMatch = Array.isArray(localMyOrders) && (localMyOrders.includes(o.trackingNumber) || localMyOrders.includes(o.id));
      return localMatch || (activeTrackingId && (o.trackingNumber === activeTrackingId || o.id === activeTrackingId));
    }

    // Logged in Customer: Strictly match their own credentials with conflict protection
    const custEmail = currentUser.email ? String(currentUser.email).trim().toLowerCase() : '';
    const orderEmail = (o.details?.customer_email || o.customerEmail || '')?.trim().toLowerCase();
    if (custEmail && orderEmail && custEmail !== orderEmail) return false;

    const custName = currentUser.name ? String(currentUser.name).trim().toLowerCase() : '';
    const orderName = o.customerName ? String(o.customerName).trim().toLowerCase() : '';
    if (custName && orderName && custName !== orderName && !custName.includes(orderName) && !orderName.includes(custName)) return false;

    const custId = currentUser.id ? String(currentUser.id) : '';
    const orderCustId = (o.details?.customer_id || o.customerId || '')?.trim();
    const idMatch = Boolean(custId && orderCustId && custId === orderCustId);

    const emailMatch = Boolean(custEmail && orderEmail && custEmail === orderEmail);

    const custPhone = currentUser.phone ? String(currentUser.phone).replace(/\D/g, '') : '';
    const orderPhone = o.customerPhone ? String(o.customerPhone).replace(/\D/g, '') : '';
    const phoneMatch = custPhone.length >= 7 && orderPhone.length >= 7 && custPhone.slice(-10) === orderPhone.slice(-10);

    const nameMatch = Boolean(custName && orderName && custName.length >= 3 && custName === orderName);

    return idMatch || emailMatch || (phoneMatch && (!orderEmail || orderEmail === custEmail)) || nameMatch;
  });

  // Active in-progress orders (pending, assigned, picked_up, out_for_delivery)
  const activeMyOrders = myOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  // Selected Active Order:
  // 1. Explicitly selected active order
  // 2. Or first active in-progress order
  // 3. Or explicitly searched tracking number (even if completed)
  const activeOrder = (activeTrackingId ? myOrders.find(o => o.trackingNumber === activeTrackingId || o.id === activeTrackingId) : null)
    || activeMyOrders[0]
    || (searchInput ? myOrders.find(o => o.trackingNumber?.toLowerCase() === searchInput.trim().toLowerCase() || o.id?.toLowerCase() === searchInput.trim().toLowerCase()) : null)
    || null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = orders.find(o => 
      o.trackingNumber?.toLowerCase() === searchInput.trim().toLowerCase() ||
      o.id?.toLowerCase() === searchInput.trim().toLowerCase()
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

  const assignedRider = (activeOrder?.riderId || activeOrder?.riderName || activeOrder?.riderPhone)
    ? (riders.find(r => 
        (activeOrder.riderId && r.id === activeOrder.riderId) || 
        (activeOrder.riderPhone && r.phone && r.phone === activeOrder.riderPhone) ||
        (activeOrder.riderName && (r.name === activeOrder.riderName || r.name.toLowerCase().includes(activeOrder.riderName.toLowerCase()) || activeOrder.riderName.toLowerCase().includes(r.name.toLowerCase())))
      ) || (activeOrder.riderName ? { name: activeOrder.riderName, phone: activeOrder.riderPhone } : null))
    : null;

  const dynamicRiderName = assignedRider?.name || activeOrder?.riderName;
  const riderAvatar = assignedRider?.avatar || localStorage.getItem(`rider_avatar_${activeOrder?.riderId}`) || (dynamicRiderName?.toLowerCase().includes('nigel') ? '/rider-nigel.jpg' : null);

  const pickupCoords = activeOrder?.pickupCoords || [10.5015, 123.7150];
  const dropoffCoords = activeOrder?.dropoffCoords || [10.4720, 123.7060];
  const riderCoords = (assignedRider?.lat && assignedRider?.lng)
    ? [parseFloat(assignedRider.lat), parseFloat(assignedRider.lng)]
    : (activeOrder?.riderCoords || [10.4850, 123.7110]);

  const canCancel = activeOrder && (activeOrder.status === 'pending' || activeOrder.status === 'assigned');

  const handleConfirmCancel = () => {
    if (!activeOrder) return;
    cancelOrder(activeOrder.trackingNumber || activeOrder.id, cancelReason);
    setShowCancelModal(false);
  };

  const reviewChipsList = [
    'Very Fast 🚀',
    'Polite & Friendly 🤝',
    'Handled with Care 📦',
    '100% Correct Order 🛍️',
    'Affordable Fare 💰',
    'Responsive in Chat 💬'
  ];

  const toggleChip = (chip) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(prev => prev.filter(c => c !== chip));
    } else {
      setSelectedChips(prev => [...prev, chip]);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!activeOrder) return;

    const fullComment = [
      selectedChips.join(', '),
      ratingFeedback.trim()
    ].filter(Boolean).join(' - ') || 'Great delivery service in Balamban!';

    rateRider(activeOrder.id, activeOrder.riderId || assignedRider?.id, ratingStars, fullComment);
    setHasSubmittedRating(true);
  };

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

      {/* MULTIPLE ACTIVE IN-PROGRESS BOOKINGS SELECTOR TABS */}
      {activeMyOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-bold px-1 shrink-0">
            <Layers className="w-4 h-4 text-rose-500" />
            <span>Your Active Bookings ({activeMyOrders.length}):</span>
          </div>
          {activeMyOrders.map((o) => {
            const isSelected = (activeOrder?.trackingNumber === o.trackingNumber) || (activeOrder?.id === o.id);
            return (
              <button
                key={o.id || o.trackingNumber}
                onClick={() => {
                  setActiveTrackingId(o.trackingNumber);
                  setHasSubmittedRating(false);
                }}
                className={`px-3.5 py-2 rounded-2xl font-bold flex items-center gap-2 shrink-0 transition-all shadow-sm ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-rose-600/30'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-rose-300'
                }`}
              >
                <span className="font-mono text-[11px]">{o.trackingNumber}</span>
                <span className="text-[10px] opacity-90">• {o.serviceName}</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </button>
            );
          })}
        </div>
      )}

      {!activeOrder ? (
        <div className="space-y-4">
          <div className="p-6 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Bike className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800 dark:text-zinc-200">No active delivery in progress.</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                Viewing active & on-duty couriers available in West Cebu below. Book a service to dispatch a rider!
              </p>
            </div>
          </div>

          {/* Interactive Available Fleet Map */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Available On-Duty Couriers (West Cebu)</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {riders.filter(r => r.isOnline !== false && r.status !== 'offline').length} Couriers Online
              </span>
            </div>

            <div className="h-72 sm:h-96 w-full">
              <DeliveryMap
                availableRiders={riders}
                showRider={false}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Column: Interactive GPS Route Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Live Courier GPS & Route (Balamban)</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">{activeOrder.distanceKm} km trip</span>
              </div>

              <div className="h-72 sm:h-96 w-full">
                <DeliveryMap
                  pickupCoords={pickupCoords}
                  dropoffCoords={dropoffCoords}
                  riderCoords={riderCoords}
                  isRiderAssigned={activeOrder.status !== 'pending'}
                  pickupLabel={`Pickup: ${activeOrder.pickupAddress}`}
                  dropoffLabel={`Dropoff: ${activeOrder.dropoffAddress}`}
                />
              </div>
            </div>

            {/* Assigned Rider Card with Real Photo */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 card-float">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dynamicRiderName ? (
                    <div className="relative">
                      <img
                        src={riderAvatar}
                        alt={dynamicRiderName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white dark:bg-zinc-800"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                      <Bike className="w-7 h-7 text-white" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {dynamicRiderName ? dynamicRiderName : 'Assigning nearest Balamban rider...'}
                      </h4>
                      {dynamicRiderName && (
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20">
                          ⭐ {assignedRider?.rating || 5.0}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                      {dynamicRiderName ? 'Balamban Delivery Express Courier • On Duty' : 'Estimated dispatch time: < 3 mins'}
                    </p>
                  </div>
                </div>

                {/* Quick Phone / SMS Actions */}
                {activeOrder.riderPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeOrder.riderPhone}`}
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-all shadow-sm"
                      title="Call Rider"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* In-App Realtime Chat Button */}
              <button
                type="button"
                onClick={() => setShowChatModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#00B14F] hover:bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <MessagesSquare className="w-4 h-4 text-white" />
                <span>Open Zero-Delay Chat with Courier</span>
                {activeOrder.messages && activeOrder.messages.length > 0 && (
                  <span className="bg-white text-[#00B14F] font-extrabold text-[10px] px-2 py-0.5 rounded-full ml-1">
                    {activeOrder.messages.length}
                  </span>
                )}
              </button>
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

            {/* CUSTOMER 5-STAR RATING & REVIEW CARD (SHOWN UPON DELIVERY) */}
            {activeOrder.status === 'delivered' && (
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-amber-400 dark:border-amber-500/40 shadow-lg space-y-4 card-float">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        Rate Your Courier: {dynamicRiderName || 'Courier'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        How was your delivery experience in Balamban?
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    ⭐ Feedback
                  </span>
                </div>

                {hasSubmittedRating || activeOrder.customerRating ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-1">
                    <div className="flex justify-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-5 h-5 ${s <= (activeOrder.customerRating || ratingStars) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      Thank you for your rating! ⭐
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Your feedback helps keep Delivery Express couriers top-rated in West Cebu.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3.5">
                    {/* Interactive Star Picker */}
                    <div className="flex items-center justify-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverStars || ratingStars);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverStars(star)}
                            onMouseLeave={() => setHoverStars(0)}
                            onClick={() => setRatingStars(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star 
                              className={`w-8 h-8 transition-colors ${
                                isFilled 
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-md' 
                                  : 'text-slate-300 dark:text-zinc-700'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {ratingStars === 5 ? '⭐⭐⭐⭐⭐ Excellent Service!' : ratingStars === 4 ? '⭐⭐⭐⭐ Very Good!' : ratingStars === 3 ? '⭐⭐⭐ Good / Average' : '⭐⭐ Needs Improvement'}
                      </span>
                    </div>

                    {/* Quick Feedback Chips */}
                    <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                      {reviewChipsList.map((chip) => {
                        const isSelected = selectedChips.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleChip(chip)}
                            className={`text-[11px] px-3 py-1 rounded-xl font-bold transition-all border ${
                              isSelected
                                ? 'bg-amber-500 text-zinc-950 border-amber-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-amber-400'
                            }`}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>

                    {/* Optional Comment */}
                    <div>
                      <input
                        type="text"
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                        placeholder="Say something to Kuya rider... (Optional)"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Submit ⭐ Rating</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Cancelled Banner */}
            {activeOrder.status === 'cancelled' && (
              <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <strong className="block text-sm">This booking has been cancelled</strong>
                  <span>You can place a new order anytime from the services menu.</span>
                </div>
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

              {/* Errand & Food Order Specific Details */}
              {activeOrder.details && Object.keys(activeOrder.details).length > 0 && (
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Order / Item Specifications:
                  </span>
                  {Object.entries(activeOrder.details)
                    .filter(([k, v]) => {
                      if (!v) return false;
                      const ignored = [
                        'chat_messages', 'rider_name', 'rider_phone', 'rider_plate', 'rider_id',
                        'cancel_reason', 'customer_avatar', 'customer_email', 'customer_id',
                        'updated_at', 'timestamp', 'created_at', 'rating_feedback', 'rating_stars'
                      ];
                      if (ignored.includes(k)) return false;
                      if (typeof v === 'string' && v.startsWith('data:image')) return false;
                      return true;
                    })
                    .map(([key, val]) => {
                      const displayKey = key
                        .replace(/_/g, ' ')
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                      
                      const displayVal = (key === 'estimatedCost' || key === 'item_cost' || key === 'itemCost')
                        ? `₱${Number(val).toLocaleString()}`
                        : String(val);

                      return (
                        <div key={key} className="text-slate-700 dark:text-zinc-300 flex items-start gap-1">
                          <span className="text-slate-400 dark:text-zinc-500 font-semibold shrink-0">{displayKey}:</span>
                          <span className="font-bold text-slate-900 dark:text-white whitespace-pre-line">{displayVal}</span>
                        </div>
                      );
                    })}
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

              {/* Cancel Order Action Button */}
              {canCancel && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel This Booking</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* In-App Real-Time Chat Modal */}
      {showChatModal && activeOrder && (
        <OrderChatModal
          order={activeOrder}
          senderRole="customer"
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* Customer Cancellation Confirmation Modal */}
      {showCancelModal && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Cancel Booking?</span>
              </h4>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Are you sure you want to cancel order <strong>#{activeOrder.trackingNumber}</strong>?
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="Change of mind / plans">Change of mind / plans</option>
                <option value="Ordered by mistake">Ordered by mistake / wrong address</option>
                <option value="Will re-order later">Will re-order later</option>
                <option value="Courier took too long">Courier assignment took too long</option>
                <option value="Other reason">Other personal reason</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black shadow-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}