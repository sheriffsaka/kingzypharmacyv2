import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { CloudUploadIcon } from './Icons';

interface PaymentInstructionsPageProps {
  orderId: number;
  onNavigate: (view: View) => void;
}

const PaymentInstructionsPage: React.FC<PaymentInstructionsPageProps> = ({ orderId, onNavigate }) => {
  const [popFile, setPopFile] = useState<File | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [bankDetails, setBankDetails] = useState({
      accountName: 'Kingzy Pharmaceuticals Ltd.',
      accountNumber: '0123456789',
      bankName: 'Zenith Bank Plc'
  });

  useEffect(() => {
    // Check if proof has already been uploaded for this order
    if (localStorage.getItem(`proof_for_${orderId}`)) {
      setHasUploaded(true);
    }
    // Load global bank details config
    const savedConfig = localStorage.getItem('kingzy_system_config');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.bankDetails) {
            setBankDetails(config.bankDetails);
        }
    }
  }, [orderId]);

  const handleUploadPop = () => {
    if (!popFile) return;
    // Simulate upload and save to localStorage
    alert('Proof of payment uploaded successfully! Our team will verify it shortly.');
    // In a real app, this would be an actual upload service, returning a URL
    localStorage.setItem(`proof_for_${orderId}`, 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770119864/sample-receipt_h4q0b3.jpg');
    setHasUploaded(true);
    setPopFile(null);
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-brand-dark mt-4">Awaiting Payment Confirmation</h1>
            <p className="text-gray-600 mt-2">
              Your order <span className="font-bold">#{orderId}</span> has been successfully placed. Please complete the payment via bank transfer using the details below.
            </p>
          </div>

          <div className="mt-6 text-left bg-blue-50 border border-blue-200 p-6 rounded-lg space-y-3">
            <h2 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-3">Bank Transfer Details</h2>
            <div><p className="text-sm font-medium text-gray-500">Account Name:</p><p className="font-semibold text-lg">{bankDetails.accountName}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Account Number:</p><p className="font-semibold text-lg">{bankDetails.accountNumber}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Bank Name:</p><p className="font-semibold text-lg">{bankDetails.bankName}</p></div>
             <div className="border-t pt-3 mt-3"><p className="text-sm text-yellow-700 font-bold bg-yellow-100 p-2 rounded-md">Please use your Order ID <strong className="underline">#{orderId}</strong> as the payment reference or narration.</p></div>
          </div>
          
          {/* --- NEW UPLOAD SECTION --- */}
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-3 text-center">Upload Your Proof of Payment</h2>
            {hasUploaded ? (
                 <div className="p-6 bg-green-100 border border-green-200 text-green-800 rounded-lg text-center">
                    <p className="font-bold">Proof Uploaded Successfully!</p>
                    <p className="text-sm">Our team will verify your payment shortly to process the order.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <label htmlFor="pop-upload" className="relative cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center block hover:border-brand-primary">
                        <CloudUploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <span className="mt-2 block text-sm font-semibold text-gray-600">{popFile ? popFile.name : 'Click to browse or drag & drop receipt'}</span>
                        <input id="pop-upload" type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setPopFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                    <button onClick={handleUploadPop} disabled={!popFile} className="w-full bg-accent-green text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Submit for Verification
                    </button>
                </div>
            )}
          </div>
          {/* --- END NEW UPLOAD SECTION --- */}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 border-t pt-6">
            <button onClick={() => onNavigate({ name: 'orders' })} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-brand-secondary transition-colors">
              Go to My Orders
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
