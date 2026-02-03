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
                    setOrders(prev => {
                        const orderToMove = prev.find(o => o.id === ev.orderId);
                        if (orderToMove) {
                            setRejectedOrders(rej => rej.find(r => r.id === ev.orderId) ? rej : [...rej, { ...orderToMove, status: 'ORDER_ACKNOWLEDGED' }]);
                            return prev.filter(o => o.id !== ev.orderId);
                        }
                        return prev;
                    });
                }
                setProcessedEventIds(prev => new Set(prev).add(ev.id));
            });
        };
        const interval = setInterval(syncEvents, 1000);
        window.addEventListener('storage', syncEvents);
        return () => { clearInterval(interval); window.removeEventListener('storage', syncEvents); }
    }, [processedEventIds]);

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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'ORDER_ACKNOWLEDGED' } : o));
        setRejectedOrders(prev => prev.filter(o => o.id !== orderId));
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
        <div className="space-y-8 animate-fadeIn">
            {/* Control Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex bg-gray-100 p-2 rounded-3xl border-2 border-gray-50 shadow-inner">
                    <button onClick={() => {setActiveSubTab('active'); setShowArchived(false);}} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'active' && !showArchived ? 'bg-white shadow-xl text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Live Pipeline</button>
                    <button onClick={() => {setActiveSubTab('rejected'); setShowArchived(false);}} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex gap-3 items-center transition-all ${activeSubTab === 'rejected' && !showArchived ? 'bg-red-600 shadow-xl text-white' : 'text-red-500 hover:bg-red-50'}`}>Logistics Rejections {rejectedOrders.length > 0 && <span className="bg-white text-red-600 px-3 py-1 rounded-full">{rejectedOrders.length}</span>}</button>
                    <button onClick={() => setShowArchived(true)} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showArchived ? 'bg-brand-dark shadow-xl text-white' : 'text-gray-400 hover:text-gray-600'}`}>Persistent Archives ({archivedOrders.length})</button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-4 bg-white p-3.5 rounded-3xl border-2 border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Pool From</span>
                            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="text-[10px] font-black outline-none bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 focus:border-brand-primary transition-colors" />
                        </div>
                        <div className="flex items-center gap-3 border-l-2 pl-4 border-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Until</span>
                            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="text-[10px] font-black outline-none bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 focus:border-brand-primary transition-colors" />
                        </div>
                    </div>
                    <div className="relative flex-grow min-w-[280px]">
                        <input type="text" placeholder="Filter by ID, Email, or Merchant..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-3xl text-[10px] font-black uppercase outline-none focus:border-brand-primary transition-all shadow-sm" />
                        <SearchIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                    <button onClick={() => setIsCreatingOrder(true)} className="bg-brand-primary text-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,82,155,0.2)] hover:bg-brand-secondary transition-all transform hover:scale-105 active:scale-95" title="Manual Intake Protocol"><ShoppingCartIcon className="w-7 h-7" /></button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border-4 border-gray-50 overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <button onClick={toggleSelectAll} className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                            {selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0 ? 'Release All' : 'Capture Visual Results'}
                        </button>
                        {selectedOrderIds.size > 0 && <div className="flex items-center gap-3 bg-brand-primary text-white px-5 py-2 rounded-2xl shadow-lg border-2 border-white/20"><span className="w-2 h-2 bg-white rounded-full animate-ping"></span><span className="text-[10px] font-black uppercase tracking-widest">{selectedOrderIds.size} Records Targeted</span></div>}
                    </div>
                    {selectedOrderIds.size > 0 && !showArchived && (
                        <button onClick={handleBatchArchive} className="flex items-center gap-4 bg-brand-dark text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl group">
                            <ClipboardCheckIcon className="w-6 h-6 text-brand-secondary group-hover:scale-110 transition-transform" /> Commit Batch to Archive
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30 text-[11px] font-black uppercase text-gray-400 tracking-[0.3em]">
                                <th className="px-10 py-8 w-12 text-center">Mark</th>
                                <th className="px-10 py-8">Merchant Assignment</th>
                                <th className="px-10 py-8">Consignment Status</th>
                                <th className="px-10 py-8">Hub Hub Routing</th>
                                <th className="px-10 py-8 text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className={`${selectedOrderIds.has(order.id) ? 'bg-brand-light/30' : ''} hover:bg-gray-50/50 transition-all group`}>
                                    <td className="px-10 py-8 text-center">
                                        <input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => {
                                            const newSet = new Set(selectedOrderIds);
                                            newSet.has(order.id) ? newSet.delete(order.id) : newSet.add(order.id);
                                            setSelectedOrderIds(newSet);
                                        }} className="w-6 h-6 rounded-xl border-4 border-gray-100 text-brand-primary focus:ring-brand-primary cursor-pointer transition-all shadow-inner" />
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="font-black text-brand-dark text-base tracking-tighter">BATCH #{order.id}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                            <span className="text-gray-200">|</span>
                                            <p className="text-[10px] text-brand-primary font-black uppercase tracking-tighter truncate max-w-[180px]">{order.customer_details.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border-4 shadow-sm inline-block ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{order.status.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        {!showArchived ? (
                                            <div className="flex gap-3 items-center">
                                                <select value={selectedLogistics[order.id] || ''} onChange={e => setSelectedLogistics({...selectedLogistics, [order.id]: e.target.value})} className="text-[10px] font-black p-4 border-4 border-gray-50 rounded-2xl bg-white shadow-inner outline-none focus:border-brand-primary transition-all">
                                                    <option value="">Personnel Pool...</option>
                                                    {mockLogisticsStaff.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}
                                                </select>
                                                <button onClick={() => handleAssignOrder(order.id)} className="bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-brand-secondary shadow-xl transition-all active:scale-95">Route</button>
                                            </div>
                                        ) : <span className="text-[11px] font-black uppercase text-gray-400 italic tracking-[0.4em] opacity-30">ENCRYPTED ARCHIVE</span>}
                                    </td>
                                    <td className="px-10 py-8 text-right flex justify-end gap-4">
                                        <button onClick={() => setSelectedOrder(order)} className="p-4 bg-brand-light text-brand-primary hover:bg-brand-primary hover:text-white rounded-[1.2rem] transition-all shadow-sm border-2 border-brand-primary/5" title="Deep Protocol Audit"><EyeIcon className="w-7 h-7"/></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr><td colSpan={5} className="py-48 text-center text-gray-200 italic uppercase font-black text-lg tracking-[0.5em] opacity-40 select-none">No Visual Logs in Context</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADVANCED ORDER INTAKE MODAL */}
            {isCreatingOrder && (
                <div className="fixed inset-0 bg-brand-dark/95 backdrop-blur-3xl flex items-center justify-center z-[500] p-4">
                    <div className="bg-white rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,0.4)] w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-scaleIn border-8 border-white/5">
                        <div className="p-12 border-b-4 border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Consignment Dispatch Entry</h3>
                                <div className="flex gap-6 mt-3">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${orderStep >= 1 ? 'text-brand-primary' : 'text-gray-300'}`}>01 Identity</p>
                                    <span className="text-gray-200">/</span>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${orderStep >= 2 ? 'text-brand-primary' : 'text-gray-300'}`}>02 Consignment</p>
                                </div>
                            </div>
                            <button onClick={resetManualOrder} className="bg-white p-4 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all shadow-xl border-2 border-gray-100 group"><XIcon className="w-10 h-10 group-hover:rotate-90 transition-transform"/></button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-12">
                            {orderStep === 1 ? (
                                <div className="space-y-12 max-w-3xl mx-auto py-10">
                                    <div className="text-center">
                                        <div className="bg-brand-primary text-white w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transform -rotate-3"><ShoppingCartIcon className="w-14 h-14" /></div>
                                        <h4 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Identify Target Merchant</h4>
                                        <p className="text-gray-500 font-medium italic text-lg mt-2">Verified Pharmacists and Retail Buyers listed below.</p>
                                    </div>
                                    <div className="relative">
                                        <input type="text" placeholder="Search by Official Name or Email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full p-8 bg-gray-50 border-4 border-gray-100 rounded-[2.5rem] outline-none focus:border-brand-primary font-black text-lg uppercase tracking-tighter shadow-inner transition-all pl-16" />
                                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-8 h-8" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 max-h-[450px] overflow-y-auto pr-4 scrollbar-hide">
                                        {mockUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                                            <button key={u.id} onClick={() => setTargetUser(u)} className={`w-full p-8 flex items-center justify-between transition-all rounded-[2rem] border-4 ${targetUser?.id === u.id ? 'bg-brand-primary text-white border-brand-primary shadow-[0_20px_60px_rgba(0,82,155,0.3)] scale-[1.03]' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                                                <div className="text-left flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center font-black text-xl border-4 ${targetUser?.id === u.id ? 'bg-white/20 border-white/20' : 'bg-gray-100 text-gray-400 border-gray-50'}`}>{u.name?.[0]}</div>
                                                    <div>
                                                        <p className="font-black text-lg uppercase tracking-tight">{u.name}</p>
                                                        <p className={`text-xs font-bold ${targetUser?.id === u.id ? 'opacity-80' : 'text-gray-400'}`}>{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl border-4 ${targetUser?.id === u.id ? 'bg-white/10 border-white/20 text-white' : 'bg-brand-light text-brand-primary border-brand-primary/5'}`}>
                                                    {u.role?.replace(/_/g, ' ')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-8">
                                        <button onClick={() => setOrderStep(2)} disabled={!targetUser} className="w-full py-8 bg-brand-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all shadow-2xl disabled:bg-gray-200 disabled:shadow-none transform hover:-translate-y-2 active:scale-95 text-lg">
                                            Proceed to Consignment Picking &rarr;
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                    {/* Product Picker */}
                                    <div className="lg:col-span-8 space-y-12">
                                        <div className="flex justify-between items-end border-b-4 border-gray-50 pb-8">
                                            <div>
                                                <h4 className="text-xl font-black uppercase text-brand-dark tracking-widest">Global Inventory</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest">Real-time stock levels active</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-3 bg-accent-green/10 px-4 py-2 rounded-2xl"><div className="w-2.5 h-2.5 bg-accent-green rounded-full animate-pulse"></div><span className="text-[10px] font-black text-accent-green uppercase">Verified</span></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                                            {productsData.map(p => (
                                                <button key={p.id} onClick={() => addToDraft(p)} className="p-8 bg-white border-4 border-gray-50 rounded-[2.5rem] hover:border-brand-primary transition-all text-left group shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-3 relative overflow-hidden flex flex-col h-full">
                                                    <div className="w-full aspect-square bg-gray-50 rounded-[2rem] mb-6 flex items-center justify-center p-6 border-4 border-transparent group-hover:border-white shadow-inner transition-all">
                                                        <img src={p.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <p className="font-black text-sm text-brand-dark uppercase tracking-tighter line-clamp-1 flex-grow">{p.name}</p>
                                                    <div className="flex justify-between items-center mt-6">
                                                        <p className="text-xs font-black text-brand-primary bg-brand-light px-4 py-2 rounded-2xl shadow-inner border border-brand-primary/10">₦{p.prices.retail.toLocaleString()}</p>
                                                        <div className="bg-brand-primary text-white w-10 h-10 rounded-[1.2rem] flex items-center justify-center text-xl font-black shadow-xl group-hover:bg-brand-secondary transition-colors">+</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Draft Manifest */}
                                    <div className="lg:col-span-4 flex flex-col h-full sticky top-0">
                                        <div className="bg-brand-dark p-10 rounded-[3rem] shadow-2xl flex flex-col flex-grow border-8 border-white/5">
                                            <div className="mb-10 text-white">
                                                <h4 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3">Draft Manifest <ShoppingCartIcon className="w-6 h-6 text-brand-secondary" /></h4>
                                                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Merchant Destination</p>
                                                    <p className="text-xs font-black text-brand-secondary mt-1">{targetUser?.name}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-grow space-y-6 overflow-y-auto pr-3 scrollbar-hide max-h-[400px]">
                                                {draftItems.length === 0 ? (
                                                    <div className="py-24 text-center space-y-6 animate-pulse">
                                                        <div className="bg-white/5 w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-white/10 border-4 border-dashed border-white/20"><ShoppingCartIcon className="w-10 h-10" /></div>
                                                        <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em]">Cart Vacant</p>
                                                    </div>
                                                ) : draftItems.map(di => (
                                                    <div key={di.product.id} className="flex items-center gap-5 bg-white p-5 rounded-3xl shadow-xl animate-slideInRight group border-2 border-transparent hover:border-brand-secondary transition-all">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl p-2.5 flex-shrink-0 border-2 border-gray-100 shadow-inner"><img src={di.product.image_url} className="w-full h-full object-contain" /></div>
                                                        <div className="flex-grow">
                                                            <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight truncate w-32">{di.product.name}</p>
                                                            <p className="text-[10px] font-black text-brand-primary mt-1">₦{di.product.prices.retail}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border-2 border-gray-100 shadow-inner scale-90 origin-right">
                                                            <button onClick={() => setDraftItems(prev => prev.map(i => i.product.id === di.product.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="text-gray-400 hover:text-red-500 font-black text-lg">-</button>
                                                            <span className="text-[11px] font-black text-brand-dark w-6 text-center">{di.qty}</span>
                                                            <button onClick={() => setDraftItems(prev => prev.map(i => i.product.id === di.product.id ? { ...i, qty: i.qty + 1 } : i))} className="text-brand-primary font-black hover:text-brand-secondary text-lg">+</button>
                                                        </div>
                                                        <button onClick={() => setDraftItems(prev => prev.filter(i => i.product.id !== di.product.id))} className="text-gray-200 hover:text-red-500 transition-all hover:scale-110"><TrashIcon className="w-6 h-6"/></button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-10 border-t-4 border-white/5 pt-10">
                                                <div className="flex justify-between font-black text-white mb-10 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                                                    <div className="relative z-10 space-y-2">
                                                        <p className="uppercase text-[10px] text-brand-secondary tracking-[0.3em]">Aggregate Financial Value</p>
                                                        <p className="text-3xl tracking-tighter">₦{draftItems.reduce((acc, i) => acc + (i.product.prices.retail * i.qty), 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => setOrderStep(1)} className="flex-1 py-6 bg-white/10 text-white border-2 border-white/20 font-black text-[10px] uppercase tracking-widest rounded-3xl shadow-lg hover:bg-white/20 transition-all active:scale-95">Previous</button>
                                                    <button onClick={handlePlaceManualOrder} disabled={draftItems.length === 0} className="flex-2 py-6 bg-brand-secondary text-white font-black text-[10px] uppercase tracking-widest rounded-3xl shadow-[0_20px_60px_rgba(0,163,224,0.3)] hover:bg-white hover:text-brand-secondary disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none transition-all active:scale-95">Commit Dispatch</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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