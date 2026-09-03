import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { BRAND } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import AuthModal from './AuthModal';
import ChangePasswordModal from './ChangePasswordModal';
import InstallAppButton from './InstallAppButton';
import CustomerProfileModal from '../customer/CustomerProfileModal';
import { 
  Bike, 
  ShieldCheck, 
  Clock, 
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
  User,
  KeyRound,
  Edit2,
  Settings
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
    announcement,
    clearAnnouncement,
    weather
  } = useOrder();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('customer');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCustomerProfileModal, setShowCustomerProfileModal] = useState(false);

  const isOpen = isWithinOperatingHours();

  const handleOpenLogin = (tab = 'customer') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Top Alert Bar - Clean responsive layout with PANAHON Weather */}
      <div className="bg-gradient-to-r from-rose-900 via-zinc-900 to-amber-900 text-white text-[11px] sm:text-xs border-b border-rose-500/20 px-3.5 sm:px-8 py-1.5 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="flex items-center gap-1.5 font-medium shrink-0">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={isOpen ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <span className="text-zinc-300 truncate hidden xs:inline">({BRAND.operatingHours.display})</span>
        </div>

        {/* Live PANAHON Weather Widget in Navbar */}
        {weather && (
          <div 
            title={`PANAHON Live Weather: ${weather.condition} in ${weather.location} (Feels like ${weather.feelsLike}°C). Advisory: ${weather.advisory}`}
            className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded-full border border-amber-400/30 text-amber-200 text-[10px] sm:text-xs font-semibold cursor-default shrink-0 transition-colors"
          >
            <span className="text-xs sm:text-sm">{weather.icon}</span>
            <span className="font-bold text-white truncate max-w-[80px] sm:max-w-none">{weather.location}:</span>
            <span className="text-amber-300 font-black">{weather.temp}°C</span>
            <span className="hidden md:inline text-zinc-300 font-normal">({weather.condition})</span>
            <span className="hidden lg:inline text-blue-200 text-[10px]">💨 {weather.windSpeed}km/h</span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1 text-emerald-300 font-medium">
            <Database className="w-3 h-3" />
            <span className="hidden sm:inline">Live Cloud Sync</span>
          </div>
        </div>
      </div>

      {/* Admin Radio Broadcast Announcement Banner with Moving Text Marquee */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 px-3 sm:px-6 py-2 text-xs font-black flex items-center justify-between gap-3 shadow-md overflow-hidden relative border-b border-amber-600/30">
          <div className="flex items-center gap-2 shrink-0 z-10 bg-amber-400/95 dark:bg-amber-500/95 pr-2 py-0.5 rounded-r-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="bg-zinc-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400 animate-spin" />
              <span>RADIO ({announcement.time})</span>
            </span>
          </div>

          {/* Continuous Smooth Scrolling Moving Text (Marquee) */}
          <div className="flex-1 overflow-hidden relative select-none mx-2">
            <div className="marquee-content font-black text-xs text-zinc-950 tracking-wide">
              <span>📢 {announcement.msg} &nbsp;&nbsp;&nbsp;•••&nbsp;&nbsp;&nbsp; 📢 {announcement.msg} &nbsp;&nbsp;&nbsp;•••&nbsp;&nbsp;&nbsp; 📢 {announcement.msg}</span>
            </div>
          </div>

          {/* Right Action / Staff Alert */}
          <div className="flex items-center gap-2 shrink-0 z-10 bg-amber-400/95 dark:bg-amber-500/95 pl-2 py-0.5 rounded-l-xl">
            <span className="text-[10px] bg-zinc-950 text-amber-400 px-2.5 py-0.5 rounded-full uppercase font-black hidden sm:inline">
              HQ Alert
            </span>
            {activeRole === 'admin' && (
              <button
                onClick={clearAnnouncement}
                title="Stop Broadcast (Admin Only)"
                className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-black text-xs rounded-xl flex items-center gap-1 shadow-sm border border-zinc-950/30 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <span>✕ Stop</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main App Bar - Mobile Optimized & Widescreen Balanced */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-2.5 sm:px-8 lg:px-12 py-2 sm:py-3 shadow-sm transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveRole('customer')}
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-500 shadow-md shadow-rose-600/20 p-1 sm:p-2 text-white">
              <Bike className="w-4 h-4 sm:w-6 sm:h-6 transform -rotate-6" />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 font-black text-[7px] sm:text-[9px] px-0.5 sm:px-1 rounded shadow-sm">
                24/7
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-xs sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-heading whitespace-nowrap">
                  Delivery <span className="text-rose-600 dark:text-rose-500">Express</span>
                </h1>
                <span className="hidden md:inline bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  West Cebu
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium hidden sm:block">
                {BRAND.tagline}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* PWA 1-Click Install Button */}
            <InstallAppButton />

            {/* Audio Toggle (Hidden on extra small mobile, visible sm+) */}
            <button
              onClick={toggleSound}
              title={soundActive ? 'Mute sound' : 'Enable sound'}
              className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all hidden xs:flex items-center justify-center ${
                soundActive 
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm' 
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 border-slate-200 dark:border-zinc-800'
              }`}
            >
              {soundActive ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch Mode`}
              className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* USER / AUTH STATUS */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800">
                
                {/* Customer Profile Button (Opens CustomerProfileModal) */}
                {currentUser.role === 'customer' ? (
                  <button
                    onClick={() => setShowCustomerProfileModal(true)}
                    title="Edit Profile, Photo & Password"
                    className="flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg sm:rounded-xl transition-all max-w-[100px] sm:max-w-[150px] group"
                  >
                    {currentUser.avatar && !currentUser.avatar.includes('unsplash') ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-rose-500 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-[9px] sm:text-[10px] shrink-0 uppercase">
                        {(currentUser.name || 'C').charAt(0)}
                      </div>
                    )}
                    <span className="truncate text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-rose-500 shrink-0" />
                  </button>
                ) : (
                  <div className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1 truncate max-w-[70px] sm:max-w-[130px]">
                    {currentUser.role === 'rider' ? (
                      <span className="truncate">{currentUser.name}</span>
                    ) : (
                      <span>Admin</span>
                    )}
                  </div>
                )}

                {currentUser.role !== 'customer' && (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    title="Change Password"
                    className="p-1 sm:p-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg shadow-sm"
                  >
                    <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                )}

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 sm:p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg sm:rounded-xl shadow-sm flex items-center gap-1 font-bold text-[10px] sm:text-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => handleOpenLogin('customer')}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 text-slate-800 dark:text-zinc-100 text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-zinc-800 transition-all shadow-sm flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-rose-500" />
                  <span>Login</span>
                </button>

                <button
                  onClick={() => handleOpenLogin('admin')}
                  className="px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1 shrink-0"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* Live Cloud Refresh / Sync */}
            <button
              onClick={resetSampleData}
              title="Sync Live Cloud Database"
              className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 py-1.5 px-3 shadow-2xl safe-bottom">
        <div className="grid grid-cols-3 gap-1 text-center">
          <button
            onClick={() => setActiveRole('customer')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
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
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
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
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeRole === 'admin' 
                ? 'bg-slate-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-bold' 
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Admin</span>
          </button>
        </div>
      </nav>

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 animate-bounce">
          <div className={`px-3.5 py-2.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-2.5 text-xs font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40' 
              : 'bg-white dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700'
          }`}>
            <BellRing className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          defaultTab={authTab}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordModal && currentUser && (
        <ChangePasswordModal
          userRole={currentUser.role}
          userId={currentUser.id}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Customer Profile & Photo Edit Modal */}
      {showCustomerProfileModal && currentUser && currentUser.role === 'customer' && (
        <CustomerProfileModal
          onClose={() => setShowCustomerProfileModal(false)}
        />
      )}
    </>
  );
}