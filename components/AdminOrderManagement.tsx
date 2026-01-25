import React, { useState, useMemo } from 'react';
import { Order, Profile, OrderItem, Product, PaymentStatus, OrderStatus, OrderStatusHistory } from '../types';
import { EyeIcon, XIcon } from './Icons';

// --- MOCK DATA FOR PRESENTATION ---
const mockLogisticsStaff: (Profile & { email: string })[] = [
    { id: '00000000-0000-0000-0000-000000000002', email: 'logistics@kingzy.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
    { id: 'logistics-2-uuid', email: 'delivery.expert@example.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
];

const mockOrders: Order[] = [
    { 
      id: 105, 
      user_id: 'user-5-uuid', 
      created_at: new Date(Date.now() - 3600000).toISOString(), 
      status: 'ORDER_RECEIVED', 
      total_price: 247500, 
      discount_applied: 27500, 
      delivery_address: { fullName: 'GoodHealth Pharmacy Ltd.', phone: '08012345678', street: '123 Commerce Ave', city: 'Lagos', state: 'Lagos', zip: '100001' }, 
      customer_details: { email: 'wholesale@kingzy.com', userId: 'user-5-uuid' }, 
      payments: [{ payment_method: 'online', payment_status: 'awaiting_confirmation' } as any],
      order_items: [
          { id: 4, order_id: 105, product_id: 1, quantity: 20, unit_price: 8000, products: { name: 'Paracetamol (Bulk)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png' } },
          { id: 5, order_id: 105, product_id: 2, quantity: 5, unit_price: 22000, products: { name: 'Ibuprofen (Case)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } },
      ] as (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[],
      order_status_history: [{ id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 3600000).toISOString(), updated_by: 'wholesale@kingzy.com' }]
    },
    { 
      id: 101, 
      user_id: 'user-1-uuid', 
      created_at: new Date().toISOString(), 
      status: 'ORDER_RECEIVED', 
      total_price: 15000, 
      discount_applied: 0, 
      delivery_address: { fullName: 'John Doe', phone: '08012345678', street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001' }, 
      customer_details: { email: 'buyer@kingzy.com', userId: 'user-1-uuid' }, 
      payments: [{ payment_status: 'paid' } as any],
      order_items: [
          { id: 1, order_id: 101, product_id: 1, quantity: 5, unit_price: 1500, products: { name: 'Paracetamol', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png' } },
          { id: 2, order_id: 101, product_id: 2, quantity: 3, unit_price: 2200, products: { name: 'Ibuprofen', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } },
      ] as (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[],
    },
    { id: 102, user_id: 'user-2-uuid', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'PROCESSING', total_price: 25000, discount_applied: 500, delivery_address: { fullName: 'Jane Smith', phone: '09087654321', street: '456 Oak Ave', city: 'Abuja', state: 'FCT', zip: '900001' }, customer_details: { email: 'wholesale@kingzy.com', userId: 'user-2-uuid' } },
    { id: 103, user_id: 'user-3-uuid', created_at: new Date(Date.now() - 172800000).toISOString(), status: 'ORDER_RECEIVED', total_price: 8500, discount_applied: 0, delivery_address: { fullName: 'Sam Ade', phone: '08122334455', street: '789 Pine Rd', city: 'Ibadan', state: 'Oyo', zip: '200001' }, customer_details: { email: 'another.buyer@example.com', userId: 'user-3-uuid' }, payments: [{ payment_status: 'pay_on_delivery' } as any],
      order_items: [
          { id: 3, order_id: 103, product_id: 3, quantity: 2, unit_price: 4000, products: { name: 'Cetirizine Hydrochloride', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819815/pr8_x30k6m.png' } }
      ] as (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[],
    },
    { id: 104, user_id: 'user-4-uuid', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), status: 'DELIVERED', total_price: 12000, discount_applied: 0, delivery_address: { fullName: 'Chris Ola', phone: '07055667788', street: '012 Elm St', city: 'Kano', state: 'Kano', zip: '700001' }, customer_details: { email: 'happy.customer@example.com', userId: 'user-4-uuid' } },
];
// ------------------------------------

// FIX: Define runtime arrays for enum-like types since type aliases cannot be iterated over.
const orderStatusOptions: OrderStatus[] = [
    'ORDER_RECEIVED',
    'ORDER_ACKNOWLEDGED',
    'PROCESSING',
    'DISPATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
    'DELIVERY_CONFIRMED'
];

const paymentStatusOptions: PaymentStatus[] = [
    'pending',
    'paid',
    'failed',
    'pay_on_delivery',
    'awaiting_confirmation'
];

interface AdminOrderManagementProps {
    profile: Profile;
}

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ profile }) => {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
    const [logisticsStaff, setLogisticsStaff] = useState<(Profile & {email: string})[]>(mockLogisticsStaff);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLogistics, setSelectedLogistics] = useState<Record<number, string>>({});
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [popUrl, setPopUrl] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [filters, setFilters] = useState({ status: '', payment: '', search: '' });

    const filteredOrders = useMemo(() => {
        const sourceOrders = showArchived ? archivedOrders : orders;
        return sourceOrders.filter(order => {
            if (filters.status && order.status !== filters.status) return false;
            if (filters.payment && order.payments?.[0]?.payment_status !== filters.payment) return false;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const idMatch = order.id.toString().includes(searchTerm);
                const emailMatch = order.customer_details.email.toLowerCase().includes(searchTerm);
                if (!idMatch && !emailMatch) return false;
            }
            return true;
        });
    }, [orders, archivedOrders, showArchived, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAcknowledge = (order: Order) => {
        // Mock stock check: assume even product IDs are low stock for demo
        const lowStockItems = order.order_items?.filter(item => item.product_id % 2 === 0).map(i => i.products?.name); 

        if (lowStockItems && lowStockItems.length > 0) {
            if (!confirm(`Warning: The following items have low stock: ${lowStockItems.join(', ')}. Proceeding will allocate stock. Continue?`)) {
                return;
            }
        }

        const newHistoryEntry: OrderStatusHistory = {
            id: Date.now(),
            status: 'ORDER_ACKNOWLEDGED',
            updated_at: new Date().toISOString(),
            updated_by: profile.email || 'admin@kingzy.com',
            note: 'Order acknowledged and sent for picking.'
        };

        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ORDER_ACKNOWLEDGED', order_status_history: [...(o.order_status_history || []), newHistoryEntry] } : o));
        alert(`Order #${order.id} acknowledged.`);
    };

    const handleAssignOrder = async (orderId: number) => {
        const logisticsUserId = selectedLogistics[orderId];
        if (!logisticsUserId) {
            alert("Please select a logistics staff member.");
            return;
        }
        setUpdating(prev => ({ ...prev, [orderId]: true }));
        
        const newHistoryEntry: OrderStatusHistory = {
            id: Date.now(),
            status: 'PROCESSING',
            updated_at: new Date().toISOString(),
            updated_by: profile.email || 'admin@kingzy.com',
            note: `Assigned to logistics staff ID ${logisticsUserId}.`
        };

        setTimeout(() => {
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: 'PROCESSING', order_status_history: [...(order.order_status_history || []), newHistoryEntry] } : order
            ));
            alert(`Order #${orderId} has been assigned and is now 'Processing'.`);
            setUpdating(prev => ({ ...prev, [orderId]: false }));
        }, 1000);
    };

    const handleConfirmPayment = (orderId: number) => {
        setUpdating(prev => ({ ...prev, [orderId]: true }));
         const newHistoryEntry: OrderStatusHistory = {
            id: Date.now(),
            status: 'ORDER_ACKNOWLEDGED', // Or keep current status, depends on flow
            updated_at: new Date().toISOString(),
            updated_by: profile.email || 'admin@kingzy.com',
            note: 'Payment confirmed by admin.'
        };
        setTimeout(() => {
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.id === orderId) {
                    const updatedPayments = order.payments ? [{ ...order.payments[0], payment_status: 'paid' as PaymentStatus }] : [];
                    return { ...order, payments: updatedPayments, order_status_history: [...(order.order_status_history || []), newHistoryEntry] };
                }
                return order;
            }));
            alert(`Payment for order #${orderId} has been confirmed.`);
            setUpdating(prev => ({ ...prev, [orderId]: false }));
        }, 1000);
    };

     const handleArchive = (orderId: number) => {
        const orderToArchive = orders.find(o => o.id === orderId);
        if (orderToArchive) {
            setArchivedOrders(prev => [...prev, orderToArchive]);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            alert(`Order #${orderId} has been archived.`);
        }
    };

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Order Management</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                    <input type="text" name="search" placeholder="Search ID or Email..." value={filters.search} onChange={handleFilterChange} className="p-2 border rounded-md" />
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">All Statuses</option>
                        {/* FIX: Iterate over the runtime array instead of the type. */}
                        {orderStatusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <select name="payment" value={filters.payment} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">All Payment Statuses</option>
                         {/* FIX: Iterate over the runtime array instead of the type. */}
                         {paymentStatusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
                        <span>Show Archived</span>
                    </label>
                </div>
                
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
                            {filteredOrders.map(order => {
                                const payment = order.payments?.[0];
                                const isAwaitingConfirmation = payment?.payment_status === 'awaiting_confirmation';
                                const isReadyForPicking = order.status === 'ORDER_RECEIVED' && (payment?.payment_status === 'paid' || payment?.payment_status === 'pay_on_delivery');
                                const isReadyToAssign = order.status === 'ORDER_ACKNOWLEDGED';
                                const isArchivable = (order.status === 'DELIVERED' || order.status === 'CANCELLED') && (Date.now() - new Date(order.created_at).getTime()) > 10 * 86400000; // Mock 10 days
                                
                                return (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                            <div className="text-sm text-gray-500">{order.customer_details.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status.replace(/_/g, ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment?.payment_status.replace(/_/g, ' ') || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                 <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"><EyeIcon className="w-5 h-5"/></button>
                                                {isAwaitingConfirmation && (
                                                     <button onClick={() => handleConfirmPayment(order.id)} disabled={updating[order.id]} className="bg-accent-green text-white font-semibold py-2 px-3 rounded-md hover:bg-green-600 transition disabled:bg-gray-400">
                                                        {updating[order.id] ? '...' : 'Confirm Payment'}
                                                     </button>
                                                )}
                                                {isReadyForPicking && (
                                                    <button onClick={() => handleAcknowledge(order)} className="bg-blue-500 text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-600">Acknowledge & Prepare</button>
                                                )}
                                                {isReadyToAssign && (
                                                    <>
                                                        <select value={selectedLogistics[order.id] || ''} onChange={(e) => setSelectedLogistics(prev => ({ ...prev, [order.id]: e.target.value }))} className="p-2 border border-gray-300 rounded-md text-sm">
                                                            <option value="" disabled>Assign to...</option>
                                                            {logisticsStaff.map(staff => (<option key={staff.id} value={staff.id}>{staff.email}</option>))}
                                                        </select>
                                                        <button onClick={() => handleAssignOrder(order.id)} disabled={!selectedLogistics[order.id] || updating[order.id]} className="bg-brand-primary text-white font-semibold py-2 px-3 rounded-md hover:bg-brand-secondary transition disabled:bg-gray-400">
                                                            {updating[order.id] ? '...' : 'Assign'}
                                                        </button>
                                                    </>
                                                )}
                                                 {isArchivable && !showArchived && <button onClick={() => handleArchive(order.id)} className="text-sm font-semibold text-gray-500 hover:underline">Archive</button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                    <p><strong>Email:</strong> {selectedOrder.customer_details.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.delivery_address.phone}</p>
                                </div>
                                 <div>
                                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Delivery Address</h4>
                                    <p>{selectedOrder.delivery_address.street}</p>
                                    <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
                                </div>
                           </div>
                           <div>
                                <h4 className="text-lg font-semibold text-brand-dark mb-2">Payment Details</h4>
                                <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                                    <p><strong>Method:</strong> <span className="capitalize">{selectedOrder.payments?.[0]?.payment_method?.replace('_', ' ') || 'N/A'}</span></p>
                                    <p><strong>Status:</strong> <span className="capitalize font-medium">{selectedOrder.payments?.[0]?.payment_status?.replace('_', ' ') || 'N/A'}</span></p>
                                    {selectedOrder.payments?.[0]?.payment_status === 'awaiting_confirmation' && (
                                        <p>
                                            <strong>Action: </strong> 
                                            <button onClick={() => setPopUrl('https://res.cloudinary.com/dzbibbld6/image/upload/v1768846395/sample-pop_lsw2yn.png')} className="text-brand-primary underline font-semibold">
                                                View Proof of Payment
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>
                           <div>
                             <h4 className="text-lg font-semibold text-brand-dark mb-2">Order Items</h4>
                             <div className="space-y-3">
                                {selectedOrder.order_items?.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-2 rounded-md">
                                        <img src={item.products?.image_url} alt={item.products?.name} className="w-14 h-14 object-cover rounded"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.products?.name}</p>
                                            <p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                                        </div>
                                        <p className="font-semibold">₦{(item.quantity * item.unit_price).toLocaleString()}</p>
                                    </div>
                                ))}
                             </div>
                           </div>
                            <div>
                                 <h4 className="text-lg font-semibold text-brand-dark mb-2">Pricing</h4>
                                 <div className="space-y-1 text-right">
                                    <p>Subtotal: ₦{(selectedOrder.total_price - 500 + selectedOrder.discount_applied).toLocaleString()}</p>
                                    <p className="text-green-600">Discount: -₦{selectedOrder.discount_applied.toLocaleString()}</p>
                                    <p>Delivery: ₦500.00</p>
                                    <p className="font-bold text-xl border-t pt-2 mt-2">Total: ₦{selectedOrder.total_price.toLocaleString()}</p>
                                 </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                            <button onClick={() => setSelectedOrder(null)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {popUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Proof of Payment</h3>
                            <button onClick={() => setPopUrl(null)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-4">
                            <img src={popUrl} alt="Proof of Payment" className="w-full h-auto rounded-md"/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminOrderManagement;
