
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { Profile } from '../types';

interface DevToolbarProps {
    session: Session | null;
    profile: Profile | null;
}

const testUsers = {
    admin: { email: 'admin@kingzy.com', password: 'password123' },
    logistics: { email: 'logistics@kingzy.com', password: 'password123' },
    wholesale_approved: { email: 'wholesale@kingzy.com', password: 'password123' },
    wholesale_pending: { email: 'pending.wholesale@kingzy.com', password: 'password123' },
    buyer: { email: 'buyer@kingzy.com', password: 'password123' },
};

const DevToolbar: React.FC<DevToolbarProps> = ({ session, profile }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleLogin = async (userKey: keyof typeof testUsers) => {
        setLoading(true);
        setMessage(null);
        await supabase.auth.signOut(); // Logout first
        const { email, password } = testUsers[userKey];
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setMessage(`Login failed: ${error.message}. Ensure test users are seeded in the database.`);
            setLoading(false);
        } else {
            // On success, reload the page to ensure all state is correctly initialized
            window.location.reload();
        }
    };
    
    const handleLogout = async () => {
         setLoading(true);
         await supabase.auth.signOut();
         // Reload the page on logout for consistent behavior
         window.location.reload();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 shadow-lg z-[100] text-xs">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-4">
                     <span className="font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">DEV TOOLBAR</span>
                     {session ? (
                        <span>Logged in as: <strong className="text-yellow-300">{profile?.email}</strong> (Role: <strong className="text-yellow-300">{profile?.role}</strong>)</span>
                     ) : (
                        <span>Not logged in.</span>
                     )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                     <span className="font-semibold mr-2">Login as:</span>
                     <button onClick={() => handleLogin('admin')} disabled={loading} className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-500">Admin</button>
                     <button onClick={() => handleLogin('logistics')} disabled={loading} className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-500">Logistics</button>
                     <button onClick={() => handleLogin('wholesale_approved')} disabled={loading} className="px-2 py-1 bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-500">Wholesaler (Approved)</button>
                      <button onClick={() => handleLogin('wholesale_pending')} disabled={loading} className="px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 disabled:bg-gray-500">Wholesaler (Pending)</button>
                     <button onClick={() => handleLogin('buyer')} disabled={loading} className="px-2 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:bg-gray-500">Buyer</button>
                     <button onClick={handleLogout} disabled={loading} className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 disabled:bg-gray-500">Logout</button>
                </div>
                {message && <div className="w-full text-center text-red-400 text-xs mt-1">{message}</div>}
            </div>
        </div>
    );
};

export default DevToolbar;