import React, { useState, useMemo, useEffect } from 'react';
import { Profile, View, Order, OrderStatus, OrderStatusHistory, OrderItem, Product, Payment } from '../types';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import { XIcon, CloudUploadIcon } from './Icons';
import { mockOrders } from '../data/orders';

// --- MOCK DATA FOR PRESENTATION ---
const initialBuyerUserDetails = {
    fullName: 'Bolanle Adeoye',
    phone: '08055551234',
    shippingAddress: '45, Unity Road, Ikeja, Lagos',
    loyaltyDiscount: '2.5%',
};

const mockBuyerActivityLog = [
    { action: 'You placed an order', time: '1h ago' },
    { action: 'An order is now In Transit', time: '5h ago' },
    { action: 'Proof of Payment for an order was approved', time: '1d ago' },
    { action: 'An order has been delivered', time: '4d ago' },
    { action: 'You updated your profile information', time: '1w ago' },
];
// ------------------------------------

type DashboardTab = 'overview' | 'orders' | 'profile';

interface BuyerDashboardProps {
  profile: Profile;
  onNavigate: (view: View) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);

  // Load and filter orders for the current user
  useEffect(() => {
    const loadAndSyncOrders = () => {
        const storedOrdersRaw = localStorage.getItem('kingzy_all_orders');
        const ordersSource: Order[] = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : (mockOrders as Order[]);
        const userOrders = ordersSource.filter(o => o.user_id === profile.id);
        setOrders(userOrders);
    };

    loadAndSyncOrders();
    window.addEventListener('storage', loadAndSyncOrders);
    return () => window.removeEventListener('storage', loadAndSyncOrders);
  }, [profile.id]);

  const tabLabels: Record<DashboardTab, string> = {
    overview: 'Overview',
    orders: 'My Orders',
    profile: 'My Profile',
  };
  
  const TabButton = ({ tab, label }: { tab: DashboardTab, label: string }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-semibold transition-colors text-sm rounded-t-lg border-b-2 ${
            activeTab === tab 
            ? 'text-brand-primary border-brand-primary' 
            : 'text-gray-500 border-transparent hover:text-brand-dark hover:border-gray-300'
        }`}
    >
        {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
        case 'overview': return <BuyerDashboardOverview orders={orders} />;
        case 'orders': return <OrderHistory orders={orders} onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })} />;
        case 'profile': return <MyProfile profile={profile} />;
        default: return <BuyerDashboardOverview orders={orders} />;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back! Here's a summary of your account and order history.</p>
      
      <nav className="text-sm font-medium text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center">
              <li><button onClick={() => setActiveTab('overview')} className="hover:text-brand-primary transition-colors">Dashboard</button></li>
              {activeTab !== 'overview' && (<><li className="mx-2">/</li><li className="text-gray-800">{tabLabels[activeTab]}</li></>)}
          </ol>
      </nav>
      
      <div className="border-b border-gray-200 mb-6"><nav className="-mb-px flex space-x-4" aria-label="Tabs"><TabButton tab="overview" label="Overview" /><TabButton tab="orders" label="My Orders" /><TabButton tab="profile" label="My Profile" /></nav></div>
      <div>{renderContent()}</div>
    </div>
  );
};

const BuyerDashboardOverview: React.FC<{orders: Order[]}> = ({ orders }) => {
    const metrics = [
        { label: 'Total Orders Placed', value: orders.length },
        { label: 'Pending Confirmation', value: orders.filter(o => o.payments?.[0].payment_status === 'awaiting_confirmation').length },
        { label: 'Active Deliveries', value: orders.filter(o => ['PROCESSING', 'DISPATCHED', 'IN_TRANSIT'].includes(o.status)).length },
        { label: 'Completed Orders', value: orders.filter(o => o.status === 'DELIVERED').length },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{metrics.map(metric => (<div key={metric.label} className="bg-white p-6 rounded-lg shadow-md border"><p className="text-sm font-medium text-gray-500">{metric.label}</p><p className="text-3xl font-bold text-brand-dark mt-1">{metric.value}</p></div>))}</div></div>
            <div className="bg-white p-6 rounded-lg shadow-md border"><h3 className="text-xl font-semibold mb-4 text-brand-dark">Recent Activity</h3><ul className="divide-y divide-gray-200">{mockBuyerActivityLog.map((log, index) => (<li key={index} className="py-3 flex justify-between items-center"><div><p className="text-sm text-gray-800">{log.action}</p></div><span className="text-xs text-gray-400">{log.time}</span></li>))}</ul></div>
        </div>
    );
};

const MyProfile: React.FC<{profile: Profile}> = ({ profile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState(initialBuyerUserDetails);
    const [formState, setFormState] = useState(initialBuyerUserDetails);

    const handleEdit = () => { setFormState(userDetails); setIsEditing(true); };
    const handleCancel = () => { setIsEditing(false); };
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); setUserDetails(formState); setIsEditing(false); };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormState({ ...formState, [e.target.name]: e.target.value }); };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-brand-dark">Account Information</h2><button onClick={handleEdit} className="font-bold py-2 px-4 rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Edit Profile</button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4"><div><h3 className="text-sm font-semibold text-gray-500">Full Name</h3><p className="text-lg">{userDetails.fullName}</p></div><div><h3 className="text-sm font-semibold text-gray-500">Registered Email</h3><p className="text-lg">{profile.email}</p></div><div><h3 className="text-sm font-semibold text-gray-500">Phone Number</h3><p className="text-lg">{userDetails.phone}</p></div></div><div className="space-y-4"><div><h3 className="text-sm font-semibold text-gray-500">Default Shipping Address</h3><p className="text-lg">{userDetails.shippingAddress}</p></div><div><h3 className="text-sm font-semibold text-gray-500">Loyalty Status</h3><p className="text-lg font-bold text-green-600">{userDetails.loyaltyDiscount} Discount</p></div></div></div>
            </div>
            {isEditing && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-2xl"><form onSubmit={handleSave}><div className="flex justify-between items-center p-4 border-b"><h3 className="text-xl font-semibold">Edit My Profile</h3><button type="button" onClick={handleCancel}><XIcon className="w-6 h-6"/></button></div><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-sm font-semibold">Full Name</label><input name="fullName" value={formState.fullName} onChange={handleChange} className="w-full p-2 border rounded-md"/></div><div><label className="text-sm font-semibold">Phone Number</label><input name="phone" value={formState.phone} onChange={handleChange} className="w-full p-2 border rounded-md"/></div><div className="md:col-span-2"><label className="text-sm font-semibold">Shipping Address</label><input name="shippingAddress" value={formState.shippingAddress} onChange={handleChange} className="w-full p-2 border rounded-md"/></div></div><div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg"><button type="button" onClick={handleCancel} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button><button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save Changes</button></div></form></div></div>)}
        </>
    );
};

const OrderHistory: React.FC<{orders: Order[], onProductSelect: (productId: number) => void}> = ({ orders, onProductSelect }) => {
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [uploadingPopFor, setUploadingPopFor] = useState<number | null>(null);
    const [popFile, setPopFile] = useState<File | null>(null);
    const [uploadedPops, setUploadedPops] = useState<Set<number>>(() => {
        const initiallyUploaded = new Set<number>();
        orders.forEach(order => { if (localStorage.getItem(`proof_for_${order.id}`)) { initiallyUploaded.add(order.id); } });
        return initiallyUploaded;
    });

    const handleUploadPop = (orderId: number) => {
        alert('Proof of payment uploaded successfully! Our team will verify it shortly.');
        localStorage.setItem(`proof_for_${orderId}`, 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770119864/sample-receipt_h4q0b3.jpg');
        setUploadedPops(prev => new Set(prev).add(orderId));
        setUploadingPopFor(null);
        setPopFile(null);
    };

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
        <>
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-brand-dark">My Orders</h2>
                {orders.length === 0 ? (<p>You have not placed any orders yet.</p>) : (
                    orders.map(order => {
                        const payment = order.payments?.[0];
                        const isAwaitingPayment = payment?.payment_status === 'awaiting_confirmation';
                        const hasUploaded = uploadedPops.has(order.id);
                        return (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div><h3 className="text-xl font-semibold">Order #{order.id}</h3><p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p></div>
                                <div className="flex items-center gap-4">{isAwaitingPayment ? <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${hasUploaded ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{hasUploaded ? 'Verification Pending' : 'Awaiting Payment'}</span> : getStatusChip(order.status)}<span className="text-lg font-bold">₦{order.total_price.toLocaleString()}</span></div>
                            </div>
                            <div className="border-t pt-4 mt-4 flex flex-wrap gap-4">
                                <button onClick={() => setExpandedOrder(prev => prev === order.id ? null : order.id)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300 transition-colors">{expandedOrder === order.id ? 'Hide Details' : 'View Details'}</button>
                                {isAwaitingPayment && !hasUploaded && (<button onClick={() => setUploadingPopFor(order.id)} className="font-bold py-2 px-4 rounded-md bg-yellow-400 text-black hover:bg-yellow-500">Upload Payment Proof</button>)}
                            </div>
                            {expandedOrder === order.id && (
                                <div className="mt-4 border-t pt-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div><h3 className="text-lg font-semibold mb-4 text-brand-dark">Order Items</h3><div className="space-y-3">{order.order_items?.map(item => (<div key={item.id} className="flex items-center gap-4 bg-gray-50 p-2 rounded-md"><img src={item.products?.image_url} alt={item.products?.name} className="w-14 h-14 object-cover rounded"/><div className="flex-grow"><p className="font-semibold">{item.products?.name}</p><p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p></div><p className="font-semibold text-right">₦{(item.quantity * item.unit_price).toLocaleString()}</p></div>))}</div></div>
                                    <div><h3 className="text-lg font-semibold mb-4 text-brand-dark">Payment & Delivery</h3><div className="space-y-4 bg-gray-50 p-4 rounded-md mb-6"><div><p className="text-sm font-semibold text-gray-500">Payment Method</p><p className="capitalize">{payment?.payment_method?.replace('_', ' ') || 'N/A'}</p></div><div><p className="text-sm font-semibold text-gray-500">Payment Status</p><p className="capitalize font-semibold">{payment?.payment_status?.replace('_', ' ') || 'N/A'}</p></div>{hasUploaded && (<div><p className="text-sm font-semibold text-gray-500">Proof of Payment</p><div className="flex items-center gap-2"><span className="text-green-600 font-semibold">Uploaded, pending verification.</span><a href={localStorage.getItem(`proof_for_${order.id}`)!} target="_blank" rel="noopener noreferrer" className="text-brand-primary underline text-sm">View</a></div></div>)}</div><OrderTrackingTimeline history={(order as any).order_status_history} /></div>
                                </div></div>
                            )}
                        </div>
                    )})
                )}
            </div>
            
            {uploadingPopFor !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b"><h3 className="text-xl font-semibold">Upload Proof of Payment for Order #{uploadingPopFor}</h3><button type="button" onClick={() => { setUploadingPopFor(null); setPopFile(null); }}><XIcon className="w-6 h-6"/></button></div>
                        <div className="p-6"><p className="text-sm text-gray-600 mb-4">Please upload a clear image or PDF of your bank transfer receipt. Our team will verify it to process your order.</p><label htmlFor="pop-upload" className="relative cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center block hover:border-brand-primary"><CloudUploadIcon className="w-12 h-12 mx-auto text-gray-400" /><span className="mt-2 block text-sm font-semibold text-gray-600">{popFile ? popFile.name : 'Click to browse or drag & drop'}</span><input id="pop-upload" type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setPopFile(e.target.files ? e.target.files[0] : null)} /></label></div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg"><button type="button" onClick={() => { setUploadingPopFor(null); setPopFile(null); }} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button><button onClick={() => handleUploadPop(uploadingPopFor!)} disabled={!popFile} className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Submit for Verification</button></div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BuyerDashboard;
