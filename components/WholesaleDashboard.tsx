import React, { useState, useEffect } from 'react';
import { Profile, Product, View, Order, OrderStatus, OrderStatusHistory, OrderItem } from '../types';
// import { supabase } from '../lib/supabase/client'; // MOCK: Temporarily disabled for presentation
import ProductList from './ProductList';
import { SearchIcon, XIcon } from './Icons';
import OrderTrackingTimeline from './OrderTrackingTimeline';

// --- MOCK DATA FOR PRESENTATION ---
const mockWholesaleProducts: Product[] = [
    { id: 1, name: 'Paracetamol (Bulk)', description: 'Effective relief from pain and fever.', category_id: 1, dosage: '500mg, 1000 tablets', prices: { retail: 10000, wholesale_tiers: [{min_quantity: 10, price: 8000}, {min_quantity: 50, price: 7500}] }, stock_status: 'in_stock', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png', min_order_quantity: 10, wholesale_display_unit: 'Jar of 1000' },
    { id: 2, name: 'Ibuprofen (Case)', description: 'Anti-inflammatory tablets for various pains.', category_id: 1, dosage: '200mg, 48 packs', prices: { retail: 25000, wholesale_tiers: [{min_quantity: 5, price: 22000}, {min_quantity: 20, price: 20000}] }, stock_status: 'in_stock', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png', min_order_quantity: 5, wholesale_display_unit: 'Case of 48' },
    { id: 3, name: 'Vitamin C Effervescent (Bulk)', description: 'High-strength Vitamin C to support your immune system.', category_id: 2, dosage: '1000mg, 200 tablets', prices: { retail: 30000, wholesale_tiers: [{min_quantity: 10, price: 25000}, {min_quantity: 40, price: 22500}] }, stock_status: 'low_stock', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png', min_order_quantity: 10, wholesale_display_unit: 'Pack of 200' },
    { id: 4, name: 'Gaviscon Double Action (Carton)', description: 'Effective relief from heartburn and indigestion.', category_id: 4, dosage: '300ml, 12 Bottles', prices: { retail: 72000, wholesale_tiers: [{min_quantity: 2, price: 66000}, {min_quantity: 10, price: 60000}] }, stock_status: 'in_stock', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr2_b8czjp.png', min_order_quantity: 2, wholesale_display_unit: 'Carton of 12' },
];

const initialWholesaleUserDetails = {
    companyName: 'GoodHealth Pharmacy Ltd.',
    contactPerson: 'Chidi Okonkwo',
    phone: '08012345678',
    shippingAddress: '123, Commerce Avenue, Victoria Island, Lagos',
    memberSince: new Date(Date.now() - 31536000000).toLocaleDateString(), // ~1 year ago
};

const mockWholesaleOrders: (Order & {order_status_history: OrderStatusHistory[], order_items: (OrderItem & { products: Pick<Product, 'name' | 'image_url'>})[] })[] = [
    {
        id: 202401,
        user_id: '00000000-0000-0000-0000-000000000003',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: 'DELIVERED',
        total_price: 150000,
        discount_applied: 15000,
        delivery_address: { fullName: 'Chidi Okonkwo', street: '123, Commerce Avenue', city: 'Lagos', state: 'Lagos', zip: '101241', phone: '08012345678' },
        customer_details: { email: 'wholesale@kingzy.com', userId: '00000000-0000-0000-0000-000000000003' },
        order_items: [
            { id: 10, order_id: 202401, product_id: 4, quantity: 1, unit_price: 66000, products: { name: 'Gaviscon Double Action (Carton)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819812/pr2_b8czjp.png' } },
            { id: 11, order_id: 202401, product_id: 2, quantity: 3, unit_price: 22000, products: { name: 'Ibuprofen (Case)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } },
        ] as any,
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), updated_by: 'user' },
            { id: 2, status: 'PROCESSING', updated_at: new Date(Date.now() - 86400000 * 1.9).toISOString(), updated_by: 'admin' },
            { id: 3, status: 'DISPATCHED', updated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(), updated_by: 'logistics' },
            { id: 4, status: 'IN_TRANSIT', updated_at: new Date(Date.now() - 86400000 * 1).toISOString(), updated_by: 'logistics' },
            { id: 5, status: 'DELIVERED', updated_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), updated_by: 'logistics' },
        ]
    },
    {
        id: 202402,
        user_id: '00000000-0000-0000-0000-000000000003',
        created_at: new Date().toISOString(), // Today
        status: 'PROCESSING',
        total_price: 220000,
        discount_applied: 22000,
        delivery_address: { fullName: 'Chidi Okonkwo', street: '123, Commerce Avenue', city: 'Lagos', state: 'Lagos', zip: '101241', phone: '08012345678' },
        customer_details: { email: 'wholesale@kingzy.com', userId: '00000000-0000-0000-0000-000000000003' },
        order_items: [
             { id: 12, order_id: 202402, product_id: 1, quantity: 20, unit_price: 8000, products: { name: 'Paracetamol (Bulk)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png' } },
             { id: 13, order_id: 202402, product_id: 3, quantity: 2, unit_price: 25000, products: { name: 'Vitamin C Effervescent (Bulk)', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr10_ogxr0t.png' } },
        ] as any,
        order_status_history: [
            { id: 1, status: 'ORDER_RECEIVED', updated_at: new Date().toISOString(), updated_by: 'user' },
            { id: 2, status: 'PROCESSING', updated_at: new Date(Date.now() + 3600000).toISOString(), updated_by: 'admin' },
        ]
    }
];
// ------------------------------------

type DashboardTab = 'catalog' | 'profile' | 'orders';

interface WholesaleDashboardProps {
  profile: Profile;
  onNavigate: (view: View) => void;
}

const WholesaleDashboard: React.FC<WholesaleDashboardProps> = ({ profile, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('catalog');
  
  if (profile.approval_status !== 'approved') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-6">Wholesale Buyer Area</h1>
        <div className="p-6 rounded-lg shadow-md bg-yellow-100">
          <h2 className="text-xl font-semibold mb-2">Account Status: <span className="capitalize">{profile.approval_status}</span></h2>
          <p className="text-yellow-800">
            Your application is currently pending review. An administrator will approve your account shortly. Please check back later.
          </p>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (activeTab) {
        case 'catalog': return <ProductCatalog onNavigate={onNavigate} profile={profile} />;
        case 'profile': return <MyProfile profile={profile} />;
        case 'orders': return <OrderHistory onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })} />;
        default: return <ProductCatalog onNavigate={onNavigate} profile={profile} />;
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
      <h1 className="text-3xl font-bold text-brand-dark mb-6">Wholesale Dashboard</h1>
      <div className="flex space-x-2 border-b mb-6">
        <TabButton tab="catalog" label="Product Catalog" />
        <TabButton tab="profile" label="My Profile" />
        <TabButton tab="orders" label="My Orders" />
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

const ProductCatalog: React.FC<{onNavigate: (view: View) => void, profile: Profile}> = ({ onNavigate, profile }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setProducts(mockWholesaleProducts);
            setFilteredProducts(mockWholesaleProducts);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const results = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchQuery, products]);
    
    return (
        <div>
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-brand-dark">Wholesale Product Catalog</h2>
                <div className="relative w-full md:w-auto">
                <input
                    type="search"
                    placeholder="Search wholesale products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-80 p-3 pl-10 rounded-full border-2 border-gray-200 focus:outline-none focus:border-brand-primary"
                />
                <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            
            {loading ? <p>Loading products...</p> : (
                <ProductList
                products={filteredProducts}
                profile={profile}
                onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })}
                />
            )}
        </div>
    );
};

const MyProfile: React.FC<{profile: Profile}> = ({ profile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState(initialWholesaleUserDetails);
    const [formState, setFormState] = useState(initialWholesaleUserDetails);

    const handleEdit = () => {
        setFormState(userDetails); // Reset form state to current details
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save: In a real app, this would be a Supabase call.
        console.log("Saving profile data:", formState);
        setUserDetails(formState);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-brand-dark">Account Information</h2>
                    {!isEditing && <button onClick={handleEdit} className="font-bold py-2 px-4 rounded-md bg-brand-primary text-white hover:bg-brand-secondary">Edit Profile</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div><h3 className="text-sm font-semibold text-gray-500">Company Name</h3><p className="text-lg">{userDetails.companyName}</p></div>
                        <div><h3 className="text-sm font-semibold text-gray-500">Contact Person</h3><p className="text-lg">{userDetails.contactPerson}</p></div>
                        <div><h3 className="text-sm font-semibold text-gray-500">Registered Email</h3><p className="text-lg">{profile.email}</p></div>
                    </div>
                     <div className="space-y-4">
                        <div><h3 className="text-sm font-semibold text-gray-500">Default Shipping Address</h3><p className="text-lg">{userDetails.shippingAddress}</p></div>
                        <div><h3 className="text-sm font-semibold text-gray-500">Phone Number</h3><p className="text-lg">{userDetails.phone}</p></div>
                        <div><h3 className="text-sm font-semibold text-gray-500">Member Since</h3><p className="text-lg">{userDetails.memberSince}</p></div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <form onSubmit={handleSave}>
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold">Edit Profile</h3>
                                <button type="button" onClick={handleCancel}><XIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-sm font-semibold">Company Name</label><input name="companyName" value={formState.companyName} onChange={handleChange} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Contact Person</label><input name="contactPerson" value={formState.contactPerson} onChange={handleChange} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Phone Number</label><input name="phone" value={formState.phone} onChange={handleChange} className="w-full p-2 border rounded-md"/></div>
                                <div className="md:col-span-2"><label className="text-sm font-semibold">Shipping Address</label><input name="shippingAddress" value={formState.shippingAddress} onChange={handleChange} className="w-full p-2 border rounded-md"/></div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                                <button type="button" onClick={handleCancel} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

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
            {mockWholesaleOrders.length === 0 ? (
                <p>You have not placed any orders yet.</p>
            ) : (
                mockWholesaleOrders.map(order => (
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
                                {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                            </button>
                        </div>
                        {expandedOrder === order.id && (
                             <div className="mt-4 border-t pt-4">
                                <h3 className="text-lg font-semibold mb-4 text-brand-dark">Order Items</h3>
                                <div className="space-y-3 mb-6">
                                    {order.order_items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-2 rounded-md">
                                            <img src={item.products?.image_url} alt={item.products?.name} className="w-14 h-14 object-cover rounded"/>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{item.products?.name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                                            </div>
                                            <p className="font-semibold text-right">₦{(item.quantity * item.unit_price).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <OrderTrackingTimeline history={order.order_status_history} />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}

export default WholesaleDashboard;