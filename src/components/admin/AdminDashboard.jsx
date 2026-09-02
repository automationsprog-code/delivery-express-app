import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { SERVICES, BRAND, ORDER_STATUSES } from '../../lib/constants';
import { uploadAvatarToStorage } from '../../lib/supabase';
import { 
  Users, 
  Bike, 
  DollarSign, 
  Sliders, 
  QrCode, 
  Radio, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  Send, 
  CheckCircle2, 
  UserPlus, 
  X, 
  Upload, 
  LayoutDashboard,
  ShieldCheck,
  Power,
  Sparkles,
  Camera,
  Loader2,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  Compass,
  UtensilsCrossed,
  Store,
  Flame,
  Tag,
  FileImage,
  Eye,
  EyeOff,
  Lock,
  Key
} from 'lucide-react';
import { fetchPanahonWeather, MUNICIPALITY_COORDS } from '../../services/weatherService';

const MUNICIPALITIES = [
  'Balamban',
  'Asturias',
  'Toledo City',
  'Tuburan',
  'Pinamungajan',
  'Tabuelan',
  'Other Cebu Municipality'
];

export default function AdminDashboard() {
  const { 
    orders, 
    riders, 
    weather,
    refreshWeather,
    broadcastWeatherAlert,
    servicesList, 
    updateServiceRates, 
    showFareBreakdownDetails,
    setShowFareBreakdownDetails,
    storesList,
    addPartnerStore,
    updatePartnerStore,
    deletePartnerStore,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    paymentSettings, 
    updatePaymentSettings,
    addRider,
    updateRider,
    deleteRider,
    deleteOrder,
    assignRider,
    updateOrderStatus,
    announcement,
    broadcastAdminAnnouncement,
    clearAnnouncement,
    toggleRiderDuty
  } = useOrder();

  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'staff' | 'menus' | 'rates' | 'payments' | 'broadcast'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedWeatherTown, setSelectedWeatherTown] = useState('Balamban');
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Store Management Modals
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Balamban Specialties');
  const [newStoreZone, setNewStoreZone] = useState('Balamban Proper');
  const [newStoreTagline, setNewStoreTagline] = useState('');
  const [newStoreImage, setNewStoreImage] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80');
  const [newStoreFlyer, setNewStoreFlyer] = useState('');

  // Item Modal
  const [targetStoreForMenu, setTargetStoreForMenu] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Specialty');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80');
  const [newItemIsPopular, setNewItemIsPopular] = useState(false);

  // Rates editing state
  const [editingRates, setEditingRates] = useState({});

  // Payment settings state
  const [gcashName, setGcashName] = useState(paymentSettings.gcashName || 'DELIVERY EXPRESS BALAMBAN');
  const [gcashNumber, setGcashNumber] = useState(paymentSettings.gcashNumber || '0917-882-1923');
  const [gcashQrUrl, setGcashQrUrl] = useState(paymentSettings.gcashQrUrl || '');

  // Announcement state
  const [broadcastText, setBroadcastText] = useState('');

  // Add / Edit Rider Modal State
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [uploadingRiderId, setUploadingRiderId] = useState(null);
  
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderPlate, setNewRiderPlate] = useState('');
  const [newRiderZone, setNewRiderZone] = useState('Balamban');
  const [newRiderPassword, setNewRiderPassword] = useState('Pass123');
  const [showNewRiderPass, setShowNewRiderPass] = useState(false);
  const [showEditStaffPass, setShowEditStaffPass] = useState(false);
  const [newRiderAvatar, setNewRiderAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (selectedStatusFilter === 'all') return true;
    return order.status === selectedStatusFilter;
  });

  // Calculate Operational Metrics
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((acc, curr) => {
    return curr.status === 'delivered' ? acc + (curr.estimatedFare || 80) : acc;
  }, 0);

  // Facebook-Style HD Photo Upload directly to Supabase Storage CDN
  const handlePhotoUpload = async (e, targetSetter, riderId = 'avatar') => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Instant local high-definition preview
    const localPreview = URL.createObjectURL(file);
    targetSetter(localPreview);

    // 2. High-speed upload to Supabase Storage 'rider-avatars'
    setUploadingRiderId(riderId);
    try {
      const publicUrl = await uploadAvatarToStorage(file, riderId);
      if (publicUrl) {
        targetSetter(publicUrl);
        if (riderId && riderId !== 'avatar' && riderId !== 'new') {
          updateRider(riderId, { avatar: publicUrl });
        }
      }
    } catch (err) {
      console.warn('Storage upload error:', err);
    } finally {
      setUploadingRiderId(null);
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGcashQrUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRider = (e) => {
    e.preventDefault();
    if (!newRiderName || !newRiderPhone || !newRiderPlate) {
      alert('Please provide name, phone and plate number.');
      return;
    }
    addRider({
      name: newRiderName,
      phone: newRiderPhone,
      plate: newRiderPlate,
      zone: newRiderZone,
      password: newRiderPassword || 'Pass123',
      avatar: newRiderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });
    setNewRiderName('');
    setNewRiderPhone('');
    setNewRiderPlate('');
    setNewRiderPassword('Pass123');
    setNewRiderAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setShowAddRiderModal(false);
  };

  const handleEditRiderSubmit = (e) => {
    e.preventDefault();
    if (!editingRider) return;
    updateRider(editingRider.id, {
      name: editingRider.name,
      phone: editingRider.phone,
      plate: editingRider.plate,
      zone: editingRider.zone,
      password: editingRider.password || 'Pass123',
      avatar: editingRider.avatar || '/rider-nigel.jpg'
    });
    setEditingRider(null);
  };

  const handleSavePaymentSettings = (e) => {
    e.preventDefault();
    updatePaymentSettings({
      gcashName,
      gcashNumber,
      gcashQrUrl
    });
  };

  const handleRateChange = (serviceId, field, value) => {
    setEditingRates(prev => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveRate = (service) => {
    const currentEdits = editingRates[service.id] || {};
    const updated = {
      baseFare: currentEdits.baseFare !== undefined ? currentEdits.baseFare : service.baseFare,
      perKmRate: currentEdits.perKmRate !== undefined ? currentEdits.perKmRate : service.perKmRate,
      errandFee: currentEdits.errandFee !== undefined ? currentEdits.errandFee : service.errandFee
    };
    updateServiceRates(service.id, updated);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    broadcastAdminAnnouncement(broadcastText.trim());
    setBroadcastText('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Operations Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-sm card-float">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Total Bookings</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{orders.length}</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">West Cebu delivery volume</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-sm card-float">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Active Dispatches</span>
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{activeOrdersCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">{pendingOrdersCount} awaiting courier</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-sm card-float">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Completed Orders</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{completedOrdersCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">100% fulfilled</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-sm card-float">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Gross Delivery Fare</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-amber-400">₱{totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Total revenue across Cebu</span>
          </div>
        </div>
      </div>

      {/* Admin Subnav Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'dispatch', label: 'Live Dispatch Board', icon: LayoutDashboard },
            { id: 'staff', label: `Staff & Riders (${riders.length})`, icon: Users },
            { id: 'menus', label: `Food & Menus (${storesList.length})`, icon: UtensilsCrossed },
            { id: 'rates', label: 'Edit Rates & Base Fares', icon: Sliders },
            { id: 'payments', label: 'GCash / QR Payments', icon: QrCode },
            { id: 'broadcast', label: 'Radio Broadcast', icon: Radio }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-rose-600/20 shadow-md' 
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {activeTab === 'menus' ? (
            <button
              onClick={() => setShowAddStoreModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white text-xs font-extrabold rounded-2xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Partner Store</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddRiderModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-extrabold rounded-2xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Staff / Rider</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Live Dispatch Kanban */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-slate-400 dark:text-zinc-500 font-semibold">Filter:</span>
            {['all', 'pending', 'assigned', 'purchasing', 'in_transit', 'delivered'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                  selectedStatusFilter === st
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {st} ({st === 'all' ? orders.length : orders.filter(o => o.status === st).length})
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-bold">
                    <th className="py-3 px-4">Tracking #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Fare (₱)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Rider</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const statusBadge = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-slate-100' };
                      const assignedRider = riders.find(r => r.id === order.riderId);

                      return (
                        <tr key={order.id || order.trackingNumber} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                            {order.trackingNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {order.customerAvatar ? (
                                <img
                                  src={order.customerAvatar}
                                  alt="Customer"
                                  className="w-7 h-7 rounded-full object-cover border border-emerald-400 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'C'}
                                </div>
                              )}
                              <div className="truncate max-w-[130px]">
                                <span className="font-bold text-slate-900 dark:text-white block truncate">
                                  {order.customerName}
                                </span>
                                <span className="text-[10px] text-slate-400 block">{order.customerPhone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                            {order.serviceName}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500">
                            <span className="text-slate-800 dark:text-zinc-200">{order.pickupAddress}</span>
                            <span className="mx-1 text-slate-400">→</span>
                            <span className="text-slate-800 dark:text-zinc-200">{order.dropoffAddress}</span>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                            ₱{((order.estimatedFare || 0) + (order.itemCost || 0)).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {order.status === 'delivered' ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-black shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{order.riderName || 'Nigel'} (Completed)</span>
                              </div>
                            ) : order.status === 'cancelled' ? (
                              <span className="text-xs text-slate-400 font-bold italic bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                Cancelled
                              </span>
                            ) : (
                              <select
                                value={order.riderId || ''}
                                onChange={(e) => assignRider(order.id || order.trackingNumber, e.target.value)}
                                className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500"
                              >
                                <option value="">Unassigned</option>
                                {riders.map(r => (
                                  <option key={r.id} value={r.id}>{r.name} ({r.zone})</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Cancel/Delete order #${order.trackingNumber}?`)) {
                                  deleteOrder(order.trackingNumber || order.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & RIDERS MANAGEMENT SUITE */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                Delivery Express Courier & Staff Roster
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage couriers, photo upload, toggle duty, and edit vehicle information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riders.map(rider => {
              const statusColors = {
                active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
                break: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
                offline: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              };

              const currentStatus = rider.status || (rider.isOnline ? 'active' : 'offline');

              return (
                <div 
                  key={rider.id} 
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 card-float"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <img
                          src={rider.avatar || '/rider-nigel.jpg'}
                          alt={rider.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white dark:bg-zinc-800"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${currentStatus === 'active' ? 'bg-emerald-500' : currentStatus === 'break' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        
                        {/* Facebook-style 1-tap Camera Upload on Avatar */}
                        <label 
                          title="Change Profile Picture (Upload High-Res Photo)"
                          className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white"
                        >
                          {uploadingRiderId === rider.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Camera className="w-5 h-5 text-white" />
                              <span className="text-[8px] font-bold mt-0.5">Edit</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handlePhotoUpload(e, (url) => updateRider(rider.id, { avatar: url }), rider.id)} 
                          />
                        </label>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {rider.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{rider.phone}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusColors[currentStatus] || statusColors.active}`}>
                      {currentStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Vehicle / Plate:</span>
                      <strong className="text-slate-900 dark:text-zinc-200">{rider.plate}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Assigned Zone:</span>
                      <strong className="text-rose-600 dark:text-rose-400 truncate max-w-[170px]">{rider.zone}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Rating & Trips:</span>
                      <strong className="text-slate-900 dark:text-white">⭐ {rider.rating} ({rider.trips || 0} trips)</strong>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => toggleRiderDuty(rider.id)}
                      className="flex-1 py-2 px-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-[11px] font-bold transition-colors"
                      title="Cycle status: Active -> On Break -> Offline"
                    >
                      Status: {currentStatus.toUpperCase()}
                    </button>

                    <button
                      onClick={() => setEditingRider(rider)}
                      className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl"
                      title="Edit Staff Info & Photo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${rider.name} from roster and unassign any active jobs?`)) deleteRider(rider.id);
                      }}
                      className="p-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl"
                      title="Remove Rider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PARTNER STORES & FOOD MENUS CATALOG */}
      {activeTab === 'menus' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Partner Stores & Food Menus Management
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Manage Balamban restaurants, upload dishes, prices, and high-res food menus.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddStoreModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-2xl shadow-md transition-all inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Partner Store</span>
            </button>
          </div>

          {/* Stores List Grid */}
          <div className="space-y-5">
            {storesList.map((store) => (
              <div 
                key={store.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Store Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-zinc-800 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                          {store.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">⭐ {store.rating || 5.0}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {store.zone} • {store.openingHours}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Store */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetStoreForMenu(store);
                        setNewItemName('');
                        setNewItemPrice('');
                        setNewItemDescription('');
                        setNewItemCategory('Specialty');
                        setNewItemImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80');
                        setNewItemIsPopular(false);
                      }}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Food Dish / Item</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove store "${store.name}" and all its menu items?`)) {
                          deletePartnerStore(store.id);
                        }
                      }}
                      className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl"
                      title="Delete Store"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items Grid for this Store */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2.5">
                    Food Dishes / Products ({(store.items || []).length}):
                  </h4>

                  {(store.items || []).length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-zinc-950 rounded-2xl">
                      No menu items yet. Click "+ Add Food Dish / Item" to add dishes.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(store.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800/80 flex items-start justify-between gap-3"
                        >
                          <div className="flex gap-2.5 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </h5>
                              <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                                ₱{item.price}
                              </span>
                              {item.isPopular && (
                                <span className="text-[9px] font-extrabold text-amber-500">
                                  ⭐ Bestseller
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteMenuItem(store.id, item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EDIT RATES & BASE FARES (ADMIN ONLY) */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent p-4 sm:p-5 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-zinc-950 rounded-2xl shadow-sm">
                <Sliders className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Admin Courier Rates & Customer Fare Breakdown
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Customize Base Fare (₱), Per-Km Rate (₱/km), Errand Fee, and toggle customer breakdown visibility.
                </p>
              </div>
            </div>

            {/* Customer Breakdown Hide/Show Toggle */}
            <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Customer Breakdown Details:
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !showFareBreakdownDetails;
                  setShowFareBreakdownDetails(nextVal);
                  try { localStorage.setItem('delivery_express_show_breakdown', String(nextVal)); } catch (_) {}
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  showFareBreakdownDetails
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700'
                }`}
              >
                {showFareBreakdownDetails ? '👁️ SHOWN (Distance & Errand Visible)' : '🔒 HIDDEN (Clean Single Fare)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesList.map(service => {
              const edits = editingRates[service.id] || {};
              const currentBase = edits.baseFare !== undefined ? edits.baseFare : service.baseFare;
              const currentPerKm = edits.perKmRate !== undefined ? edits.perKmRate : service.perKmRate;
              const currentErrand = edits.errandFee !== undefined ? edits.errandFee : service.errandFee;

              return (
                <div 
                  key={service.id} 
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 card-float"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm">{service.name}</h5>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">{service.badge}</span>
                    </div>
                    <button
                      onClick={() => handleSaveRate(service)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Rate</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-zinc-400 font-bold mb-1">
                        Base Fare (₱)
                      </label>
                      <input
                        type="number"
                        value={currentBase}
                        onChange={(e) => handleRateChange(service.id, 'baseFare', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-zinc-400 font-bold mb-1">
                        Per Km Distance Rate (₱/km)
                      </label>
                      <input
                        type="number"
                        value={currentPerKm}
                        onChange={(e) => handleRateChange(service.id, 'perKmRate', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 dark:text-zinc-400 font-bold mb-1">
                        Special Handling / Errand Fee (₱)
                      </label>
                      <input
                        type="number"
                        value={currentErrand}
                        onChange={(e) => handleRateChange(service.id, 'errandFee', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: GCASH / QR PAYMENTS MANAGER */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  GCash & QR Code Payment Settings
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Upload your official Delivery Express GCash QR code for customer scan-to-pay
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  GCash Registered Account Name
                </label>
                <input
                  type="text"
                  required
                  value={gcashName}
                  onChange={(e) => setGcashName(e.target.value)}
                  placeholder="e.g. DELIVERY EXPRESS BALAMBAN"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl p-3 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  GCash Registered Mobile / Account #
                </label>
                <input
                  type="text"
                  required
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="e.g. 0917-882-1923"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl p-3 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Upload GCash QR Code Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-2xl border border-slate-300 dark:border-zinc-700 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Upload QR Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG or Screenshot</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md"
              >
                Save Payment Settings
              </button>
            </form>
          </div>

          {/* Customer Live Preview of QR */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-900 via-indigo-950 to-zinc-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] bg-white/20 uppercase font-extrabold px-3 py-1 rounded-full">
              Customer GCash Scan Preview
            </span>
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <img
                src={gcashQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DELIVERY_EXPRESS_GCASH'}
                alt="GCash QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-300">{gcashName}</p>
              <p className="text-xs text-blue-200 font-mono mt-0.5">{gcashNumber}</p>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
              Customers will see this QR Code on their phone screen when they choose GCash payment upon booking.
            </p>
          </div>

        </div>
      )}

      {/* TAB 5: PANAHON WEATHER RADAR & RADIO BROADCAST TO STAFF */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: PANAHON Realtime Weather Station */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-zinc-900 to-sky-950 text-white border border-sky-500/20 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                    <span>PANAHON Live Weather Radar</span>
                    <span className="text-[9px] bg-sky-500 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase">PAGASA Feed</span>
                  </h4>
                  <p className="text-[11px] text-sky-200/70">Real-time Doppler meteorology for West Cebu towns</p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsRefreshingWeather(true);
                  await refreshWeather(selectedWeatherTown);
                  setIsRefreshingWeather(false);
                }}
                title="Refresh Live Weather"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-sky-300 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Municipality Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['Balamban', 'Asturias', 'Toledo City', 'Tuburan', 'Pinamungajan'].map(town => (
                <button
                  key={town}
                  type="button"
                  onClick={async () => {
                    setSelectedWeatherTown(town);
                    setIsRefreshingWeather(true);
                    await refreshWeather(town);
                    setIsRefreshingWeather(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] ${
                    selectedWeatherTown === town
                      ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {town}
                </button>
              ))}
            </div>

            {/* Live Weather Telemetry Dashboard */}
            {weather && (
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl">{weather.icon}</span>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white">{weather.temp}°C</div>
                      <div className="text-xs text-sky-300 font-bold">{weather.condition}</div>
                      <div className="text-[10px] text-slate-400">Feels like {weather.feelsLike}°C • {weather.location}</div>
                    </div>
                  </div>

                  <div className="text-right space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 text-blue-300 justify-end">
                      <Wind className="w-3.5 h-3.5" />
                      <span>{weather.windSpeed} km/h wind</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-300 justify-end">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>{weather.humidity}% humidity</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300 justify-end font-bold">
                      <span>{weather.rainMm > 0 ? `🌧️ ${weather.rainMm} mm rain` : '☀️ 0.0 mm rain'}</span>
                    </div>
                  </div>
                </div>

                {/* Road Safety Advisory */}
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  weather.isRainy 
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' 
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                }`}>
                  <Compass className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="block text-white font-extrabold">Courier Safety & Road Advisory:</strong>
                    <span className="text-[11px] leading-relaxed">{weather.advisory}</span>
                  </div>
                </div>

                {/* 1-Click Broadcast Panahon Action */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await broadcastWeatherAlert(selectedWeatherTown);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-zinc-950 font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Radio className="w-4 h-4 text-zinc-950" />
                    <span>1-Click Broadcast Panahon to Couriers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBroadcastText(`🌧️ PANAHON WEATHER (${weather.location}): ${weather.condition}, ${weather.temp}°C. Wind: ${weather.windSpeed}km/h. Advisory: ${weather.advisory}`);
                    }}
                    className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/10"
                    title="Insert weather into text editor"
                  >
                    Insert 📝
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Custom Radio Dispatch Center */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Radio Broadcast & Courier Dispatch
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Send chime alerts, typhoon advisories, and road status to all courier screens
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Custom Announcement Message:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="e.g. Heavy rain advisory in Balamban & Toledo proper. Drive safely and secure all packages with waterproof cover."
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 via-amber-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmit Radio Announcement</span>
                  </button>
                  {announcement && (
                    <button
                      type="button"
                      onClick={clearAnnouncement}
                      className="px-4 py-3 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-extrabold rounded-2xl text-xs flex items-center gap-1.5 border border-rose-300 dark:border-rose-800 transition-colors"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Stop Broadcast</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              💡 <strong>Tip:</strong> Inig broadcast nimo, motingog ang radio chime sa tanang rider ug costumer nga active sa web application!
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: ADD NEW RIDER WITH PHOTO UPLOAD */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-500" />
                <span>Add Courier / Staff</span>
              </h4>
              <button onClick={() => setShowAddRiderModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRider} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Rider Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={newRiderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-sm bg-white dark:bg-zinc-800"
                  />
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-xl border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-rose-500" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, setNewRiderAvatar)} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  placeholder="e.g. Kuya Reynante"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Active Mobile # *</label>
                <input
                  type="tel"
                  required
                  value={newRiderPhone}
                  onChange={(e) => setNewRiderPhone(e.target.value)}
                  placeholder="e.g. 0917-888-9999"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Motorcycle Model & Plate *</label>
                <input
                  type="text"
                  required
                  value={newRiderPlate}
                  onChange={(e) => setNewRiderPlate(e.target.value)}
                  placeholder="e.g. MIO GEAR - G629MC"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Assigned Municipality
                </label>
                <select
                  value={newRiderZone}
                  onChange={(e) => setNewRiderZone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-rose-500"
                >
                  {MUNICIPALITIES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-rose-500" />
                    <span>Courier Login Password *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Customizable password for Rider login</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewRiderPass ? "text" : "password"}
                    required
                    value={newRiderPassword}
                    onChange={(e) => setNewRiderPassword(e.target.value)}
                    placeholder="e.g. Pass123"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewRiderPass(!showNewRiderPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewRiderPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRiderModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold shadow-md"
                >
                  Save & Add Courier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT RIDER WITH PHOTO UPLOAD */}
      {editingRider && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <span>Edit Staff: {editingRider.name}</span>
              </h4>
              <button onClick={() => setEditingRider(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRiderSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Change Profile Picture (High-Res Cloud Sync)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={editingRider.avatar || '/rider-nigel.jpg'}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white dark:bg-zinc-800"
                    />
                    {uploadingRiderId && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="cursor-pointer px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs">
                      <Camera className="w-4 h-4" />
                      <span>{uploadingRiderId ? 'Uploading to Cloud...' : 'Upload HD Photo (From Phone / PC)'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handlePhotoUpload(e, (url) => setEditingRider({ ...editingRider, avatar: url }), editingRider.id)} 
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingRider({ ...editingRider, avatar: '/rider-nigel.jpg' })}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-[11px] text-center"
                    >
                      Reset to Nigel Default Photo
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingRider.name}
                  onChange={(e) => setEditingRider({ ...editingRider, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Mobile #</label>
                <input
                  type="tel"
                  value={editingRider.phone}
                  onChange={(e) => setEditingRider({ ...editingRider, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Vehicle / Plate</label>
                <input
                  type="text"
                  value={editingRider.plate}
                  onChange={(e) => setEditingRider({ ...editingRider, plate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Assigned Municipality</label>
                <select
                  value={editingRider.zone || 'Balamban'}
                  onChange={(e) => setEditingRider({ ...editingRider, zone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                >
                  {MUNICIPALITIES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Courier Login Password</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">For courier login portal</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditStaffPass ? "text" : "password"}
                    value={editingRider.password || ''}
                    onChange={(e) => setEditingRider({ ...editingRider, password: e.target.value })}
                    placeholder="e.g. Pass123"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditStaffPass(!showEditStaffPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showEditStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRider(null)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-extrabold shadow-md"
                >
                  Update Profile & Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PARTNER STORE / RESTAURANT */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-rose-500" />
                <span>Add Partner Store / Restaurant</span>
              </h4>
              <button onClick={() => setShowAddStoreModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStoreName) return alert('Store name is required.');
                addPartnerStore({
                  name: newStoreName,
                  category: newStoreCategory,
                  zone: newStoreZone,
                  tagline: newStoreTagline,
                  image: newStoreImage,
                  menuFlyerUrl: newStoreFlyer,
                  serviceType: newStoreCategory.includes('Cake') ? 'cake_flower' : newStoreCategory.includes('Convenience') ? 'pasabuy' : 'food_delivery'
                });
                setNewStoreName('');
                setNewStoreTagline('');
                setShowAddStoreModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Store / Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Mang Inasal Gaisano Balamban"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Store Category</label>
                <select
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Balamban Specialties">Balamban Specialties (Liempo/Lechon)</option>
                  <option value="Fast Food & Burgers">Fast Food & Burgers</option>
                  <option value="Filipino & Lutong Bahay">Grills & Lutong Bahay</option>
                  <option value="Cakes, Pastries & Bakery">Cakes & Bakery</option>
                  <option value="Beverages & Milk Tea">Beverages & Milk Tea</option>
                  <option value="Convenience & Groceries">Convenience & Groceries</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Location / Zone in Balamban</label>
                <input
                  type="text"
                  value={newStoreZone}
                  onChange={(e) => setNewStoreZone(e.target.value)}
                  placeholder="e.g. Gaisano Grand Mall Balamban, Town Proper"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Store Tagline / Description</label>
                <input
                  type="text"
                  value={newStoreTagline}
                  onChange={(e) => setNewStoreTagline(e.target.value)}
                  placeholder="e.g. 2-in-1 Unli Rice and Charcoal Grilled Chicken"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Store Banner Image (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStoreImage}
                    onChange={(e) => setNewStoreImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, setNewStoreImage, 'store')} />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black shadow-md"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD MENU ITEM / FOOD DISH TO STORE */}
      {targetStoreForMenu && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-rose-500" />
                  <span>Add Food Dish / Item</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Adding to: <strong>{targetStoreForMenu.name}</strong>
                </p>
              </div>
              <button onClick={() => setTargetStoreForMenu(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newItemName || !newItemPrice) return alert('Dish name and price are required.');
                addMenuItem(targetStoreForMenu.id, {
                  name: newItemName,
                  price: newItemPrice,
                  description: newItemDescription,
                  category: newItemCategory,
                  image: newItemImage,
                  isPopular: newItemIsPopular
                });
                setTargetStoreForMenu(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Dish / Product Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. 1 Whole Crispy Balamban Liempo"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Price (₱) *</label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="e.g. 320"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-black text-sm text-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Description / Portion</label>
                <textarea
                  rows={2}
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="e.g. Rolled pork belly infused with lemongrass & garlic. Good for 3-4 persons."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Food Photo (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemImage}
                    onChange={(e) => setNewItemImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, setNewItemImage, 'dish')} />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBestseller"
                  checked={newItemIsPopular}
                  onChange={(e) => setNewItemIsPopular(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="isBestseller" className="font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Mark as ⭐ Bestseller / Popular Dish
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetStoreForMenu(null)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}