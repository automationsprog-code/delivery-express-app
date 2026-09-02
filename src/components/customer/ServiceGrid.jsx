import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  Utensils, 
  ShoppingBag, 
  Gift, 
  Pill, 
  Package, 
  Receipt, 
  Zap, 
  Store, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Search,
  Bike,
  CheckCircle2,
  PhoneCall,
  Flame,
  Radio
} from 'lucide-react';

const iconMap = {
  Utensils,
  ShoppingBag,
  Gift,
  Pill,
  Package,
  Receipt,
  Zap,
  Store,
  FileText
};

export default function ServiceGrid({ onSelectService }) {
  const { servicesList, riders, isWithinOperatingHours } = useOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Exact real-time on-duty active rider count
  const activeRidersCount = riders.filter(r => (r.status === 'active' && r.isOnline !== false)).length;
  const isOpen = isWithinOperatingHours();

  const filteredServices = (servicesList || []).filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Dynamic Wide Hero Banner with Real-Time Courier Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white shadow-xl p-6 sm:p-8 lg:p-10 border border-rose-400/20">
        
        {/* Background glow graphics */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-rose-900/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4 text-center sm:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Balamban & West Cebu Express • 8:00 AM – 2:00 AM Daily</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-heading leading-tight drop-shadow-sm">
              Anything, Anywhere!
            </h2>

            <p className="text-sm sm:text-base text-rose-100 max-w-2xl font-medium leading-relaxed">
              Reliable on-demand errands & deliveries across <strong>Balamban, Asturias, Toledo, Tuburan, and Pinamungajan</strong>. Food, grocery, pharmacy, bills & parcels.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold flex items-center gap-1.5 border border-white/20">
                <Bike className="w-4 h-4 text-amber-300" />
                <span>Fast Motorcycle Dispatch</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold flex items-center gap-1.5 border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Proof of Delivery Photo</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold flex items-center gap-1.5 border border-white/20">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Cash on Delivery & GCash</span>
              </span>
            </div>

          </div>

          {/* Quick Stats Box on Widescreen: Real-Time Live Couriers */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-center space-y-3 shadow-lg">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-200 block">
              Active Couriers in West Cebu
            </span>

            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                {activeRidersCount > 0 ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                )}
              </span>

              <span className="text-3xl font-black text-white">
                {activeRidersCount} {activeRidersCount === 1 ? 'Courier' : 'Couriers'}
              </span>
            </div>

            <p className="text-xs text-rose-100 font-medium">
              {activeRidersCount > 0
                ? `Ready for pickup in Balamban proper, Gaisano, Buanoy, and adjacent towns.`
                : `All couriers are currently off-duty or on break. You can still place a pre-booking.`}
            </p>
          </div>

        </div>

      </div>

      {/* Services Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
            Our 9 Delivery & Errand Services
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Tap any service to open quick booking, calculate exact fare & pin map location
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service (food, bills, medicine)..."
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
          />
        </div>
      </div>

      {/* Responsive Grid: Expands to 4-5 Columns on Widescreens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
        {filteredServices.map((service) => {
          const IconComponent = iconMap[service.icon] || Package;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-rose-500/50 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between card-float"
            >
              
              {/* Card Top: Icon & Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 p-2.5 text-white shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-full h-full" />
                  </div>

                  <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {service.badge}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors font-heading mb-1">
                  {service.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              {/* Card Bottom: Starting Fare & Book Action */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-bold">
                    Starting Fare
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white">₱{service.baseFare}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">(+₱{service.perKmRate}/km)</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-rose-600 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm group-hover:bg-rose-600 group-hover:text-white"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}