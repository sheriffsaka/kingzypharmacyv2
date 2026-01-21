
import React, { useState, useEffect, useCallback } from 'react';
// import { supabase } from '../lib/supabase/client'; // MOCK: Temporarily disabled for presentation
import { Order, OrderStatus, OrderItem, Product } from '../types';
import { EyeIcon, XIcon } from './Icons';

// --- MOCK DATA FOR PRESENTATION ---
const mockAssignedOrders: Order[] = [
    { 
        id: 102, 
        user_id: 'user-2-uuid', 
        created_at: new Date(Date.now() - 86400000).toISOString(), 
        status: 'PROCESSING', 
        total_price: 25000, 
        discount_applied: 500, 
        delivery_address: { fullName: 'Jane Smith', phone: '09087654321', street: '456 Oak Ave', city: 'Abuja', state: 'FCT', zip: '900001' }, 
        customer_details: { email: 'wholesale@kingzy.com', userId: 'user-2-uuid' },
        order_items: [
             { id: 1, order_id: 102, product_id: 1, quantity: 10, unit_price: 2200, products: { name: 'Ibuprofen', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } },
        ] as (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[],
    },
    { 
        id: 205, 
        user_id: 'user-5-uuid', 
        created_at: new Date(Date.now() - 96400000).toISOString(), 
        status: 'DISPATCHED', 
        total_price: 50000, 
        discount_applied: 1000, 
        delivery_address: { fullName: 'Bello Musa', phone: '07011112222', street: '111 Sahel Rd', city: 'Kano', state: 'Kano', zip: '700001' }, 
        customer_details: { email: 'bello.m@example.com', userId: 'user-5-uuid' } 
    },
    { 
        id: 301, 
        user_id: 'user-6-uuid', 
        created_at: new Date(Date.now() - 126400000).toISOString(), 
        status: 'IN_TRANSIT', 
        total_price: 18000, 
        discount_applied: 0, 
        delivery_address: { fullName: 'Grace Akpan', phone: '08122223333', street: '222 Palm St', city: 'Calabar', state: 'Cross River', zip: '540001' }, 
        customer_details: { email: 'grace.a@example.com', userId: 'user-6-uuid' },
         order_items: [
             { id: 2, order_id: 301, product_id: 3, quantity: 2, unit_price: 4000, products: { name: 'Cetirizine Hydrochloride', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819815/pr8_x30k6m.png' } },
             { id: 3, order_id: 301, product_id: 4, quantity: 1, unit_price: 6500, products: { name: 'Gaviscon Double Action', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr2_b8czjp.png' } },
        ] as (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[],
    },
];
// ------------------------------------

const LogisticsDashboard: React.FC = () => {
    const [assignedOrders, setAssignedOrders] = useState<Order[]>(mockAssignedOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus, note?: string) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        
        setTimeout(() => {
            setAssignedOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            alert(`Order #${orderId} status updated to '${newStatus}'. Note: ${note}`);
            setUpdating(prev => ({...prev, [orderId]: false}));
        }, 1000);
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
        <>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status.replace(/_/g, ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                                                <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><EyeIcon className="w-5 h-5"/></button>
                                                {renderActionButtons(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">Order Details #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Customer Info</h4>
                                    <p><strong>Name:</strong> {selectedOrder.delivery_address.fullName}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.delivery_address.phone}</p>
                                </div>
                                 <div>
                                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Delivery Address</h4>
                                    <p>{selectedOrder.delivery_address.street}</p>
                                    <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
                                </div>
                           </div>
                           <div>
                             <h4 className="text-lg font-semibold text-brand-dark mb-2">Order Items</h4>
                             <div className="space-y-3">
                                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                    selectedOrder.order_items.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-2 rounded-md">
                                            <img src={item.products?.image_url} alt={item.products?.name} className="w-14 h-14 object-cover rounded"/>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.products?.name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                                            </div>
                                            <p className="font-semibold">₦{(item.quantity * item.unit_price).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No item details available for this order.</p>
                                )}
                             </div>
                           </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                            <button onClick={() => setSelectedOrder(null)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LogisticsDashboard;
