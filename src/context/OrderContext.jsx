import React, { createContext, useContext, useState, useEffect } from 'react';
import { SERVICES, BRAND, DEFAULT_PARTNER_STORES } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundService } from '../lib/soundUtils';
import { fetchPanahonWeather, MUNICIPALITY_COORDS } from '../services/weatherService';
import confetti from 'canvas-confetti';

const OrderContext = createContext();

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
      mayaQrUrl: ""
    };
    try {
      const saved = localStorage.getItem('delivery_express_payment_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (_) {
      return defaultSettings;
    }
  });

  // Current logged in user (Customer, Rider, or Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('delivery_express_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Active Role: PERSIST ON REFRESH based on currentUser
  const [activeRole, setActiveRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('delivery_express_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed.role || 'customer';
      }
    } catch (_) {}
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

  const [riders, setRiders] = useState([
    {
      id: 'b2c77a52-42ae-4f07-a8fa-540722d74fae',
      name: 'Nigel',
      phone: '09458819427',
      plate: 'MIO GEAR - G629MC',
      zone: 'Balamban Proper',
      municipality: 'Balamban',
      avatar: '/rider-nigel.jpg',
      rating: 5.0,
      trips: 1,
      isOnline: true,
      status: 'active',
      password: 'Pass123',
      lat: 10.5015,
      lng: 123.7150
    }
  ]);

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
  const [announcement, setAnnouncement] = useState(null);

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
            if (parsed.registered_customers && Array.isArray(parsed.registered_customers)) {
              const localCusts = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
              const combined = [...localCusts];
              parsed.registered_customers.forEach(c => {
                const cleanC = {
                  ...c,
                  avatar: c.avatar && !c.avatar.includes('unsplash') ? c.avatar : null
                };
                if (!combined.some(x => (x.email && cleanC.email && x.email.toLowerCase() === cleanC.email.toLowerCase()) || (x.phone && cleanC.phone && x.phone.slice(-10) === cleanC.phone.slice(-10)))) {
                  combined.push(cleanC);
                }
              });
              const sanitized = combined.map(c => ({
                ...c,
                avatar: c.avatar && !c.avatar.includes('unsplash') ? c.avatar : null
              }));
              setRegisteredCustomers(sanitized);
              try { localStorage.setItem('delivery_express_registered_customers', JSON.stringify(sanitized)); } catch (_) {}
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

        // 2. Fetch live riders with cloud synced avatars and passwords
        try {
          const { data: secConfig } = await supabase.from('services').select('*').eq('id', 'system_security_config').maybeSingle();
          if (secConfig && secConfig.description) {
            const parsed = JSON.parse(secConfig.description);
            cloudRiderPasswords = { ...cloudRiderPasswords, ...(parsed.rider_passwords || {}) };
            cloudRiderAvatars = { ...cloudRiderAvatars, ...(parsed.rider_avatars || {}) };
            if (Array.isArray(parsed.custom_riders) && parsed.custom_riders.length > 0) {
              cloudCustomRiders = [...cloudCustomRiders, ...parsed.custom_riders];
            }
          }
        } catch (_) {}

        const { data: riderData, error: riderErr } = await supabase
          .from('riders')
          .select('*')
          .order('created_at', { ascending: true });

        let currentRiderList = [];
        if (!riderErr && riderData && riderData.length > 0) {
          currentRiderList = riderData.map(r => {
            const cloudAvatar = cloudRiderAvatars[r.id] || cloudRiderAvatars[r.phone] || cloudRiderAvatars[r.full_name] || localStorage.getItem(`rider_avatar_${r.id}`);
            
            // Strictly prioritize cloud avatar or permanent /rider-nigel.jpg
            let finalAvatar = '/rider-nigel.jpg';
            if (cloudAvatar && cloudAvatar.length > 5 && !cloudAvatar.includes('unsplash')) {
              finalAvatar = cloudAvatar;
            } else if (r.id === 'b2c77a52-42ae-4f07-a8fa-540722d74fae') {
              finalAvatar = '/rider-nigel.jpg';
            }

            const cleanPlate = r.motorcycle_plate?.split('(')[0]?.trim() || r.motorcycle_plate || 'Motorcycle';
            const riderPass = cloudRiderPasswords[r.id] || cloudRiderPasswords[r.phone] || cloudRiderPasswords[r.full_name] || localStorage.getItem(`rider_pass_${r.id}`) || 'Pass123';
            localStorage.setItem(`rider_pass_${r.id}`, riderPass);

            return {
              id: r.id,
              name: r.full_name || 'Courier',
              phone: r.phone || '09458819427',
              plate: cleanPlate,
              zone: r.motorcycle_plate?.includes('(') ? r.motorcycle_plate.split('(')[1].replace(')', '') : 'Balamban Proper',
              municipality: 'Balamban',
              avatar: finalAvatar,
              rating: parseFloat(r.rating || 5.0),
              trips: r.total_completed_trips || 0,
              isOnline: r.is_online !== false,
              status: r.is_online ? 'active' : 'offline',
              password: riderPass,
              lat: parseFloat(r.current_lat || 10.5015),
              lng: parseFloat(r.current_lng || 123.7150)
            };
          });
        }

        // Merge any custom riders from cloud backup or localStorage that might not be in supabase riders table
        const localSavedRiders = JSON.parse(localStorage.getItem('delivery_express_riders_balamban') || '[]');
        const extraRiders = [...cloudCustomRiders, ...(Array.isArray(localSavedRiders) ? localSavedRiders : [])];
        
        extraRiders.forEach(er => {
          if (er && er.name && !currentRiderList.some(r => r.id === er.id || (r.phone && er.phone && r.phone === er.phone))) {
            const riderPass = cloudRiderPasswords[er.id] || cloudRiderPasswords[er.phone] || er.password || 'Pass123';
            currentRiderList.push({
              ...er,
              password: riderPass
            });
          }
        });

        if (currentRiderList.length > 0) {
          setRiders(currentRiderList);
          try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(currentRiderList)); } catch (_) {}
          if (!currentUser) {
            setSelectedRiderId(currentRiderList[0].id);
          }
        }

        // 3. Format and filter live delivery orders (exclude system configuration row)
        if (!orderErr && orderData) {
          const formatted = (orderData || [])
            .filter(o => o.tracking_number !== 'SYS-CONFIG-RATES' && o.customer_name !== 'SYSTEM_SETTINGS')
            .map(o => {
            const rawMessages = (o.details && o.details.chat_messages) ? o.details.chat_messages : (o.messages || []);
            const assignedRiderObj = currentRiderList.find(r => r.id === o.rider_id);
            const riderName = o.details?.rider_name || assignedRiderObj?.name || (o.rider_id ? 'Nigel' : null);
            const riderPhone = o.details?.rider_phone || assignedRiderObj?.phone || (o.rider_id ? '09458819427' : null);
            const assignedRiderId = o.rider_id || assignedRiderObj?.id || (riderName === 'Nigel' ? 'b2c77a52-42ae-4f07-a8fa-540722d74fae' : null);

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

    // Realtime subscriptions
    const orderChannel = supabase
      .channel('public:orders:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    const riderChannel = supabase
      .channel('public:riders:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, () => {
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

  const loginCustomerWithPassword = (emailOrPhone, password) => {
    const cleanInput = (emailOrPhone || '').trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    const found = registeredCustomers.find(c => {
      const cEmail = (c.email || '').trim().toLowerCase();
      const cPhone = (c.phone || '').replace(/\D/g, '');
      const emailMatches = cEmail && cEmail === cleanInput;
      const phoneMatches = cleanDigits && cPhone && (cPhone === cleanDigits || cPhone.slice(-10) === cleanDigits.slice(-10));
      return (emailMatches || phoneMatches) && c.password === password.trim();
    });
    
    if (found) {
      setCurrentUser(found);
      setActiveRole('customer');
      soundService.playSuccessFanfare();
      showNotification(`Welcome back, ${found.name}!`, 'success');
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

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
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

    if (isSupabaseConfigured && supabase) {
      try {
        const ratesPayload = servicesList.map(s => ({
          id: s.id,
          name: s.name,
          baseFare: s.baseFare,
          perKmRate: s.perKmRate,
          errandFee: s.errandFee
        }));

        await supabase.from('orders').upsert({
          tracking_number: 'SYS-CONFIG-RATES',
          service_id: 'food_delivery',
          service_type: 'food_delivery',
          customer_name: 'SYSTEM_SETTINGS',
          customer_phone: '0000000000',
          pickup_address: 'System Config',
          dropoff_address: 'System Config',
          distance_km: 0,
          estimated_fare: 0,
          payment_method: 'cash_on_delivery',
          details: {
            services_rates: ratesPayload,
            payment_settings: merged,
            admin_pass: localStorage.getItem('delivery_express_admin_password') || 'Pass123'
          },
          status: 'pending'
        }, { onConflict: 'tracking_number' });
      } catch (err) {
        console.warn('Payment cloud sync warning:', err);
      }
    }
  };

  const updateServiceRates = async (serviceId, updatedRates) => {
    const newBase = parseFloat(updatedRates.baseFare);
    const newPerKm = parseFloat(updatedRates.perKmRate);
    const newErrand = parseFloat(updatedRates.errandFee || 0);

    let updatedList = [];
    setServicesList(prev => {
      updatedList = prev.map(s => {
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
      try {
        localStorage.setItem('delivery_express_services_rates', JSON.stringify(updatedList));
      } catch (_) {}
      return updatedList;
    });

    showNotification('Courier rates saved & synced to all devices!', 'success');
    soundService.playOrderChime();

    if (isSupabaseConfigured && supabase) {
      try {
        const ratesPayload = updatedList.map(s => ({
          id: s.id,
          name: s.name,
          baseFare: s.baseFare,
          perKmRate: s.perKmRate,
          errandFee: s.errandFee
        }));

        await supabase.from('orders').upsert({
          tracking_number: 'SYS-CONFIG-RATES',
          service_id: 'food_delivery',
          service_type: 'food_delivery',
          customer_name: 'SYSTEM_SETTINGS',
          customer_phone: '0000000000',
          pickup_address: 'System Config',
          dropoff_address: 'System Config',
          distance_km: 0,
          estimated_fare: 0,
          payment_method: 'cash_on_delivery',
          details: {
            services_rates: ratesPayload,
            stores_list: storesList,
            payment_settings: paymentSettings,
            admin_pass: localStorage.getItem('delivery_express_admin_password') || 'Pass123'
          },
          status: 'pending'
        }, { onConflict: 'tracking_number' });
      } catch (err) {
        console.warn('Supabase rate sync error:', err);
      }
    }
  };

  // Helper to persist Stores & Menus to Cloud
  const syncStoresToCloud = async (updatedStores) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const ratesPayload = servicesList.map(s => ({
        id: s.id,
        name: s.name,
        baseFare: s.baseFare,
        perKmRate: s.perKmRate,
        errandFee: s.errandFee
      }));

      await supabase.from('orders').upsert({
        tracking_number: 'SYS-CONFIG-RATES',
        service_id: 'food_delivery',
        service_type: 'food_delivery',
        customer_name: 'SYSTEM_SETTINGS',
        customer_phone: '0000000000',
        pickup_address: 'System Config',
        dropoff_address: 'System Config',
        distance_km: 0,
        estimated_fare: 0,
        payment_method: 'cash_on_delivery',
        details: {
          services_rates: ratesPayload,
          stores_list: updatedStores,
          payment_settings: paymentSettings,
          admin_pass: localStorage.getItem('delivery_express_admin_password') || 'Pass123'
        },
        status: 'pending'
      }, { onConflict: 'tracking_number' });
    } catch (err) {
      console.warn('Cloud stores sync error:', err);
    }
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

  // Update Rider GPS
  const updateRiderLocation = async (riderId, newLat, newLng) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, lat: newLat, lng: newLng } : r));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          current_lat: newLat,
          current_lng: newLng
        }).eq('id', riderId);
      } catch (_) {}
    }

    soundService.triggerVibrate([50]);
  };

  // Toggle Rider Active / Inactive Duty Status
  const setRiderOnlineStatus = async (riderId, isOnline) => {
    const nextStatus = isOnline ? 'active' : 'offline';
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        return { ...r, isOnline, status: nextStatus };
      }
      return r;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          is_online: isOnline
        }).eq('id', riderId);
      } catch (_) {}
    }

    showNotification(isOnline ? 'You are now ON DUTY (Active) 🟢' : 'You are now OFF DUTY (Inactive) ⚪', 'info');
  };

  const toggleRiderDuty = async (riderId) => {
    const rider = riders.find(r => r.id === riderId);
    const newIsOnline = !(rider?.isOnline);
    setRiderOnlineStatus(riderId, newIsOnline);
  };

  // Update order status workflow (Maps accurately to Supabase order_status ENUM)
  const updateOrderStatus = async (orderId, newStatus) => {
    let dbStatus = newStatus;
    if (newStatus === 'purchasing') dbStatus = 'at_pickup_purchasing';
    if (newStatus === 'in_transit') dbStatus = 'out_for_delivery';

    let statusText = 'In Progress';
    if (dbStatus === 'at_pickup_purchasing') statusText = 'Purchasing / At Store';
    if (dbStatus === 'out_for_delivery') statusText = 'Out for Delivery';
    if (dbStatus === 'delivered') statusText = 'Delivered & Completed';

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const isAssigned = dbStatus !== 'pending';
        const isPurchased = dbStatus === 'at_pickup_purchasing' || dbStatus === 'out_for_delivery' || dbStatus === 'delivered';
        const isOut = dbStatus === 'out_for_delivery' || dbStatus === 'delivered';
        const isDeliv = dbStatus === 'delivered';

        const updatedLogs = [
          { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
          { step: `Rider Assigned (${order.riderName || 'Nigel'})`, time: 'Done', done: isAssigned },
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
        const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
        const tracking = targetOrder?.trackingNumber || orderId;

        let statusQuery = supabase.from('orders').update({
          status: dbStatus
        });

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
    const avatarToSave = newRiderData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    
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

    localStorage.setItem(`rider_avatar_${finalId}`, avatarToSave);
    localStorage.setItem(`rider_pass_${finalId}`, newRider.password);
    localStorage.setItem(`rider_pass_${newRider.phone}`, newRider.password);
    localStorage.setItem(`rider_pass_${newRider.name}`, newRider.password);

    let updatedRoster = [];
    setRiders(prev => {
      updatedRoster = [...prev.filter(r => r.id !== finalId && r.phone !== newRider.phone), newRider];
      try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}
      return updatedRoster;
    });

    // 100% Reliable Cloud Sync to SYS-CONFIG-RATES
    await syncSysConfig({
      riders_roster: updatedRoster,
      rider_passwords: {
        [finalId]: newRider.password,
        [newRider.phone]: newRider.password,
        [newRider.name]: newRider.password
      },
      rider_avatars: {
        [finalId]: avatarToSave,
        [newRider.phone]: avatarToSave
      }
    });

    showNotification(`Courier "${newRider.name}" added & cloud-synced!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = async (riderId, updatedFields) => {
    let updatedRoster = [];
    setRiders(prev => {
      updatedRoster = prev.map(r => {
        if (r.id === riderId) {
          return { ...r, ...updatedFields };
        }
        return r;
      });
      try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}
      return updatedRoster;
    });

    if (updatedFields.avatar) {
      localStorage.setItem(`rider_avatar_${riderId}`, updatedFields.avatar);
    }
    if (updatedFields.password) {
      localStorage.setItem(`rider_pass_${riderId}`, updatedFields.password);
    }

    const rider = riders.find(r => r.id === riderId);
    await syncSysConfig({
      riders_roster: updatedRoster,
      rider_passwords: {
        ...(updatedFields.password ? {
          [riderId]: updatedFields.password,
          ...(rider?.phone ? { [rider.phone]: updatedFields.password } : {}),
          ...(rider?.name ? { [rider.name]: updatedFields.password } : {})
        } : {})
      },
      rider_avatars: {
        ...(updatedFields.avatar ? { [riderId]: updatedFields.avatar } : {})
      }
    });

    showNotification('Rider profile & photo updated across all devices!', 'success');
  };

  const deleteRider = async (riderId) => {
    localStorage.removeItem(`rider_avatar_${riderId}`);
    localStorage.removeItem(`rider_pass_${riderId}`);

    const rider = riders.find(r => r.id === riderId);
    let updatedRoster = [];
    setRiders(prev => {
      updatedRoster = prev.filter(r => r.id !== riderId);
      try { localStorage.setItem('delivery_express_riders_balamban', JSON.stringify(updatedRoster)); } catch (_) {}
      return updatedRoster;
    });
    
    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId) {
        return {
          ...o,
          riderId: null,
          riderName: null,
          riderPhone: null,
          status: 'pending',
          statusText: 'Waiting for Courier Assignment'
        };
      }
      return o;
    }));

    await syncSysConfig({
      riders_roster: updatedRoster
    });

    showNotification(`Rider ${rider?.name || ''} deleted`, 'info');
  };

  // Robust Cloud Order Deletion
  const deleteOrder = async (orderId) => {
    const target = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
    const tracking = target?.trackingNumber || orderId;

    setOrders(prev => prev.filter(o => o.id !== orderId && o.trackingNumber !== orderId && o.trackingNumber !== tracking));
    if (activeTrackingId === tracking || activeTrackingId === orderId) {
      setActiveTrackingId('');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').delete().or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
      } catch (err) {
        console.warn('Supabase delete order warning:', err);
      }
    }

    showNotification('Order removed from all screens', 'info');
  };

  const broadcastAdminAnnouncement = (msg) => {
    setAnnouncement({ msg, time: new Date().toLocaleTimeString() });
    soundService.playBroadcastAlert();
    showNotification(`Radio: "${msg}"`, 'success');
  };

  const clearAnnouncement = () => {
    setAnnouncement(null);
    showNotification('Radio broadcast stopped & cleared', 'info');
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
        updateMenuItem,
        deleteMenuItem,
        paymentSettings,
        updatePaymentSettings,
        currentUser,
        registeredCustomers,
        registerCustomer,
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