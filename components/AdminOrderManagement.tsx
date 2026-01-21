import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Order, Profile } from '../types';

const AdminOrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [logisticsStaff, setLogisticsStaff] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLogistics, setSelectedLogistics] = useState<Record<number, string>>({});
    const [assigning, setAssigning] = useState<Record<number, boolean>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, payments(payment_status)')
                .order('created_at', { ascending: false });
            if (ordersError) throw ordersError;
            setOrders(ordersData as Order[]);

            const { data: staffData, error: staffError } = await supabase.rpc('get_logistics_staff');
            if (staffError) throw staffError;
            setLogisticsStaff(staffData as Profile[]);
        } catch (err: any) {
            setError(`Failed to fetch data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignOrder = async (orderId: number) => {
        const logisticsUserId = selectedLogistics[orderId];
        if (!logisticsUserId) {
            alert("Please select a logistics staff member.");
            return;
        }
        setAssigning(prev => ({ ...prev, [orderId]: true }));
        try {
            const { error: rpcError } = await supabase.rpc('acknowledge_and_assign_order', {
                p_order_id: orderId,
                p_logistics_user_id: logisticsUserId,
                p_note: 'Order assigned to logistics staff.'
            });
            if (rpcError) throw rpcError;
            // Success, refresh data
            await fetchData();
        } catch (err: any) {
            alert(`Error assigning order: ${err.message}`);
        } finally {
            setAssigning(prev => ({ ...prev, [orderId]: false }));
        }
    };

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map(order => {
                            const payment = order.payments?.[0];
                            const isAssignable = order.status === 'ORDER_RECEIVED' && (payment?.payment_status === 'paid' || payment?.payment_status === 'pay_on_delivery');
                            
                            return (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                        <div className="text-sm text-gray-500">{order.customer_details.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment?.payment_status.replace('_', ' ') || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {isAssignable ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={selectedLogistics[order.id] || ''}
                                                    onChange={(e) => setSelectedLogistics(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                    className="p-2 border border-gray-300 rounded-md text-sm"
                                                >
                                                    <option value="" disabled>Assign to...</option>
                                                    {logisticsStaff.map(staff => (
                                                        <option key={staff.id} value={staff.id}>{staff.email}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAssignOrder(order.id)}
                                                    disabled={!selectedLogistics[order.id] || assigning[order.id]}
                                                    className="bg-brand-primary text-white font-semibold py-2 px-3 rounded-md hover:bg-brand-secondary transition disabled:bg-gray-400"
                                                >
                                                    {assigning[order.id] ? 'Assigning...' : 'Assign'}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">No action required</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderManagement;