
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, Profile } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setProfileForCart: (profile: Profile | null) => void;
  cartItemCount: number;
  subtotal: number;
  loyaltyDiscountValue: number;
  total: number;
  deliveryFee: number;
  getPriceForQuantity: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('kingzyCart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data from localStorage", error);
      return [];
    }
  });
  
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    localStorage.setItem('kingzyCart', JSON.stringify(cart));
  }, [cart]);
  
  const setProfileForCart = (p: Profile | null) => {
    setProfile(p);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
      setCart([]);
  }

  const getPriceForQuantity = (item: CartItem): number => {
    const { product, quantity } = item;
    const isWholesale = profile?.role === 'wholesale_buyer' && profile.approval_status === 'approved';

    if (isWholesale && product.prices.wholesale_tiers && product.prices.wholesale_tiers.length > 0) {
      const sortedTiers = [...product.prices.wholesale_tiers].sort((a, b) => b.min_quantity - a.min_quantity);
      const applicableTier = sortedTiers.find(tier => quantity >= tier.min_quantity);
      if (applicableTier) {
        return applicableTier.price;
      }
    }
    return product.prices?.retail ?? 0;
  };

  const { subtotal, loyaltyDiscountValue, total, cartItemCount, deliveryFee } = useMemo(() => {
    const sub = cart.reduce((acc, item) => {
      const price = getPriceForQuantity(item);
      return acc + price * item.quantity;
    }, 0);
    
    const configStr = localStorage.getItem('kingzy_system_config');
    const config = configStr ? JSON.parse(configStr) : {
        deliveryConfig: {
            mode: 'flat',
            flatRate: 500,
            freeDeliveryThreshold: 50000
        }
    };

    let fee = 0;
    if (cart.length > 0) {
        const { deliveryConfig } = config;
        if (deliveryConfig && deliveryConfig.freeDeliveryThreshold > 0 && sub >= deliveryConfig.freeDeliveryThreshold) {
            fee = 0;
        } else {
            // Placeholder for more complex modes, falling back to flat rate.
            fee = deliveryConfig ? (deliveryConfig.flatRate || 500) : 500;
        }
    }

    const discount = (profile?.loyalty_discount_percentage ?? 0) / 100 * sub;
    const finalTotal = sub - discount + fee;
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    return {
      subtotal: sub,
      loyaltyDiscountValue: discount,
      total: finalTotal,
      cartItemCount: count,
      deliveryFee: fee
    };
  }, [cart, profile]);
  

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, setProfileForCart, cartItemCount, subtotal, loyaltyDiscountValue, total, deliveryFee, getPriceForQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};