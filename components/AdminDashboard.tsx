
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Profile } from '../types';

type PendingBuyer = Pick<Profile, 'id'> & { email: string | undefined };

const AdminDashboard: React.FC = () => {
    const [pendingBuyers, setPendingBuyers] = useState<PendingBuyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchPendingBuyers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // This needs to be done via an RPC call because of RLS
        const { data, error } = await supabase.rpc('get_pending_wholesale_buyers');

        if (error) {
            console.error('Error fetching pending buyers:', error);
            if (error.message.includes('function get_pending_wholesale_buyers() does not exist')) {
                 setError('Error: The required database function is missing. Please run the script in supabase/migrations/seed.sql in your Supabase SQL editor to create it.');
            } else {
                 setError('Failed to fetch pending buyers. You may not have the correct permissions, or there was a network issue.');
            }
            setPendingBuyers([]);
        } else if (data) {
             const buyers = data.map((d: any) => ({ id: d.id, email: d.email}));
             setPendingBuyers(buyers);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPendingBuyers();
    }, [fetchPendingBuyers]);

    const handleApprove = async (userId: string) => {
        setMessage(null);
        const { error } = await supabase
            .from('profiles')
            .update({ approval_status: 'approved' })
            .eq('id', userId);
        
        if (error) {
            setMessage(`Error approving user: ${error.message}`);
        } else {
            setMessage(`User ${userId.substring(0,8)}... approved successfully.`);
            // Refresh the list
            fetchPendingBuyers();
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Admin Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Wholesale Buyer Approval</h2>
                {loading && <p>Loading pending approvals...</p>}
                {error && <p className="text-red-500 font-semibold bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{message}</p>}
                
                {!loading && !error && (
                    <div className="space-y-4">
                        {pendingBuyers.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {pendingBuyers.map(buyer => (
                                    <li key={buyer.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">{buyer.email}</p>
                                            <p className="text-sm text-gray-500">ID: {buyer.id}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleApprove(buyer.id)}
                                            className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                                        >
                                            Approve
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No pending approvals at this time.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
