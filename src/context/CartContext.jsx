// src/context/CartContext.jsx
import { createContext, useContext, useState, useMemo } from 'react';
import { getPriceForQty } from '../utils/pricingHelper.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, qty) => {
    const addQty = qty ?? product.minOrderQty;
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        const newQty = existing.qty + addQty;
        return prev.map(i => i.productId === product._id
          ? { ...i, qty: newQty, price: getPriceForQty(product.priceTiers, newQty) }
          : i
        );
      }
      return [...prev, {
        productId:    product._id,
        name:         product.name,
        qty:          addQty,
        price:        getPriceForQty(product.priceTiers, addQty),
        moq:          product.minOrderQty,
        priceTiers:   product.priceTiers,
        wholesalerId: product.wholesaler?._id ?? product.wholesaler,
      }];
    });
  };

  const updateQty = (productId, newQty, priceTiers) => {
    if (newQty <= 0) { removeItem(productId); return; }
    setCartItems(prev => prev.map(i => i.productId === productId
      ? { ...i, qty: newQty, price: getPriceForQty(priceTiers ?? i.priceTiers, newQty) }
      : i
    ));
  };

  const removeItem  = (productId) => setCartItems(prev => prev.filter(i => i.productId !== productId));
  const clearCart   = () => setCartItems([]);

  // useMemo — only recomputes when cartItems changes (not on every render)
  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
