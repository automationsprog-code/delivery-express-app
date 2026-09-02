import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BRAND } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import AuthModal from './AuthModal';
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
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Radio,
  BellRing,
  Lock,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Header() {
  const { 
    theme, 
    toggleTheme, 
    soundActive, 
    toggleSound, 
    currentUser,
    activeRole, 
    setActiveRole, 
    logout,
    isWithinOperatingHours, 
    resetSampleData, 
    notification,
    announcement 
  } = useOrder();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('rider');
  const isOpen = isWithinOperatingHours();

  const handleOpenLogin = (tab = 'rider') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Top Alert Bar: Operating Hours & Hotline */}
      <div className="bg-gradient-to-r from-rose-900 via-zinc-900 to-amber-900 text-white text-xs border-b border-rose-500/20 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={isOpen ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
              {isOpen ? 'OPEN NOW' : 'OFFLINE'}
            </span>
            <span className="text-zinc-300">({BRAND.operatingHours.display})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-zinc-300 border-l border-white/20 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Balamban • Asturias • Toledo • Tuburan</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs">
          <a
            href={BRAND.facebookPage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-zinc-200 hover:text-white transition-colors font-semibold"
          >
            <Send className="w-3 h-3 text-blue-300" />
            <span className="hidden xs:inline">facebook.com/deliveryexpress23</span>
          </a>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-white/40">•</span>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1 text-emerald-300 font-medium" title="Connected to Supabase PostgreSQL">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <Sparkles className="w-3 h-3" /> Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Radio Broadcast Announcement Banner */}
      {announcement && (
        <div className="bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-spin" />
            <span>RADIO ANNOUNCEMENT ({announcement.time}): {announcement.msg}</span>
          </div>
          <span className="text-[10px] bg-zinc-950 text-amber-400 px-2 py-0.5 rounded-full uppercase">
            All Staff Alert
          </span>
        </div>
      )}

      {/* Main App Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => setActiveRole('customer')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 shadow-md shadow-rose-600/20 p-2 text-white">
              <Bike className="w-6 h-6 transform -rotate-6" />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 font-black text-[9px] px-1 rounded shadow-sm">
                24/7
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-heading">
                  Delivery <span className="text-rose-600 dark:text-rose-500">Express</span>
                </h1>
                <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  West Cebu
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-1">
                {BRAND.tagline}
              </p>
            </div>
          </div>

          {/* Right Controls: Sound, Theme, Auth / Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundActive ? 'Mute sound' : 'Enable sound'}
              className={`p-2.5 rounded-2xl border transition-all ${
                soundActive 
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm' 
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 border-slate-200 dark:border-zinc-800'
              }`}
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* USER / AUTH STATUS */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="px-2.5 py-1 text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {currentUser.role === 'rider' ? (
                    <>
                      <Bike className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate max-w-[100px]">{currentUser.name}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                      <span>Dispatcher</span>
                    </>
                  )}
                </div>

                <button
                  onClick={logout}
                  title="Logout to Customer View"
                  className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenLogin('rider')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-amber-50 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-800 transition-all shadow-sm"
                >
                  <Bike className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rider Login</span>
                </button>

                <button
                  onClick={() => handleOpenLogin('admin')}
                  className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff / Admin</span>
                </button>
              </div>
            )}

            {/* Reset Sample Data */}
            <button
              onClick={resetSampleData}
              title="Reset Sample Demo Orders"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 py-2 px-4 shadow-2xl safe-bottom">
        <div className="grid grid-cols-3 gap-1 text-center">
          <button
            onClick={() => setActiveRole('customer')}
            className={`py-1.5 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
              activeRole === 'customer' 
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold' 
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px]">Customer</span>
          </button>

          <button
            onClick={() => {
              if (currentUser?.role === 'rider') {
                setActiveRole('rider');
              } else {
                handleOpenLogin('rider');
              }
            }}
            className={`py-1.5 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
              activeRole === 'rider' 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold' 
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-[10px]">Rider Portal</span>
          </button>

          <button
            onClick={() => {
              if (currentUser?.role === 'admin') {
                setActiveRole('admin');
              } else {
                handleOpenLogin('admin');
              }
            }}
            className={`py-1.5 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all ${
              activeRole === 'admin' 
                ? 'bg-slate-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-bold' 
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Admin / Staff</span>
          </button>
        </div>
      </nav>

      {/* Floating Global Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 text-xs sm:text-sm font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40' 
              : 'bg-white dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700'
          }`}>
            <BellRing className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Staff & Rider Login Modal */}
      {showAuthModal && (
        <AuthModal
          defaultTab={authTab}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}