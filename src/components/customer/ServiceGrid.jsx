import React from 'react';
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
  Clock
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
  return (
    <div className="space-y-6">
      {/* Hero Banner with Delivery Express Slogan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/80 via-zinc-900 to-amber-950/60 border border-rose-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Courier & Errand Express (8:00 AM - 2:00 AM)</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Anything, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-amber-400">Anywhere!</span>
          </h2>

          <p className="text-sm md:text-base text-zinc-300">
            Book trusted couriers for food delivery, pasabuy, cakes, pharmacy medicines, bills payment, market kumpra, and parcel errands.
          </p>
        </div>

        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 9 Services Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Select an Errand or Delivery Service
          </h3>
          <p className="text-xs text-zinc-400">
            Choose from our 9 specialized delivery categories
          </p>
        </div>
      </div>

      {/* Grid of 9 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const IconComponent = iconMap[service.icon] || Package;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group relative cursor-pointer rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-rose-500/40 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/10 flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Icon & Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/60 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:text-rose-300 transition-transform shadow-inner">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span className="bg-zinc-800/90 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                    {service.badge}
                  </span>
                </div>

                {/* Service Name & Tagline */}
                <h4 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                  {service.name}
                </h4>

                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              {/* Card Footer: Rates & CTA */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Starts from</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    ₱{service.baseFare}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-1">
                    (+₱{service.perKmRate}/km)
                  </span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-rose-400 group-hover:translate-x-1 transition-transform text-xs">
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
