import { useState, useEffect } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// Ordered main progression steps — used to enforce forward-only movement
export const STATUS_PROGRESSION = [
  'order_placed',
  'payment_confirmed',
  'preparing',
  'quality_check',
  'packaged',
  'dispatched',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

// Side-branch statuses that can be applied from specific states
export const SIDE_STATUSES = ['delivery_attempted', 'on_hold', 'returned'];

export const DEFAULT_MESSAGES = {
  payment_confirmed: 'Your payment has been verified. We are preparing your order.',
  preparing: 'Our craftsmen are carefully preparing your piece.',
  quality_check: 'Your jewelry is undergoing our final quality inspection.',
  packaged: 'Your order has been beautifully packaged and is ready to ship.',
  dispatched: 'Your order has been handed over to the courier.',
  in_transit: 'Your order is on its way to you.',
  out_for_delivery: 'Your order is out for delivery today.',
  delivered: 'Your order has been delivered. Enjoy your AURUM piece!',
  delivery_attempted: 'Delivery was attempted but unsuccessful. We will try again.',
  on_hold: 'Your order is temporarily on hold. Our team will contact you.',
  returned: 'Your order has been returned to our facility.',
};

/**
 * Returns valid next statuses based on current status (forward only + side branches)
 */
export const getNextValidStatuses = (currentStatus) => {
  const currentIdx = STATUS_PROGRESSION.indexOf(currentStatus);
  if (currentIdx === -1) {
    // side-branch — only allow all main statuses after dispatched
    return STATUS_PROGRESSION.slice(STATUS_PROGRESSION.indexOf('dispatched') + 1);
  }
  // Can move to the next step in main progression
  const nextMain = currentIdx < STATUS_PROGRESSION.length - 1
    ? [STATUS_PROGRESSION[currentIdx + 1]]
    : [];

  // Allow side-branches from certain states
  const allowSideBranches = currentIdx >= STATUS_PROGRESSION.indexOf('dispatched');
  const sides = allowSideBranches ? SIDE_STATUSES : [];

  return [...nextMain, ...sides].filter(s => s !== currentStatus);
};

/**
 * useOrderTracking — subscribes to a single order document in real-time.
 *
 * @param {string} orderId — The Firestore document ID (same as our custom AUR-YYYY-XXXXXX)
 * @param {boolean} isAdmin — Skip ownership check if true
 */
export const useOrderTracking = (orderId, isAdmin = false) => {
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const orderRef = doc(db, 'orders', orderId);

    const unsub = onSnapshot(
      orderRef,
      (snap) => {
        if (!snap.exists()) {
          setError('Order not found.');
          setOrder(null);
          setLoading(false);
          return;
        }

        const data = { id: snap.id, ...snap.data() };

        // Ownership check for non-admin users
        if (!isAdmin && currentUser && data.userId !== currentUser.uid) {
          setError('You do not have permission to view this order.');
          setOrder(null);
          setLoading(false);
          return;
        }

        setOrder(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Order tracking snapshot error:', err);
        setError('Failed to load tracking information.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [orderId, currentUser, isAdmin]);

  // Derived values
  const trackingHistory = order?.trackingHistory
    ? [...order.trackingHistory].sort((a, b) => {
        const aMs = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
        const bMs = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
        return aMs - bMs;
      })
    : [];

  const currentStatus = order?.currentStatus || null;

  const estimatedDelivery = order?.estimatedDelivery
    ? (order.estimatedDelivery.toDate
        ? order.estimatedDelivery.toDate()
        : new Date(order.estimatedDelivery))
    : null;

  // ─── Admin-only mutation functions ───────────────────────────────────────

  const pushStatusUpdate = async ({ status, message, location }) => {
    if (!orderId) return;
    const orderRef = doc(db, 'orders', orderId);
    const payload = {
      currentStatus: status,
      trackingHistory: arrayUnion({
        status,
        message,
        location: location || null,
        timestamp: Timestamp.now(),
        updatedBy: 'admin',
      }),
      ...(status === 'delivered' && { deliveredAt: serverTimestamp() }),
    };
    await updateDoc(orderRef, payload);
  };

  const setTrackingInfo = async ({ carrier, trackingNumber, carrierTrackingUrl }) => {
    if (!orderId) return;
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      carrier: carrier || null,
      trackingNumber: trackingNumber || null,
      carrierTrackingUrl: carrierTrackingUrl || null,
    });
  };

  const setEstimatedDelivery = async (date) => {
    if (!orderId || !date) return;
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      estimatedDelivery: Timestamp.fromDate(new Date(date)),
    });
  };

  return {
    order,
    trackingHistory,
    currentStatus,
    estimatedDelivery,
    loading,
    error,
    // Admin only
    pushStatusUpdate,
    setTrackingInfo,
    setEstimatedDelivery,
  };
};
