import React, { useState, useMemo, useEffect } from 'react';
import { Order, Profile, OrderStatus, PaymentStatus, Payment, DeliveryAddress, CustomerDetails, PaymentMethod, Product } from '../types';
import { EyeIcon, XIcon, SearchIcon, ShoppingCartIcon, TrashIcon, ClipboardCheckIcon, CloudUploadIcon } from './Icons';
import { mockOrders } from '../data/orders';
import { productsData } from '../data/products';

// --- MOCK DATA ---
const mockLogisticsStaff: (Profile & { email: string })[] = [
    { id: '00000000-0000-0000-0000-000000000002', email: 'logistics@kingzy.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
    { id: 'logistics-2-uuid', email: 'delivery.expert@example.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
];
// ----------------
const initialNewOrderState = { email: '', fullName: '', phone: '', street: '', city: '', state: '' };

interface AdminOrderManagementProps { profile: Profile; }

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ profile }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
    const [showArchived, setShowArchived] = useState(false);
    const [selectedLogistics, setSelectedLogistics] = useState<Record<number, string>>({});
    const [activeSubTab, setActiveSubTab] = useState<'active' | 'rejected'>('active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [popUrl, setPopUrl] = useState<string | null>(null);
    
    // Create Order Modal State
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [newOrderForm, setNewOrderForm] = useState(initialNewOrderState);
    const [newOrderItems, setNewOrderItems] = useState<{ product: Product, quantity: number }[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState<PaymentMethod>('bank_transfer');

    // Admin POP Upload State
    const [isUploadingPop, setIsUploadingPop] = useState(false);
    const [popFile, setPopFile] = useState<File | null>(null);

    // Filters
    const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });

    useEffect(() => {
        // Centralized logic to load and sync all orders from localStorage
        const loadAndSyncOrders = () => {
            const storedOrdersRaw = localStorage.getItem('kingzy_all_orders');
            let ordersSource: Order[] = [];
            if (storedOrdersRaw) {
                ordersSource = JSON.parse(storedOrdersRaw);
            } else {
                // Seed localStorage if it's empty
                ordersSource = mockOrders as Order[];
                localStorage.setItem('kingzy_all_orders', JSON.stringify(ordersSource));
            }
            setOrders(ordersSource);
        };

        loadAndSyncOrders();
        // Listen for any changes to the central order list (e.g., a new order placed in CartPage)
        window.addEventListener('storage', loadAndSyncOrders);
        return () => window.removeEventListener('storage', loadAndSyncOrders);
    }, []);
    
     // Simulate online payment webhook
    useEffect(() => {
        const timer = setTimeout(() => {
            let changed = false;
            const updatedOrders = orders.map(o => {
                const payment = o.payments?.[0];
                if (payment?.payment_method === 'online' && payment?.payment_status === 'pending') {
                    changed = true;
                    return {
                        ...o,
                        status: 'PAYMENT_CONFIRMED' as OrderStatus,
                        payments: [{ ...payment, payment_status: 'paid' as PaymentStatus }]
                    };
                }
                return o;
            });
            if (changed) {
                localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
                window.dispatchEvent(new Event('storage'));
                console.log('[SIMULATION] Webhook received for online payment. Status updated to PAID.');
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [orders]);


    useEffect(() => {
        if (selectedOrder) {
            const payment = selectedOrder.payments?.[0];
            if (payment?.payment_status === 'awaiting_confirmation') {
                const url = localStorage.getItem(`proof_for_${selectedOrder.id}`);
                setPopUrl(url);
            } else {
                setPopUrl(null);
            }
        }
    }, [selectedOrder]);

    const filteredOrders = useMemo(() => {
        let source: Order[];
        if (showArchived) {
            source = archivedOrders;
        } else if (activeSubTab === 'rejected') {
            source = orders.filter(o => o.status === 'LOGISTICS_REJECTED');
        } else {
            // "All Orders" now shows everything that isn't archived or rejected.
            source = orders.filter(o => o.status !== 'LOGISTICS_REJECTED');
        }

        return source.filter(o => {
            const matchesSearch = filters.search === '' || o.id.toString().includes(filters.search) || o.customer_details.email.toLowerCase().includes(filters.search.toLowerCase());
            const orderDate = new Date(o.created_at);
            const matchesStart = !filters.startDate || orderDate >= new Date(filters.startDate);
            const matchesEnd = !filters.endDate || orderDate <= new Date(filters.endDate + 'T23:59:59');
            return matchesSearch && matchesStart && matchesEnd;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [orders, archivedOrders, activeSubTab, filters, showArchived]);

    const rejectedCount = useMemo(() => orders.filter(o => o.status === 'LOGISTICS_REJECTED').length, [orders]);

    const handleConfirmPayment = (orderId: number) => {
        const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
                const existingPayment = o.payments?.[0] as Partial<Payment> | undefined;
                const newPayment: Payment = {
                    id: existingPayment?.id ?? Date.now(), order_id: o.id,
                    payment_method: existingPayment?.payment_method ?? 'bank_transfer',
                    amount: existingPayment?.amount ?? o.total_price,
                    created_at: existingPayment?.created_at ?? new Date().toISOString(),
                    ...existingPayment, payment_status: 'paid' as PaymentStatus,
                };
                return { ...o, status: 'PAYMENT_CONFIRMED' as OrderStatus, payments: [newPayment] };
            }
            return o;
        });
        
        localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event('storage'));

        setSelectedOrder(null);
        alert(`Payment confirmed for Order #${orderId}. It is now ready for assignment.`);
    };

    const handleMarkAsPaid = (orderId: number) => {
        if (confirm("Protocol: This action will bypass the POP upload and directly mark the order as paid. This is for simulating a confirmed online payment. Proceed?")) {
            const updatedOrders = orders.map(o => {
                if (o.id === orderId) {
                    const existingPayment = o.payments?.[0] as Partial<Payment> | undefined;
                    return { 
                        ...o, 
                        status: 'PAYMENT_CONFIRMED' as OrderStatus, 
                        payments: [{ 
                            ...existingPayment,
                            id: existingPayment?.id ?? Date.now(),
                            order_id: o.id,
                            payment_method: 'online', // Set method to online
                            payment_status: 'paid' as PaymentStatus,
                            amount: existingPayment?.amount ?? o.total_price,
                            created_at: existingPayment?.created_at ?? new Date().toISOString()
                        }] 
                    };
                }
                return o;
            });

            localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
            window.dispatchEvent(new Event('storage'));

            setSelectedOrder(null);
            alert(`System Override: Order #${orderId} manually confirmed as paid.`);
        }
    };
    
    const handleAssignOrder = (orderId: number) => {
        const staffId = selectedLogistics[orderId];
        if (!staffId) return alert("Validation Error: Terminal assignment requires personnel selection.");

        const staffMember = mockLogisticsStaff.find(s => s.id === staffId);
        if (!staffMember) return alert("Error: Selected logistics staff not found.");
        
        const updatedOrders = orders.map(o => 
            o.id === orderId 
            ? { ...o, status: 'ASSIGNED_TO_LOGISTICS', logistics_assignments: [{ id: Date.now(), assigned_at: new Date().toISOString(), profiles: { id: staffId, email: staffMember.email } }] }
            : o
        );
        localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event('storage'));
        
        alert("Consignment dispatched to logistics hub. Order remains in pipeline view.");
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrderItems.length === 0) {
            alert("Please add at least one item to the order.");
            return;
        }

        const mockOrderId = Date.now();
        const total = newOrderItems.reduce((acc, item) => acc + (item.product.prices.retail * item.quantity), 0);

        const newOrder: Order = {
            id: mockOrderId,
            user_id: `on-behalf-${Date.now()}`,
            created_at: new Date().toISOString(),
            status: 'ORDER_RECEIVED',
            total_price: total,
            discount_applied: 0,
            placed_on_behalf_by: profile.email,
            delivery_address: { fullName: newOrderForm.fullName, phone: newOrderForm.phone, street: newOrderForm.street, city: newOrderForm.city, state: newOrderForm.state, zip: '' },
            customer_details: { email: newOrderForm.email, userId: `on-behalf-${Date.now()}` },
            order_items: newOrderItems.map((item, index) => ({
                id: Date.now() + index, order_id: mockOrderId, product_id: item.product.id, quantity: item.quantity, unit_price: item.product.prices.retail,
                products: { name: item.product.name, dosage: item.product.dosage, image_url: item.product.image_url, stock_quantity: item.product.stock_quantity }
            })) as any,
            payments: [{ id: mockOrderId, order_id: mockOrderId, payment_method: newOrderPaymentMethod, payment_status: newOrderPaymentMethod === 'bank_transfer' ? 'awaiting_confirmation' : 'pending', amount: total, created_at: new Date().toISOString() }] as any,
            order_status_history: [{ id: 1, status: 'ORDER_RECEIVED', updated_at: new Date().toISOString(), updated_by: profile.email || 'admin' }] as any
        };

        const currentOrders = JSON.parse(localStorage.getItem('kingzy_all_orders') || '[]');
        localStorage.setItem('kingzy_all_orders', JSON.stringify([newOrder, ...currentOrders]));
        window.dispatchEvent(new Event('storage'));
        
        alert(`Order #${mockOrderId} created for ${newOrderForm.email} and added to the pipeline.`);
        setIsCreatingOrder(false);
        setNewOrderForm(initialNewOrderState);
        setNewOrderItems([]);
        setProductSearch('');
        setNewOrderPaymentMethod('bank_transfer');
    };
    
     const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const handleBatchArchive = () => {
        if (selectedOrderIds.size === 0) return;
        if (confirm(`Operational Protocol: Commit ${selectedOrderIds.size} records to the Permanent Archive?`)) {
            const toArchive = orders.filter(o => selectedOrderIds.has(o.id));
            setArchivedOrders(prev => [...prev, ...toArchive]);
            
            const remainingOrders = orders.filter(o => !selectedOrderIds.has(o.id));
            localStorage.setItem('kingzy_all_orders', JSON.stringify(remainingOrders));
            window.dispatchEvent(new Event('storage'));

            setSelectedOrderIds(new Set());
            alert("Records moved to archival storage.");
        }
    };

    const getStatusBadge = (order: Order) => {
        const payment = order.payments?.[0];
        let statusText: string = order.status.replace(/_/g, ' ');
        let bgColor = 'bg-gray-100'; let textColor = 'text-gray-800';

        switch (order.status) {
            case 'ORDER_RECEIVED':
                statusText = payment?.payment_status === 'awaiting_confirmation' ? 'AWAITING PAYMENT' : 'NEW ORDER';
                bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; break;
            case 'PAYMENT_CONFIRMED':
            case 'PROCESSING':
            case 'ASSIGNED_TO_LOGISTICS':
            case 'DISPATCHED':
            case 'IN_TRANSIT':
                statusText = 'PROCESSING'; bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break;
            case 'DELIVERED': statusText = 'DELIVERED'; bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
            case 'DELIVERY_CONFIRMED': statusText = 'COMPLETED'; bgColor = 'bg-green-200'; textColor = 'text-green-900'; break;
            case 'CANCELLED': statusText = 'CANCELLED'; bgColor = 'bg-red-100'; textColor = 'text-red-700'; break;
            case 'LOGISTICS_REJECTED': statusText = 'REJECTED'; bgColor = 'bg-red-100'; textColor = 'text-red-700'; break;
        }
        return <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${bgColor} ${textColor}`}>{statusText}</span>
    };

    const getFulfillmentStatus = (order: Order) => {
        const baseClasses = "text-xs font-bold uppercase px-3 py-1.5 rounded-full";
        switch (order.status) {
            case 'ASSIGNED_TO_LOGISTICS': return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Assigned</span>;
            case 'DISPATCHED': return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Dispatched</span>;
            case 'IN_TRANSIT': return <span className={`${baseClasses} bg-purple-200 text-purple-900`}>In-Transit</span>;
            case 'DELIVERED': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Delivered</span>;
            case 'DELIVERY_CONFIRMED': return <span className={`${baseClasses} bg-green-200 text-green-900`}>Completed</span>;
            case 'PAYMENT_CONFIRMED':
            case 'PROCESSING':
            case 'LOGISTICS_REJECTED':
                return (
                    <div className="flex gap-2 items-center">
                        <select value={selectedLogistics[order.id] || ''} onChange={e => setSelectedLogistics({...selectedLogistics, [order.id]: e.target.value})} className="text-xs font-semibold p-2 border rounded-lg bg-white shadow-sm outline-none focus:border-brand-primary">
                            <option value="">Assign to...</option>
                            {mockLogisticsStaff.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}
                        </select>
                        <button onClick={() => handleAssignOrder(order.id)} className="bg-brand-primary text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-brand-secondary shadow transition-all">Assign</button>
                    </div>
                );
            case 'ORDER_RECEIVED':
            default:
                return <span className="font-semibold text-xs text-gray-400 italic">Awaiting Payment</span>;
        }
    };
    
    // Create Order Modal Functions
    const searchedProducts = useMemo(() => {
        if (!productSearch) return [];
        return productsData.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
    }, [productSearch]);
    
    const handleAddItem = (product: Product) => { setNewOrderItems(prev => { const existing = prev.find(item => item.product.id === product.id); if (existing) { return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item); } return [...prev, { product, quantity: 1 }]; }); };
    const handleRemoveItem = (productId: number) => { setNewOrderItems(prev => prev.filter(item => item.product.id !== productId)); };
    const handleQuantityChange = (productId: number, quantity: number) => { if (quantity < 1) return handleRemoveItem(productId); setNewOrderItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item)); };
    const newOrderTotal = useMemo(() => { return newOrderItems.reduce((acc, item) => acc + (item.product.prices.retail * item.quantity), 0); }, [newOrderItems]);
    const handleUploadPop = (orderId: number) => { if (!popFile) return; alert('Admin Action: Proof of payment uploaded. You may now confirm the payment.'); localStorage.setItem(`proof_for_${orderId}`, 'https://res.cloudinary.com/dzbibbld6/image/upload/v1770119864/sample-receipt_h4q0b3.jpg'); const url = localStorage.getItem(`proof_for_${orderId}`); setPopUrl(url); setIsUploadingPop(false); setPopFile(null); };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header and Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-full border shadow-sm">
                    <button onClick={() => {setActiveSubTab('active'); setShowArchived(false);}} className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${activeSubTab === 'active' && !showArchived ? 'bg-white shadow text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>All Orders</button>
                    <button onClick={() => {setActiveSubTab('rejected'); setShowArchived(false);}} className={`px-6 py-2 rounded-full font-bold text-xs uppercase flex gap-2 items-center transition-all ${activeSubTab === 'rejected' && !showArchived ? 'bg-red-600 shadow text-white' : 'text-red-500 hover:bg-red-50'}`}>Rejections {rejectedCount > 0 && <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px]">{rejectedCount}</span>}</button>
                    <button onClick={() => setShowArchived(true)} className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${showArchived ? 'bg-brand-dark shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}>Archives ({archivedOrders.length})</button>
                </div>
                 <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full border shadow-sm">
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-500 pl-2">From</span><input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="text-xs font-semibold outline-none bg-gray-100 px-2 py-1 rounded-lg border focus:border-brand-primary" /></div>
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-500">Until</span><input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="text-xs font-semibold outline-none bg-gray-100 px-2 py-1 rounded-lg border focus:border-brand-primary" /></div>
                    </div>
                    <div className="relative flex-grow min-w-[280px]">
                        <input type="text" placeholder="Filter by ID, Email..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-white border rounded-full text-sm font-medium outline-none focus:border-brand-primary shadow-sm" />
                        <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button onClick={() => setIsCreatingOrder(true)} className="bg-brand-primary text-white p-3 rounded-full shadow-lg hover:bg-brand-secondary transition-all" title="Manual Intake Protocol"><ShoppingCartIcon className="w-6 h-6" /></button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <input type="checkbox" onChange={toggleSelectAll} checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                        <button onClick={toggleSelectAll} className="text-xs font-bold text-brand-primary uppercase tracking-wider">Select/Deselect All Visible</button>
                        {selectedOrderIds.size > 0 && <span className="bg-brand-light text-brand-primary px-3 py-1 rounded-full text-xs font-bold">{selectedOrderIds.size} selected</span>}
                    </div>
                    {selectedOrderIds.size > 0 && !showArchived && (<button onClick={handleBatchArchive} className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-md"><ClipboardCheckIcon className="w-5 h-5" /> Commit to Archive</button>)}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/30 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center"></th><th className="px-6 py-4">Order Details</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Fulfillment</th><th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className={`${selectedOrderIds.has(order.id) ? 'bg-brand-light/30' : ''} hover:bg-gray-50 transition-colors`}>
                                    <td className="px-6 py-4 text-center"><input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => {const newSet = new Set(selectedOrderIds); newSet.has(order.id) ? newSet.delete(order.id) : newSet.add(order.id); setSelectedOrderIds(newSet);}} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /></td>
                                    <td className="px-6 py-4"><p className="font-bold text-brand-dark">#{order.id}</p><p className="text-xs text-gray-500 font-medium truncate max-w-xs">{order.customer_details.email}</p></td>
                                    <td className="px-6 py-4">{getStatusBadge(order)}</td>
                                    <td className="px-6 py-4">{!showArchived ? getFulfillmentStatus(order) : <span className="text-xs font-bold text-gray-400 italic">ARCHIVED</span>}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-100 text-gray-600 hover:bg-brand-primary hover:text-white rounded-lg transition-all shadow-sm"><EyeIcon className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (<tr><td colSpan={5} className="py-24 text-center text-gray-400 italic">No orders match the current filters.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAIL MODAL */}
            {selectedOrder && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-scaleIn">
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-brand-dark">Order Details: #{selectedOrder.id}</h3><button onClick={() => setSelectedOrder(null)}><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-700"/></button></div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Details</h4><p><strong>Name:</strong> {selectedOrder.delivery_address.fullName}</p><p><strong>Email:</strong> {selectedOrder.customer_details.email}</p><p><strong>Phone:</strong> {selectedOrder.delivery_address.phone}</p></div><div><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Delivery Address</h4><p>{selectedOrder.delivery_address.street}</p><p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p></div></div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Order Items</h4>
                            <div className="space-y-3 mb-6">{selectedOrder.order_items?.map(item => (<div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"><img src={item.products?.image_url} alt={item.products?.name} className="w-16 h-16 object-contain rounded bg-white p-1"/><div className="flex-grow"><p className="font-semibold">{item.products?.name}</p><p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p></div><p className="font-bold text-right">₦{(item.quantity * item.unit_price).toLocaleString()}</p></div>))}</div>
                            
                            {selectedOrder.placed_on_behalf_by && selectedOrder.payments?.[0]?.payment_status === 'awaiting_confirmation' && !popUrl && (
                                <div className="border-t pt-4 mt-4"><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Admin Payment Actions</h4><div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 flex flex-col sm:flex-row gap-4"><button onClick={() => setIsUploadingPop(true)} className="flex-1 font-bold py-2 px-4 rounded-md bg-yellow-400 text-black hover:bg-yellow-500 transition-colors">Upload Bank Transfer POP</button><button onClick={() => handleMarkAsPaid(selectedOrder.id)} className="flex-1 font-bold py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">Mark as Paid (Sim. Online)</button></div></div>
                            )}

                            {selectedOrder.payments?.[0]?.payment_status === 'awaiting_confirmation' && (
                                <div className="border-t pt-4 mt-4"><h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Proof of Payment</h4>{popUrl ? <img src={popUrl} alt="Proof of payment" className="max-h-80 w-auto rounded-md border shadow-sm"/> : <p className="text-gray-500 italic">Customer has not uploaded proof of payment yet.</p>}</div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-xl"><button onClick={() => setSelectedOrder(null)} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Close</button>{selectedOrder.payments?.[0]?.payment_status === 'awaiting_confirmation' && popUrl && (<button onClick={() => handleConfirmPayment(selectedOrder.id)} className="py-2 px-6 bg-accent-green text-white font-bold rounded-lg hover:bg-green-600 shadow-md">Confirm Payment</button>)}</div>
                    </div>
                </div>
            )}

            {/* CREATE ORDER MODAL */}
            {isCreatingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl animate-scaleIn"><form onSubmit={handleCreateOrder}><div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-brand-dark">Manual Order Intake Protocol</h3><button type="button" onClick={() => setIsCreatingOrder(false)}><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-700"/></button></div><div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="space-y-4"><fieldset className="space-y-3"><legend className="font-semibold text-lg mb-2">1. Customer Details</legend><input required value={newOrderForm.email} onChange={e => setNewOrderForm({...newOrderForm, email: e.target.value})} placeholder="Customer Email" className="w-full p-2 border rounded-md" /><div className="grid grid-cols-2 gap-4"><input required value={newOrderForm.fullName} onChange={e => setNewOrderForm({...newOrderForm, fullName: e.target.value})} placeholder="Full Name" className="w-full p-2 border rounded-md" /><input required value={newOrderForm.phone} onChange={e => setNewOrderForm({...newOrderForm, phone: e.target.value})} placeholder="Phone Number" className="w-full p-2 border rounded-md" /></div></fieldset><fieldset className="space-y-3"><legend className="font-semibold text-lg mb-2">2. Delivery Address</legend><input required value={newOrderForm.street} onChange={e => setNewOrderForm({...newOrderForm, street: e.target.value})} placeholder="Street Address" className="w-full p-2 border rounded-md" /><div className="grid grid-cols-2 gap-4"><input required value={newOrderForm.city} onChange={e => setNewOrderForm({...newOrderForm, city: e.target.value})} placeholder="City" className="w-full p-2 border rounded-md" /><input required value={newOrderForm.state} onChange={e => setNewOrderForm({...newOrderForm, state: e.target.value})} placeholder="State" className="w-full p-2 border rounded-md" /></div></fieldset><fieldset className="space-y-3"><legend className="font-semibold text-lg mb-2">4. Payment Method</legend><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="payment" value="bank_transfer" checked={newOrderPaymentMethod === 'bank_transfer'} onChange={() => setNewOrderPaymentMethod('bank_transfer')} /> Bank Transfer</label><label className="flex items-center gap-2"><input type="radio" name="payment" value="online" checked={newOrderPaymentMethod === 'online'} onChange={() => setNewOrderPaymentMethod('online')} /> Online (Card)</label></div></fieldset></div><div className="space-y-4"><fieldset><legend className="font-semibold text-lg mb-2">3. Order Items</legend><div className="relative mb-2"><input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search for products to add..." className="w-full p-2 border rounded-md" />{searchedProducts.length > 0 && <div className="absolute w-full bg-white border rounded-md shadow-lg mt-1 z-10">{searchedProducts.map(p => (<button type="button" key={p.id} onClick={() => handleAddItem(p)} className="w-full text-left p-2 hover:bg-gray-100">{p.name}</button>))}</div>}</div><div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md bg-gray-50">{newOrderItems.length === 0 ? <p className="text-center text-gray-400 p-4">No items added.</p> : newOrderItems.map(item => ( <div key={item.product.id} className="flex items-center gap-2 bg-white p-1 rounded"><p className="flex-grow text-sm">{item.product.name}</p><input type="number" value={item.quantity} onChange={e => handleQuantityChange(item.product.id, parseInt(e.target.value))} className="w-16 p-1 border rounded" /><button type="button" onClick={() => handleRemoveItem(item.product.id)} className="text-red-500 p-1"><TrashIcon className="w-4 h-4" /></button></div> ))}</div><div className="text-right font-bold text-xl mt-4">Total: ₦{newOrderTotal.toLocaleString()}</div></fieldset></div></div><div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-xl"><button type="button" onClick={() => setIsCreatingOrder(false)} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button><button type="submit" className="py-2 px-6 bg-accent-green text-white font-bold rounded-lg hover:bg-green-600 shadow-md">Create Order</button></div></form></div></div>
            )}
            
            {/* POP UPLOAD MODAL (ADMIN) */}
            {isUploadingPop && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-lg"><div className="flex justify-between items-center p-4 border-b"><h3 className="text-xl font-semibold">Upload Proof of Payment for Order #{selectedOrder.id}</h3><button type="button" onClick={() => { setIsUploadingPop(false); setPopFile(null); }}><XIcon className="w-6 h-6"/></button></div><div className="p-6"><p className="text-sm text-gray-600 mb-4">Upload the customer's bank transfer receipt. This will allow you to confirm the payment.</p><label htmlFor="admin-pop-upload" className="relative cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center block hover:border-brand-primary"><CloudUploadIcon className="w-12 h-12 mx-auto text-gray-400" /><span className="mt-2 block text-sm font-semibold text-gray-600">{popFile ? popFile.name : 'Click to browse or drag & drop'}</span><input id="admin-pop-upload" type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setPopFile(e.target.files ? e.target.files[0] : null)} /></label></div><div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg"><button type="button" onClick={() => { setIsUploadingPop(false); setPopFile(null); }} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button><button onClick={() => handleUploadPop(selectedOrder.id)} disabled={!popFile} className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">Submit for Verification</button></div></div></div>
            )}
        </div>
    );
};

export default AdminOrderManagement;