import React, { useState } from 'react';
import { SERVICES } from '../../lib/constants';
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
  ShieldAlert,
  Clock,
  Sparkles,
  Search,
  Filter
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
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = SERVICES.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Eye-Pleasing Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 text-white p-6 sm:p-8 md:p-10 shadow-2xl shadow-rose-600/20">
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Balamban Courier Express • 8:00 AM – 2:00 AM</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-sm font-heading">
            Anything, <span className="text-amber-200">Anywhere!</span>
          </h2>

          <p className="text-sm sm:text-base text-rose-50 font-medium leading-relaxed max-w-xl">
            Reliable on-demand errands & deliveries across Balamban, Asturias, Toledo, and surrounding Cebu towns.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="bg-black/20 px-3 py-1 rounded-xl border border-white/10">✓ Fast Dispatch</span>
            <span className="bg-black/20 px-3 py-1 rounded-xl border border-white/10">✓ Proof of Delivery</span>
            <span className="bg-black/20 px-3 py-1 rounded-xl border border-white/10">✓ COD & GCash</span>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-48 h-48 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Services Header & Search Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Our 9 Delivery & Errand Services
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Tap any service to open quick booking & calculate fare
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service (e.g. food, bills)..."
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
          />
        </div>
      </div>

      {/* Interactive 3D Floating Grid of 9 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredServices.map((service, index) => {
          const IconComponent = iconMap[service.icon] || Package;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group relative cursor-pointer rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 p-6 shadow-sm hover:shadow-2xl hover:border-rose-500/50 dark:hover:border-rose-500/40 card-float flex flex-col justify-between transition-all duration-300 overflow-hidden"
            >
              {/* Subtle Top Gradient Accent Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.color}`} />

              <div>
                {/* Header: Icon & Badge */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50 shadow-sm">
                    {service.badge}
                  </span>
                </div>

                {/* Service Name & Tagline */}
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {service.name}
                </h4>

                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              {/* Footer: Starting Fare & CTA */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] block uppercase font-semibold">
                    Starting Fare
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-slate-900 dark:text-amber-400 text-base sm:text-lg">
                      ₱{service.baseFare}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      (+₱{service.perKmRate}/km)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-rose-600 text-slate-700 dark:text-zinc-200 group-hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm group-hover:shadow-md"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}