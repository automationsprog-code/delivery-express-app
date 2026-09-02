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

  // Current logged in user (null = customer by default, no login required)
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

  // Persist user and data
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

  // Supabase Realtime Listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          setOrders(data);
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local state:', err);
      }
    };

    fetchSupabaseOrders();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
          soundService.playOrderChime();
          showNotification(`New Live Booking: ${payload.new.tracking_number}`);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    showNotification('Logged out to Customer View', 'info');
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

  // Create new order
  const createOrder = async (orderInput) => {
    const service = SERVICES.find(s => s.id === orderInput.serviceId) || SERVICES[0];
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
        const existingMessages = o.messages || [];
        return {
          ...o,
          messages: [...existingMessages, newMsg]
        };
      }
      return o;
    }));

    soundService.playOrderChime();
    soundService.triggerVibrate([80]);
  };

  // Assign Rider
  const assignRider = (orderId, riderId) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        const updatedLogs = order.logs.map((log, idx) => {
          if (idx === 1) return { ...log, step: `Rider Assigned (${rider.name})`, time: 'Just now', done: true };
          return log;
        });

        const welcomeMsg = {
          id: `msg-${Date.now()}`,
          senderRole: 'rider',
          senderName: rider.name,
          text: `Maayong adlaw! Ako si ${rider.name}, imong Delivery Express courier. Akong gi-accept imong order #${order.trackingNumber}.`,
          time: 'Just now'
        };

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

    soundService.playOrderChime();
    showNotification(`Courier ${rider.name} assigned!`, 'success');
  };

  // Update Rider Live GPS Location
  const updateRiderLocation = (riderId, newLat, newLng) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, lat: newLat, lng: newLng } : r));
    
    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId && o.status !== 'delivered' && o.status !== 'cancelled') {
        return { ...o, riderCoords: [newLat, newLng] };
      }
      return o;
    }));

    soundService.triggerVibrate([50]);
  };

  // Update order status workflow
  const updateOrderStatus = (orderId, newStatus, customNotes = '') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        let statusText = order.statusText;
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
        } else if (newStatus === 'cancelled') {
          statusText = 'Order Cancelled';
          soundService.triggerVibrate([300]);
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

    showNotification(`Order status updated: ${newStatus}`, 'info');
  };

  // Proof of delivery uploader
  const uploadProofOfDelivery = (orderId, photoUrl, notes) => {
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

    soundService.playSuccessFanfare();
    showNotification('Proof of Delivery submitted!', 'success');
    try {
      confetti({ particleCount: 140, spread: 90 });
    } catch (_) {}
  };

  // Staff & Rider Management
  const addRider = (newRiderData) => {
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
      avatar: newRiderData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    setRiders(prev => [newRider, ...prev]);
    showNotification(`New Courier "${newRider.name}" added successfully!`, 'success');
    soundService.playOrderChime();
  };

  const updateRider = (riderId, updatedFields) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, ...updatedFields } : r));
    showNotification('Rider profile updated!', 'info');
  };

  const toggleRiderDuty = (riderId) => {
    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        const nextStatus = r.status === 'active' ? 'break' : r.status === 'break' ? 'offline' : 'active';
        showNotification(`${r.name} status set to: ${nextStatus.toUpperCase()}`, 'info');
        return { ...r, status: nextStatus, isOnline: nextStatus === 'active' };
      }
      return r;
    }));
  };

  const deleteRider = (riderId) => {
    const rider = riders.find(r => r.id === riderId);
    setRiders(prev => prev.filter(r => r.id !== riderId));
    showNotification(`Rider ${rider?.name || ''} removed from roster`, 'info');
  };

  const broadcastAdminAnnouncement = (msg) => {
    setAnnouncement({ msg, time: new Date().toLocaleTimeString() });
    soundService.playBroadcastAlert();
    showNotification(`Radio Broadcast Sent: "${msg}"`, 'success');
  };

  const resetSampleData = () => {
    setOrders(INITIAL_ORDERS);
    setRiders(MOCK_RIDERS);
    setActiveTrackingId('DE-2026-001');
    showNotification('Sample data refreshed!', 'info');
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
        currentUser,
        loginAsRider,
        loginAsAdmin,
        logout,
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