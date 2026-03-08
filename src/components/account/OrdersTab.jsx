import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Package, ChevronDown, ChevronUp, ArrowRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TrackingStatusBadge from '../TrackingStatusBadge';
import InvoiceButton from '../invoice/InvoiceButton';
import InvoicePreviewModal from '../invoice/InvoicePreviewModal';
import toast from 'react-hot-toast';

const OrdersTab = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  const navigate = useNavigate();
  const prevStatusesRef = useRef({});

  // Live real-time listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      // Detect status changes and toast
      fetched.forEach(order => {
        const prevStatus = prevStatusesRef.current[order.id];
        const newStatus = order.currentStatus;
        if (prevStatus && newStatus && prevStatus !== newStatus) {
          const itemName = order.items?.[0]?.name || 'Your order';
          const statusLabel = newStatus.replace(/_/g, ' ');
          toast(`📦 ${itemName} — status updated: ${statusLabel}`, { icon: '🚚' });
        }
        // Update ref
        prevStatusesRef.current[order.id] = newStatus;
      });

      setOrders(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Error subscribing to orders:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(timestamp.toDate());
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border";
    switch(status?.toLowerCase()) {
      case 'confirmed': return `${base} bg-blue-500/10 border-blue-500/30 text-blue-400`;
      case 'shipped': return `${base} bg-purple-500/10 border-purple-500/30 text-purple-400`;
      case 'delivered': return `${base} bg-green-500/10 border-green-500/30 text-green-400`;
      case 'cancelled': return `${base} bg-red-500/10 border-red-500/30 text-red-500`;
      default: return `${base} bg-amber-500/10 border-amber-500/30 text-amber-500`; // pending
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass-card-premium border border-primary/10 rounded-2xl p-12 text-center flex flex-col items-center">
        <Package size={48} className="text-primary/40 mb-6 stroke-1" />
        <h3 className="font-serif text-2xl text-white mb-2">You haven't placed any orders yet</h3>
        <p className="text-slate-100/50 text-sm mb-8">Discover your next masterpiece in our curated collections.</p>
        <Link to="/shop" className="btn-lux-primary px-8 py-3 rounded-sm text-xs uppercase tracking-[0.2em] font-bold text-black transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 className="font-serif text-3xl text-primary mb-2">My Orders</h2>
      <p className="text-sm text-slate-100/60 mb-6">View and track your previous purchases.</p>
      
      {orders.map((order) => (
        <div key={order.id} className="glass-card-premium border border-primary/20 rounded-xl overflow-hidden">
          
          {/* Order Header */}
          <div className="bg-white/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-x-12 gap-y-4 w-full md:w-auto">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Order Placed</p>
                <p className="text-sm text-white">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Total</p>
                <p className="text-sm font-serif text-primary">${order.totalAmount?.toLocaleString() || order.total?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Order ID</p>
                <p className="text-sm text-slate-100/80 font-mono">#AURUM-{order.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
              <TrackingStatusBadge status={order.currentStatus || order.status || 'order_placed'} />
              <button
                onClick={() => navigate('/track?orderId=' + (order.orderId || order.id))}
                className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors"
              >
                Track <ArrowRight size={12} />
              </button>
              {/* Invoice Preview button */}
              {order.status !== 'cancelled' && order.currentStatus !== 'cancelled' && (
                <button
                  onClick={() => setPreviewOrder(order)}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#D4AF7F]/70 hover:text-[#D4AF7F] transition-colors"
                  title="Preview Invoice"
                >
                  <FileText size={12} /> Invoice
                </button>
              )}
              <button 
                onClick={() => toggleExpand(order.id)}
                className="text-primary hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase tracking-widest"
              >
                {expandedOrderId === order.id ? 'Hide Details' : 'Details'}
                {expandedOrderId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
          
          {/* Promo Snippet - if code used */}
          {order.promoCode && order.discountAmount > 0 && (
            <div className="bg-green-500/5 px-6 py-3 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-green-400">sell</span>
                <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold">Promo Applied: {order.promoCode}</span>
              </div>
              <span className="text-xs text-green-400 font-medium tracking-wide">
                You saved ${order.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Collapsed Items Preview */}
          {expandedOrderId !== order.id && order.items && (
            <div className="p-6 flex items-center gap-4">
              <div className="flex -space-x-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-12 h-16 rounded overflow-hidden border border-primary/20 bg-black relative z-[10]">
                    <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-100/80">
                {order.items[0]?.name} {order.items.length > 1 && <span className="text-primary/60 text-xs ml-1 font-light">and {order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}</span>}
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {expandedOrderId === order.id && (
            <div className="p-6 border-t border-primary/10 animate-fade-in bg-black/20">
              <h4 className="text-[10px] uppercase tracking-widest text-primary mb-4">Items in this order</h4>
              <div className="flex flex-col gap-4 mb-6">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded bg-white/5" />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm text-slate-100">{item.name}</span>
                      <span className="text-[10px] text-primary/50 uppercase tracking-widest mt-1">Qty: {item.qty}</span>
                    </div>
                    <span className="font-serif text-white">${(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              {/* Promo Breakdown in Details */}
              {order.promoCode && (
                <div className="flex flex-col gap-2 mb-8 bg-black/40 p-4 rounded-xl border border-primary/10">
                  <div className="flex justify-between items-center text-xs text-slate-100/60">
                    <span>Subtotal</span>
                    <span>${order.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || order.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-green-400 font-medium">
                    <span>Discount ({order.promoCode})</span>
                    <span>-${order.discountAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-100/60">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'Complimentary' : `$${order.shippingCost?.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-100/60">
                    <span>Tax</span>
                    <span>${order.taxAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full h-[1px] bg-primary/20 my-2"></div>
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Paid</span>
                    <span>${order.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
              
              {order.shippingAddress && (
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <h4 className="text-[10px] uppercase tracking-widest text-primary mb-2">Shipping Information</h4>
                  <p className="text-sm text-slate-100/70 leading-relaxed">
                    {order.customer?.firstName || order.shippingAddress.firstName} {order.customer?.lastName || order.shippingAddress.lastName}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}

              {/* Invoice download row inside expanded details */}
              <div className="mt-6 pt-4 border-t border-primary/10 flex items-center gap-3">
                <InvoiceButton order={order} variant="full" />
                <button
                  onClick={() => setPreviewOrder(order)}
                  className="text-[10px] uppercase tracking-widest text-[#D4AF7F]/60 hover:text-[#D4AF7F] transition-colors"
                >
                  Preview Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Invoice Preview Modal */}
      {previewOrder && (
        <InvoicePreviewModal order={previewOrder} onClose={() => setPreviewOrder(null)} />
      )}
    </div>
  );
};

export default OrdersTab;
