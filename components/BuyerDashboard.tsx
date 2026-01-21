import React, { useState } from 'react';
import { Profile, View, Order, OrderStatus, OrderStatusHistory } from '../types';
import OrderTrackingTimeline from './OrderTrackingTimeline';

// --- MOCK DATA FOR PRESENTATION ---
const mockBuyerUserDetails = {
    fullName: 'Bolanle Adeoye',
    phone: '08055551234',
    shippingAddress: '45, Unity Road, Ikeja, Lagos',
    loyaltyDiscount: '2.5%',
};

const mockBuyerOrders: (Order & {order_status_history: OrderStatusHistory[]})[] = [
    {
        id: 101,
        user_id: '00000000-0000-0000-0000-000000000005',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        status: 'DELIVERED',
        total_price: 5700,
        discount_applied: 142.5,
        delivery_address: { fullName: 'Bolanle Adeoye', street: '45, Unity Road', city: 'Ikeja', state: 'Lagos', zip: '100212', phone: '08055551234' },
        customer_details: { email: 'buyer@kingzy.com', userId: '00000000-0000-0000-0000-000000000005' },
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_by: 'user' },
            { id: 2, status: 'PROCESSING', updated_at: new Date(Date.now() - 86400000 * 4.9).toISOString(), updated_by: 'admin' },
            { id: 3, status: 'DISPATCHED', updated_at: new Date(Date.now() - 86400000 * 4).toISOString(), updated_by: 'logistics' },
            { id: 4, status: 'IN_TRANSIT', updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), updated_by: 'logistics' },
            { id: 5, status: 'DELIVERED', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'logistics' },
        ]
    },
    {
        id: 105,
        user_id: '00000000-0000-0000-0000-000000000005',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        status: 'IN_TRANSIT',
        total_price: 12000,
        discount_applied: 300,
        delivery_address: { fullName: 'Bolanle Adeoye', street: '45, Unity Road', city: 'Ikeja', state: 'Lagos', zip: '100212', phone: '08055551234' },
        customer_details: { email: 'buyer@kingzy.com', userId: '00000000-0000-0000-0000-000000000005' },
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'user' },
            { id: 2, status: 'PROCESSING', updated_at: new Date(Date.now() - 86400000 * 0.9).toISOString(), updated_by: 'admin' },
            { id: 3, status: 'DISPATCHED', updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), updated_by: 'logistics' },
            { id: 4, status: 'IN_TRANSIT', updated_at: new Date(Date.now() - 86400000 * 0.2).toISOString(), updated_by: 'logistics' },
        ]
    }
];
// ------------------------------------

type DashboardTab = 'profile' | 'orders';

interface BuyerDashboardProps {
  profile: Profile;
  onNavigate: (view: View) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  
  const renderContent = () => {
    switch (activeTab) {
        case 'profile': return <MyProfile profile={profile} />;
        case 'orders': return <OrderHistory onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })} />;
        default: return <OrderHistory onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })} />;
    }
  }

  const TabButton: React.FC<{tab: DashboardTab, label: string}> = ({tab, label}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-6">My Dashboard</h1>
      <div className="flex space-x-2 border-b mb-6">
        <TabButton tab="orders" label="My Orders" />
        <TabButton tab="profile" label="My Profile" />
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

const MyProfile: React.FC<{profile: Profile}> = ({ profile }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold text-brand-dark mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div><h3 className="text-sm font-semibold text-gray-500">Full Name</h3><p className="text-lg">{mockBuyerUserDetails.fullName}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-500">Registered Email</h3><p className="text-lg">{profile.email}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-500">Phone Number</h3><p className="text-lg">{mockBuyerUserDetails.phone}</p></div>
            </div>
             <div className="space-y-4">
                <div><h3 className="text-sm font-semibold text-gray-500">Default Shipping Address</h3><p className="text-lg">{mockBuyerUserDetails.shippingAddress}</p></div>
                <div><h3 className="text-sm font-semibold text-gray-500">Loyalty Status</h3><p className="text-lg font-bold text-green-600">{mockBuyerUserDetails.loyaltyDiscount} Discount</p></div>
            </div>
        </div>
    </div>
);

const OrderHistory: React.FC<{onProductSelect: (productId: number) => void}> = ({ onProductSelect }) => {
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const getStatusChip = (status: OrderStatus) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        const statusText = status.replace(/_/g, ' ').toLowerCase();
        switch (status) {
            case 'PROCESSING': return <span className={`${baseClasses} bg-blue-200 text-blue-900`}>{statusText}</span>;
            case 'DISPATCHED': return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>{statusText}</span>;
            case 'IN_TRANSIT': return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{statusText}</span>;
            case 'DELIVERED': return <span className={`${baseClasses} bg-green-100 text-green-800`}>{statusText}</span>;
            case 'CANCELLED': return <span className={`${baseClasses} bg-red-100 text-red-800`}>{statusText}</span>;
            default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{statusText}</span>;
        }
    };

    return (
         <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark">My Orders</h2>
            {mockBuyerOrders.length === 0 ? (
                <p>You have not placed any orders yet.</p>
            ) : (
                mockBuyerOrders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                                <p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {getStatusChip(order.status)}
                                <span className="text-lg font-bold">₦{order.total_price.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="border-t pt-4 mt-4 flex flex-wrap gap-4">
                            <button onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300 transition-colors">
                                {expandedOrder === order.id ? 'Hide Tracking' : 'Track Order'}
                            </button>
                        </div>
                        {expandedOrder === order.id && <OrderTrackingTimeline history={order.order_status_history} />}
                    </div>
                ))
            )}
        </div>
    )
}

export default BuyerDashboard;