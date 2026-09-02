import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { SERVICES, BRAND, ORDER_STATUSES } from '../../lib/constants';
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
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    orders, 
    riders, 
    assignRider, 
    updateOrderStatus,
    isWithinOperatingHours,
    showNotification
  } = useOrder();

  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'riders' | 'rates' | 'supabase'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.estimatedFare || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const isOpen = isWithinOperatingHours();

  const filteredOrders = orders.filter(o => {
    if (selectedStatusFilter === 'all') return true;
    return o.status === selectedStatusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Operations Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Bookings</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">{orders.length}</span>
            <span className="text-[11px] text-zinc-500 block">All-time errand volume</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Active Dispatches</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">{activeOrdersCount}</span>
            <span className="text-[11px] text-zinc-500 block">{pendingOrdersCount} pending dispatch</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Completed Orders</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-400">{completedOrdersCount}</span>
            <span className="text-[11px] text-zinc-500 block">100% success rate</span>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Gross Delivery Fare</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400">₱{totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-zinc-500 block">Courier earnings & fees</span>
          </div>
        </div>

      </div>

      {/* Admin Subnav Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'dispatch', label: 'Live Dispatch Kanban', icon: LayoutDashboard },
            { id: 'riders', label: 'Fleet & Riders', icon: Users },
            { id: 'rates', label: 'Services & Rates', icon: Sliders },
            { id: 'supabase', label: 'Supabase SQL Setup', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-md' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Operating status banner */}
        <div className="flex items-center gap-2 text-xs bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Hours: <strong className="text-white">{BRAND.operatingHours.display}</strong></span>
        </div>
      </div>

      {/* TAB 1: Live Dispatch Kanban */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-zinc-500 font-semibold">Filter:</span>
            {['all', 'pending', 'assigned', 'purchasing', 'in_transit', 'delivered'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                  selectedStatusFilter === st 
                    ? 'bg-zinc-200 text-zinc-950' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Orders Table / List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Tracking #</th>
                    <th className="p-3.5">Service</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Fare</th>
                    <th className="p-3.5">Assigned Rider</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white">
                        {order.trackingNumber}
                      </td>
                      <td className="p-3.5 font-medium text-rose-400">
                        {order.serviceName}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-200">{order.customerName}</div>
                        <div className="text-[10px] text-zinc-500">{order.customerPhone}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="truncate text-zinc-300"><strong>From:</strong> {order.pickupAddress}</div>
                        <div className="truncate text-zinc-400"><strong>To:</strong> {order.dropoffAddress}</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        ₱{order.estimatedFare}
                      </td>
                      <td className="p-3.5">
                        {order.riderName ? (
                          <span className="font-semibold text-amber-400">{order.riderName}</span>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value) assignRider(order.id, e.target.value);
                            }}
                            defaultValue=""
                            className="bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-rose-500"
                          >
                            <option value="" disabled>Assign Courier...</option>
                            {riders.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ORDER_STATUSES[order.status]?.color || 'bg-zinc-800 text-zinc-300'}`}>
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.proofOfDeliveryUrl && (
                            <a
                              href={order.proofOfDeliveryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 bg-zinc-800 text-zinc-300 rounded hover:text-white"
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

      {/* TAB 2: Riders & Fleet Roster */}
      {activeTab === 'riders' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riders.map(rider => (
            <div key={rider.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={rider.avatar}
                  alt={rider.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{rider.name}</h4>
                  <p className="text-xs text-zinc-400">{rider.phone}</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Motorcycle / Vehicle:</span>
                  <span className="font-medium text-zinc-200">{rider.plate}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Rating:</span>
                  <span className="font-bold text-amber-400">⭐ {rider.rating}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Total Trips:</span>
                  <span className="font-bold text-emerald-400">{rider.trips} completed</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Active on Duty
                </span>
                <button 
                  onClick={() => showNotification(`Contacted ${rider.name}`, 'info')}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium"
                >
                  Radio / SMS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Services & Rates Config */}
      {activeTab === 'rates' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="font-bold text-white text-base">Standard Delivery & Errand Rate Card</h4>
            <p className="text-xs text-zinc-400">Rates configured according to Delivery Express service guidelines</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES.map(service => (
              <div key={service.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">{service.name}</span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {service.badge}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1 pt-1 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <strong className="text-zinc-200">₱{service.baseFare}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Km Rate:</span>
                    <strong className="text-zinc-200">₱{service.perKmRate}/km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling / Errand:</span>
                    <strong className="text-zinc-200">₱{service.errandFee}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Supabase Live Migration Script */}
      {activeTab === 'supabase' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase PostgreSQL Integration</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Copy the schema script to run in your Supabase SQL Editor for production deployment
              </p>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Fallback Mode Active'}
            </span>
          </div>

          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
            <p className="text-zinc-500">// 1. Create a free project at supabase.com</p>
            <p className="text-zinc-500">// 2. Paste `supabase/schema.sql` into Supabase SQL Editor & click Run</p>
            <p className="text-zinc-500">// 3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Environment Variables</p>
          </div>
        </div>
      )}

    </div>
  );
}
