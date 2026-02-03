
import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { UserRole } from '../types';
import { CloudUploadIcon, UserCircleIcon } from './Icons';

type AuthMode = 'signin' | 'signup';

interface WholesaleAuthFormProps {
    mode: AuthMode;
    setMode: (mode: AuthMode) => void;
    isPlatinum?: boolean;
}

const WholesaleAuthForm: React.FC<WholesaleAuthFormProps> = ({ mode, setMode, isPlatinum = false }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [idType, setIdType] = useState('NIN');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'picture' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileType === 'picture') {
        setProfilePicture(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPicturePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setIdDocument(file);
    }
  };


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: "Passwords do not match." });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'wholesale_buyer' as UserRole,
            is_platinum: isPlatinum, // Important: Indicate platinum cluster status
            first_name: firstName, 
            company_name: companyName,
          }
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user) {
         setMessage({ type: 'success', text: isPlatinum 
            ? 'Platinum registration successful! Our executive team will verify your credentials and contact you within 4 hours.' 
            : 'Success! Please check your email for verification. Your account will be activated after admin approval.' 
         });
      }
    } else { // Sign-in mode
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
      // On successful sign-in, the onAuthStateChange listener in App.tsx will handle view change.
    }
    setLoading(false);
  };

  const formInputClasses = "w-full px-4 py-3 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent";
  const formLabelClasses = "block text-sm font-medium text-gray-700 mb-1";

  const renderSignupForm = () => (
    <form className="space-y-6" onSubmit={handleAuth}>
        <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b w-full pb-2 mb-2">Member Information</legend>
            
            {isPlatinum && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-sm text-yellow-700 font-bold">Registration Source: Platinum Cluster Benefits Applied</p>
                </div>
            )}

            <div>
                <label className={formLabelClasses}>Profile Picture</label>
                <div className="mt-1 flex items-center gap-4">
                     {picturePreview ? <img src={picturePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" /> : <UserCircleIcon className="h-16 w-16 text-gray-300" />}
                    <label htmlFor="profile-picture-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <span>Upload Image</span>
                        <input id="profile-picture-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => handleFileChange(e, 'picture')} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="firstName" className={formLabelClasses}>First Name</label><input id="firstName" type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={formInputClasses}/></div>
                <div><label htmlFor="surname" className={formLabelClasses}>Surname</label><input id="surname" type="text" required value={surname} onChange={e => setSurname(e.target.value)} className={formInputClasses}/></div>
            </div>
             <div><label htmlFor="phone" className={formLabelClasses}>Phone Number</label><input id="phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={formInputClasses}/></div>
             <div><label htmlFor="wholesale-email" className={formLabelClasses}>Email Address</label><input id="wholesale-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={formInputClasses}/></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="wholesale-password" className={formLabelClasses}>Password</label><input id="wholesale-password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={formInputClasses}/></div>
                <div><label htmlFor="confirmPassword" className={formLabelClasses}>Confirm Password</label><input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={formInputClasses}/></div>
            </div>
        </fieldset>
        
        <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b w-full pb-2 mb-2">Shipping / Delivery Address</legend>
            <div><label htmlFor="shippingAddress" className={formLabelClasses}>Shipping Address</label><input id="shippingAddress" type="text" required value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className={formInputClasses}/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="city" className={formLabelClasses}>Town/City</label><input id="city" type="text" required value={city} onChange={e => setCity(e.target.value)} className={formInputClasses}/></div>
                <div><label htmlFor="state" className={formLabelClasses}>State</label><input id="state" type="text" required value={state} onChange={e => setState(e.target.value)} className={formInputClasses}/></div>
            </div>
        </fieldset>

         <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b w-full pb-2 mb-2">Identity & Business Verification</legend>
            <div><label htmlFor="companyName" className={formLabelClasses}>Company / Clinic Name</label><input id="companyName" type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className={formInputClasses}/></div>
            <div>
                 <label htmlFor="idType" className={formLabelClasses}>Means of Identification</label>
                 <select id="idType" value={idType} onChange={e => setIdType(e.target.value)} className={formInputClasses}>
                    <option>NIN</option>
                    <option>Driver's License</option>
                    <option>International Passport</option>
                    <option>Pharmacist License</option>
                    <option>Medical Practitioner ID</option>
                 </select>
            </div>
            <div>
                <label className={formLabelClasses}>Upload Identification Document</label>
                <label htmlFor="id-document-upload" className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <CloudUploadIcon className="w-5 h-5" />
                    <span>{idDocument ? idDocument.name : 'Choose file...'}</span>
                    <input id="id-document-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'document')} />
                </label>
            </div>
        </fieldset>

        <div><button type="submit" disabled={loading} className={`w-full py-3 px-4 text-white rounded-md font-semibold ${isPlatinum ? 'bg-brand-dark hover:bg-brand-dark/90 shadow-xl' : 'bg-brand-primary hover:bg-brand-primary/90'} transition-all disabled:bg-gray-400`}>{loading ? 'Processing...' : isPlatinum ? 'Register for Platinum Benefits' : 'Create Account'}</button></div>
    </form>
  );

  const renderSigninForm = () => (
     <div className="max-w-md mx-auto">
        <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label htmlFor="wholesale-email" className="sr-only">Email address</label>
              <input id="wholesale-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={formInputClasses} placeholder="you@example.com"/>
            </div>
            <div>
              <label htmlFor="wholesale-password"className="sr-only">Password</label>
              <input id="wholesale-password" name="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={formInputClasses} placeholder="••••••••" />
            </div>
            <div><button type="submit" disabled={loading} className="w-full py-3 px-4 text-white bg-brand-primary rounded-md font-semibold hover:bg-brand-primary/90 disabled:bg-gray-400">{loading ? 'Processing...' : 'Sign In'}</button></div>
        </form>
     </div>
  );

  return (
    <div className="w-full p-6 md:p-8 space-y-4">
      <h3 className="text-2xl font-bold text-center text-brand-dark">
        {mode === 'signup' 
          ? (isPlatinum ? 'Platinum Cluster Application' : 'Registration') 
          : 'Partner Login'}
      </h3>
      
      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {mode === 'signup' ? renderSignupForm() : renderSigninForm()}
      
      <div className="text-center">
        <button
          onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setMessage(null);
          }}
          className="text-sm font-medium text-brand-secondary hover:underline"
        >
          {mode === 'signup' ? 'Already a partner? Sign In' : "Don't have an account? Register Now"}
        </button>
      </div>
    </div>
  );
};

export default WholesaleAuthForm;
