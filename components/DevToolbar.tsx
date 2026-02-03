
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';

interface DevToolbarProps {
    session: Session | null;
    profile: Profile | null;
    onDevLogin: (profile: Profile) => void;
    onDevLogout: () => void;
}

const mockProfiles: Record<string, Profile> = {
    super_admin: {
        id: 'super-admin-uuid',
        email: 'super@kingzy.com',
        role: 'super_admin',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 0,
    },
    admin: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@kingzy.com',
        role: 'admin',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 5.0,
    },
    platinum_member: {
        id: 'platinum-member-uuid',
        email: 'platinum.partner@kingzy.com',
        role: 'wholesale_buyer',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 15.0,
        is_platinum: true,
    },
    logistics: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'logistics@kingzy.com',
        role: 'logistics',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 0,
    },
    wholesale_approved: {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'wholesale@kingzy.com',
        role: 'wholesale_buyer',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 10.0,
    },
    wholesale_pending: {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'pending.wholesale@kingzy.com',
        role: 'wholesale_buyer',
        approval_status: 'pending',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 0,
    },
    buyer: {
        id: '00000000-0000-0000-0000-000000000005',
        email: 'buyer@kingzy.com',
        role: 'general_public',
        approval_status: 'approved',
        created_at: new Date().toISOString(),
        loyalty_discount_percentage: 2.5,
    },
};

const DevToolbar: React.FC<DevToolbarProps> = ({ session, profile, onDevLogin, onDevLogout }) => {
    
    const handleLogin = (userKey: keyof typeof mockProfiles) => {
        const mockProfile = mockProfiles[userKey];
        onDevLogin(mockProfile);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-2 shadow-lg z-[100] text-xs">
            <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-4">
                     <span className="font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">DEV TOOLBAR</span>
                     {session ? (
                        <span>Logged in as: <strong className="text-yellow-300">{profile?.email}</strong> (Role: <strong className="text-yellow-300">{profile?.role}</strong>) {profile?.is_platinum && <strong className="text-yellow-400">[PLATINUM]</strong>}</span>
                     ) : (
                        <span>Not logged in.</span>
                     )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                     <span className="font-semibold mr-2">Quick Login:</span>
                     <button onClick={() => handleLogin('super_admin')} className="px-2 py-1 bg-purple-600 rounded hover:bg-purple-700">Super Admin</button>
                     <button onClick={() => handleLogin('admin')} className="px-2 py-1 bg-red-500 rounded hover:bg-red-600">Admin</button>
                     <button onClick={() => handleLogin('platinum_member')} className="px-2 py-1 bg-yellow-600 text-black font-bold rounded hover:bg-yellow-500">Platinum</button>
                     <button onClick={() => handleLogin('logistics')} className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600">Logistics</button>
                     <button onClick={() => handleLogin('wholesale_approved')} className="px-2 py-1 bg-green-500 rounded hover:bg-green-600">Wholesaler (Appr.)</button>
                     <button onClick={() => handleLogin('wholesale_pending')} className="px-2 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600">Wholesaler (Pend.)</button>
                     <button onClick={() => handleLogin('buyer')} className="px-2 py-1 bg-gray-200 text-black rounded hover:bg-gray-300">Buyer</button>
                     {session && <button onClick={onDevLogout} className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-700">Logout</button>}
                </div>
            </div>
        </div>
    );
};

export default DevToolbar;
