
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Profile } from '../types';

type PendingBuyer = Pick<Profile, 'id'> & { email: string | undefined };

const AdminUserApproval: React.FC = () => {
    const [pendingBuyers, setPendingBuyers] = useState<PendingBuyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const fetchPendingBuyers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.rpc('get_pending_wholesale_buyers');

        if (error) {
            console.error('Error fetching pending buyers:', error);
            setError('Failed to fetch pending buyers. Ensure the database functions are set up correctly.');
            setPendingBuyers([]);
        } else if (data) {
            const buyers = data.map((d: any) => ({ id: d.id, email: d.email }));
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
            setMessage(`User approved successfully.`);
            fetchPendingBuyers();
        }
    };

    return (
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
    );
};

export default AdminUserApproval;
