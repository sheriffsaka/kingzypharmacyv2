
import React from 'react';

interface OrderSuccessPageProps {
  orderId: number;
  onGoToProducts: () => void;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onGoToProducts }) => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 className="text-3xl font-bold text-brand-dark mt-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <p className="text-lg">Your Order ID is: <span className="font-bold text-brand-primary">#{orderId}</span></p>
        </div>
        <p className="text-sm text-gray-500 mt-4">You will receive an email confirmation shortly. A pharmacist may contact you if verification is needed.</p>
        <button 
          onClick={onGoToProducts} 
          className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-brand-primary/90 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;