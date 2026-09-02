import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BALAMBAN_LANDMARKS } from '../../lib/constants';
import { 
  X, 
  MapPin, 
  Navigation, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Phone,
  User,
  Compass,
  LocateFixed,
  Volume2
} from 'lucide-react';

export default function BookingModal({ service, onClose, onBookingSuccess }) {
  const { createOrder } = useOrder();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLandmark, setPickupLandmark] = useState('');
  const [pickupCoords, setPickupCoords] = useState([10.5015, 123.7150]);
  
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLandmark, setDropoffLandmark] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState([10.4720, 123.7060]);

  const [distanceKm, setDistanceKm] = useState(3.5);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [customerNotes, setCustomerNotes] = useState('');
  const [dynamicFields, setDynamicFields] = useState({});
  const [itemCost, setItemCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic Fare Calculation
  const baseFare = service.baseFare;
  const distanceFare = Math.round(distanceKm * service.perKmRate);
  const errandFee = service.errandFee || 0;
  const deliveryFee = baseFare + distanceFare + errandFee;
  const totalEstimatedCost = deliveryFee + (parseFloat(itemCost) || 0);

  const handleFieldChange = (fieldName, value) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleUseCurrentLocation = (type) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (type === 'dropoff') {
          setDropoffCoords([latitude, longitude]);
          setDropoffAddress(`Live GPS Pin (Balamban: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } else {
          setPickupCoords([latitude, longitude]);
          setPickupAddress(`Live GPS Pin (Balamban: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS Error:', error);
        setIsLocating(false);
        alert('Could not retrieve exact GPS. Defaulting to Balamban Town Center.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !pickupAddress || !dropoffAddress) {
      alert('Palihug ibutang imong Pangalan, Contact Number, Pickup ug Drop-off Address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        serviceId: service.id,
        customerName,
        customerPhone,
        pickupAddress,
        pickupLandmark,
        pickupCoords,
        dropoffAddress,
        dropoffLandmark,
        dropoffCoords,
        distanceKm,
        estimatedFare: deliveryFee,
        itemCost: parseFloat(itemCost) || 0,
        paymentMethod,
        details: dynamicFields,
        customerNotes
      });

      setIsSubmitting(false);
      onBookingSuccess(order);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header with Service Banner */}
        <div className={`relative bg-gradient-to-r ${service.color} p-5 sm:p-6 text-white shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            <span>📍 Balamban • {service.badge}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
            Book {service.name}
          </h3>
          <p className="text-xs text-rose-50 mt-0.5">
            {service.tagline}
          </p>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* 1. Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Customer Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Clara"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Active Mobile / Phone # *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0917-123-4567"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. Service-Specific Dynamic Fields */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> 2. Errand & Item Requirements
            </h4>

            <div className="space-y-3">
              {service.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {field.label} {field.required && '*'}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={dynamicFields[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none shadow-sm"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                      <input
                        type="checkbox"
                        checked={Boolean(dynamicFields[field.name])}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 focus:ring-rose-500"
                      />
                      <span className="font-medium">{field.label}</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={dynamicFields[field.name] || ''}
                      onChange={(e) => {
                        handleFieldChange(field.name, e.target.value);
                        if (field.name === 'estimatedCost' || field.name === 'budgetLimit' || field.name === 'amountDue' || field.name === 'maxBudget') {
                          setItemCost(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pickup & Drop-off Route Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 3. Balamban Route
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Balamban Hub</span>
            </div>

            {/* Quick Balamban Shortcuts */}
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1.5 font-bold">
                ⚡ Quick Balamban Landmarks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BALAMBAN_LANDMARKS.slice(0, 5).map(lm => (
                  <button
                    key={lm.name}
                    type="button"
                    onClick={() => {
                      setPickupAddress(lm.name);
                      setPickupCoords([lm.lat, lm.lng]);
                    }}
                    className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors font-semibold"
                  >
                    📍 {lm.name.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Pickup */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  <span>1. Pickup / Store Location</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation('pickup')}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 font-semibold"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>GPS Pin</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Store / Sender address in Balamban *"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={pickupLandmark}
                onChange={(e) => setPickupLandmark(e.target.value)}
                placeholder="Landmark (e.g. Near Gaisano Balamban, Palengke, Highway)"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Drop-off */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>2. Drop-off Destination</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseCurrentLocation('dropoff')}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-600 font-semibold"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>Use My Live GPS</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="House / Barangay / Destination in Balamban *"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={dropoffLandmark}
                onChange={(e) => setDropoffLandmark(e.target.value)}
                placeholder="Landmark (e.g. Purok 3 Buanoy, Cantuod chapel, Green Gate)"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Distance Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-bold">Estimated Trip Distance:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                <span>0.5 km (Poblacion)</span>
                <span>4.0 km (Buanoy/Cantuod)</span>
                <span>20 km (Boundary)</span>
              </div>
            </div>
          </div>

          {/* 4. Payment Method & Notes */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> 4. Payment Option
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Cash on Delivery', icon: Banknote },
                { name: 'GCash', icon: Wallet },
                { name: 'Maya', icon: CreditCard }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.name;
                return (
                  <button
                    type="button"
                    key={opt.name}
                    onClick={() => setPaymentMethod(opt.name)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected 
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-sm' 
                        : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Additional Courier Notes</label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Text pag abot sa eskina, palihug ampingi ang items"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* 5. Pricing Breakdown Summary Card */}
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
              <span>Base Courier Fare:</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">₱{baseFare}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
              <span>Distance ({distanceKm} km @ ₱{service.perKmRate}/km):</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">₱{distanceFare}</span>
            </div>
            {errandFee > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
                <span>Specialized Handling Fee:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">₱{errandFee}</span>
              </div>
            )}
            {parseFloat(itemCost) > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
                <span>Estimated Item / Bill Cost:</span>
                <span className="font-black">₱{parseFloat(itemCost).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Estimated Booking:</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₱{totalEstimatedCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm tracking-wide shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Courier in Balamban...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Book Delivery Express Courier</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}