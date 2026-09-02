import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { ORDER_STATUSES } from '../../lib/constants';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  Camera, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  LocateFixed,
  Radio
} from 'lucide-react';

export default function RiderPortal() {
  const { 
    orders, 
    riders, 
    selectedRiderId, 
    setSelectedRiderId, 
    assignRider, 
    updateOrderStatus,
    updateRiderLocation,
    uploadProofOfDelivery
  } = useOrder();

  const [selectedOrderForPod, setSelectedOrderForPod] = useState(null);
  const [podPhotoUrl, setPodPhotoUrl] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);

  const currentRider = riders.find(r => r.id === selectedRiderId) || riders[0];

  // Filter orders for current rider
  const myActiveOrders = orders.filter(o => 
    o.riderId === currentRider.id && o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const myCompletedOrders = orders.filter(o => 
    o.riderId === currentRider.id && o.status === 'delivered'
  );

  const unassignedOrders = orders.filter(o => 
    !o.riderId && o.status === 'pending'
  );

  const totalEarningsToday = myCompletedOrders.reduce((acc, curr) => acc + (curr.estimatedFare || 80), 0);

  const handleOpenMaps = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Balamban, Cebu')}`, '_blank');
  };

  const handleOpenWaze = (address) => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(address + ', Balamban, Cebu')}`, '_blank');
  };

  // Broadcast real device GPS
  const handleBroadcastGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateRiderLocation(currentRider.id, latitude, longitude);
        alert(`Your Live GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) is now broadcasted to customers!`);
      },
      (err) => {
        console.warn(err);
        alert('Could not get GPS. Using Balamban center.');
      },
      { enableHighAccuracy: true }
    );
  };

  // Simulate rider moving along Balamban highway
  const handleSimulateMovement = () => {
    setIsSimulatingMove(true);
    let step = 0;
    // Route from Balamban Gaisano (10.4990, 123.7175) to Buanoy (10.4720, 123.7060)
    const points = [
      [10.5015, 123.7150],
      [10.4960, 123.7155],
      [10.4900, 123.7130],
      [10.4820, 123.7100],
      [10.4750, 123.7070],
      [10.4720, 123.7060]
    ];

    const interval = setInterval(() => {
      if (step < points.length) {
        const [lat, lng] = points[step];
        updateRiderLocation(currentRider.id, lat, lng);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulatingMove(false);
      }
    }, 1200);
  };

  const handlePodSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderForPod) return;
    uploadProofOfDelivery(
      selectedOrderForPod.id, 
      podPhotoUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80', 
      podNotes || 'Delivered safely to recipient in Balamban.'
    );
    setSelectedOrderForPod(null);
    setPodPhotoUrl('');
    setPodNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Rider Header & Stats Bar */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Rider Profile Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentRider.avatar}
              alt={currentRider.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                {currentRider.name}
              </h3>
              <span className="bg-amber-500/20 text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                ⭐ {currentRider.rating}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Plate: <strong className="text-zinc-200">{currentRider.plate}</strong> • <span className="text-emerald-400 font-semibold">Balamban Hub</span>
            </p>

            {/* Switch Rider for testing */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-zinc-500">Switch courier:</span>
              {riders.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRiderId(r.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                    r.id === currentRider.id 
                      ? 'bg-amber-500 text-zinc-950 font-bold' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GPS Broadcast & Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBroadcastGPS}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Use your phone's real GPS"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Broadcast My Phone GPS</span>
          </button>

          <button
            onClick={handleSimulateMovement}
            disabled={isSimulatingMove}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulatingMove ? 'animate-spin' : ''}`} />
            <span>{isSimulatingMove ? 'Rider Moving...' : 'Simulate Ride in Balamban'}</span>
          </button>
        </div>

        {/* Quick Earnings Summary */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 w-full md:w-auto justify-around">
          <div className="text-center px-3">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Today's Payout</span>
            <span className="text-lg font-black text-amber-400">₱{totalEarningsToday.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-center px-3">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Completed</span>
            <span className="text-lg font-black text-emerald-400">{myCompletedOrders.length} trips</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-center px-3">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Active Jobs</span>
            <span className="text-lg font-black text-rose-400">{myActiveOrders.length}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: My Active Jobs vs Available Unassigned Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: My Current Active Deliveries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-400" />
              <span>My Active Balamban Deliveries ({myActiveOrders.length})</span>
            </h4>
          </div>

          {myActiveOrders.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl text-zinc-400">
              <Bike className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-semibold">No active deliveries right now.</p>
              <p className="text-xs text-zinc-500">Pick up an available order from the right feed to start!</p>
            </div>
          ) : (
            myActiveOrders.map((order) => (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
              >
                {/* Header with Tracking & Fare */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {order.serviceName}
                    </span>
                    <h4 className="text-base font-black text-white font-mono mt-1">
                      {order.trackingNumber}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Courier Payout</span>
                    <span className="text-lg font-black text-emerald-400">₱{order.estimatedFare}</span>
                    <span className="text-[10px] text-zinc-400 block">{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Pickup & Dropoff in Balamban */}
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-zinc-500 text-[10px] block">1. PICKUP (BALAMBAN)</span>
                        <p className="text-zinc-200 font-medium">{order.pickupAddress}</p>
                        {order.pickupLandmark && <span className="text-zinc-400 text-[11px]">{order.pickupLandmark}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => handleOpenMaps(order.pickupAddress)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        Maps
                      </button>
                      <button 
                        onClick={() => handleOpenWaze(order.pickupAddress)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded text-[10px] font-semibold"
                      >
                        Waze
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-zinc-500 text-[10px] block">2. DROPOFF (BALAMBAN)</span>
                        <p className="text-zinc-200 font-medium">{order.dropoffAddress}</p>
                        {order.dropoffLandmark && <span className="text-zinc-400 text-[11px]">{order.dropoffLandmark}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => handleOpenMaps(order.dropoffAddress)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        Maps
                      </button>
                      <button 
                        onClick={() => handleOpenWaze(order.dropoffAddress)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-sky-400 rounded text-[10px] font-semibold"
                      >
                        Waze
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items & Customer Instructions */}
                {order.details && Object.keys(order.details).length > 0 && (
                  <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">Errand Instructions:</span>
                    {Object.entries(order.details).map(([k, v]) => (
                      <p key={k} className="text-zinc-300 text-[11px]">
                        <strong className="text-zinc-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}
                      </p>
                    ))}
                  </div>
                )}

                {/* Status Advancement Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {order.status === 'assigned' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'purchasing')}
                      className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      ✓ Arrived at Store / Purchasing
                    </button>
                  )}

                  {order.status === 'purchasing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'in_transit')}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      ✓ Items Ready ➔ Out for Delivery
                    </button>
                  )}

                  {order.status === 'in_transit' && (
                    <button
                      onClick={() => setSelectedOrderForPod(order)}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Proof & Complete Delivery</span>
                    </button>
                  )}

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl border border-zinc-700 transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Available Unassigned Errand Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Available Balamban Jobs ({unassignedOrders.length})</span>
            </h4>
          </div>

          {unassignedOrders.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl text-zinc-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold">All Balamban orders are assigned!</p>
              <p className="text-xs text-zinc-500">New customer bookings will appear here instantly.</p>
            </div>
          ) : (
            unassignedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/40 rounded-2xl p-4 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {order.serviceName}
                    </span>
                    <h5 className="text-sm font-bold text-white font-mono mt-1">
                      {order.trackingNumber}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">₱{order.estimatedFare}</span>
                    <span className="text-[10px] text-zinc-500 block">{order.distanceKm} km</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 space-y-1">
                  <p className="line-clamp-1"><strong className="text-zinc-500">From:</strong> {order.pickupAddress}</p>
                  <p className="line-clamp-1"><strong className="text-zinc-500">To:</strong> {order.dropoffAddress}</p>
                </div>

                <button
                  onClick={() => assignRider(order.id, currentRider.id)}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Accept Delivery Job</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Proof of Delivery (POD) Modal */}
      {selectedOrderForPod && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <span>Complete Delivery #{selectedOrderForPod.trackingNumber}</span>
            </h4>

            <form onSubmit={handlePodSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Proof of Delivery Photo URL (or simulate photo)
                </label>
                <input
                  type="text"
                  value={podPhotoUrl}
                  onChange={(e) => setPodPhotoUrl(e.target.value)}
                  placeholder="https://... (Leave blank for sample snapshot)"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Recipient Name / Delivery Notes
                </label>
                <textarea
                  rows={2}
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g. Received by customer in Balamban, Cebu. Payment collected."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPod(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Submit POD & Finish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}