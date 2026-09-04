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
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export default function AuthModal({ onClose, defaultTab = 'customer' }) {
  const { 
    riders, 
    registerCustomer,
    loginCustomerWithPassword,
    loginAsCustomer,
    loginAsRider, 
    loginAsAdmin, 
    showNotification 
  } = useOrder();
  
  const [selectedRole, setSelectedRole] = useState(defaultTab);
  const [customerMode, setCustomerMode] = useState('signup'); // 'signup' | 'signin' | 'google_prompt'
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id || 'b2c77a52-42ae-4f07-a8fa-540722d74fae');
  
  // Passwords
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Input Form
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Customer Sign Up Form (Strict First Name, Last Name, Phone, and Photo Upload)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerAvatar, setCustomerAvatar] = useState('');

  // Customer Sign In Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Handle Photo Upload with Image Compression (Canvas)
  const handleCustomerPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setCustomerAvatar(compressed);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Google Login Form Submission
  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setErrorMsg('Please enter your Google / Gmail address.');
      return;
    }
    const computedName = googleName.trim() || googleEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = computedName.charAt(0).toUpperCase() + computedName.slice(1);
    registerCustomer({
      name: formattedName,
      firstName: formattedName.split(' ')[0] || formattedName,
      lastName: formattedName.split(' ').slice(1).join(' ') || '',
      email: googleEmail.trim().toLowerCase(),
      phone: '',
      avatar: null,
      password: 'GoogleUser123'
    });
    onClose();
  };

  const handleCustomerSignUp = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !customerPassword.trim()) {
      setErrorMsg('Please fill in your First Name, Last Name, Mobile Number, and Password.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    registerCustomer({
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${firstName.toLowerCase().trim()}${lastName.toLowerCase().trim()}@gmail.com`,
      avatar: customerAvatar || null,
      password: customerPassword.trim()
    });
    onClose();
  };

  const handleCustomerSignIn = (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter your registered email/phone and password.');
      return;
    }
    const success = loginCustomerWithPassword(loginIdentifier.trim(), loginPassword.trim());
    if (success) {
      onClose();
    } else {
      setErrorMsg('Incorrect email/phone or password. Please verify your credentials or Sign Up for a new account.');
    }
  };

  const handleRiderLogin = (e) => {
    e.preventDefault();
    const rider = riders.find(r => r.id === selectedRiderId) || riders[0];
    if (!rider) {
      setErrorMsg('No courier found.');
      return;
    }
    
    const storedPass = localStorage.getItem(`rider_pass_${rider.id}`) || rider.password || '1234';
    
    if (passwordInput === storedPass) {
      loginAsRider(rider.id);
      onClose();
    } else {
      setErrorMsg(`Incorrect password for ${rider.name}.`);
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
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-rose-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Delivery Express Authentication</span>
          </div>

          <h3 className="text-xl font-black text-white font-heading">
            {selectedRole === 'customer' ? 'Customer Portal' : selectedRole === 'rider' ? 'Courier Portal' : 'Admin Operations'}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Sync across PC, Mobile, and Courier apps
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Main Portal Switcher */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => { setSelectedRole('customer'); setErrorMsg(''); setCustomerMode('signup'); }}
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

          {/* ========================================================
              CUSTOMER AUTHENTICATION MODULE (CLEAN DIRECT REGISTRATION)
          ======================================================== */}
          {selectedRole === 'customer' && (
            <div className="space-y-4">
              
              {/* Mode Switcher */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setCustomerMode('signup'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    customerMode === 'signup' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create New Account
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => { setCustomerMode('signin'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    customerMode === 'signin' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Existing Sign In
                </button>
              </div>

              {/* CREATE ACCOUNT FORM (STRICT ANTI-SCAM VERIFICATION) */}
              {customerMode === 'signup' && (
                <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
                  
                  {/* Anti-Scam Profile Picture Upload Card */}
                  <div className="bg-rose-50/70 dark:bg-rose-950/40 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Profile Picture (Optional Face Upload)</span>
                      </label>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {customerAvatar ? 'Photo Selected 🟢' : 'Optional'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        {customerAvatar ? (
                          <img
                            src={customerAvatar}
                            alt="Customer Avatar"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-white dark:bg-zinc-800"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-rose-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 shadow-sm">
                            <User className="w-6 h-6 text-slate-400" />
                            <span className="text-[8px] font-bold mt-0.5">No Photo</span>
                          </div>
                        )}
                        {customerAvatar && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="cursor-pointer px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{customerAvatar ? 'Change Photo' : '📷 Snap / Upload Face Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={handleCustomerPhotoUpload}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                          Optional face photo to help rider verify delivery address.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Required First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Maria"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Clara"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        autoComplete="off"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0917-123-4567"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gmail@example.com"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCustomerPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        placeholder="Enter a secure password"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title={showCustomerPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Create Verified Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* SIGN IN FORM */}
              {customerMode === 'signin' && (
                <form onSubmit={handleCustomerSignIn} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Mobile # or Email *</label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="0917-xxx-xxxx or email"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ========================================================
              RIDER AUTHENTICATION MODULE
          ======================================================== */}
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
                        {r.avatar && (r.avatar.startsWith('data:') || r.avatar.startsWith('http') || (r.name && r.name.toLowerCase().includes('nigel') && r.avatar === '/rider-nigel.jpg')) ? (
                          <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-amber-500" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-zinc-950 flex items-center justify-center font-black text-xs border border-amber-500 uppercase">
                            {(r.name || 'R').split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                        )}
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

          {/* ========================================================
              ADMIN AUTHENTICATION MODULE
          ======================================================== */}
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