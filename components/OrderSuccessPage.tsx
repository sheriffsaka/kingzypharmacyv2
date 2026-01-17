
import React, { useState } from 'react';
import { mockUpdatePaymentAndOrderStatus } from '../services/paymentService';

interface OrderSuccessPageProps {
  orderId: number;
  onGoToProducts: () => void;
  onViewOrders: () => void;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onGoToProducts, onViewOrders }) => {
  const [mockMessage, setMockMessage] = useState<string | null>(null);

  const handleMockConfirm = async (status: 'paid' | 'failed') => {
    setMockMessage(`Simulating ${status} payment...`);
    const result = await mockUpdatePaymentAndOrderStatus(orderId, status);
    setMockMessage(result.message);
  };

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 className="text-3xl font-bold text-brand-dark mt-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <p className="text-lg">Your Order ID is: <span className="font-bold text-brand-primary">#{orderId}</span></p>
        </div>
        <p className="text-sm text-gray-500 mt-4">You will receive an email confirmation shortly. A pharmacist may contact you if verification is needed.</p>
        
        {/* Mock Payment Confirmation for Devs */}
        <div className="mt-8 p-4 border-2 border-dashed border-yellow-500 rounded-lg bg-yellow-50 text-left">
            <h3 className="font-bold text-yellow-800">For Development & Testing Only</h3>
            <p className="text-sm text-yellow-700 mt-1">
                This section simulates a payment gateway callback (like a Paystack webhook). In a real application, this would happen automatically on the backend. Click to simulate a successful or failed online payment for this order.
            </p>
            <div className="flex gap-4 mt-4">
                <button onClick={() => handleMockConfirm('paid')} className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                    Simulate SUCCESSFUL Payment
                </button>
                <button onClick={() => handleMockConfirm('failed')} className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                    Simulate FAILED Payment
                </button>
            </div>
            {mockMessage && <p className="mt-3 text-sm font-semibold text-center text-gray-700">{mockMessage}</p>}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onGoToProducts} 
              className="bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-brand-primary/90 transition-colors"
            >
              Continue Shopping
            </button>
             <button 
              onClick={onViewOrders} 
              className="bg-gray-200 text-brand-dark font-bold py-3 px-8 rounded-md hover:bg-gray-300 transition-colors"
            >
              View My Orders
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
