import React, { useState } from 'react';
import { Order, OrderStatus, OrderItem, Product } from '../types';
import { EyeIcon, XIcon } from './Icons';

// --- MOCK DATA FOR PRESENTATION ---
const mockAssignedOrders: Order[] = [
    { 
        id: 102, 
        user_id: 'user-2-uuid', 
        created_at: new Date(Date.now() - 86400000).toISOString(), 
        status: 'PROCESSING', // This is a new, unaccepted assignment
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
        status: 'DISPATCHED', // This is an active delivery
        total_price: 50000, 
        discount_applied: 1000, 
        delivery_address: { fullName: 'Bello Musa', phone: '07011112222', street: '111 Sahel Rd', city: 'Kano', state: 'Kano', zip: '700001' }, 
        customer_details: { email: 'bello.m@example.com', userId: 'user-5-uuid' } 
    },
    { 
        id: 301, 
        user_id: 'user-6-uuid', 
        created_at: new Date(Date.now() - 126400000).toISOString(), 
        status: 'IN_TRANSIT', // This is an active delivery
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

const initialLogisticsUserDetails = {
    fullName: 'Logistics Staff',
    phone: '08011223344',
    vehicleId: 'TRK-001'
};
// ------------------------------------

type LogisticsTab = 'assignments' | 'profile';

const LogisticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<LogisticsTab>('assignments');

    const TabButton = ({ tab, label }: { tab: LogisticsTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'assignments': return <MyAssignments />;
            case 'profile': return <MyProfile />;
            default: return <MyAssignments />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Logistics Dashboard</h1>
            <div className="flex space-x-2 border-b mb-6">
                <TabButton tab="assignments" label="My Assignments" />
                <TabButton tab="profile" label="My Profile" />
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

const MyAssignments: React.FC = () => {
    const [assignedOrders, setAssignedOrders] = useState<Order[]>(mockAssignedOrders);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleAccept = (orderId: number) => {
        // MOCK: In a real app, you might just update the UI or confirm with the backend.
        // Here, we can just provide feedback.
        alert(`Order #${orderId} accepted. You can now update its delivery status.`);
        // No status change needed as 'PROCESSING' is the accepted state
    };

    const handleReject = (orderId: number) => {
        if (confirm("Are you sure you want to reject this assignment? It will be returned to the admin's queue.")) {
            // MOCK: Remove the order from this user's view.
            setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
            alert(`Order #${orderId} rejected and returned to admin for reassignment.`);
        }
    };

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus, note?: string) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        
        setTimeout(() => {
            setAssignedOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            alert(`Order #${orderId} status updated to '${newStatus}'.`);
            setUpdating(prev => ({...prev, [orderId]: false}));
        }, 1000);
    };

    if (loading) return <p className="text-center py-12">Loading assigned orders...</p>;
    if (error) return <p className="text-center py-12 text-red-500">{error}</p>;

    const newAssignments = assignedOrders.filter(o => o.status === 'PROCESSING');
    const activeDeliveries = assignedOrders.filter(o => ['DISPATCHED', 'IN_TRANSIT'].includes(o.status));

    return (
        <>
            <div className="space-y-8">
                {/* New Assignments Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-600">New Assignments (Pending Action)</h2>
                    {newAssignments.length > 0 ? (
                        <div className="space-y-4">
                            {newAssignments.map(order => (
                                <div key={order.id} className="p-4 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Order #{order.id}</p>
                                        <p className="text-sm text-gray-600">To: {order.delivery_address.fullName} in {order.delivery_address.city}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><EyeIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleReject(order.id)} className="font-semibold py-2 px-3 rounded-md bg-red-100 text-red-700 hover:bg-red-200">Reject</button>
                                        <button onClick={() => handleAccept(order.id)} className="font-semibold py-2 px-3 rounded-md bg-green-100 text-green-700 hover:bg-green-200">Accept</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No new assignments.</p>
                    )}
                </div>

                {/* Active Deliveries Table */}
                 <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4 text-brand-dark">Active Deliveries</h2>
                    {activeDeliveries.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activeDeliveries.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.delivery_address.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status.replace(/_/g, ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                                                <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><EyeIcon className="w-5 h-5"/></button>
                                                {order.status === 'DISPATCHED' && <button onClick={() => handleStatusUpdate(order.id, 'IN_TRANSIT')} disabled={updating[order.id]} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 disabled:bg-gray-400">{updating[order.id] ? '...' : 'Mark In Transit'}</button>}
                                                {order.status === 'IN_TRANSIT' && <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} disabled={updating[order.id]} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400">{updating[order.id] ? '...' : 'Confirm Delivery'}</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No active deliveries.</p>
                    )}
                </div>
            </div>

            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </>
    );
}

const MyProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState(initialLogisticsUserDetails);
    const [formState, setFormState] = useState(initialLogisticsUserDetails);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserDetails(formState);
        setIsEditing(false);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-brand-dark">My Profile</h2>
                    <button onClick={() => setIsEditing(true)} className="font-bold py-2 px-4 rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Edit Profile</button>
                </div>
                <div className="space-y-4">
                    <div><h3 className="text-sm font-semibold text-gray-500">Full Name</h3><p className="text-lg">{userDetails.fullName}</p></div>
                    <div><h3 className="text-sm font-semibold text-gray-500">Phone Number</h3><p className="text-lg">{userDetails.phone}</p></div>
                    <div><h3 className="text-sm font-semibold text-gray-500">Vehicle ID</h3><p className="text-lg">{userDetails.vehicleId}</p></div>
                </div>
            </div>

            {isEditing && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleSave}>
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold">Edit My Profile</h3>
                                <button type="button" onClick={() => setIsEditing(false)}><XIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-sm font-semibold">Full Name</label><input name="fullName" value={formState.fullName} onChange={(e) => setFormState({...formState, fullName: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Phone Number</label><input name="phone" value={formState.phone} onChange={(e) => setFormState({...formState, phone: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Vehicle ID</label><input name="vehicleId" value={formState.vehicleId} onChange={(e) => setFormState({...formState, vehicleId: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                                <button type="button" onClick={() => setIsEditing(false)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

const OrderDetailsModal: React.FC<{order: Order, onClose: () => void}> = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">Order Details #{order.id}</h3>
                <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-lg font-semibold text-brand-dark mb-2">Customer Info</h4>
                        <p><strong>Name:</strong> {order.delivery_address.fullName}</p>
                        <p><strong>Phone:</strong> {order.delivery_address.phone}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-brand-dark mb-2">Delivery Address</h4>
                        <p>{order.delivery_address.street}</p>
                        <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Order Items</h4>
                    <div className="space-y-3">
                        {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map(item => (
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
                            <p className="text-gray-500">No item details available.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button onClick={onClose} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Close</button>
            </div>
        </div>
    </div>
);


export default LogisticsDashboard;