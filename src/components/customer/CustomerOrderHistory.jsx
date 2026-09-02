import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { SERVICES, ORDER_STATUSES, BRAND } from '../../lib/constants';
import { 
  History, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bike, 
  PhoneCall, 
  Star, 
  ArrowUpRight, 
  FileText, 
  Receipt, 
  Camera, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Download,
  Share2,
  Printer,
  Copy,
  X
} from 'lucide-react';

export default function CustomerOrderHistory({ onSelectService, onTrackOrder }) {
  const { orders, riders, currentUser, rateRider, showNotification } = useOrder();
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'delivered' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [selectedPodImage, setSelectedPodImage] = useState(null);

  // Rating modal state
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // STRICT CUSTOMER ORDER ISOLATION
  const myOrders = orders.filter(o => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'rider') return true;

    let localMyOrders = [];
    try {
      localMyOrders = JSON.parse(localStorage.getItem('delivery_express_my_orders') || '[]');
    } catch (_) {}
    const localMatch = localMyOrders.includes(o.trackingNumber) || localMyOrders.includes(o.id);

    if (!currentUser) return localMatch;

    const custPhone = currentUser?.phone ? String(currentUser.phone).replace(/\D/g, '') : '';
    const orderPhone = o.customerPhone ? String(o.customerPhone).replace(/\D/g, '') : '';
    const phoneMatch = custPhone && orderPhone && custPhone.slice(-10) === orderPhone.slice(-10);

    const custName = currentUser?.name?.trim().toLowerCase();
    const orderName = o.customerName?.trim().toLowerCase();
    const nameMatch = custName && orderName && (custName === orderName || custName.includes(orderName) || orderName.includes(custName));

    const custEmail = currentUser?.email?.trim().toLowerCase();
    const orderEmail = (o.details?.customer_email || o.customerEmail || '')?.trim().toLowerCase();
    const emailMatch = custEmail && orderEmail && custEmail === orderEmail;

    return phoneMatch || nameMatch || emailMatch || localMatch;
  });

  // Filtered orders
  const filteredHistory = myOrders.filter(o => {
    if (filterStatus === 'delivered' && o.status !== 'delivered') return false;
    if (filterStatus === 'cancelled' && o.status !== 'cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrack = o.trackingNumber?.toLowerCase().includes(q);
      const matchService = o.serviceName?.toLowerCase().includes(q);
      const matchAddr = o.pickupAddress?.toLowerCase().includes(q) || o.dropoffAddress?.toLowerCase().includes(q);
      const matchRider = o.riderName?.toLowerCase().includes(q);
      return matchTrack || matchService || matchAddr || matchRider;
    }
    return true;
  });

  const completedCount = myOrders.filter(o => o.status === 'delivered').length;
  const totalSpent = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.estimatedFare || 0) + (curr.itemCost || 0), 0);

  const handleOpenRating = (order) => {
    setRatingOrder(order);
    setRatingStars(order.customerRating || 5);
    setRatingComment(order.customerReview || '');
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    if (!ratingOrder) return;
    rateRider(ratingOrder.id, ratingOrder.riderId, ratingStars, ratingComment);
    setRatingOrder(null);
  };

  const handleDownloadReceipt = (order) => {
    if (!order) return;
    const total = (order.estimatedFare || 0) + (order.itemCost || 0);
    const content = `========================================
       DELIVERY EXPRESS BALAMBAN
       Official Digital E-Receipt
========================================
Tracking Number: ${order.trackingNumber || order.id}
Date & Time    : ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
Customer Name  : ${order.customerName || 'Customer'}
Customer Phone : ${order.customerPhone || 'N/A'}
Service        : ${order.serviceName || 'Delivery'}
Courier / Rider: ${order.riderName || 'Nigel'}

Pickup Address : ${order.pickupAddress || 'Balamban'}
Dropoff Address: ${order.dropoffAddress || 'Balamban'}

----------------------------------------
Delivery Fare  : ₱${order.estimatedFare || 0}
Items/Goods Cost: ₱${order.itemCost || 0}
----------------------------------------
TOTAL PAID     : ₱${total.toLocaleString()}
Payment Method : ${order.paymentMethod || 'Cash on Delivery'}
Status         : ${order.status?.toUpperCase() || 'DELIVERED'}
========================================
Thank you for trusting Delivery Express!
"Anything, Anywhere in West Cebu!"
========================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Delivery-Express-Receipt-${order.trackingNumber || 'DE'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showNotification) showNotification('Receipt file downloaded!', 'success');
  };

  const handleShareReceipt = async (order) => {
    if (!order) return;
    const total = (order.estimatedFare || 0) + (order.itemCost || 0);
    const shareText = `📄 Delivery Express Official Receipt #${order.trackingNumber}\nCustomer: ${order.customerName}\nService: ${order.serviceName}\nCourier: ${order.riderName || 'Nigel'}\nTotal Paid: ₱${total.toLocaleString()} (${order.paymentMethod || 'COD'})\nTrack & Verify: https://delivery-express-app-one.vercel.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Delivery Express Receipt #${order.trackingNumber}`,
          text: shareText
        });
        return;
      } catch (_) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      if (showNotification) showNotification('Receipt copied to clipboard! Ready to paste & send in Messenger/SMS.', 'success');
    } catch (_) {
      if (showNotification) showNotification('Could not copy to clipboard', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Header Banner with Statistics */}
      <div className="bg-gradient-to-br from-zinc-900 via-rose-950 to-zinc-900 border border-rose-500/20 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <History className="w-3.5 h-3.5" />
              <span>Customer Booking History</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Your Past Deliveries & Receipts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Complete chronological record of all your Balamban & West Cebu deliveries, proof of delivery photos, and digital receipts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">Delivered</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-heading">
                {completedCount}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">Total Spent</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-heading">
                ₱{totalSpent.toLocaleString()}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">All Bookings</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-heading">
                {myOrders.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 ${
              filterStatus === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            All Bookings ({myOrders.length})
          </button>

          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'delivered'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered Items ({completedCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 ${
              filterStatus === 'cancelled'
                ? 'bg-rose-900 text-white shadow-md'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            Cancelled ({myOrders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking #, items, courier..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700/80 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Orders History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No History Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              {myOrders.length === 0 
                ? "You haven't completed any bookings yet. Book a service to get started!"
                : "No orders match the selected filter."}
            </p>
          </div>
          {onSelectService && (
            <button
              onClick={() => onSelectService(SERVICES[0])}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Book Food or Errand Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((order) => {
            const assignedRider = riders.find(r => r.id === order.riderId || r.name === order.riderName) || riders[0];
            const riderPhoto = assignedRider?.avatar || '/rider-nigel.jpg';
            const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };

            return (
              <div 
                key={order.id || order.trackingNumber}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-rose-300 dark:hover:border-rose-500/40 transition-all space-y-5"
              >
                {/* Top Row: Service, Tracking #, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          {order.serviceName}
                        </h3>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          #{order.trackingNumber}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition-colors"
                      title="View Digital Official Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-rose-500" />
                      <span>E-Receipt</span>
                    </button>

                    {onTrackOrder && (
                      <button
                        onClick={() => onTrackOrder(order.trackingNumber)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/30 transition-colors"
                      >
                        <span>Track Live</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle Grid: Route & Courier Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Route Card */}
                  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Pickup Location</span>
                        <p className="font-extrabold text-slate-800 dark:text-zinc-200">{order.pickupAddress}</p>
                        {order.pickupLandmark && <p className="text-[11px] text-slate-500 dark:text-zinc-400">Landmark: {order.pickupLandmark}</p>}
                      </div>
                    </div>

                    <div className="border-l-2 border-dashed border-slate-200 dark:border-zinc-800 ml-1 pl-4 my-1 text-[11px] text-slate-400">
                      {order.distanceKm} km trip distance
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Dropoff / Destination</span>
                        <p className="font-extrabold text-slate-800 dark:text-zinc-200">{order.dropoffAddress}</p>
                        {order.dropoffLandmark && <p className="text-[11px] text-slate-500 dark:text-zinc-400">Landmark: {order.dropoffLandmark}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Courier & Payment Info */}
                  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 flex flex-col justify-between gap-3">
                    
                    {/* Courier Snippet */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={riderPhoto}
                            alt={order.riderName || 'Courier'}
                            className="w-11 h-11 rounded-2xl object-cover border border-amber-400 shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Assigned Courier</span>
                          <h4 className="font-black text-slate-900 dark:text-white">
                            {order.riderName || 'Nigel'}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {assignedRider?.plate || 'MIO GEAR - G629MC'}
                          </p>
                        </div>
                      </div>

                      {order.riderPhone && (
                        <a
                          href={`tel:${order.riderPhone}`}
                          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                          title="Call Courier"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Fare & Items Cost Breakdown */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Payment Method</span>
                        <span className="font-extrabold text-slate-700 dark:text-zinc-300">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block">Total Amount</span>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 font-heading">
                          ₱{((order.estimatedFare || 0) + (order.itemCost || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Description / Errand Details (If present) */}
                {(order.details?.foodOrders || order.details?.shoppingList || order.details?.itemSpecs || order.customerNotes) && (
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl text-xs space-y-1">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                      🛍️ Items / Request Details:
                    </span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium whitespace-pre-line">
                      {order.details?.foodOrders || order.details?.shoppingList || order.details?.itemSpecs || order.customerNotes}
                    </p>
                  </div>
                )}

                {/* Proof of Delivery (POD) & Star Review Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  
                  {/* Proof of Delivery Image Thumbnail */}
                  {order.proofOfDeliveryUrl ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPodImage(order.proofOfDeliveryUrl)}
                        className="flex items-center gap-2 p-1.5 pr-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <img
                          src={order.proofOfDeliveryUrl}
                          alt="POD"
                          className="w-7 h-7 rounded-lg object-cover border border-emerald-400"
                        />
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          <span>View Proof of Delivery (POD)</span>
                        </span>
                      </button>
                    </div>
                  ) : order.status === 'delivered' ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified Delivered by Balamban Courier</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Rating / Review Badge */}
                  <div className="flex items-center gap-2">
                    {order.customerRating ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Rated: {order.customerRating} Stars</span>
                        {order.customerReview && (
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:inline">
                            - "{order.customerReview}"
                          </span>
                        )}
                      </div>
                    ) : order.status === 'delivered' ? (
                      <button
                        onClick={() => handleOpenRating(order)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
                        <span>Rate Courier</span>
                      </button>
                    ) : null}

                    {/* Re-order button */}
                    {onSelectService && (
                      <button
                        onClick={() => {
                          const matchingService = SERVICES.find(s => s.id === order.serviceId) || SERVICES[0];
                          onSelectService(matchingService);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Book Again</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: PROOF OF DELIVERY (POD) FULL IMAGE VIEWER */}
      {selectedPodImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proof of Delivery Photo</span>
              </div>
              <button onClick={() => setSelectedPodImage(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedPodImage}
              alt="Proof of Delivery Full"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md"
            />
            <p className="text-xs text-center text-slate-500 dark:text-zinc-400">
              Verified & captured on-site upon handover in Balamban, Cebu.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: DIGITAL OFFICIAL E-RECEIPT */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            id="printable-receipt-modal"
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl"
          >
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  DE
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white uppercase font-heading">
                    Official E-Receipt
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Delivery Express • Balamban Hub</p>
                </div>
              </div>
              <button onClick={() => setSelectedReceiptOrder(null)} className="no-print text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body Slip */}
            <div className="space-y-2.5 text-xs bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Number:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{selectedReceiptOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {selectedReceiptOrder.createdAt ? new Date(selectedReceiptOrder.createdAt).toLocaleString() : 'Just now'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceiptOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Courier:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceiptOrder.riderName || 'Nigel'}</span>
              </div>

              <div className="border-t border-dashed border-slate-300 dark:border-zinc-700 my-2 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Delivery Fare:</span>
                  <span className="font-bold">₱{selectedReceiptOrder.estimatedFare || 60}</span>
                </div>
                {selectedReceiptOrder.itemCost > 0 && (
                  <div className="flex justify-between">
                    <span>Items / Goods Cost:</span>
                    <span className="font-bold">₱{selectedReceiptOrder.itemCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-zinc-700">
                  <span>TOTAL PAID:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    ₱{((selectedReceiptOrder.estimatedFare || 0) + (selectedReceiptOrder.itemCost || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Payment Method:</span>
                  <span className="uppercase font-bold">{selectedReceiptOrder.paymentMethod || 'Cash on Delivery'}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-zinc-800">
                <span>"Your first choice in delivery. Anything, Anywhere!"</span>
              </div>
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="no-print space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-600" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => handleDownloadReceipt(selectedReceiptOrder)}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download File</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleShareReceipt(selectedReceiptOrder)}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share / Copy Receipt</span>
                </button>

                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STAR RATING POPUP */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Rate Courier: {ratingOrder.riderName || 'Nigel'}
                </h4>
              </div>
              <button onClick={() => setRatingOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRatingStars(s)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star className={`w-8 h-8 ${s <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-zinc-700'}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience (e.g. Very fast delivery and friendly rider!)..."
                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 h-24"
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black rounded-2xl text-xs shadow-md"
              >
                Submit Feedback ⭐
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
