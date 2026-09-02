import React, { useState } from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/common/Header';
import ServiceGrid from './components/customer/ServiceGrid';
import BookingModal from './components/customer/BookingModal';
import LiveTracker from './components/customer/LiveTracker';
import RiderPortal from './components/rider/RiderPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import { BRAND } from './lib/constants';
import { 
  Bike, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Send, 
  ShieldCheck, 
  Package, 
  Compass, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

function MainContent() {
  const { activeRole, activeTrackingId, setActiveTrackingId } = useOrder();
  const [customerTab, setCustomerTab] = useState('services'); // 'services' | 'tracker'
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);

  const handleBookingSuccess = (newOrder) => {
    setSelectedServiceForBooking(null);
    setActiveTrackingId(newOrder.trackingNumber);
    setCustomerTab('tracker');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Universal Header */}
      <Header />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* VIEW 1: CUSTOMER VIEW (DEFAULT - NO LOGIN NEEDED) */}
        {activeRole === 'customer' && (
          <div className="space-y-6">
            
            {/* Customer Subnav Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <button
                onClick={() => setCustomerTab('services')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-sm ${
                  customerTab === 'services'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/20 shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Our 9 Delivery Services</span>
              </button>

              <button
                onClick={() => setCustomerTab('tracker')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all relative shadow-sm ${
                  customerTab === 'tracker'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-amber-500/20 shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Live Order Tracker</span>
                {activeTrackingId && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 animate-ping" />
                )}
              </button>
            </div>

            {/* Active Customer Tab Content */}
            {customerTab === 'services' ? (
              <ServiceGrid onSelectService={(service) => setSelectedServiceForBooking(service)} />
            ) : (
              <LiveTracker />
            )}

            {/* Booking Modal Popup */}
            {selectedServiceForBooking && (
              <BookingModal
                service={selectedServiceForBooking}
                onClose={() => setSelectedServiceForBooking(null)}
                onBookingSuccess={handleBookingSuccess}
              />
            )}
          </div>
        )}

        {/* VIEW 2: RIDER PORTAL */}
        {activeRole === 'rider' && (
          <RiderPortal />
        )}

        {/* VIEW 3: DISPATCH / ADMIN DASHBOARD */}
        {activeRole === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-8 px-4 text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-2.5 justify-center md:justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
              DE
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-bold">Delivery Express</p>
              <p className="text-slate-400 dark:text-zinc-500 text-[11px]">{BRAND.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={BRAND.facebookPage}
              target="_blank"
              rel="noreferrer"
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Facebook Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Hours: <strong>{BRAND.operatingHours.display}</strong></span>
            <span>Coverage: <strong>{BRAND.coverage}</strong></span>
          </div>

          <p className="text-slate-400 dark:text-zinc-500 text-[11px]">
            &copy; {new Date().getFullYear()} Delivery Express. Live on Vercel & Supabase.
          </p>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <MainContent />
    </OrderProvider>
  );
}