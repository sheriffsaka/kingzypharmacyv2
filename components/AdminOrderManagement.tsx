import React, { useState, useMemo, useEffect } from 'react';
import { Order, Profile, OrderItem, Product, OrderStatus } from '../types';
import { EyeIcon, XIcon, SearchIcon, ShoppingCartIcon, TrashIcon, ClipboardCheckIcon } from './Icons';
import { productsData } from '../data/products';

// --- MOCK DATA ---
const mockUsers: (Partial<Profile> & { email: string; name: string })[] = [
    { id: 'u1', email: 'wholesale@kingzy.com', name: 'GoodHealth Pharmacy', role: 'wholesale_buyer' },
    { id: 'u2', email: 'buyer@kingzy.com', name: 'Bolanle Adeoye', role: 'general_public' },
    { id: 'u3', email: 'clinic.central@test.com', name: 'Central Clinic', role: 'wholesale_buyer' },
    { id: 'u4', email: 'express.meds@pharma.ng', name: 'Express Meds', role: 'wholesale_buyer' },
];

const mockLogisticsStaff: (Profile & { email: string })[] = [
    { id: '00000000-0000-0000-0000-000000000002', email: 'logistics@kingzy.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
    { id: 'logistics-2-uuid', email: 'delivery.expert@example.com', role: 'logistics', approval_status: 'approved', created_at: new Date().toISOString(), loyalty_discount_percentage: 0 },
];

const initialMockOrders: Order[] = [
    { 
      id: 105, user_id: 'u1', created_at: new Date(Date.now() - 3600000).toISOString(), 
      status: 'ORDER_RECEIVED', total_price: 247500, discount_applied: 27500, 
      delivery_address: { fullName: 'GoodHealth Pharmacy', phone: '08012345678', street: '123 Commerce Ave', city: 'Lagos', state: 'Lagos', zip: '100001' }, 
      customer_details: { email: 'wholesale@kingzy.com', userId: 'u1' }, 
      order_items: [{ id: 4, order_id: 105, product_id: 1, quantity: 20, unit_price: 8000, products: { name: 'Paracetamol (Bulk)', dosage: 'Jar of 1000', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png' } }] as any,
    },
    { 
      id: 101, user_id: 'u2', created_at: new Date(Date.now() - 172800000).toISOString(), 
      status: 'ORDER_ACKNOWLEDGED', total_price: 15000, discount_applied: 0, 
      delivery_address: { fullName: 'Bolanle Adeoye', phone: '08012345678', street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001' }, 
      customer_details: { email: 'buyer@kingzy.com', userId: 'u2' }, 
      order_items: [{ id: 1, order_id: 101, product_id: 1, quantity: 5, unit_price: 1500, products: { name: 'Paracetamol', dosage: '500mg, 20 tabs', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819816/pr9_ouhvx0.png' } }] as any,
    },
];

interface AdminOrderManagementProps { profile: Profile; }

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ profile }) => {
    const [orders, setOrders] = useState<Order[]>(initialMockOrders);
    const [rejectedOrders, setRejectedOrders] = useState<Order[]>([]);
    const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
    const [showArchived, setShowArchived] = useState(false);
    const [processedEventIds, setProcessedEventIds] = useState<Set<number>>(new Set());
    const [selectedLogistics, setSelectedLogistics] = useState<Record<number, string>>({});
    const [activeSubTab, setActiveSubTab] = useState<'active' | 'rejected'>('active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });

    // Manual Order Intake State
    const [orderStep, setOrderStep] = useState(1);
    const [targetUser, setTargetUser] = useState<typeof mockUsers[0] | null>(null);
    const [draftItems, setDraftItems] = useState<{product: any, qty: number}[]>([]);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        const syncEvents = () => {
            const rawEvents = localStorage.getItem('order_events_sync');
            if (!rawEvents) return;
            const events = JSON.parse(rawEvents);
            events.forEach((ev: any) => {
                if (processedEventIds.has(ev.id)) return;
                if (ev.type === 'REJECTED_DISPATCH') {
                    // This finds the order from ANY list (live, archived etc.) and moves it to rejected.
                    const allOrders = [...orders, ...archivedOrders];
                    const orderToMove = allOrders.find(o => o.id === ev.orderId);
                    
                    if (orderToMove) {
                        setRejectedOrders(rej => {
                            if (rej.find(r => r.id === ev.orderId)) return rej; // Already in rejected list
                            return [...rej, { ...orderToMove, status: 'ORDER_RECEIVED' }]; // Reset status
                        });
                        // Remove from other lists
                        setOrders(prev => prev.filter(o => o.id !== ev.orderId));
                        setArchivedOrders(prev => prev.filter(o => o.id !== ev.orderId));
                    }
                }
                setProcessedEventIds(prev => new Set(prev).add(ev.id));
            });
        };
        const interval = setInterval(syncEvents, 1000);
        window.addEventListener('storage', syncEvents);
        return () => { clearInterval(interval); window.removeEventListener('storage', syncEvents); }
    }, [processedEventIds, orders, archivedOrders]);

    const filteredOrders = useMemo(() => {
        const source = showArchived ? archivedOrders : (activeSubTab === 'rejected' ? rejectedOrders : orders);
        return source.filter(o => {
            const matchesSearch = o.id.toString().includes(filters.search) || o.customer_details.email.toLowerCase().includes(filters.search.toLowerCase());
            const orderDate = new Date(o.created_at);
            const matchesStart = !filters.startDate || orderDate >= new Date(filters.startDate);
            const matchesEnd = !filters.endDate || orderDate <= new Date(filters.endDate + 'T23:59:59');
            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [orders, rejectedOrders, archivedOrders, activeSubTab, filters, showArchived]);

    const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const handleBatchArchive = () => {
        if (selectedOrderIds.size === 0) return;
        const dateDesc = filters.startDate && filters.endDate ? ` between ${filters.startDate} and ${filters.endDate}` : '';
        if (confirm(`Operational Protocol: Commit ${selectedOrderIds.size} records${dateDesc} to the Permanent Archive?`)) {
            const toArchive = [...orders, ...rejectedOrders].filter(o => selectedOrderIds.has(o.id));
            setArchivedOrders(prev => [...prev, ...toArchive]);
            setOrders(prev => prev.filter(o => !selectedOrderIds.has(o.id)));
            setRejectedOrders(prev => prev.filter(o => !selectedOrderIds.has(o.id)));
            setSelectedOrderIds(new Set());
            alert("Database Synced: Filtered visual records moved to archival storage.");
        }
    };

    const handleAssignOrder = (orderId: number) => {
        const staffId = selectedLogistics[orderId];
        if (!staffId) return alert("Validation Error: Terminal assignment requires personnel selection.");
        
        let orderToAssign: Order | undefined;
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                orderToAssign = { ...o, status: 'ORDER_ACKNOWLEDGED' };
                return orderToAssign;
            }
            return o;
        }));
        setRejectedOrders(prev => prev.filter(o => o.id !== orderId));

        if (orderToAssign) {
            const assignments = JSON.parse(localStorage.getItem('logistics_assignments') || '[]');
            const updatedAssignments = [ ...assignments.filter((a: Order) => a.id !== orderId), orderToAssign ];
            localStorage.setItem('logistics_assignments', JSON.stringify(updatedAssignments));
            window.dispatchEvent(new Event('storage'));
        }
        
        alert("Consignment dispatched to logistics hub.");
    };

    const handlePlaceManualOrder = () => {
        if (!targetUser || draftItems.length === 0) return;
        const newOrderId = Math.floor(Math.random() * 90000) + 10000;
        const total = draftItems.reduce((acc, i) => acc + (i.product.prices.retail * i.qty), 0);
        const newOrder: Order = {
            id: newOrderId, user_id: targetUser.id!, created_at: new Date().toISOString(),
            status: 'ORDER_RECEIVED', total_price: total, discount_applied: 0,
            delivery_address: { fullName: targetUser.name, street: 'System Manual Override', city: 'Administrative Hub', state: 'Lagos', zip: '0000', phone: '000' },
            customer_details: { email: targetUser.email, userId: targetUser.id! },
            placed_on_behalf_by: profile.email,
            order_items: draftItems.map((di, idx) => ({
                id: idx, order_id: newOrderId, product_id: di.product.id, quantity: di.qty, unit_price: di.product.prices.retail,
                products: { name: di.product.name, dosage: di.product.dosage, image_url: di.product.image_url }
            })) as any
        };
        setOrders(prev => [newOrder, ...prev]);
        resetManualOrder();
        alert(`Order Entry #${newOrderId} for ${targetUser.name} successfully injected into pipeline.`);
    };

    const resetManualOrder = () => {
        setIsCreatingOrder(false);
        setOrderStep(1);
        setTargetUser(null);
        setDraftItems([]);
        setUserSearch('');
    };

    const addToDraft = (p: any) => {
        setDraftItems(prev => {
            const existing = prev.find(i => i.product.id === p.id);
            if (existing) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product: p, qty: 1 }];
        });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-full border shadow-sm">
                    <button onClick={() => {setActiveSubTab('active'); setShowArchived(false);}} className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${activeSubTab === 'active' && !showArchived ? 'bg-white shadow text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Live Pipeline</button>
                    <button onClick={() => {setActiveSubTab('rejected'); setShowArchived(false);}} className={`px-6 py-2 rounded-full font-bold text-xs uppercase flex gap-2 items-center transition-all ${activeSubTab === 'rejected' && !showArchived ? 'bg-red-600 shadow text-white' : 'text-red-500 hover:bg-red-50'}`}>Rejections {rejectedOrders.length > 0 && <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px]">{rejectedOrders.length}</span>}</button>
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
                                <th className="px-6 py-4 w-12 text-center"></th>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Logistics Assignment</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className={`${selectedOrderIds.has(order.id) ? 'bg-brand-light/30' : ''} hover:bg-gray-50 transition-colors`}>
                                    <td className="px-6 py-4 text-center"><input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => {const newSet = new Set(selectedOrderIds); newSet.has(order.id) ? newSet.delete(order.id) : newSet.add(order.id); setSelectedOrderIds(newSet);}} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" /></td>
                                    <td className="px-6 py-4"><p className="font-bold text-brand-dark">#{order.id}</p><p className="text-xs text-gray-500 font-medium truncate max-w-xs">{order.customer_details.email}</p></td>
                                    <td className="px-6 py-4"><span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.status.replace(/_/g, ' ')}</span></td>
                                    <td className="px-6 py-4">
                                        {!showArchived ? (<div className="flex gap-2 items-center"><select value={selectedLogistics[order.id] || ''} onChange={e => setSelectedLogistics({...selectedLogistics, [order.id]: e.target.value})} className="text-xs font-semibold p-2 border rounded-lg bg-white shadow-sm outline-none focus:border-brand-primary"><option value="">Assign to...</option>{mockLogisticsStaff.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}</select><button onClick={() => handleAssignOrder(order.id)} className="bg-brand-primary text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-brand-secondary shadow transition-all">Assign</button></div>) : <span className="text-xs font-bold text-gray-400 italic">ARCHIVED</span>}
                                    </td>
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
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-brand-dark">Order Details: #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-700"/></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Details</h4>
                                    <p><strong>Name:</strong> {selectedOrder.delivery_address.fullName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer_details.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.delivery_address.phone}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Delivery Address</h4>
                                    <p>{selectedOrder.delivery_address.street}</p>
                                    <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
                                </div>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Order Items</h4>
                            <div className="space-y-3">
                                {selectedOrder.order_items?.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                        <img src={item.products?.image_url} alt={item.products?.name} className="w-16 h-16 object-contain rounded bg-white p-1"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.products?.name}</p>
                                            <p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                                        </div>
                                        <p className="font-bold text-right">₦{(item.quantity * item.unit_price).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                            <button onClick={() => setSelectedOrder(null)} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {isCreatingOrder && (
                <div className="fixed inset-0 bg-brand-dark/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn border-4 border-white/10">
                        <div className="p-8 border-b bg-gray-50 flex justify-between items-center"><h3 className="text-2xl font-bold text-brand-dark uppercase tracking-wider">Manual Order Intake</h3><button onClick={resetManualOrder} className="p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-all"><XIcon className="w-6 h-6"/></button></div>
                        <div className="flex-grow overflow-y-auto p-8">
                            {orderStep === 1 ? (
                                <div className="space-y-8 max-w-2xl mx-auto py-5"><div className="text-center"><h4 className="text-2xl font-bold text-brand-dark">Step 1: Identify Target User</h4><p className="text-gray-500 mt-1">Search for a verified Pharmacist or Retail Buyer.</p></div><div className="relative"><input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full p-4 bg-gray-100 border-2 rounded-xl outline-none focus:border-brand-primary font-semibold text-lg" /><SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" /></div><div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto pr-2">{mockUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).map(u => (<button key={u.id} onClick={() => setTargetUser(u)} className={`w-full p-4 flex items-center justify-between transition-all rounded-lg border-2 ${targetUser?.id === u.id ? 'bg-brand-primary text-white border-brand-primary shadow-lg' : 'bg-white hover:bg-gray-50 border-gray-200'}`}><div className="text-left"><p className="font-bold text-lg">{u.name}</p><p className={`text-sm ${targetUser?.id === u.id ? 'opacity-80' : 'text-gray-500'}`}>{u.email}</p></div><span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${targetUser?.id === u.id ? 'bg-white/20 border-white/30' : 'bg-brand-light text-brand-primary border-brand-primary/20'}`}>{u.role?.replace(/_/g, ' ')}</span></button>))}</div><div className="pt-4"><button onClick={() => setOrderStep(2)} disabled={!targetUser} className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-brand-secondary transition-all shadow-lg disabled:bg-gray-300 disabled:shadow-none">Proceed to Item Selection &rarr;</button></div></div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8 space-y-6"><h4 className="text-xl font-bold text-brand-dark">Step 2: Build Consignment</h4><div className="grid grid-cols-2 xl:grid-cols-3 gap-4">{productsData.map(p => (<button key={p.id} onClick={() => addToDraft(p)} className="p-4 bg-white border rounded-xl hover:border-brand-primary transition-all text-left group shadow-sm hover:shadow-lg relative flex flex-col h-full"><div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center p-2"><img src={p.image_url} className="w-full h-full object-contain group-hover:scale-105 transition-transform" /></div><p className="font-semibold text-sm text-brand-dark line-clamp-1 flex-grow">{p.name}</p><div className="flex justify-between items-center mt-2"><p className="text-xs font-bold text-brand-primary">₦{p.prices.retail.toLocaleString()}</p><div className="bg-brand-primary text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-md group-hover:bg-brand-secondary">+</div></div></button>))}</div></div>
                                    <div className="lg:col-span-4"><div className="bg-brand-dark p-6 rounded-xl shadow-lg flex flex-col h-full"><div className="mb-6 text-white"><h4 className="text-lg font-bold uppercase tracking-wider">Draft Manifest</h4><p className="text-xs text-brand-secondary font-semibold">For: {targetUser?.name}</p></div><div className="flex-grow space-y-3 overflow-y-auto pr-2 max-h-96">{draftItems.length === 0 ? (<div className="py-16 text-center"><ShoppingCartIcon className="w-12 h-12 mx-auto text-white/10" /><p className="text-xs font-semibold uppercase text-white/30 mt-2">Cart is empty</p></div>) : draftItems.map(di => (<div key={di.product.id} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-md animate-slideInRight"><img src={di.product.image_url} className="w-12 h-12 object-contain rounded bg-gray-100 p-1" /><div className="flex-grow"><p className="text-xs font-bold text-brand-dark truncate">{di.product.name}</p><p className="text-xs text-brand-primary">₦{di.product.prices.retail}</p></div><div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md"><button onClick={() => setDraftItems(prev => prev.map(i => i.product.id === di.product.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="font-bold w-5 h-5">-</button><span className="text-xs font-bold w-4 text-center">{di.qty}</span><button onClick={() => setDraftItems(prev => prev.map(i => i.product.id === di.product.id ? { ...i, qty: i.qty + 1 } : i))} className="font-bold w-5 h-5">+</button></div><button onClick={() => setDraftItems(prev => prev.filter(i => i.product.id !== di.product.id))} className="text-gray-300 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button></div>))}</div><div className="mt-6 border-t border-white/20 pt-6"><div className="flex justify-between font-bold text-white mb-6 bg-white/10 p-4 rounded-lg"><p className="uppercase text-sm">Total Value</p><p className="text-2xl">₦{draftItems.reduce((acc, i) => acc + (i.product.prices.retail * i.qty), 0).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => setOrderStep(1)} className="flex-1 py-3 bg-white/20 text-white font-bold text-xs uppercase rounded-lg hover:bg-white/30">Back</button><button onClick={handlePlaceManualOrder} disabled={draftItems.length === 0} className="flex-2 py-3 bg-brand-secondary text-white font-bold text-xs uppercase rounded-lg shadow-lg hover:bg-opacity-80 disabled:bg-gray-700 disabled:text-gray-500">Commit Order</button></div></div></div></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderManagement;