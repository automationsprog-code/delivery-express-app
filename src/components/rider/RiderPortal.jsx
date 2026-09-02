import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';
import { ORDER_STATUSES } from '../../lib/constants';
import OrderChatModal from '../common/OrderChatModal';
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
  Radio,
  Volume2,
  MessageSquare,
  Power,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  Check,
  Key,
  Eye,
  EyeOff,
  Lock,
  X
} from 'lucide-react';

export default function RiderPortal() {
  const { 
    orders, 
    riders, 
    weather,
    selectedRiderId, 
    setSelectedRiderId, 
    assignRider, 
    updateOrderStatus,
    updateRiderLocation,
    setRiderOnlineStatus,
    toggleRiderDuty,
    uploadProofOfDelivery,
    updateRiderPassword,
    currentUser,
    showNotification
  } = useOrder();

  const [selectedOrderForPod, setSelectedOrderForPod] = useState(null);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newCourierPass, setNewCourierPass] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [podPhotoUrl, setPodPhotoUrl] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);
  const [podError, setPodError] = useState('');

  const currentRider = riders.find(r => r.id === selectedRiderId || r.id === currentUser?.id || r.name === currentUser?.name) || riders[0] || {
    id: 'b2c77a52-42ae-4f07-a8fa-540722d74fae',
    name: 'Nigel',
    isOnline: true,
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    plate: 'MIO GEAR - G629MC',
    zone: 'Balamban Proper'
  };

  const isOnline = currentRider.isOnline !== false && currentRider.status !== 'offline';

  // Orders assigned to this rider
  const myActiveOrders = orders.filter(o => 
    (o.riderId === currentRider.id || o.riderName === currentRider.name || o.details?.rider_name === currentRider.name) && 
    o.status !== 'delivered' && 
    o.status !== 'cancelled'
  );

  const myCompletedOrders = orders.filter(o => 
    (o.riderId === currentRider.id || o.riderName === currentRider.name || o.details?.rider_name === currentRider.name) && 
    o.status === 'delivered'
  );

  // Available unassigned orders
  const unassignedOrders = orders.filter(o => 
    !o.riderId && !o.riderName && !o.details?.rider_name && o.status === 'pending'
  );

  const totalEarningsToday = myCompletedOrders.reduce((acc, curr) => acc + (curr.estimatedFare || 80), 0);

  const [isLocationSharing, setIsLocationSharing] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('Live');

  // Automatic Background GPS Location Stream (Grab/FoodPanda Style)
  useEffect(() => {
    if (!isOnline || !isLocationSharing) {
      setGpsStatus('Paused');
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('Not Supported');
      return;
    }

    setGpsStatus('Live');

    // Continuous watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateRiderLocation(currentRider.id, latitude, longitude);
        setGpsStatus('Live');
      },
      (err) => {
        console.warn('GPS location error:', err);
        setGpsStatus('Searching...');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, isLocationSharing, currentRider.id]);

  const handleOpenMaps = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Balamban, Cebu')}`, '_blank');
  };

  const handleOpenWaze = (address) => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(address + ', Balamban, Cebu')}`, '_blank');
  };

  // Camera & Photo Upload Capture for Proof of Delivery
  const handlePodPhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPodError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPodPhotoUrl(compressed);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePodSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderForPod) return;

    // STRICT REQUIREMENT: Photo is mandatory
    if (!podPhotoUrl) {
      setPodError('Proof of Delivery Photo is REQUIRED before completing this order.');
      return;
    }

    uploadProofOfDelivery(
      selectedOrderForPod.id, 
      podPhotoUrl, 
      podNotes.trim() || 'Handed over directly to customer. Payment collected in Balamban.'
    );

    setSelectedOrderForPod(null);
    setPodPhotoUrl('');
    setPodNotes('');
    setPodError('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Rider Header & Duty Shift Status Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-float">
        
        {/* Rider Profile & Status Indicator */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={currentRider.avatar}
              alt={currentRider.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-zinc-900 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentRider.name}
              </h3>
              <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                ⭐ {currentRider.rating}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Plate: <strong className="text-slate-800 dark:text-zinc-200">{currentRider.plate}</strong> • <span className="text-rose-600 dark:text-rose-400 font-bold">{currentRider.zone || 'Balamban'}</span>
            </p>

            {/* Courier Duty Status Pill */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                isOnline 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>{isOnline ? 'ACTIVE & ON DUTY' : 'OFF DUTY / INACTIVE'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* DUTY TOGGLE SWITCH & GPS CONTROLS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Main Duty Active / Inactive Toggle Button */}
          <button
            onClick={() => toggleRiderDuty(currentRider.id)}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Set OFF DUTY' : 'Set ACTIVE ON DUTY'}</span>
          </button>

          {/* Grab-Style Live Location Sharing Toggle */}
          <button
            onClick={() => setIsLocationSharing(prev => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm ${
              isLocationSharing && isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
            }`}
            title="Turn Live Location Sharing ON/OFF"
          >
            <LocateFixed className={`w-4 h-4 ${isLocationSharing && isOnline ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>
              {isLocationSharing && isOnline ? '📍 Location: ON 🟢' : '📍 Location: OFF ⚪'}
            </span>
          </button>

          {/* Change Password Button */}
          <button
            onClick={() => {
              setNewCourierPass(localStorage.getItem(`rider_pass_${currentRider.id}`) || currentRider.password || 'Pass123');
              setShowChangePassModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-slate-200 dark:border-zinc-700"
            title="Change My Login Password"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>🔑 Password</span>
          </button>
        </div>

        {/* Shift Summary */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 w-full md:w-auto justify-around">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-bold">Today's Payout</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">₱{totalEarningsToday.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-bold">Completed</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{myCompletedOrders.length}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-bold">Active Jobs</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{myActiveOrders.length}</span>
          </div>
        </div>

      </div>

      {/* Real-time PANAHON Weather Advisory Card for Courier */}
      {weather && (
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between gap-3 card-float ${
          weather.isRainy 
            ? 'bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border-rose-500/30' 
            : 'bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-transparent border-sky-500/20'
        }`}>
          <div className="flex items-center gap-3.5">
            <span className="text-3xl sm:text-4xl">{weather.icon}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  PANAHON Weather ({weather.location})
                </span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                  {weather.temp}°C • Wind {weather.windSpeed}km/h • Humidity {weather.humidity}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1">
                {weather.condition} — <strong className="text-slate-900 dark:text-white font-extrabold">{weather.advisory}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: My Active Jobs vs Available Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left Column: My Current Active Deliveries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-500" />
              <span>My Active Deliveries ({myActiveOrders.length})</span>
            </h4>
          </div>

          {myActiveOrders.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 dark:text-zinc-500 shadow-sm">
              <Bike className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">No active deliveries right now.</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Pick up an available order from the right feed to start!</p>
            </div>
          ) : (
            myActiveOrders.map((order) => {
              const isAssigned = order.status === 'assigned';
              const isPurchasing = order.status === 'purchasing' || order.status === 'at_pickup_purchasing';
              const isOutForDelivery = order.status === 'in_transit' || order.status === 'out_for_delivery';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 card-float transition-all"
                >
                  {/* Header with Tracking & Fare */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      {/* Customer Photo / Avatar */}
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={order.customerAvatar || order.details?.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={order.customerName}
                          className="w-10 h-10 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm" title="Verified Customer">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div>
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {order.serviceName}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          {order.trackingNumber}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold mt-0.5 flex items-center gap-1">
                          <span>Customer:</span>
                          <strong className="text-slate-900 dark:text-white font-black">{order.customerName}</strong>
                          <span className="text-slate-400 font-normal">({order.customerPhone})</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Courier Payout</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₱{order.estimatedFare}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-semibold">{order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Pickup & Dropoff */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800/80 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 text-[10px] block font-bold">1. PICKUP (BALAMBAN)</span>
                          <p className="text-slate-800 dark:text-zinc-200 font-semibold">{order.pickupAddress}</p>
                          {order.pickupLandmark && <span className="text-slate-500 dark:text-zinc-400 text-[11px]">{order.pickupLandmark}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleOpenMaps(order.pickupAddress)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-zinc-700 shadow-sm"
                        >
                          Maps
                        </button>
                        <button 
                          onClick={() => handleOpenWaze(order.pickupAddress)}
                          className="px-2.5 py-1 bg-sky-50 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 rounded-xl text-[10px] font-bold border border-sky-200 dark:border-zinc-700 shadow-sm"
                        >
                          Waze
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 text-[10px] block font-bold">2. DROPOFF (BALAMBAN)</span>
                          <p className="text-slate-800 dark:text-zinc-200 font-semibold">{order.dropoffAddress}</p>
                          {order.dropoffLandmark && <span className="text-slate-500 dark:text-zinc-400 text-[11px]">{order.dropoffLandmark}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleOpenMaps(order.dropoffAddress)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-zinc-700 shadow-sm"
                        >
                          Maps
                        </button>
                        <button 
                          onClick={() => handleOpenWaze(order.dropoffAddress)}
                          className="px-2.5 py-1 bg-sky-50 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 rounded-xl text-[10px] font-bold border border-sky-200 dark:border-zinc-700 shadow-sm"
                        >
                          Waze
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items & Customer Instructions (Filtered out internal technical metadata) */}
                  {order.details && Object.keys(order.details).length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">Errand Instructions:</span>
                      {Object.entries(order.details)
                        .filter(([k]) => k !== 'chat_messages' && k !== 'rider_name' && k !== 'rider_phone' && k !== 'rider_plate' && k !== 'cancel_reason')
                        .map(([k, v]) => (
                          <div key={k} className="text-slate-700 dark:text-zinc-300 text-[11px]">
                            <strong className="text-slate-500 dark:text-zinc-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}: </strong> 
                            <span className="font-semibold whitespace-pre-line">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Status Advancement Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {isAssigned && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'purchasing')}
                        className="flex-1 py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>✓ Arrived at Store / Purchasing</span>
                      </button>
                    )}

                    {isPurchasing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'in_transit')}
                        className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>✓ Items Ready ➔ Out for Delivery</span>
                      </button>
                    )}

                    {isOutForDelivery && (
                      <button
                        onClick={() => {
                          setSelectedOrderForPod(order);
                          setPodPhotoUrl('');
                          setPodNotes('');
                          setPodError('');
                        }}
                        className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>📸 Take Proof Photo & Complete</span>
                      </button>
                    )}

                    {/* Open Grab-Style In-App Chat Button */}
                    <button
                      onClick={() => setSelectedOrderForChat(order)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900 transition-colors shadow-sm"
                      title="Chat with Customer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-slate-200 dark:border-zinc-700 transition-colors shadow-sm"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Available Unassigned Jobs Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Available Jobs Feed ({unassignedOrders.length})</span>
            </h4>
          </div>

          {unassignedOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 dark:text-zinc-500 shadow-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">All Balamban orders are assigned!</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500">New customer bookings will chime here instantly.</p>
            </div>
          ) : (
            unassignedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-rose-500/40 rounded-3xl p-5 shadow-sm space-y-3 card-float"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {order.serviceName}
                    </span>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                      {order.trackingNumber}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₱{order.estimatedFare}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-semibold">{order.distanceKm} km</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-1">
                  <p className="line-clamp-1"><strong className="text-slate-400">From:</strong> {order.pickupAddress}</p>
                  <p className="line-clamp-1"><strong className="text-slate-400">To:</strong> {order.dropoffAddress}</p>
                </div>

                <button
                  onClick={() => assignRider(order.id, currentRider.id)}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Accept Delivery Job</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Grab-Style In-App Real-Time Chat Modal */}
      {selectedOrderForChat && (
        <OrderChatModal
          order={selectedOrderForChat}
          senderRole="rider"
          onClose={() => setSelectedOrderForChat(null)}
        />
      )}

      {/* STRICT MANDATORY PROOF OF DELIVERY (POD) CAMERA MODAL */}
      {selectedOrderForPod && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>Proof of Delivery (Required)</span>
              </h4>
              <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full uppercase border border-rose-300 dark:border-rose-800">
                Mandatory Photo
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Palihug og kuha og litrato sa gi-deliver nga item o sa pagdawat sa kustomer sa Balamban.
            </p>

            {podError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{podError}</span>
              </div>
            )}

            <form onSubmit={handlePodSubmit} className="space-y-4 text-xs">
              
              {/* Photo Shutter & Live Preview */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  1. Snapshot Proof of Delivery Photo *
                </label>

                {podPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                    <img
                      src={podPhotoUrl}
                      alt="Proof Preview"
                      className="w-full h-48 object-cover bg-slate-100 dark:bg-zinc-950"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Photo Captured</span>
                    </div>
                    <label className="absolute bottom-2 left-2 right-2 cursor-pointer py-2 bg-black/70 hover:bg-black/80 backdrop-blur-md text-white font-bold text-center rounded-xl flex items-center justify-center gap-2 text-xs transition-colors">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Retake Photo / Choose Another</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handlePodPhotoCapture} 
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-emerald-500/60 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all shadow-sm group">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 block">
                      📷 Open Camera to Snap Photo
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Tap to open phone camera or upload from gallery
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={handlePodPhotoCapture} 
                    />
                  </label>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  2. Recipient Name / Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g. Received by customer. Payment collected."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPod(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!podPhotoUrl}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Proof & Finish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE COURIER PASSWORD */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Change Password
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Courier: {currentRider.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCourierPass.trim()) return alert('Password cannot be empty.');
                updateRiderPassword(currentRider.id, newCourierPass.trim());
                showNotification(`Password for ${currentRider.name} updated!`, 'success');
                setShowChangePassModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  New Portal Password
                </label>
                <div className="relative">
                  <input
                    type={showPassText ? "text" : "password"}
                    required
                    value={newCourierPass}
                    onChange={(e) => setNewCourierPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Use this password whenever logging in to the Courier Portal.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl shadow-md transition-all"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}