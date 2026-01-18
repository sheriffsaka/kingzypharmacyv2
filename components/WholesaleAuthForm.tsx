
import React, { useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { UserRole } from '../types';

type AuthMode = 'signin' | 'signup';

const WholesaleAuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
            role: 'wholesale_buyer' as UserRole,
          }
        }
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user) {
         setMessage({ type: 'success', text: 'Success! Please check your email for verification. Your account will be activated after admin approval.' });
      }
    } else {
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

  const modeConfig = {
    signin: {
      title: 'Partner Login',
      buttonText: 'Sign In',
      toggleText: "Don't have an account? Register Now",
    },
    signup: {
      title: 'Register as a Partner',
      buttonText: 'Create Wholesale Account',
      toggleText: 'Already a partner? Sign In',
    },
  };

  return (
    <div className="w-full p-8 space-y-6">
      <h3 className="text-2xl font-bold text-center text-brand-dark">{modeConfig[mode].title}</h3>
      
      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleAuth}>
        <div>
          <label htmlFor="wholesale-email" className="sr-only">Email address</label>
          <input
            id="wholesale-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="wholesale-password"className="sr-only">Password</label>
          <input
            id="wholesale-password"
            name="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white bg-brand-primary rounded-md font-semibold hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 transition-colors"
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
  );
};

export default WholesaleAuthForm;
