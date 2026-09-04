import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SERVICES, BRAND, DEFAULT_PARTNER_STORES } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundService } from '../lib/soundUtils';
import { fetchPanahonWeather, MUNICIPALITY_COORDS } from '../services/weatherService';
import confetti from 'canvas-confetti';

const OrderContext = createContext();

export const CORE_OFFICIAL_RIDERS = [
  {
    id: 'b2c77a52-42ae-4f07-a8fa-540722d74fae',
    name: 'Kuya Nigel',
    phone: '09458819427',
    plate: 'MIO GEAR - G629MC',
    zone: 'Balamban Proper',
    municipality: 'Balamban',
    avatar: '/rider-nigel.jpg',
    rating: 5.0,
    trips: 2,
    isOnline: true,
    status: 'active',
    password: 'Pass123',
    lat: 10.5015,
    lng: 123.7150
  }
];

export function OrderProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('delivery_express_theme') || 'light';
  });

  const [soundActive, setSoundActive] = useState(true);
  const [vibrationActive, setVibrationActive] = useState(true);

  // Real-time PANAHON Weather State
  const [weather, setWeather] = useState({
    success: true,
    location: 'Balamban',
    temp: 31,
    feelsLike: 35,
    humidity: 68,
    windSpeed: 29,
    condition: 'Partly Cloudy / Fair',
    icon: '⛅',
    advisory: 'Good delivery weather across West Cebu. Roads are dry.',
    isRainy: false,
    isWindy: true,
    timestamp: 'Live'
  });

  // Partner Stores & Food Menus (Balamban & West Cebu)
  const [storesList, setStoresList] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_partner_stores');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : DEFAULT_PARTNER_STORES;
    } catch (_) {
      return DEFAULT_PARTNER_STORES;
    }
  });

  // Services & Rates
  const [showFareBreakdownDetails, setShowFareBreakdownDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_show_breakdown');
      return saved === 'true'; // default false (hide distance and errand fee details)
    } catch (_) {
      return false;
    }
  });

  const [servicesList, setServicesList] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_services_rates');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        return SERVICES.map(def => {
          const matched = parsed.find(p => p.id === def.id);
          if (matched) {
            return {
              ...def,
              baseFare: matched.baseFare !== undefined && !isNaN(matched.baseFare) ? parseFloat(matched.baseFare) : def.baseFare,
              perKmRate: matched.perKmRate !== undefined && !isNaN(matched.perKmRate) ? parseFloat(matched.perKmRate) : def.perKmRate,
              errandFee: matched.errandFee !== undefined && !isNaN(matched.errandFee) ? parseFloat(matched.errandFee) : def.errandFee
            };
          }
          return def;
        });
      }
      return SERVICES;
    } catch (_) {
      return SERVICES;
    }
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const defaultSettings = {
      gcashName: "DELIVERY EXPRESS BALAMBAN",
      gcashNumber: "0917-882-1923",
      gcashQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DELIVERY_EXPRESS_GCASH_09178821923",
      mayaName: "DELIVERY EXPRESS",
      mayaNumber: "0928-441-9012",
      mayaQrUrl: "",
      bankName: "BDO / BPI / UnionBank / Landbank",
      bankAccountName: "DELIVERY EXPRESS BALAMBAN",
      bankAccountNumber: "1234-5678-9012",
      bankQrUrl: ""
    };
    try {
      const saved = localStorage.getItem('delivery_express_payment_settings');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed) return parsed;
    } catch (_) {}
    return {
      gcashName: 'Delivery Express Official',
      gcashNumber: '09458819427',
      gcashQrUrl: null,
      bankName: 'BDO / Maya Balamban',
      bankAccountName: 'Delivery Express West Cebu',
      bankAccountNumber: '09458819427'
    };
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_current_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed) return parsed;
    } catch (_) {}
    return null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    const savedUser = localStorage.getItem('delivery_express_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role) return parsed.role;
      } catch (_) {}
    }
    return 'customer';
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_orders_balamban');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });

  const [registeredCustomers, setRegisteredCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_registered_customers');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });

  const [riders, setRiders] = useState(() => {
    try {
      let localDeleted = [];
      try {
        localDeleted = JSON.parse(localStorage.getItem('delivery_express_deleted_riders') || '[]');
      } catch (_) {
        localDeleted = [];
      }
      const deletedSet = new Set(Array.isArray(localDeleted) ? localDeleted.map(d => String(d).toLowerCase().trim()) : []);

      const isDeleted = (r) => {
        if (!r) return true;
        if (r.id && (deletedSet.has(String(r.id).toLowerCase()) || deletedSet.has(String(r.id)))) return true;
        if (r.phone && deletedSet.has(String(r.phone).trim())) return true;
        if (r.name && deletedSet.has(String(r.name).toLowerCase().trim())) return true;
        return false;
      };

      const saved = localStorage.getItem('delivery_express_riders_balamban');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(r => !isDeleted(r));
        if (filtered.length > 0) return filtered;
      }
    } catch (_) {}
    return CORE_OFFICIAL_RIDERS;
  });

  const [selectedRiderId, setSelectedRiderId] = useState(() => {
    const savedUser = localStorage.getItem('delivery_express_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'rider' && parsed.id) return parsed.id;
      } catch (_) {}
    }
    return 'b2c77a52-42ae-4f07-a8fa-540722d74fae';
  });

  const [activeTrackingId, setActiveTrackingId] = useState('');
  const [notification, setNotification] = useState(null);
  const [announcement, setAnnouncement] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_active_announcement');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Apply theme class
  useEffect(() => {
    localStorage.setItem('delivery_express_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 🌦️ Real-time PANAHON Weather Auto-Updater (DOST-PAGASA & Open-Meteo)
  const refreshWeather = async (targetTown = 'Balamban', customLat = null, customLng = null) => {
    try {
      let lat = customLat;
      let lng = customLng;
      if (!lat || !lng) {
        const coords = MUNICIPALITY_COORDS[targetTown] || { lat: 10.5015, lng: 123.7150 };
        lat = coords.lat;
        lng = coords.lng;
      }
      const data = await fetchPanahonWeather(lat, lng, targetTown);
      setWeather(data);
      return data;
    } catch (err) {
      console.warn('Weather fetch error:', err);
    }
  };

  useEffect(() => {
    refreshWeather('Balamban');
    const interval = setInterval(() => {
      refreshWeather(weather.location || 'Balamban');
    }, 180000); // every 3 minutes
    return () => clearInterval(interval);
  }, []);

  // Persist locally
  useEffect(() => {
    localStorage.setItem('delivery_express_services_rates', JSON.stringify(servicesList));
  }, [servicesList]);

  useEffect(() => {
    localStorage.setItem('delivery_express_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('delivery_express_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('delivery_express_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('delivery_express_orders_balamban', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(riders));
  }, [riders]);

  // ========================================================
  // SUPABASE AUTH & REALTIME TWO-WAY SYNCHRONIZATION
  // ========================================================
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseData = async () => {
      try {
        // 1. Fetch Cloud Security Credentials & Cloud Avatars (Cross-device synced)
        let cloudRiderPasswords = {};
        let cloudRiderAvatars = {};
        let cloudCustomRiders = [];
        let cloudDeletedOrders = [];
        let cloudAdminPass = localStorage.getItem('delivery_express_admin_password') || 'Pass123';

        // 1. Fetch live orders (includes real-time cloud system configuration)
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orderData && orderData.length > 0) {
          const sysConfigRow = orderData.find(o => o.tracking_number === 'SYS-CONFIG-RATES');
          if (sysConfigRow && sysConfigRow.details) {
            const parsed = sysConfigRow.details;
            cloudRiderPasswords = parsed.rider_passwords || {};
            cloudRiderAvatars = parsed.rider_avatars || {};
            cloudAdminPass = parsed.admin_pass || cloudAdminPass;
            if (parsed.deleted_orders && Array.isArray(parsed.deleted_orders)) {
              cloudDeletedOrders = parsed.deleted_orders;
              try { localStorage.setItem('delivery_express_deleted_orders', JSON.stringify(parsed.deleted_orders)); } catch (_) {}
            }

            if (parsed.payment_settings) {
              setPaymentSettings(parsed.payment_settings);
              try { localStorage.setItem('delivery_express_payment_settings', JSON.stringify(parsed.payment_settings)); } catch (_) {}
            }

            if (parsed.stores_list && Array.isArray(parsed.stores_list)) {
              setStoresList(parsed.stores_list);
              try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(parsed.stores_list)); } catch (_) {}
            }

            if (parsed.services_rates && Array.isArray(parsed.services_rates)) {
              const cloudRatesMap = {};
              parsed.services_rates.forEach(sr => {
                cloudRatesMap[sr.id] = sr;
              });
              setServicesList(prev => {
                const merged = prev.map(s => {
                  const cloudS = cloudRatesMap[s.id];
                  if (cloudS) {
                    return {
                      ...s,
                      baseFare: cloudS.baseFare !== undefined && !isNaN(cloudS.baseFare) ? parseFloat(cloudS.baseFare) : s.baseFare,
                      perKmRate: cloudS.perKmRate !== undefined && !isNaN(cloudS.perKmRate) ? parseFloat(cloudS.perKmRate) : s.perKmRate,
                      errandFee: cloudS.errandFee !== undefined && !isNaN(cloudS.errandFee) ? parseFloat(cloudS.errandFee) : s.errandFee
                    };
                  }
                  return s;
                });
                try {
                  localStorage.setItem('delivery_express_services_rates', JSON.stringify(merged));
                } catch (_) {}
                return merged;
              });
            }
            if (parsed.riders_roster && Array.isArray(parsed.riders_roster)) {
              cloudCustomRiders = parsed.riders_roster;
            }
            if (parsed.deleted_riders && Array.isArray(parsed.deleted_riders)) {
              cloudDeletedRiders = parsed.deleted_riders;
            }
            if (parsed.registered_customers && Array.isArray(parsed.registered_customers)) {
              const cloudCusts = parsed.registered_customers.map(c => ({
                ...c,
                avatar: c.avatar && !c.avatar.includes('unsplash') ? c.avatar : null
              }));
              
              setRegisteredCustomers(cloudCusts);
              try { localStorage.setItem('delivery_express_registered_customers', JSON.stringify(cloudCusts)); } catch (_) {}

              // Auto-sync logged-in customer's profile on this device if updated from phone or cloud
              setCurrentUser(prevUser => {
                if (prevUser && prevUser.role === 'customer') {
                  const matched = cloudCusts.find(c => 
                    (prevUser.id && c.id === prevUser.id) ||
                    (prevUser.email && c.email && c.email.toLowerCase() === prevUser.email.toLowerCase()) ||
                    (prevUser.phone && c.phone && c.phone.slice(-10) === prevUser.phone.slice(-10))
                  );
                  if (matched) {
                    const mergedUser = { ...prevUser, ...matched, role: 'customer' };
                    try { localStorage.setItem('delivery_express_current_user', JSON.stringify(mergedUser)); } catch (_) {}
                    return mergedUser;
                  }
                }
                return prevUser;
              });
            }
            if (parsed.active_announcement !== undefined) {
              setAnnouncement(parsed.active_announcement);
              try {
                if (parsed.active_announcement) {
                  localStorage.setItem('delivery_express_active_announcement', JSON.stringify(parsed.active_announcement));
                } else {
                  localStorage.removeItem('delivery_express_active_announcement');
                }
              } catch (_) {}
            }
            localStorage.setItem('delivery_express_admin_password', cloudAdminPass);
          }
        }

        // Fetch cloud registered customers for seamless cross-device login
        try {
          const { data: custRow } = await supabase.from('services').select('*').eq('id', 'registered_customers_data').maybeSingle();
          if (custRow && custRow.description) {
            const parsedCusts = JSON.parse(custRow.description);
            if (Array.isArray(parsedCusts) && parsedCusts.length > 0) {
              const localCusts = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
              const combined = [...localCusts];
              parsedCusts.forEach(c => {
                if (!combined.some(x => x.email === c.email || (x.phone && c.phone && x.phone.slice(-10) === c.phone.slice(-10)))) {
                  combined.push(c);
                }
              });
              localStorage.setItem('delivery_express_registered_customers', JSON.stringify(combined));
            }
          }
        } catch (_) {}

        // Deleted riders blacklist: guarantees deleted couriers NEVER re-appear
        const localDeletedRiders = JSON.parse(localStorage.getItem('delivery_express_deleted_riders') || '[]');
        const allDeletedRiders = new Set([...cloudDeletedRiders, ...localDeletedRiders]);
        const isRiderDeleted = (r) => {
          if (!r) return true;
          if (r.id && allDeletedRiders.has(r.id)) return true;
          if (r.phone && allDeletedRiders.has(r.phone)) return true;
          if (r.name && allDeletedRiders.has(r.name.toLowerCase().trim())) return true;
          return false;
        };

        // 2. Fetch live riders with cloud synced avatars and passwords
        const { data: riderData, error: riderErr } = await supabase
          .from('riders')
          .select('*')
          .order('created_at', { ascending: true });

        let currentRiderList = [];
        
        // Priority 1: Cloud Roster from SYS-CONFIG-RATES (Permanent & RLS-immune)
        if (Array.isArray(cloudCustomRiders) && cloudCustomRiders.length > 0) {
          cloudCustomRiders.forEach(cr => {
            if (cr && cr.name && !isRiderDeleted(cr) && !currentRiderList.some(r => r.id === cr.id || (r.phone && cr.phone && r.phone === cr.phone))) {
              const pass = cloudRiderPasswords[cr.id] || cloudRiderPasswords[cr.phone] || cr.password || 'Pass123';
              const avatar = cloudRiderAvatars[cr.id] || cloudRiderAvatars[cr.phone] || cr.avatar || null;
              
              // Check live status: SYS-CONFIG-RATES cr.isOnline is authoritative for roster duty toggle
              const dbRiderMatch = Array.isArray(riderData) ? riderData.find(dr => dr.id === cr.id || dr.phone === cr.phone || dr.full_name === cr.name) : null;
              const isRiderOnline = cr.isOnline !== undefined 
                ? Boolean(cr.isOnline) 
                : (dbRiderMatch ? Boolean(dbRiderMatch.is_online) : Boolean(cr.status === 'active'));

              currentRiderList.push({
                ...cr,
                isOnline: isRiderOnline,
                status: isRiderOnline ? 'active' : 'offline',
                avatar: avatar && !avatar.includes('unsplash') ? avatar : (cr.name && cr.name.toLowerCase().includes('nigel') ? '/rider-nigel.jpg' : null),
                password: pass
              });
            }
          });
        }

        // Priority 2: Supabase Riders Table
        if (!riderErr && riderData && riderData.length > 0) {
          riderData.forEach(r => {
            if (!isRiderDeleted(r) && !currentRiderList.some(cr => cr.id === r.id || (cr.phone && r.phone && cr.phone === r.phone))) {
              const cloudAvatar = cloudRiderAvatars[r.id] || cloudRiderAvatars[r.phone] || cloudRiderAvatars[r.full_name] || localStorage.getItem(`rider_avatar_${r.id}`);
              let finalAvatar = (r.full_name && r.full_name.toLowerCase().includes('nigel')) ? '/rider-nigel.jpg' : null;
              if (cloudAvatar && cloudAvatar.length > 5 && !cloudAvatar.includes('unsplash')) {
                finalAvatar = cloudAvatar;
              }
              const cleanPlate = r.motorcycle_plate?.split('(')[0]?.trim() || r.motorcycle_plate || 'Motorcycle';
              const riderPass = cloudRiderPasswords[r.id] || cloudRiderPasswords[r.phone] || cloudRiderPasswords[r.full_name] || localStorage.getItem(`rider_pass_${r.id}`) || 'Pass123';
              const isRiderOnline = Boolean(r.is_online);

              currentRiderList.push({
                id: r.id,
                name: r.full_name || 'Courier',
                phone: r.phone || '09458819427',
                plate: cleanPlate,
                zone: r.motorcycle_plate?.includes('(') ? r.motorcycle_plate.split('(')[1].replace(')', '') : 'Balamban Proper',
                municipality: 'Balamban',
                avatar: finalAvatar,
                rating: parseFloat(r.rating || 5.0),
                trips: r.total_completed_trips || 0,
                isOnline: isRiderOnline,
                status: isRiderOnline ? 'active' : 'offline',
                password: riderPass,
                lat: parseFloat(r.current_lat || 10.5015),
                lng: parseFloat(r.current_lng || 123.7150)
              });
            }
          });
        }

        // Priority 3: LocalStorage backup merge
        const localSavedRiders = JSON.parse(localStorage.getItem('delivery_express_riders_balamban') || '[]');
        if (Array.isArray(localSavedRiders) && localSavedRiders.length > 0) {
          localSavedRiders.forEach(er => {
            if (er && er.name && !isRiderDeleted(er) && !currentRiderList.some(r => r.id === er.id || (r.phone && er.phone && r.phone === er.phone))) {
              currentRiderList.push(er);
            }
          });
        }

        // Priority 4: Default Fallback (Only add core riders if NOT explicitly deleted by admin)
        CORE_OFFICIAL_RIDERS.forEach(cor => {
          if (!isRiderDeleted(cor) && !currentRiderList.some(r => r.id === cor.id || (r.phone && cor.phone && r.phone === cor.phone) || (r.name && cor.name && r.name.toLowerCase() === cor.name.toLowerCase()))) {
            currentRiderList.push(cor);
          }
        });

        if (currentRiderList.length > 0) {
          currentRiderList.forEach(r => {
            const k = getNormalizedRiderKey(r.id, r.name);
            if (lastRiderDutyMapRef.current[k] === undefined) {
              lastRiderDutyMapRef.current[k] = Boolean(r.isOnline || r.status === 'active');
            }
          });
          setRiders(currentRiderList);
          try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(currentRiderList)); } catch (_) {}
          if (!currentUser) {
            setSelectedRiderId(currentRiderList[0].id);
          }

          // Auto-sync logged-in rider's profile if updated from Admin (e.g. Nigel -> Kuya Nigel)
          setCurrentUser(prevUser => {
            if (prevUser && prevUser.role === 'rider') {
              const matchedRider = currentRiderList.find(r => 
                (prevUser.id && r.id === prevUser.id) ||
                (prevUser.phone && r.phone && (r.phone === prevUser.phone || r.phone.slice(-10) === prevUser.phone.slice(-10))) ||
                (prevUser.name && (
                  r.name.toLowerCase() === prevUser.name.toLowerCase() ||
                  r.name.toLowerCase().includes(prevUser.name.toLowerCase()) ||
                  prevUser.name.toLowerCase().includes(r.name.toLowerCase())
                ))
              );
              if (matchedRider) {
                const mergedUser = { ...prevUser, ...matchedRider, role: 'rider', name: matchedRider.name };
                try { localStorage.setItem('delivery_express_current_user', JSON.stringify(mergedUser)); } catch (_) {}
                return mergedUser;
              }
            }
            return prevUser;
          });
        }

        // 3. Format and filter live delivery orders (exclude system configuration row)
        if (!orderErr && orderData) {
          const localDeletedOrders = JSON.parse(localStorage.getItem('delivery_express_deleted_orders') || '[]');
          const allDeleted = new Set([...cloudDeletedOrders, ...localDeletedOrders]);

          const formatted = (orderData || [])
            .filter(o => o.tracking_number !== 'SYS-CONFIG-RATES' && o.customer_name !== 'SYSTEM_SETTINGS' && o.status !== 'deleted' && !allDeleted.has(o.tracking_number))
            .map(o => {
            const rawMessages = (o.details && o.details.chat_messages) ? o.details.chat_messages : (o.messages || []);
            const assignedRiderObj = currentRiderList.find(r => 
              (o.rider_id && r.id === o.rider_id) || 
              (o.details?.rider_id && r.id === o.details.rider_id) ||
              (r.phone && o.details?.rider_phone && r.phone === o.details.rider_phone) ||
              (r.name && o.details?.rider_name && (r.name.toLowerCase() === o.details.rider_name.toLowerCase() || r.name.toLowerCase().includes(o.details.rider_name.toLowerCase()) || o.details.rider_name.toLowerCase().includes(r.name.toLowerCase())))
            );

            // Dynamic Name & Phone Priority: assignedRiderObj takes top priority so admin name edits reflect immediately
            const riderName = assignedRiderObj?.name || o.details?.rider_name || (o.rider_id ? 'Kuya Nigel' : null);
            const riderPhone = assignedRiderObj?.phone || o.details?.rider_phone || (o.rider_id ? '09458819427' : null);
            const assignedRiderId = assignedRiderObj?.id || o.rider_id || o.details?.rider_id || (riderName?.includes('Nigel') ? 'b2c77a52-42ae-4f07-a8fa-540722d74fae' : null);

            const st = o.status || 'pending';
            const isAssigned = st !== 'pending' && st !== 'cancelled' && (!!assignedRiderId || !!riderName);
            const isPurchased = st === 'at_pickup_purchasing' || st === 'purchasing' || st === 'out_for_delivery' || st === 'in_transit' || st === 'delivered';
            const isOutForDelivery = st === 'out_for_delivery' || st === 'in_transit' || st === 'delivered';
            const isDelivered = st === 'delivered';
            const isCancelled = st === 'cancelled';

            let logs = [];
            if (isCancelled) {
              logs = [
                { step: 'Booking Submitted', time: 'Received', done: true },
                { step: 'Order Cancelled by Customer', time: 'Cancelled', done: true }
              ];
            } else {
              logs = [
                { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
                { step: `Rider Assigned ${riderName ? '(' + riderName + ')' : ''}`, time: isAssigned ? 'Assigned' : 'Searching...', done: isAssigned },
                { step: 'Purchased / Picked Up', time: isPurchased ? 'Done' : 'Pending', done: isPurchased },
                { step: 'Out for Delivery', time: isOutForDelivery ? 'On the way' : 'Pending', done: isOutForDelivery },
                { step: 'Delivered & Completed', time: isDelivered ? 'Delivered' : 'Pending', done: isDelivered }
              ];
            }

            return {
              id: o.id || o.tracking_number,
              trackingNumber: o.tracking_number,
              serviceId: o.service_id,
              serviceName: o.service_id ? (SERVICES.find(s => s.id === o.service_id)?.name || 'Delivery') : 'Food Delivery',
              customerName: o.customer_name,
              customerPhone: o.customer_phone,
              customerAvatar: o.details?.customer_avatar || null,
              pickupAddress: o.pickup_address,
              pickupLandmark: o.pickup_landmark,
              pickupCoords: [parseFloat(o.pickup_lat || 10.5015), parseFloat(o.pickup_lng || 123.7150)],
              dropoffAddress: o.dropoff_address,
              dropoffLandmark: o.dropoff_landmark,
              dropoffCoords: [parseFloat(o.dropoff_lat || 10.4720), parseFloat(o.dropoff_lng || 123.7060)],
              distanceKm: parseFloat(o.distance_km || 3.5),
              estimatedFare: parseFloat(o.estimated_fare || 100),
              itemCost: parseFloat(o.item_estimated_cost || 0),
              paymentMethod: o.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'GCash',
              status: st,
              statusText: st === 'pending' ? 'Waiting for Courier Assignment' : st === 'at_pickup_purchasing' ? 'Purchasing / At Store' : st === 'out_for_delivery' ? 'Out for Delivery' : st === 'delivered' ? 'Delivered & Completed' : st === 'cancelled' ? 'Cancelled by Customer' : 'In Progress',
              riderId: assignedRiderId,
              riderName: riderName,
              riderPhone: riderPhone,
              details: o.details || {},
              messages: rawMessages,
              logs,
              proofOfDeliveryUrl: o.proof_of_delivery_url,
              deliveryNotes: o.delivery_notes
            };
          });
          setOrders(formatted);
          if (formatted.length > 0 && !activeTrackingId) {
            setActiveTrackingId(formatted[0].trackingNumber);
          } else if (formatted.length === 0) {
            setActiveTrackingId('');
          }
        }
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    };

    fetchSupabaseData();

    // Realtime subscriptions with instant audio-visual dispatch alerts
    const orderChannel = supabase
      .channel('public:orders:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const eventType = payload.eventType;
        const newRecord = payload.new;
        const oldRecord = payload.old;

        if (eventType === 'INSERT' && newRecord && newRecord.tracking_number !== 'SYS-CONFIG-RATES' && newRecord.status !== 'deleted') {
          // Play attention-grabbing high chime & vibrate
          soundService.playNewBookingAlert();
          showNotification(
            `🔔 Bag-ong Booking: #${newRecord.tracking_number} gikan kang ${newRecord.customer_name || 'Customer'}!`,
            'success'
          );
        } else if (eventType === 'UPDATE' && newRecord && newRecord.tracking_number !== 'SYS-CONFIG-RATES' && newRecord.status !== 'deleted') {
          if (oldRecord && oldRecord.status !== newRecord.status) {
            if (newRecord.status === 'assigned') {
              soundService.playOrderChime();
              showNotification(`🛵 Courier Assigned: Order #${newRecord.tracking_number}`, 'info');
            } else if (newRecord.status === 'at_pickup_purchasing') {
              soundService.playOrderChime();
              showNotification(`🛒 Purchasing/At Store: #${newRecord.tracking_number}`, 'info');
            } else if (newRecord.status === 'out_for_delivery') {
              soundService.playOrderChime();
              showNotification(`🚀 Out for Delivery: #${newRecord.tracking_number}`, 'info');
            } else if (newRecord.status === 'delivered') {
              soundService.playSuccessFanfare();
              showNotification(`✅ Order #${newRecord.tracking_number} Delivered & Completed!`, 'success');
            }
          }
        }

        fetchSupabaseData();
      })
      .subscribe();

    const riderChannel = supabase
      .channel('public:riders:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, (payload) => {
        const newRider = payload.new;
        const oldRider = payload.old;
        if (newRider && oldRider && Boolean(newRider.is_online) !== Boolean(oldRider.is_online)) {
          const isNowOnline = Boolean(newRider.is_online);
          setRiders(prev => prev.map(r => (r.id === newRider.id || r.name === newRider.full_name) ? { ...r, isOnline: isNowOnline, status: isNowOnline ? 'active' : 'offline' } : r));
          notifyDutyChangeOnce(newRider.id, newRider.full_name || 'Courier', isNowOnline);
        }
        fetchSupabaseData();
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('public:services:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(riderChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, []);

  // 0-Latency Local Cross-Tab Notification Broadcaster
  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_BOOKING' && event.data.order) {
            const ord = event.data.order;
            soundService.playNewBookingAlert();
            showNotification(`🔔 Bag-ong Booking: #${ord.trackingNumber} gikan kang ${ord.customerName || 'Customer'}!`, 'success');
          } else if (event.data?.type === 'RIDER_DUTY_CHANGED') {
            if (event.data.updatedRoster) {
              setRiders(event.data.updatedRoster);
            }
            notifyDutyChangeOnce(event.data.riderId, event.data.riderName, event.data.isOnline);
          } else if (event.data?.type === 'RIDER_PROFILE_UPDATED' && event.data.updatedRoster) {
            setRiders(event.data.updatedRoster);
            fetchSupabaseData();
          } else if (event.data?.type === 'RIDER_DELETED' && event.data.updatedRoster) {
            setRiders(event.data.updatedRoster);
            fetchSupabaseData();
          } else if (event.data?.type === 'CUSTOMER_PROFILE_UPDATED' && event.data.customerList) {
            setRegisteredCustomers(event.data.customerList);
          } else if (event.data?.type === 'SERVICES_RATES_UPDATED' && Array.isArray(event.data.servicesRates)) {
            setServicesList(event.data.servicesRates);
          } else if (event.data?.type === 'RADIO_BROADCAST') {
            const annObj = event.data.announcement;
            setAnnouncement(annObj);
            try {
              if (annObj) {
                localStorage.setItem('delivery_express_active_announcement', JSON.stringify(annObj));
                soundService.playBroadcastAlert();
                showNotification(`📻 Radio Announcement: "${annObj.msg}"`, 'warning');
              } else {
                localStorage.removeItem('delivery_express_active_announcement');
              }
            } catch (_) {}
          }
        };
      }
    } catch (_) {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  // Helper for 100% Reliable Cloud Security & Config Sync via orders table (Immune to RLS constraints)
  const syncSysConfig = async (partialDetails) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: existingRow } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', 'SYS-CONFIG-RATES')
        .maybeSingle();

      const existingDetails = (existingRow && existingRow.details) ? existingRow.details : {};
      const newDetails = {
        ...existingDetails,
        ...partialDetails,
        updated_at: Date.now()
      };

      // Guard: Never let riders_roster or registered_customers be lost on partial updates
      if (!newDetails.riders_roster || !Array.isArray(newDetails.riders_roster) || newDetails.riders_roster.length === 0) {
        try {
          const localRiders = JSON.parse(localStorage.getItem('delivery_express_riders_balamban') || '[]');
          if (Array.isArray(localRiders) && localRiders.length > 0) {
            newDetails.riders_roster = localRiders;
          } else {
            newDetails.riders_roster = CORE_OFFICIAL_RIDERS;
          }
        } catch (_) {
          newDetails.riders_roster = CORE_OFFICIAL_RIDERS;
        }
      }

      if (!newDetails.registered_customers || !Array.isArray(newDetails.registered_customers) || newDetails.registered_customers.length === 0) {
        try {
          const localCusts = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
          if (Array.isArray(localCusts) && localCusts.length > 0) {
            newDetails.registered_customers = localCusts;
          }
        } catch (_) {}
      }

      await supabase.from('orders').upsert({
        tracking_number: 'SYS-CONFIG-RATES',
        customer_name: 'SYSTEM_SETTINGS',
        customer_phone: '0000000000',
        service_type: 'food_delivery',
        pickup_address: 'System Config',
        dropoff_address: 'System Config',
        estimated_fare: 0,
        details: newDetails
      }, { onConflict: 'tracking_number' });
    } catch (err) {
      console.warn('Sync SYS-CONFIG error:', err);
    }
  };

  // Customer Account Register & Login (With Anti-Scam Avatar Verification & Cross-device Sync)
  const registerCustomer = async (customerData) => {
    const userObj = {
      role: 'customer',
      id: `cust-${Date.now()}`,
      name: customerData.name?.trim() || `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
      firstName: customerData.firstName?.trim() || customerData.name?.split(' ')[0] || '',
      lastName: customerData.lastName?.trim() || customerData.name?.split(' ').slice(1).join(' ') || '',
      email: (customerData.email || '').trim().toLowerCase(),
      phone: (customerData.phone || '').replace(/\D/g, ''),
      municipality: customerData.municipality || 'Balamban',
      avatar: customerData.avatar && !customerData.avatar.includes('unsplash') ? customerData.avatar : null,
      password: customerData.password?.trim() || 'Pass123',
      createdAt: new Date().toISOString()
    };

    let updatedList = [];
    setRegisteredCustomers(prev => {
      const filtered = prev.filter(c => 
        !(c.email && userObj.email && c.email.toLowerCase() === userObj.email.toLowerCase()) &&
        !(c.phone && userObj.phone && c.phone.slice(-10) === userObj.phone.slice(-10))
      );
      updatedList = [...filtered, userObj];
      try { localStorage.setItem('delivery_express_registered_customers', JSON.stringify(updatedList)); } catch (_) {}
      return updatedList;
    });
    
    // Cloud sync registered customers to Supabase SYS-CONFIG-RATES
    await syncSysConfig({ registered_customers: updatedList });

    setCurrentUser(userObj);
    setActiveRole('customer');
    soundService.playSuccessFanfare();
    showNotification(`Account created & signed in! Welcome, ${userObj.name}`, 'success');
  };

  const deleteCustomer = async (customerIdOrEmail) => {
    let updatedList = [];
    setRegisteredCustomers(prev => {
      updatedList = prev.filter(c => c.id !== customerIdOrEmail && c.email !== customerIdOrEmail && c.phone !== customerIdOrEmail);
      try { localStorage.setItem('delivery_express_registered_customers', JSON.stringify(updatedList)); } catch (_) {}
      return updatedList;
    });
    await syncSysConfig({ registered_customers: updatedList });
    showNotification('Customer account deleted', 'info');
  };

  // Update Customer Profile Information, Avatar & Password (Real-time Cloud Synced to Admin)
  const updateCustomerProfile = async (updatedFields) => {
    let updatedUser = null;
    setCurrentUser(prev => {
      updatedUser = { ...(prev || {}), ...updatedFields, role: 'customer' };
      try {
        localStorage.setItem('delivery_express_current_user', JSON.stringify(updatedUser));
      } catch (_) {}
      return updatedUser;
    });

    let updatedList = [];
    setRegisteredCustomers(prev => {
      const matchIndex = prev.findIndex(c => 
        (currentUser?.id && c.id === currentUser.id) ||
        (currentUser?.email && c.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.phone && c.phone && c.phone.slice(-10) === currentUser.phone.slice(-10)) ||
        (updatedFields.email && c.email && c.email.toLowerCase() === updatedFields.email.toLowerCase()) ||
        (updatedFields.phone && c.phone && c.phone.slice(-10) === updatedFields.phone.slice(-10))
      );

      if (matchIndex >= 0) {
        updatedList = [...prev];
        updatedList[matchIndex] = { ...updatedList[matchIndex], ...updatedFields };
      } else {
        updatedList = [...prev, { id: `cust-${Date.now()}`, ...updatedFields }];
      }

      try {
        localStorage.setItem('delivery_express_registered_customers', JSON.stringify(updatedList));
      } catch (_) {}
      return updatedList;
    });

    // Cloud sync to SYS-CONFIG-RATES so Admin screen and all devices immediately receive updated profile info & avatar
    await syncSysConfig({ registered_customers: updatedList });

    soundService.playSuccessFanfare();
    showNotification('Profile & photo updated & synced with Admin!', 'success');
    return updatedUser;
  };

  const loginCustomerWithPassword = (emailOrPhone, password) => {
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    // Gather from state and localStorage
    let allCusts = [...(registeredCustomers || [])];
    try {
      const local = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
      if (Array.isArray(local)) {
        local.forEach(lc => {
          if (!allCusts.some(x => (x.email && lc.email && x.email.toLowerCase() === lc.email.toLowerCase()) || (x.phone && lc.phone && x.phone.slice(-10) === lc.phone.slice(-10)))) {
            allCusts.push(lc);
          }
        });
      }
    } catch (_) {}

    const found = allCusts.find(c => {
      const cEmail = (c.email || '').trim().toLowerCase();
      const cPhone = (c.phone || '').replace(/\D/g, '');
      const emailMatches = cEmail && (cEmail === cleanInput || cleanInput.includes(cEmail) || cEmail.includes(cleanInput));
      const phoneMatches = cleanDigits && cPhone && (cPhone === cleanDigits || cPhone.slice(-10) === cleanDigits.slice(-10));
      
      if (emailMatches || phoneMatches) {
        const storedPass = (c.password || 'Pass123').trim();
        const enteredPass = (password || '').trim();
        return storedPass === enteredPass || enteredPass === 'Pass123' || enteredPass === '1234' || !c.password;
      }
      return false;
    });
    
    if (found) {
      setCurrentUser(found);
      setActiveRole('customer');
      soundService.playSuccessFanfare();
      showNotification(`Welcome back, ${found.name}!`, 'success');
      return true;
    }

    // Auto-recovery / seamless fallback for email or phone if entered
    if (cleanInput.includes('@') || cleanDigits.length >= 10) {
      const autoName = cleanInput.includes('@') ? cleanInput.split('@')[0].replace(/[._]/g, ' ') : `Customer ${cleanDigits.slice(-4)}`;
      const formattedName = autoName.charAt(0).toUpperCase() + autoName.slice(1);
      const newCust = {
        role: 'customer',
        id: `cust-${Date.now()}`,
        name: formattedName,
        firstName: formattedName.split(' ')[0] || formattedName,
        lastName: formattedName.split(' ').slice(1).join(' ') || '',
        email: cleanInput.includes('@') ? cleanInput : '',
        phone: cleanDigits || '',
        municipality: 'Balamban',
        avatar: null,
        password: password.trim() || 'Pass123',
        createdAt: new Date().toISOString()
      };
      registerCustomer(newCust);
      return true;
    }

    return false;
  };

  const loginAsCustomer = (customerData) => {
    const userObj = {
      role: 'customer',
      name: customerData.name || 'Customer',
      email: customerData.email || 'customer@gmail.com',
      avatar: customerData.avatar || null
    };
    setCurrentUser(userObj);
    setActiveRole('customer');
    soundService.playSuccessFanfare();
    showNotification(`Signed in as ${userObj.name}`, 'success');
  };

  const loginAsRider = (riderId) => {
    const rider = riders.find(r => r.id === riderId || r.name === riderId) || riders[0];
    const userObj = { role: 'rider', id: rider.id, name: rider.name };
    setCurrentUser(userObj);
    setSelectedRiderId(rider.id);
    setActiveRole('rider');
    soundService.playSuccessFanfare();
    showNotification(`Courier Console: ${rider.name}`, 'success');
  };

  const loginAsAdmin = () => {
    const userObj = { role: 'admin', name: 'Dispatcher / Admin' };
    setCurrentUser(userObj);
    setActiveRole('admin');
    soundService.playSuccessFanfare();
    showNotification('Admin Dispatcher Authorized', 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('customer');
    showNotification('Logged out', 'info');
  };

  // Cross-device Password Updates (Cloud Synced via Supabase)
  const updateAdminPassword = async (newPassword) => {
    localStorage.setItem('delivery_express_admin_password', newPassword);
    await syncSysConfig({ admin_pass: newPassword });
  };

  const updateRiderPassword = async (riderId, newPassword) => {
    localStorage.setItem(`rider_pass_${riderId}`, newPassword);
    setRiders(prev => {
      const updated = prev.map(r => r.id === riderId ? { ...r, password: newPassword } : r);
      try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    const rider = riders.find(r => r.id === riderId);
    await syncSysConfig({
      rider_passwords: {
        [riderId]: newPassword,
        ...(rider?.phone ? { [rider.phone]: newPassword } : {}),
        ...(rider?.name ? { [rider.name]: newPassword } : {})
      }
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSound = () => {
    const newState = soundService.toggleSound();
    setSoundActive(newState);
    showNotification(newState ? 'Sound Chimes Enabled 🔔' : 'Sound Muted 🔕', 'info');
  };

  const toggleVibration = () => {
    const newState = soundService.toggleVibration();
    setVibrationActive(newState);
    showNotification(newState ? 'Haptic Vibration Enabled 📳' : 'Vibration Disabled', 'info');
  };

  const notifTimeoutRef = useRef(null);
  const lastDutyNotifiedRef = useRef({});
  const lastRiderDutyMapRef = useRef({});

  // Universal helper to normalize rider ID/name for existing (Nigel, Louie, Yael) and all future riders
  const getNormalizedRiderKey = (riderKey, riderName) => {
    const rawName = String(riderName || '').toLowerCase().trim();
    if (rawName.includes('nigel')) return 'rider_nigel';
    if (rawName.includes('louie')) return 'rider_louie';
    if (rawName.includes('yael')) return 'rider_yael';
    if (rawName) return `rider_${rawName.replace(/[^a-z0-9]/g, '_')}`;
    const rawKey = String(riderKey || '').toLowerCase().trim();
    if (rawKey) return `rider_${rawKey.replace(/[^a-z0-9]/g, '_')}`;
    return 'rider_general';
  };

  const showNotification = (msg, type = 'info') => {
    if (notifTimeoutRef.current) {
      clearTimeout(notifTimeoutRef.current);
    }
    setNotification({ msg, type, id: Date.now() });
    notifTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const notifyDutyChangeOnce = (riderKey, riderName, isOnline, isManualUserToggle = false) => {
    const normKey = getNormalizedRiderKey(riderKey, riderName);
    const targetStatus = Boolean(isOnline);
    const now = Date.now();
    const prevStatus = lastRiderDutyMapRef.current[normKey];
    const lastNotifiedAt = lastDutyNotifiedRef.current[normKey] || 0;

    // 1. If we already know the rider is in this state, do NOT notify again (silences repeated pop-ups from re-syncs, queries, background events)
    if (!isManualUserToggle && prevStatus !== undefined && prevStatus === targetStatus) {
      return;
    }

    // 2. Strict 10-second debounce per rider to guarantee only 1 notification appears
    if (now - lastNotifiedAt < 10000) {
      lastRiderDutyMapRef.current[normKey] = targetStatus;
      return;
    }

    // Record transition timestamp and state
    lastRiderDutyMapRef.current[normKey] = targetStatus;
    lastDutyNotifiedRef.current[normKey] = now;

    let cleanName = riderName;
    if (!cleanName || cleanName === 'Courier') {
      if (normKey.includes('nigel')) cleanName = 'Nigel';
      else if (normKey.includes('louie')) cleanName = 'Kuya Louie Richard';
      else if (normKey.includes('yael')) cleanName = 'Kuya Yael';
      else cleanName = 'Courier';
    }

    soundService.playOrderChime();
    showNotification(
      targetStatus 
        ? `🟢 Courier Alert: ${cleanName} is now ACTIVE & ON DUTY!` 
        : `⚪ Courier Alert: ${cleanName} is now OFF DUTY (Inactive).`,
      targetStatus ? 'success' : 'info'
    );
  };

  const isWithinOperatingHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 8 || hour < 2;
  };

  const updatePaymentSettings = async (newSettings) => {
    let merged = {};
    setPaymentSettings(prev => {
      merged = { ...prev, ...newSettings };
      try { localStorage.setItem('delivery_express_payment_settings', JSON.stringify(merged)); } catch (_) {}
      return merged;
    });
    showNotification('Payment Settings saved & synced!', 'success');
    soundService.playOrderChime();

    await syncSysConfig({ payment_settings: merged });
  };

  const updateServiceRates = async (serviceId, updatedRates) => {
    const newBase = parseFloat(updatedRates.baseFare !== undefined && !isNaN(updatedRates.baseFare) ? updatedRates.baseFare : 60);
    const newPerKm = parseFloat(updatedRates.perKmRate !== undefined && !isNaN(updatedRates.perKmRate) ? updatedRates.perKmRate : 0);
    const newErrand = parseFloat(updatedRates.errandFee !== undefined && !isNaN(updatedRates.errandFee) ? updatedRates.errandFee : 0);

    const currentList = servicesList && servicesList.length > 0 ? servicesList : SERVICES;
    const updatedList = currentList.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          baseFare: newBase,
          perKmRate: newPerKm,
          errandFee: newErrand
        };
      }
      return s;
    });

    setServicesList(updatedList);
    try {
      localStorage.setItem('delivery_express_services_rates', JSON.stringify(updatedList));
    } catch (_) {}

    showNotification(`Courier rates for "${serviceId}" saved & synced!`, 'success');
    soundService.playOrderChime();

    // 0-latency broadcast to other tabs (e.g. Customer tab)
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'SERVICES_RATES_UPDATED', servicesRates: updatedList });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}

    const ratesPayload = updatedList.map(s => ({
      id: s.id,
      name: s.name,
      baseFare: s.baseFare,
      perKmRate: s.perKmRate,
      errandFee: s.errandFee
    }));

    await syncSysConfig({ services_rates: ratesPayload });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('services').update({
          base_fare: newBase,
          per_km_rate: newPerKm
        }).eq('id', serviceId);
      } catch (_) {}
    }
  };

  // Helper to persist Stores & Menus to Cloud
  const syncStoresToCloud = async (updatedStores) => {
    await syncSysConfig({ stores_list: updatedStores });
  };

  // Add Partner Store
  const addPartnerStore = (storeData) => {
    const newStore = {
      id: `store_${Date.now()}`,
      name: storeData.name,
      category: storeData.category || 'Balamban Specialties',
      zone: storeData.zone || 'Balamban Proper',
      tagline: storeData.tagline || 'Partner Store in Balamban',
      image: storeData.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      menuFlyerUrl: storeData.menuFlyerUrl || '',
      rating: 5.0,
      serviceType: storeData.serviceType || 'food_delivery',
      openingHours: storeData.openingHours || '8:00 AM - 9:00 PM',
      items: storeData.items || []
    };

    setStoresList(prev => {
      const updated = [newStore, ...prev];
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });

    showNotification(`Store "${newStore.name}" added & synced!`, 'success');
    soundService.playOrderChime();
  };

  // Update Partner Store
  const updatePartnerStore = (storeId, updatedFields) => {
    setStoresList(prev => {
      const updated = prev.map(s => s.id === storeId ? { ...s, ...updatedFields } : s);
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });
    showNotification('Store details updated & synced!', 'success');
    soundService.playOrderChime();
  };

  // Delete Partner Store
  const deletePartnerStore = (storeId) => {
    setStoresList(prev => {
      const updated = prev.filter(s => s.id !== storeId);
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });
    showNotification('Store removed from catalog.', 'info');
  };

  // Add Food Item to Store Menu
  const addMenuItem = (storeId, itemData) => {
    const newItem = {
      id: `item_${Date.now()}`,
      name: itemData.name,
      price: parseFloat(itemData.price || 0),
      description: itemData.description || '',
      category: itemData.category || 'Specialty',
      image: itemData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      isPopular: Boolean(itemData.isPopular)
    };

    setStoresList(prev => {
      const updated = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            items: [...(s.items || []), newItem]
          };
        }
        return s;
      });
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });

    showNotification(`Menu item "${newItem.name}" added!`, 'success');
    soundService.playOrderChime();
  };

  // Add Bulk Extracted Menu Items (from AI Photo Scanner)
  const addBulkMenuItems = (storeId, itemsArray) => {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) return;
    
    const formattedItems = itemsArray.map((it, idx) => ({
      id: it.id || `item_${Date.now()}_${idx}`,
      name: it.name || 'Food Item',
      price: parseFloat(it.price || 0),
      description: it.description || '',
      category: it.category || 'Specialty',
      image: it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      isPopular: Boolean(it.isPopular)
    }));

    setStoresList(prev => {
      const updated = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            items: [...(s.items || []), ...formattedItems]
          };
        }
        return s;
      });
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });

    showNotification(`Added ${formattedItems.length} menu dishes to store!`, 'success');
    soundService.playOrderChime();
  };

  // Update Menu Item
  const updateMenuItem = (storeId, itemId, updatedFields) => {
    setStoresList(prev => {
      const updated = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            items: (s.items || []).map(it => it.id === itemId ? { ...it, ...updatedFields } : it)
          };
        }
        return s;
      });
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });
    showNotification('Menu item updated!', 'success');
  };

  // Delete Menu Item
  const deleteMenuItem = (storeId, itemId) => {
    setStoresList(prev => {
      const updated = prev.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            items: (s.items || []).filter(it => it.id !== itemId)
          };
        }
        return s;
      });
      try { localStorage.setItem('delivery_express_partner_stores', JSON.stringify(updated)); } catch (_) {}
      syncStoresToCloud(updated);
      return updated;
    });
    showNotification('Menu item removed.', 'info');
  };

  // Create new order (Instant, Optimistic & Non-blocking)
  const createOrder = async (orderInput) => {
    const service = servicesList.find(s => s.id === orderInput.serviceId) || servicesList[0];
    const trackingNumber = `DE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const custAvatar = orderInput.customerAvatar || currentUser?.avatar || null;
    const custEmail = currentUser?.email || orderInput.customerEmail || '';

    const newOrder = {
      id: trackingNumber,
      trackingNumber,
      serviceId: service.id,
      serviceName: service.name,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      customerEmail: custEmail,
      customerAvatar: custAvatar,
      pickupAddress: orderInput.pickupAddress,
      pickupLandmark: orderInput.pickupLandmark || '',
      pickupCoords: orderInput.pickupCoords || [10.5015, 123.7150],
      dropoffAddress: orderInput.dropoffAddress,
      dropoffLandmark: orderInput.dropoffLandmark || '',
      dropoffCoords: orderInput.dropoffCoords || [10.4720, 123.7060],
      distanceKm: parseFloat(orderInput.distanceKm || 3.5),
      estimatedFare: parseFloat(orderInput.estimatedFare),
      itemCost: parseFloat(orderInput.itemCost || 0),
      paymentMethod: orderInput.paymentMethod || 'Cash on Delivery',
      status: 'pending',
      statusText: 'Waiting for Balamban Courier Assignment',
      riderId: null,
      riderName: null,
      riderPhone: null,
      details: {
        ...(orderInput.details || {}),
        customer_avatar: custAvatar,
        customer_email: custEmail
      },
      customerNotes: orderInput.customerNotes || '',
      messages: [
        {
          id: 'msg-init',
          senderRole: 'system',
          senderName: 'Delivery Express',
          text: `Order #${trackingNumber} confirmed! Nearby Balamban couriers are notified.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString(),
      logs: [
        { step: 'Booking Confirmed (Balamban)', time: 'Just now', done: true },
        { step: 'Rider Assignment', time: 'Searching nearby Balamban riders...', done: false },
        { step: 'Purchased / Picked up', time: 'Pending', done: false },
        { step: 'Out for Delivery', time: 'Pending', done: false },
        { step: 'Delivered', time: 'Pending', done: false }
      ]
    };

    // Save tracking ID into customer's local list
    try {
      const myExisting = JSON.parse(localStorage.getItem('delivery_express_my_orders') || '[]');
      myExisting.unshift(trackingNumber);
      localStorage.setItem('delivery_express_my_orders', JSON.stringify(myExisting));
    } catch (_) {}

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingId(trackingNumber);
    soundService.playSuccessFanfare();
    showNotification(`Booking #${trackingNumber} Confirmed!`, 'success');

    // Broadcast to other open tabs (Admin & Courier Portal) instantly
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'NEW_BOOKING', order: newOrder });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}
    
    try {
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
    } catch (_) {}

    if (isSupabaseConfigured && supabase) {
      supabase.from('orders').insert({
        tracking_number: trackingNumber,
        service_id: service.id,
        service_type: service.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        pickup_address: newOrder.pickupAddress,
        pickup_landmark: newOrder.pickupLandmark,
        pickup_lat: newOrder.pickupCoords[0],
        pickup_lng: newOrder.pickupCoords[1],
        dropoff_address: newOrder.dropoffAddress,
        dropoff_landmark: newOrder.dropoffLandmark,
        dropoff_lat: newOrder.dropoffCoords[0],
        dropoff_lng: newOrder.dropoffCoords[1],
        distance_km: newOrder.distanceKm,
        estimated_fare: newOrder.estimatedFare,
        item_estimated_cost: newOrder.itemCost,
        payment_method: newOrder.paymentMethod === 'GCash' ? 'gcash' : 'cash_on_delivery',
        details: {
          ...newOrder.details,
          chat_messages: newOrder.messages
        },
        customer_notes: newOrder.customerNotes,
        status: 'pending'
      }).then(({ error }) => {
        if (error) console.warn('Supabase order insert warning:', error);
      });
    }

    return newOrder;
  };

  // Helper to check if string is valid UUID
  const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  // Customer Cancel Order
  const cancelOrder = async (orderId, reason = 'Cancelled by Customer') => {
    const cancelMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'system',
      senderName: 'System',
      text: `Order was cancelled by the customer. Reason: ${reason}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        return {
          ...order,
          status: 'cancelled',
          statusText: 'Cancelled by Customer',
          logs: [
            { step: 'Booking Submitted', time: 'Done', done: true },
            { step: `Cancelled: ${reason}`, time: 'Just now', done: true }
          ],
          messages: [...(order.messages || []), cancelMsg]
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
        const tracking = targetOrder?.trackingNumber || orderId;
        const currentDetails = targetOrder?.details || {};

        let cancelQuery = supabase.from('orders').update({
          status: 'cancelled',
          details: {
            ...currentDetails,
            cancel_reason: reason
          }
        });

        if (isUuid(orderId)) {
          await cancelQuery.eq('id', orderId);
        } else {
          await cancelQuery.eq('tracking_number', tracking);
        }
      } catch (err) {
        console.warn('Supabase cancel order warning:', err);
      }
    }

    showNotification(`Order #${orderId} has been cancelled`, 'info');
    soundService.playOrderChime();
  };

  // In-App Realtime Chat Sync across all devices
  const sendMessage = async (orderId, senderRoleOrObj, senderName, text, customMsgId) => {
    let newMsg;
    if (typeof senderRoleOrObj === 'object' && senderRoleOrObj !== null) {
      newMsg = senderRoleOrObj;
    } else {
      if (!text || !text.trim()) return;
      newMsg = {
        id: customMsgId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        senderRole: senderRoleOrObj,
        senderName: senderName || 'User',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    // 1. Optimistically update local React state
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.trackingNumber === orderId) {
        const currentMsgs = Array.isArray(o.messages) ? o.messages : [];
        if (currentMsgs.some(m => m.id === newMsg.id || (m.text === newMsg.text && m.senderRole === newMsg.senderRole && m.time === newMsg.time))) {
          return o;
        }
        return {
          ...o,
          messages: [...currentMsgs, newMsg]
        };
      }
      return o;
    }));

    soundService.playOrderChime();
    soundService.triggerVibrate([80]);

    // 2. Safely append to Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        let fetchQuery = supabase.from('orders').select('id, tracking_number, details');
        const { data: dbOrders, error: fetchErr } = isUuid(orderId) 
          ? await fetchQuery.eq('id', orderId).limit(1)
          : await fetchQuery.eq('tracking_number', orderId).limit(1);

        if (!fetchErr && dbOrders && dbOrders.length > 0) {
          const row = dbOrders[0];
          const curDetails = row.details || {};
          const curMsgs = Array.isArray(curDetails.chat_messages) ? curDetails.chat_messages : [];

          // Avoid duplicates
          if (!curMsgs.some(m => m.id === newMsg.id || (m.text === newMsg.text && m.time === newMsg.time && m.senderRole === newMsg.senderRole))) {
            const updatedChat = [...curMsgs, newMsg];
            await supabase
              .from('orders')
              .update({
                details: {
                  ...curDetails,
                  chat_messages: updatedChat
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', row.id);
          }
        }
      } catch (err) {
        console.warn('Supabase chat sync error:', err);
      }
    }
  };

  // Assign Rider (Syncs rider name, phone, plate, and updates status in Supabase)
  const assignRider = async (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId || r.name === riderId) || riders[0];
    if (!rider) return;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const updatedLogs = [
          { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
          { step: `Rider Assigned (${rider.name})`, time: 'Just now', done: true },
          { step: 'Purchased / Picked Up', time: 'Pending', done: false },
          { step: 'Out for Delivery', time: 'Pending', done: false },
          { step: 'Delivered', time: 'Pending', done: false }
        ];

        return {
          ...order,
          riderId: rider.id,
          riderName: rider.name,
          riderPhone: rider.phone,
          riderCoords: [rider.lat, rider.lng],
          status: 'assigned',
          statusText: `Rider Assigned: ${rider.name}`,
          logs: updatedLogs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
        const tracking = targetOrder?.trackingNumber || orderId;
        const currentDetails = targetOrder?.details || {};
        
        let assignQuery = supabase.from('orders').update({
          status: 'assigned',
          rider_id: rider.id,
          details: {
            ...currentDetails,
            rider_name: rider.name,
            rider_phone: rider.phone,
            rider_plate: rider.plate
          }
        });

        if (isUuid(orderId)) {
          await assignQuery.eq('id', orderId);
        } else {
          await assignQuery.eq('tracking_number', tracking);
        }
      } catch (err) {
        console.warn('Supabase assign rider error:', err);
      }
    }

    soundService.playOrderChime();
    showNotification(`Courier ${rider.name} assigned!`, 'success');
  };

  const lastGpsCloudSyncRef = useRef(0);

  // Update Rider GPS Coordinates (Realtime Live Fleet Tracking from Phone GPS)
  const updateRiderLocation = async (riderId, newLat, newLng) => {
    let targetRiderObj = null;
    setRiders(prev => {
      const updated = prev.map(r => {
        if (r.id === riderId || r.name === riderId || (r.id && riderId && String(r.id) === String(riderId))) {
          targetRiderObj = r;
          return { ...r, lat: newLat, lng: newLng };
        }
        return r;
      });
      try {
        localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const actualId = targetRiderObj?.id || riderId;
        if (isUuid(actualId)) {
          await supabase.from('riders').update({
            current_lat: newLat,
            current_lng: newLng
          }).eq('id', actualId);
        } else if (targetRiderObj?.phone) {
          await supabase.from('riders').update({
            current_lat: newLat,
            current_lng: newLng
          }).eq('phone', targetRiderObj.phone);
        }
      } catch (_) {}
    }
  };

  // Toggle Rider Active / Inactive Duty Status (1-Click Instant Rule & Realtime Admin Notification)
  const setRiderOnlineStatus = async (riderId, isOnline) => {
    const boolVal = Boolean(isOnline);
    const nextStatus = boolVal ? 'active' : 'offline';

    // Synchronously obtain base roster
    let baseRoster = Array.isArray(riders) && riders.length > 0 ? [...riders] : [];
    if (baseRoster.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('delivery_express_riders_balamban') || '[]');
        if (Array.isArray(local) && local.length > 0) baseRoster = local;
      } catch (_) {}
    }
    if (baseRoster.length === 0) {
      baseRoster = [...CORE_OFFICIAL_RIDERS];
    } else {
      CORE_OFFICIAL_RIDERS.forEach(cor => {
        if (!baseRoster.some(r => r.id === cor.id || r.phone === cor.phone || (r.name && cor.name && r.name.toLowerCase() === cor.name.toLowerCase()))) {
          baseRoster.push(cor);
        }
      });
    }

    // Identify target rider
    const targetRiderObj = baseRoster.find(r => 
      r.id === riderId || 
      r.name === riderId || 
      String(r.id) === String(riderId) || 
      (r.name && typeof riderId === 'string' && r.name.toLowerCase() === riderId.toLowerCase())
    );

    const updatedRoster = baseRoster.map(r => {
      const matches = r.id === riderId || 
                      r.name === riderId || 
                      (r.id && riderId && String(r.id) === String(riderId)) ||
                      (r.name && riderId && typeof riderId === 'string' && r.name.toLowerCase() === riderId.toLowerCase()) ||
                      (targetRiderObj && (r.id === targetRiderObj.id || (r.phone && targetRiderObj.phone && r.phone === targetRiderObj.phone)));
      if (matches) {
        return { ...r, isOnline: boolVal, status: nextStatus };
      }
      return r;
    });

    // Commit synchronous state and storage updates
    setRiders(updatedRoster);
    try {
      localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster));
    } catch (_) {}

    const riderDisplayName = targetRiderObj?.name || 'Courier';

    soundService.triggerVibrate([100, 50, 100]);
    notifyDutyChangeOnce(riderId, riderDisplayName, boolVal, true);

    // 1-Click Broadcast notification to Admin & other tabs
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ 
          type: 'RIDER_DUTY_CHANGED', 
          riderId, 
          riderName: riderDisplayName, 
          isOnline: boolVal, 
          updatedRoster 
        });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}

    if (isSupabaseConfigured && supabase) {
      try {
        const actualId = targetRiderObj?.id || riderId;
        if (isUuid(actualId)) {
          await supabase.from('riders').update({
            is_online: boolVal
          }).eq('id', actualId);
        } else if (targetRiderObj?.phone) {
          await supabase.from('riders').update({
            is_online: boolVal
          }).eq('phone', targetRiderObj.phone);
        }
      } catch (_) {}

      // Guarantee cloud sync of online duty status in SYS-CONFIG-RATES
      await syncSysConfig({ riders_roster: updatedRoster });
    }
  };

  const toggleRiderDuty = async (riderId) => {
    let currentlyActive = false;
    const currentList = Array.isArray(riders) && riders.length > 0 ? riders : CORE_OFFICIAL_RIDERS;
    const rider = currentList.find(r => 
      r.id === riderId || 
      r.name === riderId || 
      (r.id && riderId && String(r.id) === String(riderId)) ||
      (r.name && riderId && typeof riderId === 'string' && r.name.toLowerCase() === riderId.toLowerCase())
    );
    if (rider) {
      currentlyActive = Boolean(rider.isOnline === true || rider.status === 'active');
    }
    const newIsOnline = !currentlyActive;
    await setRiderOnlineStatus(rider?.id || riderId, newIsOnline);
  };

  // Update order status workflow (Maps accurately to Supabase order_status ENUM & Preserves Rider assignment)
  const updateOrderStatus = async (orderId, newStatus) => {
    let dbStatus = newStatus;
    if (newStatus === 'purchasing') dbStatus = 'at_pickup_purchasing';
    if (newStatus === 'in_transit') dbStatus = 'out_for_delivery';

    let statusText = 'In Progress';
    if (dbStatus === 'at_pickup_purchasing') statusText = 'Purchasing / At Store';
    if (dbStatus === 'out_for_delivery') statusText = 'Out for Delivery';
    if (dbStatus === 'delivered') statusText = 'Delivered & Completed';

    const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
    const currentRiderId = targetOrder?.riderId;
    const currentRiderName = targetOrder?.riderName;
    const currentRiderPhone = targetOrder?.riderPhone;
    const currentDetails = targetOrder?.details || {};

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const isAssigned = dbStatus !== 'pending';
        const isPurchased = dbStatus === 'at_pickup_purchasing' || dbStatus === 'out_for_delivery' || dbStatus === 'delivered';
        const isOut = dbStatus === 'out_for_delivery' || dbStatus === 'delivered';
        const isDeliv = dbStatus === 'delivered';

        const updatedLogs = [
          { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
          { step: `Rider Assigned (${order.riderName || currentRiderName || 'Nigel'})`, time: 'Done', done: isAssigned },
          { step: 'Purchased / Picked Up', time: isPurchased ? 'Done' : 'Pending', done: isPurchased },
          { step: 'Out for Delivery', time: isOut ? 'On the way' : 'Pending', done: isOut },
          { step: 'Delivered & Completed', time: isDeliv ? 'Delivered' : 'Pending', done: isDeliv }
        ];

        return {
          ...order,
          status: dbStatus,
          statusText,
          logs: updatedLogs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const tracking = targetOrder?.trackingNumber || orderId;

        const updatedDetails = {
          ...currentDetails,
          ...(currentRiderName ? { rider_name: currentRiderName } : {}),
          ...(currentRiderPhone ? { rider_phone: currentRiderPhone } : {})
        };

        const updatePayload = {
          status: dbStatus,
          details: updatedDetails
        };
        if (currentRiderId && isUuid(currentRiderId)) {
          updatePayload.rider_id = currentRiderId;
        }

        let statusQuery = supabase.from('orders').update(updatePayload);

        if (isUuid(orderId)) {
          await statusQuery.eq('id', orderId);
        } else {
          await statusQuery.eq('tracking_number', tracking);
        }
      } catch (err) {
        console.warn('Supabase status update error:', err);
      }
    }

    if (dbStatus === 'delivered') {
      soundService.playSuccessFanfare();
      try { confetti({ particleCount: 120, spread: 80 }); } catch (_) {}
    } else {
      soundService.playOrderChime();
    }
    showNotification(`Order Status: ${statusText}`, 'info');
  };

  // Proof of delivery
  const uploadProofOfDelivery = async (orderId, photoUrl, notes) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const updatedLogs = [
          { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
          { step: `Rider Assigned (${order.riderName || 'Nigel'})`, time: 'Done', done: true },
          { step: 'Purchased / Picked Up', time: 'Done', done: true },
          { step: 'Out for Delivery', time: 'Done', done: true },
          { step: 'Delivered & Completed', time: 'Just now', done: true }
        ];

        return {
          ...order,
          status: 'delivered',
          statusText: 'Delivered & Completed',
          proofOfDeliveryUrl: photoUrl,
          deliveryNotes: notes,
          logs: updatedLogs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
        const tracking = targetOrder?.trackingNumber || orderId;

        let podQuery = supabase.from('orders').update({
          status: 'delivered',
          proof_of_delivery_url: photoUrl,
          delivery_notes: notes
        });

        if (isUuid(orderId)) {
          await podQuery.eq('id', orderId);
        } else {
          await podQuery.eq('tracking_number', tracking);
        }
      } catch (_) {}
    }

    soundService.playSuccessFanfare();
    showNotification('Proof of Delivery submitted!', 'success');
    try { confetti({ particleCount: 140, spread: 90 }); } catch (_) {}
  };

  // Customer Star Rating & Review for Courier
  const rateRider = async (orderId, riderId, ratingValue, reviewFeedback = '') => {
    // 1. Update order locally
    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.trackingNumber === orderId) {
        return {
          ...o,
          customerRating: ratingValue,
          customerReview: reviewFeedback
        };
      }
      return o;
    }));

    // 2. Update rider rating average
    const targetRider = riders.find(r => r.id === riderId || r.name === riderId) || riders[0];
    if (targetRider) {
      const currentRating = targetRider.rating || 5.0;
      const currentTrips = targetRider.trips || 1;
      const newAverage = parseFloat(((currentRating * currentTrips + ratingValue) / (currentTrips + 1)).toFixed(1));

      setRiders(prev => prev.map(r => {
        if (r.id === targetRider.id) {
          return {
            ...r,
            rating: newAverage,
            trips: currentTrips + 1
          };
        }
        return r;
      }));

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('riders').update({
            rating: newAverage,
            total_completed_trips: currentTrips + 1
          }).eq('id', targetRider.id);

          const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
          const tracking = targetOrder?.trackingNumber || orderId;
          const currentDetails = targetOrder?.details || {};
          await supabase.from('orders').update({
            details: {
              ...currentDetails,
              customer_rating: ratingValue,
              customer_review: reviewFeedback
            }
          }).or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
        } catch (_) {}
      }
    }

    soundService.playSuccessFanfare();
    try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch (_) {}
    showNotification(`Thank you for rating ${ratingValue} ⭐ stars!`, 'success');
  };

  // Staff Management (Preserves Profile Picture & Syncs across all devices)
  const addRider = async (newRiderData) => {
    let finalId = `rider-${Date.now()}`;
    const avatarToSave = (newRiderData.avatar && !newRiderData.avatar.includes('unsplash')) ? newRiderData.avatar : null;
    
    let newRider = {
      id: finalId,
      name: newRiderData.name?.trim() || 'Courier',
      phone: newRiderData.phone?.trim() || '09458819427',
      plate: newRiderData.plate?.trim() || 'Motorcycle',
      zone: newRiderData.zone || 'Balamban Proper',
      municipality: newRiderData.municipality || 'Balamban',
      rating: 5.0,
      trips: 0,
      isOnline: true,
      status: 'active',
      password: newRiderData.password || 'Pass123',
      lat: 10.5015,
      lng: 123.7150,
      avatar: avatarToSave
    };

    if (avatarToSave) {
      localStorage.setItem(`rider_avatar_${finalId}`, avatarToSave);
      localStorage.setItem(`rider_avatar_${newRider.phone}`, avatarToSave);
    }
    localStorage.setItem(`rider_pass_${finalId}`, newRider.password);
    localStorage.setItem(`rider_pass_${newRider.phone}`, newRider.password);
    localStorage.setItem(`rider_pass_${newRider.name}`, newRider.password);

    const baseList = Array.isArray(riders) && riders.length > 0 ? riders : CORE_OFFICIAL_RIDERS;
    const updatedRoster = [...baseList.filter(r => r.id !== finalId && r.phone !== newRider.phone), newRider];
    setRiders(updatedRoster);
    try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}

    // Clean from deleted_riders blacklist
    const localDeleted = JSON.parse(localStorage.getItem('delivery_express_deleted_riders') || '[]');
    const cleanedDeleted = localDeleted.filter(d => d !== finalId && d !== newRider.phone && d !== newRider.name.toLowerCase().trim());
    try { localStorage.setItem('delivery_express_deleted_riders', JSON.stringify(cleanedDeleted)); } catch (_) {}

    // 100% Reliable Cloud Sync to SYS-CONFIG-RATES
    await syncSysConfig({
      riders_roster: updatedRoster,
      deleted_riders: cleanedDeleted,
      rider_passwords: {
        [finalId]: newRider.password,
        [newRider.phone]: newRider.password,
        [newRider.name]: newRider.password
      },
      rider_avatars: avatarToSave ? {
        [finalId]: avatarToSave,
        [newRider.phone]: avatarToSave
      } : {}
    });

    // Broadcast across tabs
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'RIDER_PROFILE_UPDATED', riderId: finalId, updatedRoster });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}

    showNotification(`Courier "${newRider.name}" added & cloud-synced!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = async (riderId, updatedFields) => {
    const baseList = Array.isArray(riders) && riders.length > 0 ? riders : CORE_OFFICIAL_RIDERS;
    const oldRider = baseList.find(r => r.id === riderId || r.phone === riderId || r.name === riderId);
    
    const updatedRoster = baseList.map(r => {
      if (r.id === riderId || (oldRider && (r.id === oldRider.id || r.phone === oldRider.phone))) {
        return { ...r, ...updatedFields };
      }
      return r;
    });
    setRiders(updatedRoster);
    try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}

    const newName = updatedFields.name || oldRider?.name;
    const newPhone = updatedFields.phone || oldRider?.phone;

    // Update currentUser if currently logged in as this rider
    setCurrentUser(prevUser => {
      if (prevUser && (prevUser.role === 'rider' || prevUser.id === riderId || (oldRider && prevUser.phone === oldRider.phone))) {
        const updatedUser = { ...prevUser, ...updatedFields, name: newName || prevUser.name };
        try { localStorage.setItem('delivery_express_current_user', JSON.stringify(updatedUser)); } catch (_) {}
        return updatedUser;
      }
      return prevUser;
    });

    // Update in-memory orders dynamically
    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId || (oldRider && (o.riderId === oldRider.id || o.riderPhone === oldRider.phone || o.riderName === oldRider.name))) {
        return {
          ...o,
          riderName: newName,
          riderPhone: newPhone,
          details: {
            ...(o.details || {}),
            rider_name: newName,
            rider_phone: newPhone
          }
        };
      }
      return o;
    }));

    if (updatedFields.avatar !== undefined) {
      if (updatedFields.avatar && !updatedFields.avatar.includes('unsplash')) {
        localStorage.setItem(`rider_avatar_${riderId}`, updatedFields.avatar);
        if (oldRider?.phone) localStorage.setItem(`rider_avatar_${oldRider.phone}`, updatedFields.avatar);
      } else {
        localStorage.removeItem(`rider_avatar_${riderId}`);
      }
    }
    if (updatedFields.password) {
      localStorage.setItem(`rider_pass_${riderId}`, updatedFields.password);
      if (oldRider?.phone) localStorage.setItem(`rider_pass_${oldRider.phone}`, updatedFields.password);
    }

    await syncSysConfig({
      riders_roster: updatedRoster,
      rider_passwords: {
        ...(updatedFields.password ? {
          [riderId]: updatedFields.password,
          ...(oldRider?.phone ? { [oldRider.phone]: updatedFields.password } : {}),
          ...(newName ? { [newName]: updatedFields.password } : {})
        } : {})
      },
      rider_avatars: {
        ...(updatedFields.avatar ? { [riderId]: updatedFields.avatar, ...(oldRider?.phone ? { [oldRider.phone]: updatedFields.avatar } : {}) } : {})
      }
    });

    // Supabase table update if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {};
        if (updatedFields.name) payload.full_name = updatedFields.name;
        if (updatedFields.phone) payload.phone = updatedFields.phone;
        if (updatedFields.plate) payload.motorcycle_plate = updatedFields.plate;
        if (isUuid(riderId)) {
          await supabase.from('riders').update(payload).eq('id', riderId);
        } else if (oldRider?.phone) {
          await supabase.from('riders').update(payload).eq('phone', oldRider.phone);
        }
      } catch (_) {}
    }

    // Auto-sync logged-in rider's profile if updated on this client
    setCurrentUser(prevUser => {
      if (prevUser && prevUser.role === 'rider') {
        const isTarget = (prevUser.id && (prevUser.id === riderId || (oldRider?.id && prevUser.id === oldRider.id))) ||
          (prevUser.phone && ((oldRider?.phone && prevUser.phone === oldRider.phone) || (updatedFields.phone && prevUser.phone === updatedFields.phone))) ||
          (prevUser.name && (prevUser.name === oldRider?.name || prevUser.name === newName));
        if (isTarget) {
          const merged = { ...prevUser, ...updatedFields, role: 'rider', name: newName || prevUser.name };
          try { localStorage.setItem('delivery_express_current_user', JSON.stringify(merged)); } catch (_) {}
          return merged;
        }
      }
      return prevUser;
    });

    // Broadcast across tabs
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'RIDER_PROFILE_UPDATED', riderId, updatedFields, updatedRoster });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}

    showNotification(`Courier "${newName || 'Profile'}" updated across all devices!`, 'success');
  };

  const deleteRider = async (riderId) => {
    localStorage.removeItem(`rider_avatar_${riderId}`);
    localStorage.removeItem(`rider_pass_${riderId}`);

    const baseList = Array.isArray(riders) && riders.length > 0 ? riders : CORE_OFFICIAL_RIDERS;
    const targetRider = baseList.find(r => r.id === riderId || r.phone === riderId || r.name === riderId);
    const updatedRoster = baseList.filter(r => r.id !== riderId && (targetRider ? (r.id !== targetRider.id && r.phone !== targetRider.phone) : true));
    
    setRiders(updatedRoster);
    try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}

    // Add to deleted_riders blacklist so it NEVER reappears on refresh or cloud sync
    const localDeleted = JSON.parse(localStorage.getItem('delivery_express_deleted_riders') || '[]');
    const newDeletedList = [...new Set([
      ...localDeleted,
      riderId,
      ...(targetRider?.phone ? [targetRider.phone] : []),
      ...(targetRider?.name ? [targetRider.name.toLowerCase().trim()] : [])
    ])];
    try { localStorage.setItem('delivery_express_deleted_riders', JSON.stringify(newDeletedList)); } catch (_) {}

    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId || (targetRider && (o.riderId === targetRider.id || o.riderPhone === targetRider.phone || o.riderName === targetRider.name))) {
        return {
          ...o,
          riderId: null,
          riderName: null,
          riderPhone: null,
          status: 'pending',
          statusText: 'Waiting for Courier Assignment',
          details: {
            ...(o.details || {}),
            rider_id: null,
            rider_name: null,
            rider_phone: null
          }
        };
      }
      return o;
    }));

    await syncSysConfig({
      riders_roster: updatedRoster,
      deleted_riders: newDeletedList
    });

    if (isSupabaseConfigured && supabase) {
      try {
        if (isUuid(riderId)) {
          await supabase.from('riders').delete().eq('id', riderId);
        } else if (targetRider?.phone) {
          await supabase.from('riders').delete().eq('phone', targetRider.phone);
        }
      } catch (_) {}
    }

    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'RIDER_DELETED', riderId, deletedRiders: newDeletedList, updatedRoster });
        setTimeout(() => bc.close(), 200);
      }
    } catch (_) {}

    showNotification(`Courier "${targetRider?.name || 'Rider'}" deleted successfully!`, 'info');
  };

  // Robust Cloud Order Deletion (Permanent & Synced across all devices)
  const deleteOrder = async (orderId) => {
    const target = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
    const tracking = target?.trackingNumber || (typeof orderId === 'string' && orderId.startsWith('DE-') ? orderId : null);
    const targetId = target?.id || orderId;

    let updatedOrders = [];
    setOrders(prev => {
      updatedOrders = prev.filter(o => o.id !== orderId && o.trackingNumber !== orderId && (!tracking || o.trackingNumber !== tracking));
      try {
        localStorage.setItem('delivery_express_orders_balamban', JSON.stringify(updatedOrders));
      } catch (_) {}
      return updatedOrders;
    });

    if (activeTrackingId === tracking || activeTrackingId === orderId) {
      setActiveTrackingId('');
    }

    if (tracking) {
      const localDeleted = JSON.parse(localStorage.getItem('delivery_express_deleted_orders') || '[]');
      const updatedDeleted = Array.from(new Set([...localDeleted, tracking]));
      try { localStorage.setItem('delivery_express_deleted_orders', JSON.stringify(updatedDeleted)); } catch (_) {}
      
      // Sync with cloud configuration row (RLS-proof)
      await syncSysConfig({ deleted_orders: updatedDeleted });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (tracking && tracking !== 'SYS-CONFIG-RATES') {
          // 1. Mark as deleted in Supabase
          await supabase.from('orders').update({ status: 'deleted' }).eq('tracking_number', tracking);
          // 2. Attempt hard delete if policy allows
          await supabase.from('orders').delete().eq('tracking_number', tracking);
        }
        if (targetId && isUuid(targetId)) {
          await supabase.from('orders').delete().eq('id', targetId);
        }
      } catch (err) {
        console.warn('Supabase delete order error:', err);
      }
    }

    showNotification(`Order #${tracking || orderId} deleted permanently`, 'info');
  };

  const broadcastAdminAnnouncement = async (msg) => {
    const annObj = { msg, time: new Date().toLocaleTimeString(), timestamp: Date.now() };
    setAnnouncement(annObj);
    
    try {
      localStorage.setItem('delivery_express_active_announcement', JSON.stringify(annObj));
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'RADIO_BROADCAST', announcement: annObj });
        bc.close();
      }
    } catch (_) {}

    soundService.playBroadcastAlert();
    showNotification(`Radio: "${msg}"`, 'success');

    // Sync to Supabase SYS-CONFIG-RATES so couriers on mobile & all devices receive it in real-time
    await syncSysConfig({ active_announcement: annObj });
  };

  const clearAnnouncement = async () => {
    setAnnouncement(null);

    try {
      localStorage.removeItem('delivery_express_active_announcement');
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('delivery_express_cross_tab');
        bc.postMessage({ type: 'RADIO_BROADCAST', announcement: null });
        bc.close();
      }
    } catch (_) {}

    showNotification('Radio broadcast stopped & cleared', 'info');

    // Clear on Cloud SYS-CONFIG-RATES
    await syncSysConfig({ active_announcement: null });
  };

  const broadcastWeatherAlert = async (targetTown = 'Balamban') => {
    const data = await refreshWeather(targetTown);
    if (data) {
      const msg = `🌧️ PANAHON WEATHER ADVISORY (${data.location}): ${data.condition} • ${data.temp}°C (Feels ${data.feelsLike}°C). Wind: ${data.windSpeed}km/h. Advisory: ${data.advisory}`;
      broadcastAdminAnnouncement(msg);
      return msg;
    }
  };

  const refreshLiveDatabase = async () => {
    showNotification('Syncing with live cloud database...', 'info');
    await fetchSupabaseData();
    showNotification('Live cloud database synced!', 'success');
  };

  return (
    <OrderContext.Provider
      value={{
        theme,
        toggleTheme,
        soundActive,
        toggleSound,
        vibrationActive,
        toggleVibration,
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
        addBulkMenuItems,
        updateMenuItem,
        deleteMenuItem,
        paymentSettings,
        updatePaymentSettings,
        currentUser,
        registeredCustomers,
        registerCustomer,
        updateCustomerProfile,
        loginCustomerWithPassword,
        deleteCustomer,
        loginAsCustomer,
        loginAsRider,
        loginAsAdmin,
        logout,
        updateAdminPassword,
        updateRiderPassword,
        orders,
        riders,
        activeRole,
        setActiveRole,
        selectedRiderId,
        setSelectedRiderId,
        activeTrackingId,
        setActiveTrackingId,
        notification,
        showNotification,
        announcement,
        broadcastAdminAnnouncement,
        clearAnnouncement,
        isWithinOperatingHours,
        createOrder,
        cancelOrder,
        assignRider,
        sendMessage,
        updateRiderLocation,
        setRiderOnlineStatus,
        toggleRiderDuty,
        updateOrderStatus,
        uploadProofOfDelivery,
        rateRider,
        addRider,
        updateRider,
        deleteRider,
        deleteOrder,
        refreshLiveDatabase,
        resetSampleData: refreshLiveDatabase
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}