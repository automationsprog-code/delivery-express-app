import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { SERVICES, BRAND, ORDER_STATUSES, MUNICIPALITIES_AND_ZONES } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Bike, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Sliders, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Eye,
  Settings,
  Plus,
  Radio,
  UserPlus,
  Trash2,
  Edit2,
  Phone,
  ShieldCheck,
  X,
  MapPin
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    orders, 
    riders, 
    assignRider, 
    updateOrderStatus,
    addRider,
    updateRider,
    toggleRiderDuty,
    deleteRider,
    broadcastAdminAnnouncement,
    isWithinOperatingHours,
    showNotification
  } = useOrder();

  const [activeTab, setActiveTab] = useState('dispatch');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [broadcastText, setBroadcastText] = useState('');

  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderPlate, setNewRiderPlate] = useState('');
  const [newRiderZone, setNewRiderZone] = useState('Balamban Proper / Public Palengke');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.estimatedFare || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const filteredOrders = orders.filter(o => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

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
      zone: newRiderZone
    });
    setNewRiderName('');
    setNewRiderPhone('');
    setNewRiderPlate('');
    setShowAddRiderModal(false);
  };

  const handleEditRiderSubmit = (e) => {
    e.preventDefault();
    if (!editingRider) return;
    updateRider(editingRider.id, {
      name: editingRider.name,
      phone: editingRider.phone,
      plate: editingRider.plate,
      zone: editingRider.zone
    });
    setEditingRider(null);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    broadcastAdminAnnouncement(broadcastText.trim());
    setBroadcastText('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'dispatch', label: 'Live Dispatch Board', icon: LayoutDashboard },
            { id: 'staff', label: `Staff & Riders (${riders.length})`, icon: Users },
            { id: 'broadcast', label: 'Radio Broadcast', icon: Radio },
            { id: 'rates', label: 'Services & Rates', icon: Sliders }
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

        <button
          onClick={() => setShowAddRiderModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-extrabold rounded-2xl flex items-center gap-1.5 shadow-md transition-all ml-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Add Staff / Rider</span>
        </button>
      </div>

      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-slate-400 dark:text-zinc-500 font-semibold">Filter:</span>
            {['all', 'pending', 'assigned', 'purchasing', 'in_transit', 'delivered'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl capitalize font-bold transition-all ${
                  selectedStatusFilter === st 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-950/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Tracking #</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Route Details</th>
                    <th className="p-4">Fare</th>
                    <th className="p-4">Assigned Staff</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {order.trackingNumber}
                      </td>
                      <td className="p-4 font-bold text-rose-600 dark:text-rose-400">
                        {order.serviceName}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">{order.customerPhone}</div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate text-slate-800 dark:text-zinc-300"><strong>From:</strong> {order.pickupAddress}</div>
                        <div className="truncate text-slate-500 dark:text-zinc-400"><strong>To:</strong> {order.dropoffAddress}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₱{order.estimatedFare}
                      </td>
                      <td className="p-4">
                        {order.riderName ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">{order.riderName}</span>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value) assignRider(order.id, e.target.value);
                            }}
                            defaultValue=""
                            className="bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-rose-500"
                          >
                            <option value="" disabled>Assign Courier...</option>
                            {riders.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({r.zone})</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ORDER_STATUSES[order.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-[10px] font-bold transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.proofOfDeliveryUrl && (
                            <a
                              href={order.proofOfDeliveryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:text-slate-900"
                              title="View Proof"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                Delivery Express Courier & Staff Roster
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage couriers across Balamban, Asturias, Toledo, Tuburan, and Pinamungajan
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
                      <div className="relative">
                        <img
                          src={rider.avatar}
                          alt={rider.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${currentStatus === 'active' ? 'bg-emerald-500' : currentStatus === 'break' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
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
                      className="flex-1 py-1.5 px-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-[11px] font-bold transition-colors"
                      title="Cycle status: Active -> On Break -> Offline"
                    >
                      Status: {currentStatus.toUpperCase()}
                    </button>

                    <button
                      onClick={() => setEditingRider(rider)}
                      className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl"
                      title="Edit Staff Info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${rider.name} from roster?`)) deleteRider(rider.id);
                      }}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl"
                      title="Remove Rider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                Radio Announcement Broadcast
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Send an audio chime and banner announcement to all active couriers
              </p>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2">
            <textarea
              rows={3}
              required
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. Heavy rain alert in Balamban & Toledo proper. Drive safely! All riders prioritize cake deliveries."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Announcement Now</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              Standard Rate Card (West Cebu)
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Configured base rates and per-kilometer distance fee
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES.map(service => (
              <div key={service.id} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{service.name}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-md">
                    {service.badge}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1 pt-1 border-t border-slate-200 dark:border-zinc-800/80">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <strong className="text-slate-900 dark:text-zinc-200">₱{service.baseFare}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Km Rate:</span>
                    <strong className="text-slate-900 dark:text-zinc-200">₱{service.perKmRate}/km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling / Errand:</span>
                    <strong className="text-slate-900 dark:text-zinc-200">₱{service.errandFee}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  Assigned Municipality & Zone
                </label>
                <select
                  value={newRiderZone}
                  onChange={(e) => setNewRiderZone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  {MUNICIPALITIES_AND_ZONES.map(m => (
                    <optgroup key={m.municipality} label={m.municipality}>
                      {m.zones.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
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
                  Save & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Assigned Zone</label>
                <select
                  value={editingRider.zone}
                  onChange={(e) => setEditingRider({ ...editingRider, zone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  {MUNICIPALITIES_AND_ZONES.map(m => (
                    <optgroup key={m.municipality} label={m.municipality}>
                      {m.zones.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
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
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}