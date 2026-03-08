import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('aurum_cart');
    return localData ? JSON.parse(localData) : [];
  });
  
  const [appliedPromo, setAppliedPromo] = useState(() => {
    const localPromo = localStorage.getItem('aurum_promo');
    return localPromo ? JSON.parse(localPromo) : null;
  });
  
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aurum_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('aurum_promo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('aurum_promo');
    }
  }, [appliedPromo]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => item.id === id ? { ...item, qty: newQty } : item)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
    setDiscountAmount(0);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.qty, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    appliedPromo,
    setAppliedPromo,
    discountAmount,
    setDiscountAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
