import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { BRAND } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import { 
  Bike, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  Send, 
  Database, 
  LayoutDashboard, 
  Smartphone,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function Header() {
  const { activeRole, setActiveRole, isWithinOperatingHours, resetSampleData, notification } = useOrder();
  const isOpen = isWithinOperatingHours();

  return (
    <>
      {/* Top Alert Bar: Operating Hours & Hotline */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-amber-950 text-xs border-b border-zinc-800/80 px-4 py-1.5 text-zinc-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={isOpen ? 'text-emerald-400' : 'text-rose-400'}>
              {isOpen ? 'OPEN NOW' : 'OFFLINE'}
            </span>
            <span className="text-zinc-400">({BRAND.operatingHours.display})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-400 border-l border-zinc-700 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Courier Service</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs">
          <a
            href={BRAND.facebookPage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-blue-400 transition-colors font-medium text-zinc-300"
          >
            <Send className="w-3 h-3 text-blue-400" />
            <span className="hidden xs:inline">facebook.com/deliveryexpress23</span>
          </a>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-zinc-600">•</span>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1 text-emerald-400" title="Connected to Supabase PostgreSQL">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400/90" title="Running in Interactive Local & Vercel Preview Mode">
                <Sparkles className="w-3 h-3" /> Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 shadow-lg shadow-rose-600/20 border border-rose-400/30 p-2">
              <Bike className="w-6 h-6 text-white transform -rotate-6" />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 font-black text-[9px] px-1 rounded shadow-sm">
                24/7
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white uppercase font-heading">
                  Delivery <span className="text-rose-500">Express</span>
                </h1>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium line-clamp-1">
                {BRAND.tagline}
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs (Demo & Testing between Customer, Rider, Admin) */}
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setActiveRole('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'customer'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => setActiveRole('rider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'rider'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Console</span>
              </button>

              <button
                onClick={() => setActiveRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-zinc-800 text-rose-400 border border-rose-500/40 shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dispatch / Admin</span>
              </button>
            </div>

            {/* Quick Reset Sample Data button */}
            <button
              onClick={resetSampleData}
              title="Reset Sample Demo Orders"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Floating Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 text-sm font-semibold ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' 
              : 'bg-zinc-900/90 text-zinc-100 border-zinc-700'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{notification.msg}</span>
          </div>
        </div>
      )}
    </>
  );
}
