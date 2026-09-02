import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
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
  ShieldAlert
} from 'lucide-react';

export default function BookingModal({ service, onClose, onBookingSuccess }) {
  const { createOrder } = useOrder();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLandmark, setPickupLandmark] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffLandmark, setDropoffLandmark] = useState('');
  const [distanceKm, setDistanceKm] = useState(3.5);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [customerNotes, setCustomerNotes] = useState('');
  const [dynamicFields, setDynamicFields] = useState({});
  const [itemCost, setItemCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Fare Calculation
  const baseFare = service.baseFare;
  const distanceFare = Math.round(distanceKm * service.perKmRate);
  const errandFee = service.errandFee || 0;
  const deliveryFee = baseFare + distanceFare + errandFee;
  const totalEstimatedCost = deliveryFee + (parseFloat(itemCost) || 0);

  const handleFieldChange = (fieldName, value) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !pickupAddress || !dropoffAddress) {
      alert('Please fill in your name, contact number, pickup and drop-off addresses.');
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
        dropoffAddress,
        dropoffLandmark,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header with Service Banner */}
        <div className="relative bg-gradient-to-r from-rose-900 via-zinc-900 to-zinc-900 p-6 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            <span>{service.badge}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
            Book {service.name}
          </h3>
          <p className="text-xs text-zinc-300 mt-0.5">
            {service.tagline}
          </p>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Customer Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Maria Clara"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Active Mobile / Phone # *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0917-123-4567"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Service-Specific Dynamic Fields */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> 2. Errand & Item Requirements
            </h4>

            <div className="space-y-3">
              {service.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {field.label} {field.required && '*'}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={dynamicFields[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                      <input
                        type="checkbox"
                        checked={Boolean(dynamicFields[field.name])}
                        onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded bg-zinc-900 border-zinc-700 focus:ring-rose-500"
                      />
                      <span>{field.label}</span>
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
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pickup & Drop-off Route Details */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 3. Pickup & Delivery Location
            </h4>

            {/* Pickup */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Pickup / Merchant Location</span>
              </div>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Store address / Sender pickup address *"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={pickupLandmark}
                onChange={(e) => setPickupLandmark(e.target.value)}
                placeholder="Landmark / Branch name / Unit number"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Drop-off */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Drop-off Destination</span>
              </div>
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder="Your house / Office destination address *"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={dropoffLandmark}
                onChange={(e) => setDropoffLandmark(e.target.value)}
                placeholder="Gate color / Barangay / Landmark"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Distance Slider for Rate calculation */}
            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Estimated Route Distance:</span>
                <span className="font-bold text-amber-400 text-sm">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0.5 km (Nearby)</span>
                <span>12 km</span>
                <span>25 km (Out-of-town)</span>
              </div>
            </div>
          </div>

          {/* 4. Payment Method & Notes */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> 4. Payment Option & Notes
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
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected 
                        ? 'bg-rose-500/20 border-rose-500 text-white font-bold' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Additional Courier Notes (Optional)</label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Please handle with care, text when outside, etc."
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* 5. Pricing Breakdown Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
              <span>Base Courier Fare:</span>
              <span className="font-semibold text-zinc-200">₱{baseFare}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
              <span>Distance ({distanceKm} km @ ₱{service.perKmRate}/km):</span>
              <span className="font-semibold text-zinc-200">₱{distanceFare}</span>
            </div>
            {errandFee > 0 && (
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
                <span>Specialized Errand / Handling Fee:</span>
                <span className="font-semibold text-zinc-200">₱{errandFee}</span>
              </div>
            )}
            {parseFloat(itemCost) > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-400 pb-2 border-b border-zinc-800/80">
                <span>Estimated Item / Bill Cost:</span>
                <span className="font-bold">₱{parseFloat(itemCost).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-sm font-bold text-white">
              <span>Total Estimated Booking:</span>
              <span className="text-lg text-emerald-400">₱{totalEstimatedCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm tracking-wide shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Order...</span>
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
