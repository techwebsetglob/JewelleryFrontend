import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { usePromoCode } from '../../hooks/usePromoCode';
import { promoSchema } from '../../security/validate';
import toast from 'react-hot-toast';

const PromoCodeInput = () => {
  const { cartItems, cartTotal, appliedPromo, setAppliedPromo, setDiscountAmount } = useCart();
  const [inputValue, setInputValue] = useState(appliedPromo?.code || '');
  
  // Initialize the hook
  const { 
    applyCode, 
    removeCode, 
    loading, 
    error: hookError, 
    appliedPromo: hookAppliedPromo,
    discountAmount: hookDiscountAmount,
    setError
  } = usePromoCode(cartItems, cartTotal);

  // Sync state between hook and context
  useEffect(() => {
    if (hookAppliedPromo) {
      setAppliedPromo(hookAppliedPromo);
      setDiscountAmount(hookDiscountAmount);
      setInputValue(hookAppliedPromo.code);
      toast.success(`${hookAppliedPromo.code} applied successfully!`, {
        icon: '💎',
        style: {
          borderRadius: '10px',
          background: '#0A0A0A',
          color: '#FDE047',
          border: '1px solid rgba(253, 224, 71, 0.2)',
        },
      });
    }
  }, [hookAppliedPromo, hookDiscountAmount, setAppliedPromo, setDiscountAmount]);

  // Handle re-validation on mount/cart change
  useEffect(() => {
    const revalidate = async () => {
      if (appliedPromo && !hookAppliedPromo) {
        // Silently re-validate
        const isValid = await applyCode(appliedPromo.code);
        if (!isValid) {
          // If it became invalid (e.g., cart no longer meets min order, or item removed)
          removeCode();
          setAppliedPromo(null);
          setDiscountAmount(0);
          setInputValue('');
          
          if (hookError) {
             toast.error(`Promo removed: ${hookError}`, {
              style: {
                borderRadius: '10px',
                background: '#0A0A0A',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              },
             });
          }
        }
      }
    };
    revalidate();
  }, [cartItems, cartTotal]); // Re-run when cart changes

  const handleInputChange = (e) => {
    // Force uppercase and strip non-alphanumeric/hyphen characters
    const raw = e.target.value.toUpperCase();
    const sanitized = raw.replace(/[^A-Z0-9\-]/g, '');
    setInputValue(sanitized);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError('Please enter a code');
      return;
    }

    // Validate format with promoSchema before sending to API
    const result = promoSchema.safeParse({ code: inputValue.trim() });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid promo code format');
      return;
    }

    await applyCode(result.data.code);
  };

  const handleRemove = () => {
    removeCode();
    setAppliedPromo(null);
    setDiscountAmount(0);
    setInputValue('');
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 mt-6">
      <form onSubmit={handleApply} className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter promo code"
          disabled={loading || appliedPromo}
          className={`w-full bg-black/40 border p-4 text-xs tracking-widest uppercase text-white placeholder-white/30 outline-none transition-all ${
            appliedPromo 
              ? 'border-green-500/50 text-green-400 pr-12' 
              : hookError 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-primary/20 focus:border-primary/50'
          }`}
        />
        
        {appliedPromo ? (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-4 text-white/50 hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="absolute right-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase text-[10px] tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">auto_renew</span>
            ) : (
              'Apply'
            )}
          </button>
        )}
      </form>

      {/* States Feedback */}
      {hookError && !appliedPromo && (
        <p className="text-red-400 text-[10px] uppercase tracking-widest ml-1">{hookError}</p>
      )}
      
      {appliedPromo && (
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest px-1">
          <span className="text-green-400">{appliedPromo.code} applied</span>
          {appliedPromo.applicableCategories && appliedPromo.applicableCategories !== "all" && (
             <span className="text-primary/60">Valid on {Array.isArray(appliedPromo.applicableCategories) ? appliedPromo.applicableCategories.join(', ') : appliedPromo.applicableCategories} only</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
