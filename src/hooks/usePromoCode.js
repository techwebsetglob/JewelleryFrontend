import { useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { calculateDiscount } from '../utils/promoCalculator';

export const usePromoCode = (cartItems, cartSubtotal) => {
  const { currentUser } = useAuth();
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyCode = async (codeString) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Normalize
      const code = codeString.trim().toUpperCase();
      if (!code) {
        setError('Please enter a promo code');
        setLoading(false);
        return false;
      }

      // 2. Fetch promoCodes/{code}
      const promoRef = doc(db, 'promoCodes', code);
      const promoSnap = await getDoc(promoRef);
      
      if (!promoSnap.exists()) {
        setError('Invalid promo code');
        setLoading(false);
        return false;
      }

      const promo = promoSnap.data();

      // 3. Check isActive
      if (!promo.isActive) {
        setError('This promo code is no longer active');
        setLoading(false);
        return false;
      }

      // 4. Check Date
      const now = new Date();
      const start = promo.startDate?.toDate ? promo.startDate.toDate() : new Date(promo.startDate);
      const expiry = promo.expiryDate?.toDate ? promo.expiryDate.toDate() : new Date(promo.expiryDate);
      
      if (now < start) {
        setError('This promo code is not yet active');
        setLoading(false);
        return false;
      }
      if (now > expiry) {
        setError('This promo code has expired');
        setLoading(false);
        return false;
      }

      // 5. Check usageLimit
      if (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usageCount >= promo.usageLimit) {
        setError('This promo code has reached its usage limit');
        setLoading(false);
        return false;
      }

      // 6. Check perUserLimit
      if (promo.perUserLimit && promo.perUserLimit > 0) {
        if (!currentUser) {
          setError('Please sign in to use this code');
          setLoading(false);
          return false;
        }
        
        const usageRef = doc(db, 'promoUsage', `${currentUser.uid}_${code}`);
        const usageSnap = await getDoc(usageRef);
        
        if (usageSnap.exists() && usageSnap.data().usedCount >= promo.perUserLimit) {
          setError('You have already used this promo code');
          setLoading(false);
          return false;
        }
      }

      // 7. Check minOrderValue
      if (promo.minOrderValue && cartSubtotal < promo.minOrderValue) {
        setError(`Minimum order of $${promo.minOrderValue} required for this code`);
        setLoading(false);
        return false;
      }

      // 8. Check applicableCategories / applicableProductIds
      const hasCategoriesRestricted = promo.applicableCategories && promo.applicableCategories !== "all" && Array.isArray(promo.applicableCategories);
      const hasProductsRestricted = promo.applicableProductIds && promo.applicableProductIds !== "all" && Array.isArray(promo.applicableProductIds);
      
      if (hasCategoriesRestricted || hasProductsRestricted) {
        const hasEligibleItem = cartItems.some(item => {
          const categoryMatch = !hasCategoriesRestricted || promo.applicableCategories.includes(item.category);
          const productMatch = !hasProductsRestricted || promo.applicableProductIds.includes(item.productId);
          return categoryMatch && productMatch;
        });
        
        if (!hasEligibleItem) {
          setError('This code is not valid for the items in your cart');
          setLoading(false);
          return false;
        }
      }

      // 9. All checks passed -> calculate & apply
      const calcDiscount = calculateDiscount(promo, cartItems, cartSubtotal);
      setAppliedPromo(promo);
      setDiscountAmount(calcDiscount);
      setLoading(false);
      return true;

    } catch (err) {
      console.error("Error applying promo code:", err);
      setError('An error occurred validating the code');
      setLoading(false);
      return false;
    }
  };

  const removeCode = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setError('');
  }, []);

  return {
    applyCode,
    removeCode,
    appliedPromo,
    setAppliedPromo,
    discountAmount,
    setDiscountAmount,
    loading,
    error,
    setError,
    isApplied: !!appliedPromo
  };
};
