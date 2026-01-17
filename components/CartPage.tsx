import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useCart } from '../contexts/CartContext';
import { Profile, DeliveryAddress } from '../types';
import { supabase } from '../lib/supabase/client';
import { ArrowLeftIcon, TrashIcon } from './Icons';

interface CartPageProps {
  profile: Profile | null;
  session: Session | null;
  onContinueShopping: () => void;
  onPlaceOrder: (orderId: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ profile, session, onContinueShopping, onPlaceOrder }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartItemCount, subtotal, loyaltyDiscountValue, total, getPriceForQuantity } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '', phone: '', street: '', city: '', state: '', zip: ''
  });
  const [acknowledge, setAcknowledge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      setDeliveryAddress(prev => ({ ...prev, fullName: prev.fullName || '' }));
    }
  }, [session]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({...prev, [name]: value}));
  };

  const isFormValid = () => {
    // FIX: Add a type check to ensure `field` is a string before calling `.trim()`.
    return Object.values(deliveryAddress).every(field => typeof field === 'string' && field.trim() !== '') && acknowledge && cart.length > 0;
  };
  
  const handleSubmitOrder = async () => {
      if (!isFormValid() || !session?.user) {
          setError("Please fill in all delivery details, acknowledge the terms, and ensure your cart is not empty.");
          return;
      }
      setIsLoading(true);
      setError(null);
      
      try {
          // 1. Create the order record
          const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .insert({
                  user_id: session.user.id,
                  total_price: total,
                  discount_applied: loyaltyDiscountValue,
                  delivery_address: deliveryAddress,
                  customer_details: { email: session.user.email, userId: session.user.id },
                  status: 'pending'
              })
              .select()
              .single();
          
          if (orderError) throw orderError;
          const orderId = orderData.id;

          // 2. Create the order items records
          const orderItems = cart.map(item => ({
              order_id: orderId,
              product_id: item.product.id,
              quantity: item.quantity,
              unit_price: getPriceForQuantity(item)
          }));

          const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

          if (itemsError) {
              // Attempt to roll back order creation if items fail
              await supabase.from('orders').delete().eq('id', orderId);
              throw itemsError;
          }

          // 3. Success
          clearCart();
          onPlaceOrder(orderId);

      } catch (err: any) {
          setError(`Failed to place order: ${err.message}`);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <button onClick={onContinueShopping} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-primary/90 transition-colors">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items & Delivery Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Items ({cartItemCount})</h2>
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 border-b pb-4">
                            <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-md"/>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.product.name}</h3>
                                <p className="text-sm text-gray-500">{item.product.dosage}</p>
                                <p className="text-sm">Unit Price: ₦{getPriceForQuantity(item).toLocaleString()}</p>
                            </div>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                                    min="1"
                                    className="w-16 p-2 border rounded-md"
                                    aria-label={`Quantity for ${item.product.name}`}
                                />
                            </div>
                             <p className="font-semibold w-24 text-right">₦{(getPriceForQuantity(item) * item.quantity).toLocaleString()}</p>
                             <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-red-600">
                                <TrashIcon className="w-5 h-5"/>
                             </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Delivery & Contact Information</h2>
                 {!session && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">Please log in to place an order.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="fullName" value={deliveryAddress.fullName} onChange={handleAddressChange} placeholder="Full Name" className="p-2 border rounded-md" disabled={!session} />
                    <input name="phone" value={deliveryAddress.phone} onChange={handleAddressChange} placeholder="Phone Number" className="p-2 border rounded-md" disabled={!session}/>
                    <input name="street" value={deliveryAddress.street} onChange={handleAddressChange} placeholder="Street Address" className="md:col-span-2 p-2 border rounded-md" disabled={!session} />
                    <input name="city" value={deliveryAddress.city} onChange={handleAddressChange} placeholder="City" className="p-2 border rounded-md" disabled={!session} />
                    <input name="state" value={deliveryAddress.state} onChange={handleAddressChange} placeholder="State" className="p-2 border rounded-md" disabled={!session} />
                    <input name="zip" value={deliveryAddress.zip} onChange={handleAddressChange} placeholder="Postal Code" className="p-2 border rounded-md" disabled={!session} />
                </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
                     {loyaltyDiscountValue > 0 && <div className="flex justify-between text-green-600"><span>Loyalty Discount</span><span>-₦{loyaltyDiscountValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>}
                    <div className="flex justify-between"><span>Delivery Fee</span><span>₦500.00</span></div>
                    <div className="flex justify-between text-xl font-bold text-brand-dark pt-2 border-t"><span>Total</span><span>₦{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                </div>

                <div className="mt-6">
                    <label className="flex items-start space-x-3">
                        <input type="checkbox" checked={acknowledge} onChange={(e) => setAcknowledge(e.target.checked)} className="mt-1" disabled={!session} />
                        <span className="text-sm text-gray-600">I acknowledge that a qualified pharmacist may contact me to verify prescription details for this order.</span>
                    </label>
                </div>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                
                <button 
                    onClick={handleSubmitOrder}
                    disabled={!isFormValid() || isLoading || !session}
                    className="w-full mt-6 bg-accent-green text-white font-bold py-3 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Placing Order...' : 'Place Order'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;