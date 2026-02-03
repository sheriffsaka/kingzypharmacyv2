
import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { UserRole } from '../types';
import WholesaleAuthForm from './WholesaleAuthForm';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  initialIsPlatinum?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialIsPlatinum = false }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('general_public');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // If initialIsPlatinum is true, we force a specific registration experience
  const isPlatinumFlow = initialIsPlatinum;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            is_platinum: false // Default to false for regular signup
          }
        }
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user) {
         setMessage({ type: 'success', text: 'Success! Please check your email to verify your account.' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
      // On successful sign-in, the onAuthStateChange listener in App.tsx will handle the redirect.
    }
    setLoading(false);
  };

  const modeConfig = {
    signin: {
      title: 'Sign In',
      buttonText: 'Sign In',
      toggleText: "Don't have an account? Sign Up",
    },
    signup: {
      title: isPlatinumFlow ? 'Platinum Cluster Registration' : 'Create Account',
      buttonText: 'Sign Up',
      toggleText: 'Already have an account? Sign In',
    },
  };

  // If it's a platinum flow, we use the detailed form immediately
  if (isPlatinumFlow && mode === 'signup') {
      return (
          <div className="flex justify-center items-center py-12 px-4 bg-gray-50">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border border-yellow-200">
                <div className="bg-brand-dark p-6 text-white text-center">
                    <h2 className="text-3xl font-bold italic tracking-wider">PLATINUM CLUSTER</h2>
                    <p className="text-yellow-400 font-bold uppercase text-xs mt-1">Premium Healthcare Onboarding</p>
                </div>
                <WholesaleAuthForm mode="signup" setMode={setMode} isPlatinum={true} />
            </div>
          </div>
      );
  }

  return (
    <div className="flex justify-center items-center py-12 px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-brand-dark">{modeConfig[mode].title}</h2>
        
        {message && (
          <div className={`p-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div>
               <label htmlFor="role" className="text-sm font-medium text-gray-700">I am a...</label>
               <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
               >
                 <option value="general_public">General Public</option>
                 <option value="wholesale_buyer">Wholesale Buyer</option>
               </select>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-white bg-brand-primary rounded-md font-semibold hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : modeConfig[mode].buttonText}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setMessage(null);
            }}
            className="text-sm font-medium text-brand-secondary hover:underline"
          >
            {modeConfig[mode].toggleText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
