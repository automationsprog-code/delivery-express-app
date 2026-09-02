import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  X, 
  Bike, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  Smartphone, 
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function AuthModal({ onClose, defaultTab = 'rider' }) {
  const { riders, loginAsRider, loginAsAdmin, showNotification } = useOrder();
  const [selectedRole, setSelectedRole] = useState(defaultTab); // 'rider' | 'admin'
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || 'rider-1');
  const [adminPin, setAdminPin] = useState('');
  const [riderPin, setRiderPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRiderLogin = (e) => {
    e.preventDefault();
    const rider = riders.find(r => r.id === selectedRiderId);
    if (!rider) {
      setErrorMsg('Please select a rider account.');
      return;
    }
    loginAsRider(rider.id);
    onClose();
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin === 'deliveryexpress') {
      loginAsAdmin();
      onClose();
    } else {
      setErrorMsg('Incorrect Admin PIN. (Demo PIN: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-rose-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff & Courier Portal Access</span>
          </div>

          <h3 className="text-xl font-black text-white font-heading">
            Delivery Express Login
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Customers do not need to log in. This portal is for Riders & Dispatchers.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="p-4 sm:p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { setSelectedRole('rider'); setErrorMsg(''); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'rider'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Rider Portal</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setErrorMsg(''); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Staff</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* RIDER LOGIN FORM */}
          {selectedRole === 'rider' && (
            <form onSubmit={handleRiderLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Select Your Registered Courier Profile:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {riders.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRiderId(r.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedRiderId === r.id
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-amber-500" />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{r.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{r.plate} • {r.zone}</span>
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
                  Rider PIN (Optional for Demo / Enter 4 digits)
                </label>
                <input
                  type="password"
                  value={riderPin}
                  onChange={(e) => setRiderPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Login as Courier & Open Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ADMIN LOGIN FORM */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Admin Passcode / Security PIN:
                </label>
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 text-sm"
                />
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  💡 Hint: Enter <strong>1234</strong> to access full dispatcher management.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Authorize & Open Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}