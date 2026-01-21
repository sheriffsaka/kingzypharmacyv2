import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Order, OrderStatus } from '../types';

const LogisticsDashboard: React.FC = () => {
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});

    const fetchAssignedOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found.");

            const { data, error: fetchError } = await supabase
                .from('logistics_assignments')
                .select(`
                    orders (
                        *,
                        payments(payment_status, payment_method)
                    )
                `)
                .eq('logistics_user_id', user.id);

            if (fetchError) throw fetchError;
            
            // The data is nested, so we extract the order objects
            // FIX: The Supabase join can return a nested array of orders. Using .flat()
            // correctly unnests the data into a single list of Order objects.
            const orders = data.map(assignment => assignment.orders).flat().filter(Boolean) as Order[];
            setAssignedOrders(orders);

        } catch (err: any) {
            setError(`Failed to fetch assigned orders: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignedOrders();
    }, [fetchAssignedOrders]);

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus, note?: string) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        try {
            const { error: rpcError } = await supabase.rpc('update_order_status_by_logistics', {
                p_order_id: orderId,
                p_new_status: newStatus,
                p_note: note,
            });
            if (rpcError) throw rpcError;
            // Refresh the list to show the new status
            await fetchAssignedOrders();
        } catch (err: any) {
            alert(`Error updating status: ${err.message}`);
        } finally {
            setUpdating(prev => ({...prev, [orderId]: false}));
        }
    };
    
    const renderActionButtons = (order: Order) => {
        const isUpdating = updating[order.id];
        switch (order.status) {
            case 'PROCESSING':
                return <button onClick={() => handleStatusUpdate(order.id, 'DISPATCHED', 'Order has been dispatched from warehouse.')} disabled={isUpdating} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition disabled:bg-gray-400">{isUpdating ? 'Updating...' : 'Dispatch Order'}</button>;
            case 'DISPATCHED':
                return <button onClick={() => handleStatusUpdate(order.id, 'IN_TRANSIT', 'Order is now in transit with delivery partner.')} disabled={isUpdating} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 transition disabled:bg-gray-400">{isUpdating ? 'Updating...' : 'Mark In Transit'}</button>;
            case 'IN_TRANSIT':
                return <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED', 'Order has been successfully delivered to the customer.')} disabled={isUpdating} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition disabled:bg-gray-400">{isUpdating ? 'Updating...' : 'Confirm Delivery'}</button>;
            default:
                return <span className="text-sm font-medium text-gray-500">No actions available</span>;
        }
    };

    if (loading) return <p className="text-center py-12">Loading your assigned orders...</p>;
    if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Logistics Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">My Assigned Orders</h2>
                {assignedOrders.length === 0 ? (
                    <p>You have no orders assigned to you at the moment.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignedOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery_address.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{renderActionButtons(order)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogisticsDashboard;