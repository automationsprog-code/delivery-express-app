import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ORDERS, MOCK_RIDERS, SERVICES, BRAND } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_riders');
    return saved ? JSON.parse(saved) : MOCK_RIDERS;
  });

  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'rider' | 'admin'
  const [selectedRiderId, setSelectedRiderId] = useState('rider-1');
  const [activeTrackingId, setActiveTrackingId] = useState('DE-2026-001');
  const [notification, setNotification] = useState(null);

  // Save to localStorage for instant offline demo / state persistence
  useEffect(() => {
    localStorage.setItem('delivery_express_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('delivery_express_riders', JSON.stringify(riders));
  }, [riders]);

  // Supabase Real-time Listeners if enabled
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Fetch initial data from Supabase
    const fetchSupabaseOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Format orders if needed
          setOrders(data);
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local state:', err);
      }
    };

    fetchSupabaseOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
          showNotification(`New Order: ${payload.new.tracking_number}`);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Check if currently within operating hours (8:00 AM - 2:00 AM)
  const isWithinOperatingHours = () => {
    const now = new Date();
    const hour = now.getHours(); // 0 to 23
    // 8 AM to 23:59 (8 to 23) OR 0:00 to 1:59 (0, 1)
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
      dropoffAddress: orderInput.dropoffAddress,
      dropoffLandmark: orderInput.dropoffLandmark || '',
      distanceKm: parseFloat(orderInput.distanceKm || 3.5),
      estimatedFare: parseFloat(orderInput.estimatedFare),
      itemCost: parseFloat(orderInput.itemCost || 0),
      paymentMethod: orderInput.paymentMethod || 'Cash on Delivery',
      status: 'pending',
      statusText: 'Waiting for Courier Assignment',
      riderId: null,
      riderName: null,
      riderPhone: null,
      details: orderInput.details || {},
      customerNotes: orderInput.customerNotes || '',
      createdAt: new Date().toISOString(),
      logs: [
        { step: 'Booking Submitted', time: 'Just now', done: true },
        { step: 'Rider Assignment', time: 'Searching nearby...', done: false },
        { step: 'Purchased / Picked up', time: 'Pending', done: false },
        { step: 'Out for Delivery', time: 'Pending', done: false },
        { step: 'Delivered', time: 'Pending', done: false }
      ]
    };

    // If Supabase configured, insert row
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
          dropoff_address: newOrder.dropoffAddress,
          dropoff_landmark: newOrder.dropoffLandmark,
          distance_km: newOrder.distanceKm,
          estimated_fare: newOrder.estimatedFare,
          item_estimated_cost: newOrder.itemCost,
          payment_method: newOrder.paymentMethod === 'GCash' ? 'gcash' : 'cash_on_delivery',
          details: newOrder.details,
          customer_notes: newOrder.customerNotes,
          status: 'pending'
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving to local state:', err);
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingId(trackingNumber);
    showNotification(`Booking ${trackingNumber} created successfully!`, 'success');
    
    // Auto trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    return newOrder;
  };

  // Assign Rider to order
  const assignRider = (orderId, riderId) => {
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
          status: 'assigned',
          statusText: `Rider Assigned: ${rider.name}`,
          logs: updatedLogs
        };
      }
      return order;
    }));

    showNotification(`Rider ${rider.name} assigned to order!`, 'success');
  };

  // Update order status workflow
  const updateOrderStatus = (orderId, newStatus, customNotes = '') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.trackingNumber === orderId) {
        let statusText = order.statusText;
        let logs = [...order.logs];

        if (newStatus === 'purchasing') {
          statusText = 'At Pickup / Purchasing Items';
          logs[2] = { step: 'Items Purchased / Picked Up', time: 'Just now', done: true };
        } else if (newStatus === 'in_transit') {
          statusText = 'Rider Out for Delivery';
          logs[3] = { step: 'Out for Delivery', time: 'Just now', done: true };
        } else if (newStatus === 'delivered') {
          statusText = 'Order Delivered Successfully';
          logs[4] = { step: 'Delivered & Completed', time: 'Just now', done: true };
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          } catch (_) {}
        } else if (newStatus === 'cancelled') {
          statusText = 'Order Cancelled';
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

    showNotification(`Order status updated to: ${newStatus}`, 'info');
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

    showNotification('Proof of Delivery submitted!', 'success');
    try {
      confetti({ particleCount: 120, spread: 90 });
    } catch (_) {}
  };

  // Reset to sample data
  const resetSampleData = () => {
    setOrders(INITIAL_ORDERS);
    setRiders(MOCK_RIDERS);
    setActiveTrackingId('DE-2026-001');
    showNotification('Sample data reset successfully!', 'info');
  };

  return (
    <OrderContext.Provider
      value={{
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
        isWithinOperatingHours,
        createOrder,
        assignRider,
        updateOrderStatus,
        uploadProofOfDelivery,
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
