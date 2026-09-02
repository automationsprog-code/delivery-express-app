import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { X, Lock, KeyRound, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';

export default function ChangePasswordModal({ onClose, userRole, userId }) {
  const { riders, updateRiderPassword, updateAdminPassword, showNotification } = useOrder();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (userRole === 'admin') {
      updateAdminPassword(newPassword);
    } else if (userRole === 'rider' && userId) {
      updateRiderPassword(userId, newPassword);
    }

    showNotification('Password updated securely!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base">Security & Password</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Private encrypted credentials</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              New Secure Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
