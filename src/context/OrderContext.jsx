import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ORDERS, MOCK_RIDERS, SERVICES, BRAND } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_orders_balamban');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [riders, setRiders] = useState(() => {
    const saved = localStorage.getItem('delivery_express_riders_balamban');
    return saved ? JSON.parse(saved) : MOCK_RIDERS;
  });

  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'rider' | 'admin'
  const [selectedRiderId, setSelectedRiderId] = useState('rider-1');
  const [activeTrackingId, setActiveTrackingId] = useState('DE-2026-001');
  const [notification, setNotification] = useState(null);

  // Save to localStorage
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
          showNotification(`New Order in Balamban: ${payload.new.tracking_number}`);
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

  const isWithinOperatingHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 8 || hour < 2;
  };

  // Create new order with Balamban Coordinates
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
      pickupCoords: orderInput.pickupCoords || [10.5015, 123.7150], // Balamban Market
      dropoffAddress: orderInput.dropoffAddress,
      dropoffLandmark: orderInput.dropoffLandmark || '',
      dropoffCoords: orderInput.dropoffCoords || [10.4720, 123.7060], // Buanoy
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
    showNotification(`Booking ${trackingNumber} created in Balamban!`, 'success');
    
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}

    return newOrder;
  };

  // Assign Rider & set rider GPS coordinates
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
          riderCoords: [rider.lat, rider.lng],
          status: 'assigned',
          statusText: `Rider Assigned: ${rider.name}`,
          logs: updatedLogs
        };
      }
      return order;
    }));

    showNotification(`Courier ${rider.name} assigned in Balamban!`, 'success');
  };

  // Update Rider Live GPS Location
  const updateRiderLocation = (riderId, newLat, newLng) => {
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, lat: newLat, lng: newLng } : r));
    
    // Also update all active orders assigned to this rider
    setOrders(prev => prev.map(o => {
      if (o.riderId === riderId && o.status !== 'delivered' && o.status !== 'cancelled') {
        return { ...o, riderCoords: [newLat, newLng] };
      }
      return o;
    }));

    showNotification(`Rider GPS synced: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`, 'info');
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
        } else if (newStatus === 'in_transit') {
          statusText = 'Courier Out for Delivery in Balamban';
          logs[3] = { step: 'Out for Delivery', time: 'Just now', done: true };
        } else if (newStatus === 'delivered') {
          statusText = 'Delivered Successfully in Balamban';
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

    showNotification('Proof of Delivery submitted!', 'success');
    try {
      confetti({ particleCount: 120, spread: 90 });
    } catch (_) {}
  };

  // Reset to sample Balamban data
  const resetSampleData = () => {
    setOrders(INITIAL_ORDERS);
    setRiders(MOCK_RIDERS);
    setActiveTrackingId('DE-2026-001');
    showNotification('Balamban, Cebu sample data refreshed!', 'info');
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
        updateRiderLocation,
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