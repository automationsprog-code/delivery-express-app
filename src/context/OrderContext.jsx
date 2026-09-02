import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ORDERS, MOCK_RIDERS, SERVICES, BRAND } from '../lib/constants';
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

  // Editable Services and Rates
  const [servicesList, setServicesList] = useState(() => {
    const saved = localStorage.getItem('delivery_express_services_rates');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  // GCash & Maya QR Payment Settings
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

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_orders_balamban');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_riders_balamban');
    return saved ? JSON.parse(saved) : MOCK_RIDERS;
  });

  const [activeRole, setActiveRole] = useState(() => {
    const savedUser = localStorage.getItem('delivery_express_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role || 'customer';
    }
    return 'customer';
  });

  const [selectedRiderId, setSelectedRiderId] = useState('rider-1');
  const [activeTrackingId, setActiveTrackingId] = useState('DE-2026-001');
  const [notification, setNotification] = useState(null);
  const [announcement, setAnnouncement] = useState(null);

  // Apply theme class to document root
  useEffect(() => {
    localStorage.setItem('delivery_express_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save to localStorage
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

  // ==========================================
  // SUPABASE REALTIME MULTI-DEVICE SYNC
  // ==========================================
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Initial Fetch of Riders & Orders from Supabase
    const fetchSupabaseData = async () => {
      try {
        // Fetch Orders
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!orderErr && orderData && orderData.length > 0) {
          const formattedOrders = orderData.map(o => ({
            id: o.id || o.tracking_number,
            trackingNumber: o.tracking_number,
            serviceId: o.service_id,
            serviceName: o.service_name,
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
            itemCost: parseFloat(o.item_cost || 0),
            paymentMethod: o.payment_method,
            status: o.status,
            statusText: o.status_text,
            riderId: o.rider_id,
            riderName: o.rider_name,
            riderPhone: o.rider_phone,
            details: o.details || {},
            messages: o.messages || [],
            logs: o.logs || [],
            proofOfDeliveryUrl: o.proof_of_delivery_url,
            deliveryNotes: o.delivery_notes
          }));
          setOrders(formattedOrders);
        }

        // Fetch Riders
        const { data: riderData, error: riderErr } = await supabase
          .from('riders')
          .select('*')
          .order('created_at', { ascending: true });
        if (!riderErr && riderData && riderData.length > 0) {
          setRiders(riderData);
        } else if (riders.length > 0) {
          // Seed Supabase with initial riders if table is empty
          for (const r of riders) {
            await supabase.from('riders').upsert({
              id: r.id,
              name: r.name,
              phone: r.phone,
              plate: r.plate,
              zone: r.zone,
              municipality: r.municipality || 'Balamban',
              avatar: r.avatar,
              rating: r.rating,
              trips: r.trips,
              is_online: r.isOnline !== false,
              status: r.status || 'active',
              lat: r.lat,
              lng: r.lng
            });
          }
        }
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    };

    fetchSupabaseData();

    // 2. Realtime Subscriptions (Broadcast changes across PC and Mobile in real-time)
    const orderChannel = supabase
      .channel('orders-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newO = payload.new;
          const formatted = {
            id: newO.id || newO.tracking_number,
            trackingNumber: newO.tracking_number,
            serviceId: newO.service_id,
            serviceName: newO.service_name,
            customerName: newO.customer_name,
            customerPhone: newO.customer_phone,
            pickupAddress: newO.pickup_address,
            pickupLandmark: newO.pickup_landmark,
            pickupCoords: [parseFloat(newO.pickup_lat || 10.5015), parseFloat(newO.pickup_lng || 123.7150)],
            dropoffAddress: newO.dropoff_address,
            dropoffLandmark: newO.dropoff_landmark,
            dropoffCoords: [parseFloat(newO.dropoff_lat || 10.4720), parseFloat(newO.dropoff_lng || 123.7060)],
            distanceKm: parseFloat(newO.distance_km || 3.5),
            estimatedFare: parseFloat(newO.estimated_fare || 100),
            itemCost: parseFloat(newO.item_cost || 0),
            paymentMethod: newO.payment_method,
            status: newO.status,
            statusText: newO.status_text,
            riderId: newO.rider_id,
            riderName: newO.rider_name,
            riderPhone: newO.rider_phone,
            details: newO.details || {},
            messages: newO.messages || [],
            logs: newO.logs || []
          };
          setOrders(prev => [formatted, ...prev.filter(x => x.trackingNumber !== formatted.trackingNumber)]);
          soundService.playOrderChime();
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id || o.trackingNumber === payload.new.tracking_number ? { ...o, ...payload.new } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id && o.trackingNumber !== payload.old.tracking_number));
        }
      })
      .subscribe();

    const riderChannel = supabase
      .channel('riders-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'riders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRiders(prev => [...prev.filter(r => r.id !== payload.new.id), payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setRiders(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
        } else if (payload.eventType === 'DELETE') {
          setRiders(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(riderChannel);
    };
  }, []);

  // Auth Methods
  const loginAsCustomer = (customerData) => {
    const userObj = {
      role: 'customer',
      name: customerData.name || 'Verified Customer',
      email: customerData.email || 'customer@gmail.com',
      avatar: customerData.avatar
    };
    setCurrentUser(userObj);
    setActiveRole('customer');
    soundService.playSuccessFanfare();
    showNotification(`Signed in as Customer (${userObj.name})`, 'success');
  };

  const loginAsRider = (riderId) => {
    const rider = riders.find(r => r.id === riderId) || riders[0];
    const userObj = { role: 'rider', id: rider.id, name: rider.name };
    setCurrentUser(userObj);
    setSelectedRiderId(rider.id);
    setActiveRole('rider');
    soundService.playSuccessFanfare();
    showNotification(`Logged in as Courier: ${rider.name}`, 'success');
  };

  const loginAsAdmin = () => {
    const userObj = { role: 'admin', name: 'Dispatcher / Operations Lead' };
    setCurrentUser(userObj);
    setActiveRole('admin');
    soundService.playSuccessFanfare();
    showNotification('Logged in as Dispatcher / Admin', 'success');
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

  const updateRiderPassword = async (riderId, newPassword) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, password: newPassword } : r));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({ password_hash: newPassword }).eq('id', riderId);
      } catch (_) {}
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

  const updatePaymentSettings = (newSettings) => {
    setPaymentSettings(prev => ({ ...prev, ...newSettings }));
    showNotification('GCash & QR Payment Settings updated!', 'success');
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
    showNotification(`Rates updated!`, 'success');
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
      riderCoords: null,
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
          id: trackingNumber,
          tracking_number: trackingNumber,
          service_id: service.id,
          service_name: service.name,
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
          item_cost: newOrder.itemCost,
          payment_method: newOrder.paymentMethod,
          status: 'pending',
          status_text: 'Waiting for Courier Assignment',
          details: newOrder.details,
          customer_notes: newOrder.customerNotes,
          messages: newOrder.messages,
          logs: newOrder.logs
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving locally:', err);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingId(trackingNumber);
    soundService.playOrderChime();
    showNotification(`Booking ${trackingNumber} dispatched in Balamban!`, 'success');
    
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}

    return newOrder;
  };

  // In-App Chat Send Message
  const sendMessage = async (orderId, senderRole, senderName, text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let updatedMessages = [];

    setOrders(prev => prev.map(o => {
      if (o.id === orderId || o.trackingNumber === orderId) {
        updatedMessages = [...(o.messages || []), newMsg];
        return {
          ...o,
          messages: updatedMessages
        };
      }
      return o;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ messages: updatedMessages }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    soundService.playOrderChime();
    soundService.triggerVibrate([80]);
  };

  // Assign Rider
  const assignRider = async (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    const welcomeMsg = {
      id: `msg-${Date.now()}`,
      senderRole: 'rider',
      senderName: rider.name,
      text: `Maayong adlaw! Ako si ${rider.name}, imong Delivery Express courier. Akong gi-accept imong order.`,
      time: 'Just now'
    };

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
          messages: [...(order.messages || []), welcomeMsg],
          logs: updatedLogs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({
          rider_id: rider.id,
          rider_name: rider.name,
          rider_phone: rider.phone,
          status: 'assigned',
          status_text: `Rider Assigned: ${rider.name}`
        }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    soundService.playOrderChime();
    showNotification(`Courier ${rider.name} assigned!`, 'success');
  };

  // Update Rider Live GPS Location
  const updateRiderLocation = async (riderId, newLat, newLng) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, lat: newLat, lng: newLng } : r));
    
    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId && o.status !== 'delivered' && o.status !== 'cancelled') {
        return { ...o, riderCoords: [newLat, newLng] };
      }
      return o;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({ lat: newLat, lng: newLng }).eq('id', riderId);
      } catch (_) {}
    }

    soundService.triggerVibrate([50]);
  };

  // Update order status workflow
  const updateOrderStatus = async (orderId, newStatus, customNotes = '') => {
    let statusText = 'Updated';

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        let logs = [...order.logs];

        if (newStatus === 'purchasing') {
          statusText = 'At Pickup / Purchasing in Balamban';
          logs[2] = { step: 'Items Purchased / Picked Up', time: 'Just now', done: true };
          soundService.playOrderChime();
        } else if (newStatus === 'in_transit') {
          statusText = 'Courier Out for Delivery in Balamban';
          logs[3] = { step: 'Out for Delivery', time: 'Just now', done: true };
          soundService.playOrderChime();
        } else if (newStatus === 'delivered') {
          statusText = 'Delivered Successfully in Balamban';
          logs[4] = { step: 'Delivered & Completed', time: 'Just now', done: true };
          soundService.playSuccessFanfare();
          try {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
          } catch (_) {}
        }

        return {
          ...order,
          status: newStatus,
          statusText,
          deliveryNotes: customNotes || order.deliveryNotes,
          logs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({
          status: newStatus,
          status_text: statusText
        }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    showNotification(`Order status: ${newStatus}`, 'info');
  };

  // Proof of delivery uploader
  const uploadProofOfDelivery = async (orderId, photoUrl, notes) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const logs = [...order.logs];
        logs[4] = { step: 'Delivered & Proof Captured', time: 'Just now', done: true };
        return {
          ...order,
          status: 'delivered',
          statusText: 'Delivered (Proof Attached)',
          proofOfDeliveryUrl: photoUrl,
          deliveryNotes: notes,
          logs
        };
      }
      return order;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({
          status: 'delivered',
          status_text: 'Delivered (Proof Attached)',
          proof_of_delivery_url: photoUrl,
          delivery_notes: notes
        }).eq('tracking_number', orderId);
      } catch (_) {}
    }

    soundService.playSuccessFanfare();
    showNotification('Proof of Delivery submitted!', 'success');
    try {
      confetti({ particleCount: 140, spread: 90 });
    } catch (_) {}
  };

  // Staff & Rider Management with Supabase Live Multi-Device Sync
  const addRider = async (newRiderData) => {
    const newRider = {
      id: `rider-${Date.now()}`,
      name: newRiderData.name,
      phone: newRiderData.phone,
      plate: newRiderData.plate,
      zone: newRiderData.zone || 'Balamban Proper / Public Palengke',
      municipality: newRiderData.municipality || 'Balamban',
      rating: 5.0,
      trips: 0,
      isOnline: true,
      isBusy: false,
      status: 'active',
      lat: 10.5015,
      lng: 123.7150,
      avatar: newRiderData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      password: newRiderData.password || '1234'
    };

    setRiders(prev => [newRider, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').insert({
          id: newRider.id,
          name: newRider.name,
          phone: newRider.phone,
          plate: newRider.plate,
          zone: newRider.zone,
          municipality: newRider.municipality,
          avatar: newRider.avatar,
          rating: newRider.rating,
          trips: newRider.trips,
          is_online: true,
          status: 'active',
          lat: newRider.lat,
          lng: newRider.lng
        });
      } catch (err) {
        console.warn('Supabase rider insert warning:', err);
      }
    }

    showNotification(`New Courier "${newRider.name}" added & synced!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = async (riderId, updatedFields) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, ...updatedFields } : r));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          name: updatedFields.name,
          phone: updatedFields.phone,
          plate: updatedFields.plate,
          zone: updatedFields.zone,
          avatar: updatedFields.avatar
        }).eq('id', riderId);
      } catch (_) {}
    }

    showNotification('Rider profile updated across devices!', 'info');
  };

  const toggleRiderDuty = async (riderId) => {
    let nextStatus = 'active';
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        nextStatus = r.status === 'active' ? 'break' : r.status === 'break' ? 'offline' : 'active';
        showNotification(`${r.name} status: ${nextStatus.toUpperCase()}`, 'info');
        return { ...r, status: nextStatus, isOnline: nextStatus === 'active' };
      }
      return r;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('riders').update({
          status: nextStatus,
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
          riderCoords: null,
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

    showNotification(`Rider ${rider?.name || ''} removed from all devices`, 'info');
  };

  const deleteOrder = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId && o.trackingNumber !== orderId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').delete().eq('tracking_number', orderId);
      } catch (_) {}
    }

    showNotification('Order removed from all devices', 'info');
  };

  const broadcastAdminAnnouncement = (msg) => {
    setAnnouncement({ msg, time: new Date().toLocaleTimeString() });
    soundService.playBroadcastAlert();
    showNotification(`Radio Broadcast: "${msg}"`, 'success');
  };

  const resetSampleData = () => {
    setOrders(INITIAL_ORDERS);
    setRiders(MOCK_RIDERS);
    setServicesList(SERVICES);
    setActiveTrackingId('DE-2026-001');
    showNotification('Sample data & rates refreshed!', 'info');
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