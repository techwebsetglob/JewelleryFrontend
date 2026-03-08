import React from 'react';
import { useCart } from '../../context/CartContext';

const DiscountBadge = ({ product }) => {
  const { appliedPromo } = useCart();

  if (!appliedPromo || !product) return null;

  // Check if this product is eligible for the current promo
  const hasCategoriesRestricted = appliedPromo.applicableCategories && appliedPromo.applicableCategories !== "all" && Array.isArray(appliedPromo.applicableCategories);
  const hasProductsRestricted = appliedPromo.applicableProductIds && appliedPromo.applicableProductIds !== "all" && Array.isArray(appliedPromo.applicableProductIds);
  
  let isEligible = true;
  
  if (hasCategoriesRestricted || hasProductsRestricted) {
    const categoryMatch = !hasCategoriesRestricted || appliedPromo.applicableCategories.includes(product.category);
    const productMatch = !hasProductsRestricted || appliedPromo.applicableProductIds.includes(product.id);
    isEligible = categoryMatch && productMatch;
  }

  if (!isEligible) return null;

  let badgeText = "";
  if (appliedPromo.type === "percentage") {
    badgeText = `${appliedPromo.value}% OFF`;
  } else if (appliedPromo.type === "fixed") {
    badgeText = `$${appliedPromo.value} OFF`;
  } else if (appliedPromo.type === "freeShipping") {
    // Only show free shipping badge if it's the only product or generally applicable
    return null; 
  } else if (appliedPromo.type === "bogo") {
    badgeText = "BOGO ELIGIBLE";
  }

  return (
    <div className="absolute top-12 left-4 z-10 flex flex-col gap-2">
      <span className="bg-green-600/90 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-lg font-bold border border-green-500/30">
        {badgeText}
      </span>
    </div>
  );
};

export default DiscountBadge;
