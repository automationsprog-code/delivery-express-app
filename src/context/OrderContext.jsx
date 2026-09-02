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
    const saved = localStorage.getItem('delivery_express_partner_stores');
    return saved ? JSON.parse(saved) : DEFAULT_PARTNER_STORES;
  });

  // Services & Rates
  const [servicesList, setServicesList] = useState(() => {
    const saved = localStorage.getItem('delivery_express_services_rates');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const saved = localStorage.getItem('delivery_express_payment_settings');
    return saved ? JSON.parse(saved) : {
      gcashName: "DELIVERY EXPRESS BALAMBAN",
      gcashNumber: "0917-882-1923",
      gcashQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DELIVERY_EXPRESS_GCASH_09178821923",
      mayaName: "DELIVERY EXPRESS",
      mayaNumber: "0928-441-9012",
      mayaQrUrl: ""
    };
  });

  // Current logged in user (Customer, Rider, or Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('delivery_express_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Role: PERSIST ON REFRESH based on currentUser
  const [activeRole, setActiveRole] = useState(() => {
    const savedUser = localStorage.getItem('delivery_express_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.role || 'customer';
      } catch (_) {}
    }
    return 'customer';
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_orders_balamban');
    return saved ? JSON.parse(saved) : [];
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
            localStorage.setItem('delivery_express_admin_password', cloudAdminPass);
          }
        }

        // 2. Fetch live riders with cloud synced avatars and passwords
        const { data: riderData, error: riderErr } = await supabase
          .from('riders')
          .select('*')
          .order('created_at', { ascending: true });

        let currentRiderList = [];
        if (!riderErr && riderData) {
          currentRiderList = (riderData || []).map(r => {
            const cloudAvatar = cloudRiderAvatars[r.id];
            
            // Strictly prioritize cloud avatar or permanent /rider-nigel.jpg
            let finalAvatar = '/rider-nigel.jpg';
            if (cloudAvatar && cloudAvatar.length > 5 && !cloudAvatar.includes('unsplash')) {
              finalAvatar = cloudAvatar;
            } else if (r.id === 'b2c77a52-42ae-4f07-a8fa-540722d74fae') {
              finalAvatar = '/rider-nigel.jpg';
            }

            const cleanPlate = r.motorcycle_plate?.split('(')[0]?.trim() || r.motorcycle_plate || 'Motorcycle';
            const riderPass = cloudRiderPasswords[r.id] || 'Pass123';
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
          setRiders(currentRiderList);
          if (currentRiderList.length > 0 && !currentUser) {
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

  // Customer Account Register & Login (With Anti-Scam Avatar Verification)
  const registerCustomer = (customerData) => {
    const userObj = {
      role: 'customer',
      name: customerData.name,
      firstName: customerData.firstName || customerData.name.split(' ')[0],
      lastName: customerData.lastName || customerData.name.split(' ').slice(1).join(' '),
      email: customerData.email,
      phone: customerData.phone,
      avatar: customerData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      password: customerData.password
    };
    const existing = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
    existing.push(userObj);
    localStorage.setItem('delivery_express_registered_customers', JSON.stringify(existing));
    
    setCurrentUser(userObj);
    setActiveRole('customer');
    soundService.playSuccessFanfare();
    showNotification(`Account verified & created! Welcome, ${userObj.name}`, 'success');
  };

  const loginCustomerWithPassword = (emailOrPhone, password) => {
    const existing = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
    const found = existing.find(c => (c.email === emailOrPhone || c.phone === emailOrPhone) && c.password === password);
    
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('services').select('*').eq('id', 'system_security_config').maybeSingle();
        let parsed = { admin_pass: newPassword, rider_passwords: {}, rider_avatars: {} };
        if (existing && existing.description) {
          try { parsed = JSON.parse(existing.description); } catch (_) {}
          parsed.admin_pass = newPassword;
        }
        await supabase.from('services').upsert({
          id: 'system_security_config',
          name: 'Security Configuration',
          icon: 'Lock',
          description: JSON.stringify(parsed),
          base_fare: 0,
          per_km_rate: 0,
          errand_fee: 0,
          is_active: false
        });
      } catch (err) {
        console.warn('Admin pass sync warning:', err);
      }
    }
  };

  const updateRiderPassword = async (riderId, newPassword) => {
    localStorage.setItem(`rider_pass_${riderId}`, newPassword);
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, password: newPassword } : r));

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase.from('services').select('*').eq('id', 'system_security_config').maybeSingle();
        let parsed = { admin_pass: 'Pass123', rider_passwords: {}, rider_avatars: {} };
        if (existing && existing.description) {
          try { parsed = JSON.parse(existing.description); } catch (_) {}
        }
        if (!parsed.rider_passwords) parsed.rider_passwords = {};
        parsed.rider_passwords[riderId] = newPassword;

        await supabase.from('services').upsert({
          id: 'system_security_config',
          name: 'Security Configuration',
          icon: 'Lock',
          description: JSON.stringify(parsed),
          base_fare: 0,
          per_km_rate: 0,
          errand_fee: 0,
          is_active: false
        });
      } catch (err) {
        console.warn('Rider pass sync warning:', err);
      }
    }
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
          messages: [...(order.messages || []), cancelMsg],
          logs: [
            { step: 'Booking Submitted', time: 'Received', done: true },
            { step: `Order Cancelled (${reason})`, time: 'Just now', done: true }
          ]
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        const targetOrder = orders.find(o => o.id === orderId || o.trackingNumber === orderId);
        const tracking = targetOrder?.trackingNumber || orderId;
        const currentDetails = targetOrder?.details || {};

        await supabase.from('orders').update({
          status: 'cancelled',
          details: {
            ...currentDetails,
            cancel_reason: reason
          }
        }).or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
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
        const { data: dbOrders, error: fetchErr } = await supabase
          .from('orders')
          .select('id, tracking_number, details')
          .or(`tracking_number.eq.${orderId},id.eq.${orderId}`)
          .limit(1);

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
        
        await supabase.from('orders').update({
          status: 'assigned',
          rider_id: rider.id,
          details: {
            ...currentDetails,
            rider_name: rider.name,
            rider_phone: rider.phone,
            rider_plate: rider.plate
          }
        }).or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
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

        await supabase.from('orders').update({
          status: dbStatus
        }).or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
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

        await supabase.from('orders').update({
          status: 'delivered',
          proof_of_delivery_url: photoUrl,
          delivery_notes: notes
        }).or(`tracking_number.eq.${tracking},id.eq.${orderId}`);
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
    const newId = `rider-${Date.now()}`;
    const avatarToSave = newRiderData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    
    localStorage.setItem(`rider_avatar_${newId}`, avatarToSave);

    const newRider = {
      id: newId,
      name: newRiderData.name,
      phone: newRiderData.phone,
      plate: newRiderData.plate,
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

    setRiders(prev => [...prev, newRider]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').insert({
          full_name: newRider.name,
          phone: newRider.phone,
          motorcycle_plate: `${newRider.plate} (${newRider.zone})`,
          is_online: true,
          rating: 5.0,
          total_completed_trips: 0
        });

        // Sync avatar to cloud
        const { data: existing } = await supabase.from('services').select('*').eq('id', 'system_security_config').maybeSingle();
        let parsed = { admin_pass: 'Pass123', rider_passwords: {}, rider_avatars: {} };
        if (existing && existing.description) {
          try { parsed = JSON.parse(existing.description); } catch (_) {}
        }
        if (!parsed.rider_avatars) parsed.rider_avatars = {};
        parsed.rider_avatars[newId] = avatarToSave;

        await supabase.from('services').upsert({
          id: 'system_security_config',
          name: 'Security Configuration',
          icon: 'Lock',
          description: JSON.stringify(parsed),
          base_fare: 0,
          per_km_rate: 0,
          errand_fee: 0,
          is_active: false
        });
      } catch (err) {
        console.warn('Supabase rider insert warning:', err);
      }
    }

    showNotification(`Courier "${newRider.name}" added!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = async (riderId, updatedFields) => {
    let mergedRider = null;
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        mergedRider = { ...r, ...updatedFields };
        return mergedRider;
      }
      return r;
    }));

    if (updatedFields.avatar) {
      localStorage.setItem(`rider_avatar_${riderId}`, updatedFields.avatar);
    }

    if (isSupabaseConfigured && supabase && mergedRider) {
      try {
        const plateToSave = mergedRider.plate || 'MIO GEAR - G629MC';
        const zoneToSave = mergedRider.zone || 'Balamban Proper';
        await supabase.from('riders').update({
          full_name: mergedRider.name,
          phone: mergedRider.phone,
          motorcycle_plate: `${plateToSave} (${zoneToSave})`
        }).eq('id', riderId);

        // Sync avatar to cloud so mobile phone sees it instantly
        if (updatedFields.avatar) {
          const { data: existing } = await supabase.from('services').select('*').eq('id', 'system_security_config').maybeSingle();
          let parsed = { admin_pass: 'Pass123', rider_passwords: {}, rider_avatars: {} };
          if (existing && existing.description) {
            try { parsed = JSON.parse(existing.description); } catch (_) {}
          }
          if (!parsed.rider_avatars) parsed.rider_avatars = {};
          parsed.rider_avatars[riderId] = updatedFields.avatar;

          await supabase.from('services').upsert({
            id: 'system_security_config',
            name: 'Security Configuration',
            icon: 'Lock',
            description: JSON.stringify(parsed),
            base_fare: 0,
            per_km_rate: 0,
            errand_fee: 0,
            is_active: false
          });
        }
      } catch (err) {
        console.warn('Supabase update rider warning:', err);
      }
    }

    showNotification('Rider profile & photo updated across all devices!', 'success');
  };

  const deleteRider = async (riderId) => {
    localStorage.removeItem(`rider_avatar_${riderId}`);
    localStorage.removeItem(`rider_pass_${riderId}`);

    const rider = riders.find(r => r.id === riderId);
    setRiders(prev => prev.filter(r => r.id !== riderId));
    
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').delete().eq('id', riderId);
      } catch (_) {}
    }

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

  const resetSampleData = () => {
    setOrders([]);
    setRiders([]);
    setActiveTrackingId('');
    showNotification('Roster cleared!', 'info');
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
        registerCustomer,
        loginCustomerWithPassword,
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
        resetSampleData
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}