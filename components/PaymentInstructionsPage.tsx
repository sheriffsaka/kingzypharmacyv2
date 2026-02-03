
import React from 'react';
import { View } from '../types';

interface PaymentInstructionsPageProps {
  orderId: number;
  onNavigate: (view: View) => void;
}

const PaymentInstructionsPage: React.FC<PaymentInstructionsPageProps> = ({ orderId, onNavigate }) => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 mx-auto text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <h1 className="text-2xl font-bold text-brand-dark mt-4">Awaiting Payment Confirmation</h1>
          <p className="text-gray-600 mt-2">
            Your order <span className="font-bold">#{orderId}</span> has been successfully placed. Please complete the payment via bank transfer using the details below.
          </p>

          <div className="mt-6 text-left bg-blue-50 border border-blue-200 p-6 rounded-lg space-y-3">
            <h2 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-3">Bank Transfer Details</h2>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Name:</p>
              <p className="font-semibold text-lg">Kingzy Pharmaceuticals Ltd.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Account Number:</p>
              <p className="font-semibold text-lg">0123456789</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bank Name:</p>
              <p className="font-semibold text-lg">Zenith Bank Plc</p>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-left">
            <p className="font-bold">Important!</p>
            <p>Please use your Order ID <strong className="underline">#{orderId}</strong> as the payment reference or narration to ensure a fast confirmation process.</p>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">Once your payment is confirmed, our team will process your order for dispatch. You will be notified via email.</p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => onNavigate({ name: 'wholesale' })} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-brand-secondary transition-colors">
              Go to My Dashboard
            </button>
            <button onClick={() => onNavigate({ name: 'home' })} className="bg-gray-200 text-brand-dark font-bold py-3 px-8 rounded-md hover:bg-gray-300 transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructionsPage;
