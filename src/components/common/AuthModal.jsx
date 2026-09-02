import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  X, 
  Bike, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles 
} from 'lucide-react';

export default function AuthModal({ onClose, defaultTab = 'customer' }) {
  const { riders, loginAsCustomer, loginAsRider, loginAsAdmin, showNotification } = useOrder();
  
  const [selectedRole, setSelectedRole] = useState(defaultTab);
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || 'rider-nigel-1');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Handle Google Login for Customer
  const handleGoogleLogin = () => {
    const googleUser = {
      name: 'Google Verified User',
      email: 'customer.balamban@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    loginAsCustomer(googleUser);
    onClose();
  };

  const handleCustomerDirectLogin = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    loginAsCustomer({
      name: customerName.trim(),
      email: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
    });
    onClose();
  };

  const handleRiderLogin = (e) => {
    e.preventDefault();
    const rider = riders.find(r => r.id === selectedRiderId) || riders[0];
    if (!rider) {
      setErrorMsg('No rider found. Please add a rider first.');
      return;
    }
    
    // Strict password verification (Saved password or default 1234 if not modified)
    const storedPass = localStorage.getItem(`rider_pass_${rider.id}`) || rider.password || '1234';
    
    if (passwordInput === storedPass) {
      loginAsRider(rider.id);
      onClose();
    } else {
      setErrorMsg('Incorrect password for ' + rider.name + '.');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const storedAdminPass = localStorage.getItem('delivery_express_admin_password') || '1234';
    
    if (passwordInput === storedAdminPass) {
      loginAsAdmin();
      onClose();
    } else {
      setErrorMsg('Incorrect Admin Master Password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-rose-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors absolute top-5 right-5"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Portal Sign In</span>
          </div>

          <h3 className="text-xl font-black text-white font-heading">
            Delivery Express Access
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Realtime sync across PC, Mobile, and Courier apps
          </p>
        </div>

        {/* Role Tabs */}
        <div className="p-5 sm:p-6 space-y-4">
          
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { setSelectedRole('customer'); setErrorMsg(''); setPasswordInput(''); }}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'customer'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('rider'); setErrorMsg(''); setPasswordInput(''); }}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'rider'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Rider</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setErrorMsg(''); setPasswordInput(''); }}
              className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-slate-900 dark:bg-zinc-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: CUSTOMER LOGIN */}
          {selectedRole === 'customer' && (
            <div className="space-y-4">
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 bg-white dark:bg-zinc-950 hover:bg-slate-50 text-slate-800 dark:text-zinc-100 font-extrabold rounded-2xl border border-slate-300 dark:border-zinc-700 text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
                <span>OR SIGN IN WITH NAME</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
              </div>

              <form onSubmit={handleCustomerDirectLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Clara"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Email / Phone</label>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. 0917-123-4567 or email"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <span>Sign In & Open Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: RIDER LOGIN */}
          {selectedRole === 'rider' && (
            <form onSubmit={handleRiderLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Select Registered Courier Account:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {riders.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRiderId(r.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedRiderId === r.id
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-amber-500" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{r.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{r.plate}</span>
                        </div>
                      </div>
                      {selectedRiderId === r.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Courier Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your private password"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Authorize & Open Rider Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN LOGIN */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Admin Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter master password"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-900 to-zinc-900 hover:bg-black text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <span>Access Admin Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}