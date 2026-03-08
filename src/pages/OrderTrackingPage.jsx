import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
import InvoiceButton from '../components/invoice/InvoiceButton';
import { Search, Package, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formOrderId, setFormOrderId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Logged-in users: list all their orders
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Auto-load from URL param
  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      setTrackedOrderId(paramId);
    }
  }, [searchParams]);

  // Fetch orders for logged-in users via onSnapshot
  useEffect(() => {
    if (!currentUser) return;

    setOrdersLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA;
      });
      setUserOrders(fetched);
      setOrdersLoading(false);
    }, (err) => {
      console.error('Error loading orders:', err);
      setOrdersLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleGuestLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    const id = formOrderId.trim().toUpperCase();
    const email = formEmail.trim().toLowerCase();

    if (!id || !email) {
      setLookupError('Please enter both your Order ID and email address.');
      return;
    }

    setLookupLoading(true);
    try {
      // Query by orderId field AND userEmail field
      const q = query(
        collection(db, 'orders'),
        where('orderId', '==', id),
        where('userEmail', '==', email)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setLookupError('No order found with these details. Please check your Order ID and email address.');
        setTrackedOrderId(null);
      } else {
        const orderDoc = snap.docs[0];
        setTrackedOrderId(orderDoc.id);
        setLookupError('');
      }
    } catch (err) {
      console.error('Guest lookup error:', err);
      setLookupError('An error occurred. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  };

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 pb-20 animate-fade-in">
      <div className="mx-auto max-w-[1440px]">

        {/* Page Header */}
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3">Real-Time Updates</p>
          <h1 className="font-serif text-4xl lg:text-5xl text-primary shimmer-gold mb-4">
            Track Your <span className="italic">Order</span>
          </h1>
          <p className="text-slate-100/60 text-sm max-w-lg">
            Follow your AURUM masterpiece as it is crafted, inspected, and delivered to your door.
          </p>
        </div>

        {/* ── LOGGED-IN USER VIEW ─────────────────────────────── */}
        {currentUser ? (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="glass-card-premium border border-primary/10 rounded-2xl p-16 text-center flex flex-col items-center">
                <Package size={52} className="text-primary/30 mb-6 stroke-1" />
                <h3 className="font-serif text-2xl text-white mb-2">No orders yet</h3>
                <p className="text-slate-100/50 text-sm mb-8">Discover your next masterpiece in our curated collections.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="btn-lux-primary px-8 py-3 rounded-sm text-xs uppercase tracking-[0.2em] font-bold text-black"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {userOrders.map((order) => (
                  <div key={order.id} className="glass-card-premium border border-primary/20 rounded-xl overflow-hidden">
                    {/* Order summary row */}
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.03]">
                      <div className="flex flex-wrap gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Order ID</p>
                          <p className="text-sm font-mono text-white">{order.orderId || `#${order.id.slice(-6).toUpperCase()}`}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Placed</p>
                          <p className="text-sm text-white">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-1">Total</p>
                          <p className="text-sm font-serif text-primary">${order.total?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <TrackingStatusBadge status={order.currentStatus || order.status} />
                        {/* Invoice quick-download button — always visible */}
                        <InvoiceButton order={order} variant="icon" />
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                          {expandedOrderId === order.id ? 'Hide Tracker' : 'Track Order'}
                          <ArrowRight size={12} className={`transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded tracker */}
                    {expandedOrderId === order.id && (
                      <div className="p-6 lg:p-10 border-t border-primary/10 animate-fade-in">
                        <OrderTracker orderId={order.id} />
                        {/* Invoice download below tracking timeline */}
                        <div className="mt-6 pt-5 border-t border-primary/10">
                          <InvoiceButton order={order} variant="full" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── GUEST / URL-PARAM TRACKING VIEW ───────────────── */
          <div>
            {/* Lookup Form */}
            {!trackedOrderId && (
              <div className="max-w-lg">
                <div className="glass-card-premium border border-primary/20 rounded-2xl p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Search size={18} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl text-white">Track Your Order</h2>
                      <p className="text-[10px] uppercase tracking-widest text-primary/50">No login required</p>
                    </div>
                  </div>

                  <form onSubmit={handleGuestLookup} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">
                        Order ID
                      </label>
                      <input
                        type="text"
                        value={formOrderId}
                        onChange={(e) => setFormOrderId(e.target.value.toUpperCase())}
                        placeholder="AUR-2026-XXXXXX"
                        className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white font-mono placeholder-white/25 focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="The email used at checkout"
                        className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    {lookupError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                        {lookupError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={lookupLoading}
                      className="btn-lux-primary w-full py-4 mt-2 rounded-sm text-xs uppercase tracking-[0.2em] font-bold text-black flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {lookupLoading ? (
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      ) : (
                        <>
                          Track Order
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-xs text-white/30 mt-6">
                    Have an account?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-primary hover:text-white transition-colors underline underline-offset-2"
                    >
                      Sign in
                    </button>{' '}
                    to see all your orders.
                  </p>
                </div>
              </div>
            )}

            {/* Tracker result */}
            {trackedOrderId && (
              <div>
                {/* Back button */}
                <button
                  onClick={() => { setTrackedOrderId(null); setFormOrderId(''); setFormEmail(''); }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors mb-8"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Track Another Order
                </button>
                <OrderTracker orderId={trackedOrderId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
