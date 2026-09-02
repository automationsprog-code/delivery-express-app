import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BALAMBAN_LANDMARKS, BRAND } from '../../lib/constants';
import LocationPickerModal from '../map/LocationPickerModal';
import { 
  X, 
  MapPin, 
  Navigation, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Phone, 
  User, 
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  LocateFixed,
  Building,
  QrCode,
  Compass
} from 'lucide-react';

export default function BookingModal({ service, initialData = null, onClose, onBookingSuccess }) {
  const { createOrder, paymentSettings, servicesList, currentUser, showFareBreakdownDetails } = useOrder();

  // Find latest active service rates
  const currentService = servicesList?.find(s => s.id === service.id) || service;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [pickupAddress, setPickupAddress] = useState(initialData?.pickupAddress || 'Balamban Public Market, Cebu');
  const [pickupLandmark, setPickupLandmark] = useState(initialData?.pickupLandmark || 'Palengke Town Proper');
  const [pickupCoords, setPickupCoords] = useState([10.5015, 123.7150]);
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLandmark, setDropoffLandmark] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState([10.4720, 123.7060]);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [customerNotes, setCustomerNotes] = useState('');
  const [dynamicFields, setDynamicFields] = useState(() => {
    if (initialData) {
      return {
        restaurantName: initialData.storeName || '',
        storeName: initialData.storeName || '',
        bakeshopName: initialData.storeName || '',
        foodOrders: initialData.foodOrders || '',
        shoppingList: initialData.shoppingList || '',
        itemSpecs: initialData.foodOrders || '',
        estimatedCost: initialData.estimatedCost || 0,
        budgetLimit: initialData.estimatedCost || 0
      };
    }
    return {};
  });
  const [itemCostInput, setItemCostInput] = useState(initialData?.estimatedCost || 0);

  // Map Picker State
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // 'pickup' | 'dropoff' | null

  // Calculate Distance (Haversine formula approximation or coordinate delta)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.max(1.0, parseFloat(d.toFixed(1)));
  };

  const distanceKm = calculateDistance(pickupCoords[0], pickupCoords[1], dropoffCoords[0], dropoffCoords[1]);
  const baseFare = currentService.baseFare || 50;
  const perKmRate = currentService.perKmRate || 10;
  const errandFee = currentService.errandFee || 0;
  const estimatedDeliveryFare = Math.round(baseFare + (distanceKm * perKmRate) + errandFee);
  const totalDue = estimatedDeliveryFare + parseFloat(itemCostInput || 0);

  const handleDynamicChange = (name, value) => {
    setDynamicFields(prev => ({ ...prev, [name]: value }));
    if (name === 'estimatedCost' || name === 'budgetLimit' || name === 'amountDue' || name === 'maxBudget') {
      setItemCostInput(parseFloat(value) || 0);
    }
  };

  const handleLocationPicked = (result) => {
    if (mapPickerTarget === 'pickup') {
      setPickupCoords(result.coords);
      setPickupAddress(result.address);
      setPickupLandmark('Pinned Store/Pickup Location');
    } else if (mapPickerTarget === 'dropoff') {
      setDropoffCoords(result.coords);
      setDropoffAddress(result.address);
      setDropoffLandmark('Pinned Dropoff Location');
    }
  };

  const handleSelectLandmark = (landmark, target = 'dropoff') => {
    if (target === 'pickup') {
      setPickupAddress(landmark.name);
      setPickupCoords([landmark.lat, landmark.lng]);
      setPickupLandmark(landmark.name);
    } else {
      setDropoffAddress(landmark.name);
      setDropoffCoords([landmark.lat, landmark.lng]);
      setDropoffLandmark(landmark.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !dropoffAddress) {
      alert('Please fill in your name, contact number, and delivery destination.');
      return;
    }

    const order = await createOrder({
      serviceId: currentService.id,
      customerName,
      customerPhone,
      customerAvatar: currentUser?.avatar || null,
      pickupAddress,
      pickupLandmark,
      pickupCoords,
      dropoffAddress,
      dropoffLandmark,
      dropoffCoords,
      distanceKm,
      estimatedFare: estimatedDeliveryFare,
      itemCost: parseFloat(itemCostInput || 0),
      paymentMethod,
      details: dynamicFields,
      customerNotes
    });

    if (onBookingSuccess) {
      onBookingSuccess(order);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
        <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white p-5 sm:p-6 flex items-start justify-between relative shadow-md shrink-0">
            <div>
              <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">
                <span>{currentService.badge || 'Fast Dispatch'}</span>
                <span>•</span>
                <span>Balamban & West Cebu</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white font-heading">
                {currentService.name}
              </h3>
              <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                {currentService.tagline}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 dark:text-zinc-200">
            
            {/* Section 1: Customer Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Customer Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Clara"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Mobile Number (for Courier SMS/Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0917-123-4567"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pickup & Dropoff Routing with Interactive Map Pinning */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>2. Pickup & Drop-off Map Locations</span>
              </h4>

              {/* Pickup Address + Pin Map Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    <span>1. Pickup / Store Location *</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('pickup')}
                    className="text-[11px] px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl font-bold flex items-center gap-1 transition-all shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Pin on Map</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Store name, Palengke, or specific pickup location"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* Dropoff Address + Pin Map Button */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>2. Drop-off Destination (House / Barangay) *</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('dropoff')}
                    className="text-[11px] px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold flex items-center gap-1 transition-all shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Pin on Map</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder="Barangay, Street, House #, or Landmark"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>
            </div>

            {/* Section 3: Dynamic Service Fields */}
            {currentService.fields && currentService.fields.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>3. Specific Item & Order Details</span>
                </h4>

                <div className="space-y-3">
                  {currentService.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        {field.label} {field.required && '*'}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          rows={3}
                          value={dynamicFields[field.name] || ''}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm resize-none"
                        />
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={!!dynamicFields[field.name]}
                            onChange={(e) => handleDynamicChange(field.name, e.target.checked)}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span>{field.placeholder || field.label}</span>
                        </label>
                      ) : (
                        <input
                          type={field.type}
                          required={field.required}
                          value={dynamicFields[field.name] || ''}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Payment Method & GCash QR Code */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>4. Payment Method</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)' },
                  { id: 'GCash', label: 'GCash / Scan QR Code' }
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-2 ${
                      paymentMethod === pm.id
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm font-extrabold'
                        : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400'
                    }`}
                  >
                    {pm.id === 'GCash' && <QrCode className="w-4 h-4 text-blue-500" />}
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* If GCash is selected: Show Official Delivery Express GCash QR Code */}
              {paymentMethod === 'GCash' && (
                <div className="p-4 bg-gradient-to-br from-blue-900/90 to-indigo-950 text-white rounded-3xl border border-blue-500/30 flex flex-col sm:flex-row items-center gap-4 shadow-lg animate-fadeIn">
                  <div className="p-2 bg-white rounded-2xl shrink-0 shadow-md">
                    <img
                      src={paymentSettings.gcashQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DELIVERY_EXPRESS_GCASH'}
                      alt="GCash QR Code"
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] bg-blue-500/30 text-blue-200 font-bold px-2 py-0.5 rounded-full uppercase">
                      Official Delivery Express GCash
                    </span>
                    <p className="text-sm font-black text-white">{paymentSettings.gcashName}</p>
                    <p className="text-xs font-mono font-bold text-amber-300">{paymentSettings.gcashNumber}</p>
                    <p className="text-[11px] text-blue-200">
                      Scan with your GCash app or send to the number above.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Transparent Fare Breakdown */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Delivery Service Fare:</span>
                <span className="font-bold text-slate-900 dark:text-white">₱{estimatedDeliveryFare}</span>
              </div>

              {/* Granular Distance & Errand calculation only if Admin enabled breakdown */}
              {showFareBreakdownDetails && (
                <div className="pl-3 border-l-2 border-rose-300 dark:border-rose-700 space-y-1 my-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>• Base Rate ({currentService.name}):</span>
                    <span>₱{baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Distance (~{distanceKm} km trip):</span>
                    <span>₱{Math.round(distanceKm * perKmRate)}</span>
                  </div>
                  {errandFee > 0 && (
                    <div className="flex justify-between">
                      <span>• Special Errand Handling:</span>
                      <span>₱{errandFee}</span>
                    </div>
                  )}
                </div>
              )}

              {itemCostInput > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Estimated Items / Budget Cost:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₱{itemCostInput.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total Estimated Due:</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  ₱{totalDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Confirm & Dispatch Order in Balamban</span>
            </button>

          </form>

        </div>
      </div>

      {/* Interactive Map Location Picker Modal */}
      {mapPickerTarget && (
        <LocationPickerModal
          title={mapPickerTarget === 'pickup' ? 'Pin Pickup / Store Location on Map' : 'Pin Drop-off Destination on Map'}
          initialCoords={mapPickerTarget === 'pickup' ? pickupCoords : dropoffCoords}
          initialAddress={mapPickerTarget === 'pickup' ? pickupAddress : dropoffAddress}
          onSelectLocation={handleLocationPicked}
          onClose={() => setMapPickerTarget(null)}
        />
      )}
    </>
  );
}