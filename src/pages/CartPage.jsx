import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import PromoCodeInput from '../components/promos/PromoCodeInput';
import { calculateOrderTotals } from '../utils/promoCalculator';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, cartTotal, appliedPromo } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const totals = calculateOrderTotals(cartItems, cartTotal, appliedPromo);

  const handleCheckout = () => {
    if (currentUser) {
      navigate('/checkout');
    } else {
      // Redirect to login, then they can come back to checkout
      navigate('/login?redirect=/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background-dark pt-40 px-6 lg:px-20 text-center animate-fade-in flex flex-col items-center">
        <span className="material-symbols-outlined text-6xl text-primary/30 mb-6">shopping_bag</span>
        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-4">Your Bag is Empty</h1>
        <p className="text-slate-100/60 mb-8 font-light">Elegance awaits. Discover your next masterpiece.</p>
        <Link to="/shop" className="btn-lux-primary inline-flex items-center justify-center rounded-full px-8 py-4 text-xs tracking-[0.2em] font-bold uppercase text-black transition-all hover:shadow-[0_0_20px_rgba(212,175,127,0.3)]">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pt-32 px-6 lg:px-20 pb-20 animate-fade-in">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="font-serif text-4xl text-primary mb-12 shimmer-gold">Your <span className="italic">Bag</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Cart Items */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-primary/20 pb-4 text-[10px] uppercase tracking-widest text-primary/60">
              <div className="col-span-6">Item</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-4 items-start md:items-center border-b border-white/5 pb-8">
                
                {/* Product Info */}
                <div className="col-span-6 flex gap-6 w-full">
                  <Link to={`/shop/${item.id}`} className="shrink-0 w-24 h-32 md:w-32 md:h-40 bg-white/5 rounded-xl overflow-hidden group">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link to={`/shop/${item.id}`} className="font-serif text-lg md:text-xl text-slate-100 hover:text-primary transition-colors mb-2">{item.name}</Link>
                    <p className="text-[10px] uppercase tracking-widest text-primary/50 mb-4">{item.category}</p>
                    <span className="text-primary font-serif">${item.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-3 flex items-center justify-between w-full md:w-auto md:justify-center">
                  <div className="flex items-center gap-4 glass-card-premium rounded-full px-4 py-2 border border-primary/20">
                    <button 
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="text-primary/60 hover:text-primary transition-colors"
                      disabled={item.qty <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-white text-sm w-4 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="text-primary/60 hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="md:hidden text-primary/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Item Line Total & Desktop Remove */}
                <div className="col-span-3 flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
                  <span className="md:hidden text-xs uppercase tracking-widest text-primary/50">Total</span>
                  <span className="font-serif text-lg text-white">${(item.price * item.qty).toLocaleString()}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="hidden md:block text-primary/40 hover:text-red-400 transition-colors ml-4 focus:outline-none"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
            ))}
            
            <PromoCodeInput />
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="glass-card-premium p-8 rounded-2xl border border-primary/20 sticky top-32">
              <h2 className="font-serif text-2xl text-primary mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-8">
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
                  <span>Estimated Shipping</span>
                  <span className={totals.isFreeShipping || totals.shipping === 0 ? "text-green-400" : "text-white"}>
                    {totals.isFreeShipping || totals.shipping === 0 ? "Complimentary" : `$${totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-light text-slate-100/80">
                  <span>Taxes (8%)</span>
                  <span>${totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="w-full h-[1px] bg-primary/20 mb-6"></div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-xs uppercase tracking-widest text-primary/60">Estimated Total</span>
                <span className="font-serif text-2xl text-white">${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-lux-primary flex items-center justify-center gap-2 rounded-sm py-4 text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(212,175,127,0.3)] mb-4"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
              
              <Link to="/shop" className="w-full flex items-center justify-center py-4 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
