import React, { useState } from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import Header from './components/common/Header';
import ServiceGrid from './components/customer/ServiceGrid';
import BookingModal from './components/customer/BookingModal';
import LiveTracker from './components/customer/LiveTracker';
import CustomerOrderHistory from './components/customer/CustomerOrderHistory';
import StoreMenuCatalog from './components/customer/StoreMenuCatalog';
import RiderPortal from './components/rider/RiderPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthModal from './components/common/AuthModal';
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
  ExternalLink, 
  User, 
  Lock, 
  ArrowRight,
  History,
  UtensilsCrossed
} from 'lucide-react';

function MainContent() {
  const { activeRole, currentUser, activeTrackingId, setActiveTrackingId, orders, storesList } = useOrder();
  const [customerTab, setCustomerTab] = useState('services'); // 'services' | 'menus' | 'tracker' | 'history'
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [bookingInitialData, setBookingInitialData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBookingSuccess = (newOrder) => {
    setSelectedServiceForBooking(null);
    setBookingInitialData(null);
    setActiveTrackingId(newOrder.trackingNumber);
    setCustomerTab('tracker');
  };

  const handleTrackFromHistory = (trackingNum) => {
    setActiveTrackingId(trackingNum);
    setCustomerTab('tracker');
  };

  const handleOrderFromMenu = (menuData) => {
    setSelectedServiceForBooking(menuData.service);
    setBookingInitialData(menuData);
  };

  // Count delivered items for customer badge
  const deliveredCount = orders.filter(o => {
    if (o.status !== 'delivered') return false;
    if (currentUser?.role === 'admin' || currentUser?.role === 'rider') return true;
    const custPhone = currentUser?.phone ? String(currentUser.phone).replace(/\D/g, '') : '';
    const orderPhone = o.customerPhone ? String(o.customerPhone).replace(/\D/g, '') : '';
    const phoneMatch = custPhone && orderPhone && custPhone.slice(-10) === orderPhone.slice(-10);
    const custName = currentUser?.name?.trim().toLowerCase();
    const orderName = o.customerName?.trim().toLowerCase();
    const nameMatch = custName && orderName && (custName === orderName || custName.includes(orderName) || orderName.includes(custName));
    const custEmail = currentUser?.email?.trim().toLowerCase();
    const orderEmail = (o.details?.customer_email || o.customerEmail || '')?.trim().toLowerCase();
    const emailMatch = custEmail && orderEmail && custEmail === orderEmail;
    return phoneMatch || nameMatch || emailMatch;
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Universal Header */}
      <Header />

      {/* Main Body Container: Responsive & Widescreen Balanced */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3.5 sm:px-8 lg:px-12 py-4 sm:py-6 space-y-6">
        
        {/* VIEW 1: CUSTOMER VIEW */}
        {activeRole === 'customer' && (
          <div className="space-y-6">
            
            {/* Customer Subnav Tabs */}
            <div className="flex items-center justify-start sm:justify-start gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3 overflow-x-auto">
              <button
                onClick={() => setCustomerTab('services')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shrink-0 shadow-sm ${
                  customerTab === 'services'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/20 shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Our 9 Delivery Services</span>
              </button>

              <button
                onClick={() => setCustomerTab('menus')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all relative shrink-0 shadow-sm ${
                  customerTab === 'menus'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-amber-500/20 shadow-md font-black'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Food & Store Menus</span>
                <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                  {(storesList || []).length} Stores
                </span>
              </button>

              <button
                onClick={() => setCustomerTab('tracker')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all relative shrink-0 shadow-sm ${
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

              <button
                onClick={() => setCustomerTab('history')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all relative shrink-0 shadow-sm ${
                  customerTab === 'history'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/20 shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Order History & Receipts</span>
                {deliveredCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                    {deliveredCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Customer Tab Content */}
            {customerTab === 'services' ? (
              <ServiceGrid onSelectService={(service) => {
                setBookingInitialData(null);
                setSelectedServiceForBooking(service);
              }} />
            ) : customerTab === 'menus' ? (
              <StoreMenuCatalog onOrderFromMenu={handleOrderFromMenu} />
            ) : customerTab === 'history' ? (
              <CustomerOrderHistory 
                onSelectService={(service) => {
                  setBookingInitialData(null);
                  setSelectedServiceForBooking(service);
                }} 
                onTrackOrder={handleTrackFromHistory}
              />
            ) : (
              /* If customer is not signed in and clicks tracker, offer sign-in prompt or tracking by number */
              !currentUser ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                    Sign in to View Your Live Orders
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    Sign in with Google or your name to view real-time GPS tracking and live courier updates.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Sign In as Customer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCustomerTab('services')}
                      className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-2xl text-xs"
                    >
                      Browse Services
                    </button>
                  </div>
                </div>
              ) : (
                <LiveTracker />
              )
            )}

            {/* Booking Modal Popup */}
            {selectedServiceForBooking && (
              <BookingModal
                service={selectedServiceForBooking}
                initialData={bookingInitialData}
                onClose={() => {
                  setSelectedServiceForBooking(null);
                  setBookingInitialData(null);
                }}
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
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-8 px-4 sm:px-8 text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
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

      {/* Global Auth Modal */}
      {showAuthModal && (
        <AuthModal
          defaultTab="customer"
          onClose={() => setShowAuthModal(false)}
        />
      )}

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