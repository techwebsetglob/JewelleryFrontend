import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import PromoCodeInput from './promos/PromoCodeInput';
import { calculateOrderTotals } from '../utils/promoCalculator';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQty, cartTotal, isCartOpen, setIsCartOpen, appliedPromo } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (currentUser) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  const totals = calculateOrderTotals(cartItems, cartTotal, appliedPromo);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-background-dark border-l border-primary/20 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <h2 className="font-serif text-2xl text-primary shimmer-gold">Your Bag</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-primary/60 hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-4 block">shopping_bag</span>
              <p className="font-serif text-xl text-primary mb-2">Your Bag is Empty</p>
              <p className="text-slate-100/60 text-sm">Discover your next masterpiece.</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 border-b border-white/5 pb-6">
                <div className="w-20 h-24 bg-white/5 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <Link 
                        to={`/shop/${item.id}`} 
                        onClick={() => setIsCartOpen(false)}
                        className="font-serif text-white hover:text-primary transition-colors text-sm line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[10px] uppercase tracking-widest text-primary/50 mt-1">{item.category}</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-primary/40 hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3 glass-card-premium rounded-full px-2 py-1 border border-primary/20">
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="text-primary/80 hover:text-primary disabled:opacity-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-xs w-3 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="text-primary/80 hover:text-primary"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-serif text-primary text-sm">${(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-primary/10 glass-card-premium mt-auto flex flex-col gap-4">
            <div className="mb-2">
              <PromoCodeInput />
            </div>
            
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-primary/10">
              <span className="text-xs uppercase tracking-widest text-slate-100/80">Est. Total</span>
              <span className="font-serif text-xl text-white">
                ${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCheckout}
                className="w-full btn-lux-primary flex items-center justify-center gap-2 rounded-sm py-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(212,175,127,0.3)]"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={handleViewCart}
                className="w-full py-3 text-[10px] sm:text-xs uppercase tracking-widest text-primary hover:text-white transition-colors border border-primary/30 rounded-sm hover:bg-white/5"
              >
                View Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
