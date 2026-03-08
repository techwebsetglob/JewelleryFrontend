export function calculateDiscount(promo, cartItems, subtotal) {
  if (!promo) return 0;

  switch (promo.type) {
    case "percentage": {
      let discount = subtotal * (promo.value / 100);
      
      // apply only to eligible items if category/product restricted
      if (promo.applicableCategories && promo.applicableCategories !== "all" && Array.isArray(promo.applicableCategories)) {
        const eligibleSubtotal = cartItems
          .filter(item => promo.applicableCategories.includes(item.category))
          .reduce((sum, item) => sum + item.price * item.qty, 0);
        discount = eligibleSubtotal * (promo.value / 100);
      }
      
      // cap if maxDiscountAmount set
      if (promo.maxDiscountAmount) {
        discount = Math.min(discount, promo.maxDiscountAmount);
      }
      return Math.round(discount * 100) / 100;
    }

    case "fixed":
      return Math.min(promo.value, subtotal); // can't discount more than total

    case "freeShipping":
      return 0; // handled separately in shipping logic — set shippingCost to 0

    case "bogo": {
      // Buy one get one: find cheapest eligible item, make it free
      const eligible = cartItems
        .filter(item => 
          !promo.applicableProductIds || 
          promo.applicableProductIds === "all" || 
          (Array.isArray(promo.applicableProductIds) && promo.applicableProductIds.includes(item.productId))
        )
        // flattening cart items in case qty > 1
        .reduce((arr, item) => {
          for (let i = 0; i < item.qty; i++) arr.push(item);
          return arr;
        }, [])
        .sort((a, b) => a.price - b.price);
        
      return eligible.length >= 2 ? eligible[0].price : 0;
    }

    default:
      return 0;
  }
}

export function calculateShipping(subtotal, isFreeShipping) {
  if (isFreeShipping) return 0;
  if (subtotal >= 500) return 0;       // free over $500
  if (subtotal >= 200) return 15;
  return 25;
}

export function calculateOrderTotals(cartItems, subtotal, promo) {
  const discountAmount = promo ? calculateDiscount(promo, cartItems, subtotal) : 0;
  const isFreeShipping = promo?.type === "freeShipping";
  const shipping = calculateShipping(subtotal, isFreeShipping);
  
  // Tax logic (8% tax) - Calculate tax post-discount
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  
  const total = Math.max(0, subtotal - discountAmount) + shipping + tax;
  
  return { 
    subtotal: Math.round(subtotal * 100) / 100, 
    discountAmount, 
    shipping, 
    tax, 
    total: Math.round(total * 100) / 100, 
    isFreeShipping 
  };
}
