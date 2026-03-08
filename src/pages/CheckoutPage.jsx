import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { collection, serverTimestamp, setDoc, doc, increment, arrayUnion, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateOrderTotals } from '../utils/promoCalculator';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { checkoutSchema } from '../security/validate';
import { sanitizeObject } from '../security/sanitize';
import InvoiceButton from '../components/invoice/InvoiceButton';
import toast from 'react-hot-toast';

// Generate human-readable order ID: AUR-YYYY-XXXXXX
const generateOrderId = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `AUR-${year}-${random}`;
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart, appliedPromo } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Session security — auto-logout after 30 min idle
  useSessionGuard();

  const totals = calculateOrderTotals(cartItems, cartTotal, appliedPromo);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  React.useEffect(() => {
    if (currentUser) {
      const names = currentUser.displayName ? currentUser.displayName.split(' ') : [];
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  // Redirect if cart is empty
  if (cartItems.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // 1. Zod validation
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Sanitize all inputs
    const cleanData = sanitizeObject(result.data);

    setLoading(true);

    try {
      const newOrderId = generateOrderId();
      const orderData = {
        orderId: newOrderId,
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || cleanData.email,
        userName: currentUser?.displayName || `${cleanData.firstName} ${cleanData.lastName}`.trim() || 'Guest',
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || item.images?.[0] || ''
        })),
        promoCode: appliedPromo?.code || null,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingCost: totals.shipping,
        taxAmount: totals.tax,
        total: totals.total,
        status: 'pending',
        shippingAddress: { ...cleanData },
        createdAt: serverTimestamp(),
        // Tracking fields
        currentStatus: 'order_placed',
        trackingNumber: null,
        carrier: null,
        carrierTrackingUrl: null,
        estimatedDelivery: null,
        trackingHistory: [{
          status: 'order_placed',
          message: 'Your order has been received and is being processed.',
          location: null,
          timestamp: Timestamp.now(),
          updatedBy: 'system',
        }],
      };

      // Use setDoc with the custom orderId so Firestore doc ID == orderId
      await setDoc(doc(db, 'orders', newOrderId), orderData);
      const docRef = { id: newOrderId };
      
      // Update Promo Usage if a promo was applied
      if (appliedPromo) {
         try {
           const userId = currentUser?.uid || 'guest';
           const code = appliedPromo.code;
           
           // Update aggregate usage
           await updateDoc(doc(db, "promoCodes", code), {
             usageCount: increment(1)
           });
           
           // Keep track of user limits
           await setDoc(doc(db, "promoUsage", `${userId}_${code}`), {
             userId,
             code,
             usedCount: increment(1),
             lastUsedAt: serverTimestamp(),
             orderIds: arrayUnion(docRef.id)
           }, { merge: true });
         } catch (usageErr) {
           console.error("Non-fatal: Failed to increment promo usage", usageErr);
         }
      }

      setOrderId(docRef.id);
      // Store the complete order so the success screen can generate an invoice
      setCompletedOrder({
        ...orderData,
        orderId: newOrderId,
        id: newOrderId,
        // serverTimestamp() isn't available client-side immediately, use JS Date
        createdAt: { toDate: () => new Date() },
      });
      setSuccess(true);
      clearCart();
      toast.success('Order placed successfully!');
      
      setTimeout(() => {
        navigate('/track?orderId=' + newOrderId);
      }, 3000);
      
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error('Failed to process order. Please try again.');
      setError("Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-dark pt-40 px-6 flex flex-col items-center animate-fade-in text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-8 border border-green-500/50">
          <span className="material-symbols-outlined text-4xl text-green-400">check</span>
        </div>
        <h1 className="font-serif text-4xl text-primary mb-4">Order Confirmed</h1>
        <p className="text-primary/60 text-sm uppercase tracking-widest mb-6">{orderId}</p>
        <p className="text-slate-100/80 mb-8 max-w-md">
          Thank you for choosing Aurum. Your masterpiece is being prepared. Redirecting you to order tracking...
        </p>
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
            <button 
              onClick={() => navigate('/track?orderId=' + orderId)}
              className="btn-lux-primary px-8 py-3 rounded-sm text-xs uppercase tracking-[0.2em] font-bold text-black transition-all"
            >
              Track Your Order
            </button>
            <button 
              onClick={() => navigate('/account?tab=orders')}
              className="px-8 py-3 rounded-sm text-xs uppercase tracking-[0.2em] font-bold border border-primary/30 text-primary hover:bg-primary/10 transition-all"
            >
              View All Orders
            </button>
            {completedOrder && (
              <InvoiceButton order={completedOrder} variant="full" />
            )}
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 pb-20 animate-fade-in">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-serif text-4xl text-primary mb-12 shimmer-gold">Secure <span className="italic">Checkout</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Form Section */}
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-primary/20 pb-4">Shipping Information</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">First Name</label>
                  <input 
                    type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                    className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  {fieldErrors.firstName && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.firstName}</p>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Last Name</label>
                  <input 
                    type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                    className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  {fieldErrors.lastName && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Email</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                />
                {fieldErrors.email && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.email}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Address</label>
                <input 
                  type="text" name="address" required value={formData.address} onChange={handleChange}
                  className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                />
                {fieldErrors.address && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.address}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">City</label>
                  <input 
                    type="text" name="city" required value={formData.city} onChange={handleChange}
                    className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  {fieldErrors.city && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.city}</p>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Country</label>
                  <input 
                    type="text" name="country" required value={formData.country} onChange={handleChange}
                    className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  {fieldErrors.country && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.country}</p>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-100/60 pl-1">Postal Code</label>
                  <input 
                    type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange}
                    className="w-full bg-white/5 border border-primary/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-colors"
                  />
                  {fieldErrors.postalCode && <p className="text-red-400 text-[10px] pl-1">{fieldErrors.postalCode}</p>}
                </div>
              </div>

              {/* Mock Payment Section */}
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mt-8 mb-6 border-b border-primary/20 pb-4">Payment Method</h2>
              <div className="glass-card-premium border border-primary/20 rounded-lg p-6 opacity-60">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                  <span className="text-sm text-white font-medium tracking-wide">Secure Mock Payment</span>
                </div>
                <p className="text-xs text-slate-100/60 leading-relaxed">
                  This is a demonstration environment. No real payment information will be collected. By clicking "Place Order", your request will be generated and processed safely.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-lux-primary w-full py-5 mt-6 rounded-sm text-xs uppercase tracking-[0.2em] font-bold text-black transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Place Order — ${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 shrink-0 order-first lg:order-last mb-12 lg:mb-0">
            <div className="glass-card-premium p-8 rounded-2xl border border-primary/20 sticky top-32">
              <h2 className="font-serif text-2xl text-primary mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded bg-white/5" />
                    <div className="flex flex-col flex-1 justify-center">
                      <span className="text-sm text-slate-100 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-primary/60 uppercase tracking-widest mt-1">Qty: {item.qty}</span>
                      <span className="text-primary font-serif mt-1">${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full h-[1px] bg-primary/20 mb-6"></div>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-sm font-light text-slate-100/80">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                {appliedPromo && totals.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm font-light text-green-400">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${totals.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm font-light text-slate-100/80">
                  <span>Shipping</span>
                  <span className={totals.isFreeShipping || totals.shipping === 0 ? "text-green-400" : "text-white"}>
                    {totals.isFreeShipping || totals.shipping === 0 ? "Complimentary" : `$${totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm font-light text-slate-100/80">
                  <span>Taxes (8%)</span>
                  <span>${totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xs uppercase tracking-widest text-primary">Total Pay</span>
                <span className="font-serif text-2xl text-white">${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
