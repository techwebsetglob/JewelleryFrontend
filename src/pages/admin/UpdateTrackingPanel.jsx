import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import {
  useOrderTracking,
  getNextValidStatuses,
  DEFAULT_MESSAGES,
  STATUS_PROGRESSION,
} from '../../hooks/useOrderTracking';
import TrackingStatusBadge from '../../components/TrackingStatusBadge';
import toast from 'react-hot-toast';
import { ChevronRight, Package } from 'lucide-react';

const CARRIERS = ['FedEx', 'DHL', 'BlueDart', 'DTDC', 'India Post', 'UPS'];

const STATUS_LABELS = {
  order_placed: 'Order Placed',
  payment_confirmed: 'Payment Confirmed',
  preparing: 'Preparing',
  quality_check: 'Quality Check',
  packaged: 'Packaged',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delivery_attempted: 'Delivery Attempted',
  on_hold: 'On Hold',
  returned: 'Returned',
};

const formatTs = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(d);
};

// ── Inner Panel for a single selected order ───────────────────────────────
const OrderDetailPanel = ({ orderId, onClose }) => {
  const { order, trackingHistory, currentStatus, loading, error, pushStatusUpdate, setTrackingInfo, setEstimatedDelivery } = useOrderTracking(orderId, true);

  // Carrier form state
  const [carrier, setCarrier] = useState('');
  const [trackingNum, setTrackingNum] = useState('');
  const [carrierUrl, setCarrierUrl] = useState('');
  const [edd, setEdd] = useState('');
  const [carrierSaving, setCarrierSaving] = useState(false);

  // Status update form state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  // Pre-fill carrier form when order loads
  useEffect(() => {
    if (order) {
      setCarrier(order.carrier || '');
      setTrackingNum(order.trackingNumber || '');
      setCarrierUrl(order.carrierTrackingUrl || '');
      if (order.estimatedDelivery) {
        const d = order.estimatedDelivery.toDate ? order.estimatedDelivery.toDate() : new Date(order.estimatedDelivery);
        const tzOffset = d.getTimezoneOffset() * 60000;
        setEdd(new Date(d - tzOffset).toISOString().slice(0, 16));
      }
    }
  }, [order]);

  // Pre-fill status message when status changes
  useEffect(() => {
    if (selectedStatus) {
      setStatusMessage(DEFAULT_MESSAGES[selectedStatus] || '');
    }
  }, [selectedStatus]);

  const handleSaveCarrier = async (e) => {
    e.preventDefault();
    setCarrierSaving(true);
    try {
      await setTrackingInfo({ carrier, trackingNumber: trackingNum, carrierTrackingUrl: carrierUrl });
      if (edd) await setEstimatedDelivery(edd);
      toast.success('Carrier information saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save carrier info.');
    } finally {
      setCarrierSaving(false);
    }
  };

  const handlePushStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) { toast.error('Please select a status.'); return; }
    if (!statusMessage.trim()) { toast.error('Please enter a message.'); return; }
    setStatusSaving(true);
    try {
      await pushStatusUpdate({ status: selectedStatus, message: statusMessage.trim(), location: statusLocation.trim() });
      toast.success(`Status updated to "${STATUS_LABELS[selectedStatus]}"`);
      setSelectedStatus('');
      setStatusMessage('');
      setStatusLocation('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to push status update.');
    } finally {
      setStatusSaving(false);
    }
  };

  const nextStatuses = currentStatus ? getNextValidStatuses(currentStatus) : [];

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
    </div>
  );

  if (error || !order) return (
    <p className="text-red-400 text-sm p-4">{error || 'Order not found.'}</p>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-8 pt-24 pb-6 border-b border-primary/15 shrink-0">
        <div>
          <h2 className="font-serif text-xl text-primary">{order.orderId || `#${order.id?.slice(-6).toUpperCase()}`}</h2>
          <TrackingStatusBadge status={currentStatus} className="mt-2" />
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors ml-4">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">

        {/* ── Carrier Info ─────────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-primary/60 mb-4 flex items-center gap-2">
            <Package size={13} /> Carrier Information
          </h3>
          <form onSubmit={handleSaveCarrier} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white appearance-none"
              >
                <option value="">— Select carrier —</option>
                {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Tracking Number</label>
              <input
                type="text"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                placeholder="e.g. FX928374001IN"
                className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Carrier Tracking URL</label>
              <input
                type="url"
                value={carrierUrl}
                onChange={(e) => setCarrierUrl(e.target.value)}
                placeholder="https://www.fedex.com/..."
                className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Estimated Delivery</label>
              <input
                type="datetime-local"
                value={edd}
                onChange={(e) => setEdd(e.target.value)}
                className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              disabled={carrierSaving}
              className="btn-lux-primary py-3 rounded-sm text-xs uppercase tracking-widest font-bold text-black flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {carrierSaving ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
              Save Carrier Info
            </button>
          </form>
        </section>

        <div className="w-full h-px bg-primary/15" />

        {/* ── Push Status Update ─────────────────── */}
        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-primary/60 mb-4">Push Status Update</h3>
          {nextStatuses.length === 0 ? (
            <p className="text-xs text-white/30 italic">No further statuses available for this order.</p>
          ) : (
            <form onSubmit={handlePushStatus} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white appearance-none"
                >
                  <option value="">— Select next status —</option>
                  {nextStatuses.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Message</label>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white resize-none"
                  placeholder="Describe the current status..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/40">Location (optional)</label>
                <input
                  type="text"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  placeholder="e.g. Mumbai Sorting Facility"
                  className="w-full bg-black border border-primary/20 rounded-lg p-3 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={statusSaving}
                className="btn-lux-primary py-3 rounded-sm text-xs uppercase tracking-widest font-bold text-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {statusSaving ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                Push Update →
              </button>
            </form>
          )}
        </section>

        <div className="w-full h-px bg-primary/15" />

        {/* ── History Log ──────────────────────────── */}
        <section className="pb-8">
          <h3 className="text-[10px] uppercase tracking-widest text-primary/60 mb-4">Update History</h3>
          {trackingHistory.length === 0 ? (
            <p className="text-xs text-white/30 italic">No history yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {[...trackingHistory].reverse().map((ev, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{STATUS_LABELS[ev.status] || ev.status}</p>
                    <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{ev.message}</p>
                    {ev.location && <p className="text-[10px] text-primary/40 mt-0.5">📍 {ev.location}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/30">{formatTs(ev.timestamp)}</p>
                    <p className="text-[9px] uppercase tracking-widest text-primary/30 mt-0.5">{ev.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// ── Main Admin Page ────────────────────────────────────────────────────────
const UpdateTrackingPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.userEmail || '').toLowerCase().includes(q) ||
      (o.userName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-12 pb-20 animate-fade-in">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-primary mb-2">Order Tracking Manager</h1>
          <p className="text-slate-100/60 text-[10px] uppercase tracking-widest">Update status, carrier info &amp; push shipping events</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-sm">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, email, name..."
            className="w-full bg-white/5 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : (
          <div className="glass-card-premium border border-primary/20 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-primary/20 text-[10px] uppercase tracking-widest text-primary/50">
                  <th className="p-4 font-normal">Order ID</th>
                  <th className="p-4 font-normal">Customer</th>
                  <th className="p-4 font-normal">Placed</th>
                  <th className="p-4 font-normal">Total</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-white/30 text-sm">No orders found.</td>
                  </tr>
                )}
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-white/5 transition-colors text-sm cursor-pointer ${selected?.id === order.id ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                    onClick={() => setSelected(order)}
                  >
                    <td className="p-4 font-mono text-primary text-xs">{order.orderId || `#${order.id.slice(-6).toUpperCase()}`}</td>
                    <td className="p-4">
                      <p className="text-white text-xs">{order.userName || '—'}</p>
                      <p className="text-white/40 text-[10px]">{order.userEmail}</p>
                    </td>
                    <td className="p-4 text-white/60 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="p-4 font-serif text-primary">${order.total?.toLocaleString()}</td>
                    <td className="p-4">
                      <TrackingStatusBadge status={order.currentStatus || order.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(order); }}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors ml-auto"
                      >
                        Update <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Detail Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[520px] z-50 bg-background-dark border-l border-primary/20 shadow-2xl transition-transform duration-500 ${selected ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selected && (
          <OrderDetailPanel
            orderId={selected.id}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* Backdrop */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default UpdateTrackingPanel;
