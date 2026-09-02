import React, { createContext, useContext, useState, useEffect } from 'react';
import { SERVICES, BRAND } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundService } from '../lib/soundUtils';
import confetti from 'canvas-confetti';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('delivery_express_theme') || 'light';
  });

  const [soundActive, setSoundActive] = useState(true);
  const [vibrationActive, setVibrationActive] = useState(true);

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

  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_riders_balamban');
    return saved ? JSON.parse(saved) : [
      {
        id: 'rider-nigel-1',
        name: 'Nigel',
        phone: '0917-882-1923',
        plate: 'MIO GEAR - G629MC',
        zone: 'Balamban Proper / Public Palengke',
        municipality: 'Balamban',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        trips: 1,
        isOnline: true,
        status: 'active',
        password: '1234',
        lat: 10.5015,
        lng: 123.7150
      }
    ];
  });

  const [selectedRiderId, setSelectedRiderId] = useState(() => {
    const savedUser = localStorage.getItem('delivery_express_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'rider' && parsed.id) return parsed.id;
      } catch (_) {}
    }
    return 'rider-nigel-1';
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
        // Fetch live orders
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!orderErr && orderData && orderData.length > 0) {
          const formatted = orderData.map(o => ({
            id: o.id || o.tracking_number,
            trackingNumber: o.tracking_number,
            serviceId: o.service_id,
            serviceName: o.service_id ? (SERVICES.find(s => s.id === o.service_id)?.name || 'Delivery') : 'Food Delivery',
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
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
            status: o.status || 'pending',
            statusText: o.status === 'pending' ? 'Waiting for Courier Assignment' : o.status,
            riderId: o.rider_id,
            riderName: o.rider_name || null,
            riderPhone: o.rider_phone || null,
            details: o.details || {},
            messages: o.messages || [],
            logs: [
              { step: 'Booking Confirmed (Balamban)', time: 'Received', done: true },
              { step: 'Rider Assigned', time: o.rider_name ? 'Assigned' : 'Searching...', done: !!o.rider_id },
              { step: 'Purchased / Picked Up', time: o.status === 'purchasing' || o.status === 'in_transit' || o.status === 'delivered' ? 'Done' : 'Pending', done: o.status === 'purchasing' || o.status === 'in_transit' || o.status === 'delivered' },
              { step: 'Out for Delivery', time: o.status === 'in_transit' || o.status === 'delivered' ? 'On the way' : 'Pending', done: o.status === 'in_transit' || o.status === 'delivered' },
              { step: 'Delivered', time: o.status === 'delivered' ? 'Completed' : 'Pending', done: o.status === 'delivered' }
            ],
            proofOfDeliveryUrl: o.proof_of_delivery_url,
            deliveryNotes: o.delivery_notes
          }));
          setOrders(formatted);
          if (formatted.length > 0 && !activeTrackingId) {
            setActiveTrackingId(formatted[0].trackingNumber);
          }
        }

        // Fetch live riders
        const { data: riderData, error: riderErr } = await supabase
          .from('riders')
          .select('*')
          .order('created_at', { ascending: true });

        if (!riderErr && riderData && riderData.length > 0) {
          const formattedRiders = riderData.map(r => ({
            id: r.id,
            name: r.full_name || 'Courier',
            phone: r.phone || '0917-000-0000',
            plate: r.motorcycle_plate || 'Motorcycle',
            zone: r.motorcycle_plate?.includes('(') ? r.motorcycle_plate.split('(')[1].replace(')', '') : 'Balamban Proper',
            municipality: 'Balamban',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            rating: parseFloat(r.rating || 5.0),
            trips: r.total_completed_trips || 0,
            isOnline: r.is_online !== false,
            status: r.is_online ? 'active' : 'offline',
            password: localStorage.getItem(`rider_pass_${r.id}`) || '1234',
            lat: parseFloat(r.current_lat || 10.5015),
            lng: parseFloat(r.current_lng || 123.7150)
          }));
          setRiders(formattedRiders);
          if (formattedRiders.length > 0 && !currentUser) {
            setSelectedRiderId(formattedRiders[0].id);
          }
        }
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    };

    fetchSupabaseData();

    // Subscribe to realtime orders and riders
    const orderChannel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    const riderChannel = supabase
      .channel('public:riders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(riderChannel);
    };
  }, []);

  // Customer Account Register & Login
  const registerCustomer = (customerData) => {
    const userObj = {
      role: 'customer',
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      password: customerData.password,
      zone: customerData.zone || 'Balamban Proper'
    };
    const existing = JSON.parse(localStorage.getItem('delivery_express_registered_customers') || '[]');
    existing.push(userObj);
    localStorage.setItem('delivery_express_registered_customers', JSON.stringify(existing));
    
    setCurrentUser(userObj);
    setActiveRole('customer');
    soundService.playSuccessFanfare();
    showNotification(`Account created! Welcome, ${userObj.name}`, 'success');
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
    const rider = riders.find(r => r.id === riderId) || riders[0];
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

  // Password Security Updates
  const updateAdminPassword = (newPassword) => {
    localStorage.setItem('delivery_express_admin_password', newPassword);
  };

  const updateRiderPassword = (riderId, newPassword) => {
    localStorage.setItem(`rider_pass_${riderId}`, newPassword);
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, password: newPassword } : r));
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

  const updatePaymentSettings = (newSettings) => {
    setPaymentSettings(prev => ({ ...prev, ...newSettings }));
    showNotification('Payment Settings saved!', 'success');
    soundService.playOrderChime();
  };

  const updateServiceRates = (serviceId, updatedRates) => {
    setServicesList(prev => prev.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          baseFare: parseFloat(updatedRates.baseFare),
          perKmRate: parseFloat(updatedRates.perKmRate),
          errandFee: parseFloat(updatedRates.errandFee || 0)
        };
      }
      return s;
    }));
    showNotification('Courier rates updated!', 'success');
    soundService.playOrderChime();
  };

  // Create new order
  const createOrder = async (orderInput) => {
    const service = servicesList.find(s => s.id === orderInput.serviceId) || servicesList[0];
    const trackingNumber = `DE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: trackingNumber,
      trackingNumber,
      serviceId: service.id,
      serviceName: service.name,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
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
      details: orderInput.details || {},
      customerNotes: orderInput.customerNotes || '',
      messages: [
        {
          id: 'msg-init',
          senderRole: 'system',
          senderName: 'Delivery Express',
          text: `Order #${trackingNumber} created. A rider in Balamban will be assigned shortly.`,
          time: 'Just now'
        }
      ],
      createdAt: new Date().toISOString(),
      logs: [
        { step: 'Booking Submitted (Balamban)', time: 'Just now', done: true },
        { step: 'Rider Assignment', time: 'Searching nearby Balamban riders...', done: false },
        { step: 'Purchased / Picked up', time: 'Pending', done: false },
        { step: 'Out for Delivery', time: 'Pending', done: false },
        { step: 'Delivered', time: 'Pending', done: false }
      ]
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert({
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
          details: newOrder.details,
          customer_notes: newOrder.customerNotes,
          status: 'pending'
        });
      } catch (err) {
        console.warn('Supabase insert warning:', err);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingId(trackingNumber);
    soundService.playOrderChime();
    showNotification(`Booking ${trackingNumber} placed in Balamban!`, 'success');
    
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}

    return newOrder;
  };

  // In-App Chat
  const sendMessage = (orderId, senderRole, senderName, text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.trackingNumber === orderId) {
        return {
          ...o,
          messages: [...(o.messages || []), newMsg]
        };
      }
      return o;
    }));

    soundService.playOrderChime();
    soundService.triggerVibrate([80]);
  };

  // Assign Rider
  const assignRider = async (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const updatedLogs = order.logs.map((log, idx) => {
          if (idx === 1) return { ...log, step: `Rider Assigned (${rider.name})`, time: 'Just now', done: true };
          return log;
        });

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
        await supabase.from('orders').update({
          status: 'assigned'
        }).eq('tracking_number', orderId);
      } catch (_) {}
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

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        return {
          ...order,
          status: newStatus,
          statusText: newStatus
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ status: newStatus }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    if (newStatus === 'delivered') {
      soundService.playSuccessFanfare();
      try { confetti({ particleCount: 120, spread: 80 }); } catch (_) {}
    } else {
      soundService.playOrderChime();
    }
    showNotification(`Order: ${newStatus}`, 'info');
  };

  // Proof of delivery
  const uploadProofOfDelivery = async (orderId, photoUrl, notes) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        return {
          ...order,
          status: 'delivered',
          statusText: 'Delivered (Proof Attached)',
          proofOfDeliveryUrl: photoUrl,
          deliveryNotes: notes
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({
          status: 'delivered',
          proof_of_delivery_url: photoUrl,
          delivery_notes: notes
        }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    soundService.playSuccessFanfare();
    showNotification('Proof of Delivery submitted!', 'success');
    try { confetti({ particleCount: 140, spread: 90 }); } catch (_) {}
  };

  // Staff Management
  const addRider = async (newRiderData) => {
    const newRider = {
      id: `rider-${Date.now()}`,
      name: newRiderData.name,
      phone: newRiderData.phone,
      plate: newRiderData.plate,
      zone: newRiderData.zone || 'Balamban Proper',
      municipality: newRiderData.municipality || 'Balamban',
      rating: 5.0,
      trips: 0,
      isOnline: true,
      status: 'active',
      password: newRiderData.password || '1234',
      lat: 10.5015,
      lng: 123.7150,
      avatar: newRiderData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
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
      } catch (err) {
        console.warn('Supabase rider insert warning:', err);
      }
    }

    showNotification(`Courier "${newRider.name}" added!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = async (riderId, updatedFields) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, ...updatedFields } : r));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          full_name: updatedFields.name,
          phone: updatedFields.phone,
          motorcycle_plate: `${updatedFields.plate} (${updatedFields.zone})`
        }).eq('id', riderId);
      } catch (_) {}
    }

    showNotification('Rider updated on all devices!', 'info');
  };

  const toggleRiderDuty = async (riderId) => {
    let nextStatus = 'active';
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        nextStatus = r.status === 'active' ? 'break' : r.status === 'break' ? 'offline' : 'active';
        return { ...r, status: nextStatus, isOnline: nextStatus === 'active' };
      }
      return r;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          is_online: nextStatus === 'active'
        }).eq('id', riderId);
      } catch (_) {}
    }
  };

  const deleteRider = async (riderId) => {
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

    showNotification(`Rider ${rider?.name || ''} deleted from all devices`, 'info');
  };

  const deleteOrder = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId && o.trackingNumber !== orderId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').delete().eq('tracking_number', orderId);
      } catch (_) {}
    }

    showNotification('Order removed', 'info');
  };

  const broadcastAdminAnnouncement = (msg) => {
    setAnnouncement({ msg, time: new Date().toLocaleTimeString() });
    soundService.playBroadcastAlert();
    showNotification(`Radio: "${msg}"`, 'success');
  };

  const resetSampleData = () => {
    setOrders([]);
    setRiders([
      {
        id: 'rider-nigel-1',
        name: 'Nigel',
        phone: '0917-882-1923',
        plate: 'MIO GEAR - G629MC',
        zone: 'Balamban Proper / Public Palengke',
        municipality: 'Balamban',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        trips: 1,
        isOnline: true,
        status: 'active',
        password: '1234',
        lat: 10.5015,
        lng: 123.7150
      }
    ]);
    setActiveTrackingId('');
    showNotification('Roster reset to Nigel!', 'info');
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
        servicesList,
        updateServiceRates,
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
        isWithinOperatingHours,
        createOrder,
        assignRider,
        sendMessage,
        updateRiderLocation,
        updateOrderStatus,
        uploadProofOfDelivery,
        addRider,
        updateRider,
        toggleRiderDuty,
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