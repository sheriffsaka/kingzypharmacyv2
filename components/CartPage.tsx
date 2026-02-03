
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { useCart } from '../contexts/CartContext';
import { Profile, DeliveryAddress, PaymentStatus, PaymentMethod, View } from '../types';
import { supabase } from '../lib/supabase/client';
import { TrashIcon } from './Icons';

interface CartPageProps {
  profile: Profile | null;
  session: Session | null;
  onContinueShopping: () => void;
  onNavigate: (view: View) => void;
}

const CartPage: React.FC<CartPageProps> = ({ profile, session, onContinueShopping, onNavigate }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartItemCount, subtotal, loyaltyDiscountValue, total, getPriceForQuantity } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '', phone: '', street: '', city: '', state: '', zip: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [acknowledge, setAcknowledge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWholesale = profile?.role === 'wholesale_buyer';

  useEffect(() => {
    // Pre-fill form for wholesale buyers from mock data for convenience
    if (isWholesale) {
        setDeliveryAddress({
            fullName: 'Chidi Okonkwo (GoodHealth Pharmacy Ltd.)',
            phone: '08012345678',
            street: '123, Commerce Avenue',
            city: 'Victoria Island',
            state: 'Lagos',
            zip: '101241'
        });
    }
    // Always default to bank transfer since POD is removed
    setPaymentMethod('bank_transfer');
  }, [isWholesale]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({...prev, [name]: value}));
  };

  const isFormValid = () => {
    return Object.values(deliveryAddress).every(field => typeof field === 'string' && field.trim() !== '') && acknowledge && cart.length > 0;
  };
  
  const handleSubmitOrder = async () => {
      if (!isFormValid() || !session?.user) {
          setError("Please fill in all delivery details, select a payment method, acknowledge the terms, and ensure your cart is not empty.");
          return;
      }
      setIsLoading(true);
      setError(null);
      
      try {
          // --- MOCK ORDER CREATION ---
          const mockOrderId = Math.floor(1000 + Math.random() * 9000);
          console.log(`Simulating order creation for user ${session.user.email}...`);
          console.log({
              user_id: session.user.id,
              total_price: total,
              payment_method: paymentMethod,
              status: 'awaiting_confirmation'
          });
          await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
          console.log(`Mock Order #${mockOrderId} created.`);
          // --------------------------

          clearCart();
          
          if (isWholesale) {
            onNavigate({ name: 'invoicePreview', orderId: mockOrderId });
          } else {
            onNavigate({ name: 'paymentInstructions', orderId: mockOrderId });
          }

      } catch (err: any) {
          setError(`Failed to place order: ${err.message}`);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  const renderPaymentMethods = () => {
    return (
        <div className="space-y-3">
            <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-brand-light has-[:checked]:border-brand-primary transition-all">
                <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="h-4 w-4 text-brand-primary focus:ring-brand-secondary" disabled={!session}/>
                <div className="ml-3">
                    <span className="font-semibold text-gray-800">Bank Transfer</span>
                    <p className="text-sm text-gray-500">Securely pay via transfer to our corporate accounts.</p>
                </div>
            </label>
             <label className="flex items-center p-4 border rounded-md cursor-not-allowed bg-gray-100 opacity-60">
                <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} className="h-4 w-4" disabled/>
                <div className="ml-3">
                    <span className="font-semibold text-gray-500">Online Payment (Card)</span>
                    <p className="text-sm text-gray-400">Card payments coming soon.</p>
                </div>
            </label>
            <div className="p-3 bg-red-50 rounded border border-red-100">
                <p className="text-[10px] text-red-600 font-bold uppercase">Policy Update</p>
                <p className="text-xs text-red-700">"Pay on Delivery" is no longer supported to improve transaction security.</p>
            </div>
        </div>
    );
  };

  const submitButtonText = isWholesale ? 'Proceed to Confirmation' : 'Place Order';

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
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Items ({cartItemCount})</h2>
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 border-b pb-4">
                            <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-md"/>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.product.name}</h3>
                                <p className="text-sm text-gray-500">{isWholesale ? item.product.wholesale_display_unit : item.product.dosage}</p>
                                <p className="text-sm">Unit Price: ₦{getPriceForQuantity(item).toLocaleString()}</p>
                            </div>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                                    min={isWholesale ? item.product.min_order_quantity : 1}
                                    step={isWholesale ? item.product.min_order_quantity : 1}
                                    className="w-20 p-2 border rounded-md"
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

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Delivery & Contact Information</h2>
                 {!session && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">Please log in to place an order.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="fullName" value={deliveryAddress.fullName} onChange={handleAddressChange} placeholder="Full Name / Company Name" className="p-2 border rounded-md" disabled={!session} />
                    <input name="phone" value={deliveryAddress.phone} onChange={handleAddressChange} placeholder="Phone Number" className="p-2 border rounded-md" disabled={!session}/>
                    <input name="street" value={deliveryAddress.street} onChange={handleAddressChange} placeholder="Street Address" className="md:col-span-2 p-2 border rounded-md" disabled={!session} />
                    <input name="city" value={deliveryAddress.city} onChange={handleAddressChange} placeholder="City" className="p-2 border rounded-md" disabled={!session} />
                    <input name="state" value={deliveryAddress.state} onChange={handleAddressChange} placeholder="State" className="p-2 border rounded-md" disabled={!session} />
                    <input name="zip" value={deliveryAddress.zip} onChange={handleAddressChange} placeholder="Postal Code" className="p-2 border rounded-md" disabled={!session} />
                </div>
            </div>
          </div>
          
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
                    <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                    {renderPaymentMethods()}
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
                    className="w-full mt-6 bg-brand-primary text-white font-bold py-3 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : submitButtonText}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
