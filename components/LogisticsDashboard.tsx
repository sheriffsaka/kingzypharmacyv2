import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderItem, Product } from '../types';
import { EyeIcon, XIcon, UserCircleIcon } from './Icons';

// --- MOCK DATA ---
const mockAssignedOrders: Order[] = [
    { 
        id: 102, user_id: 'u1', created_at: new Date(Date.now() - 86400000).toISOString(), 
        status: 'ORDER_ACKNOWLEDGED', 
        total_price: 25000, discount_applied: 500, 
        delivery_address: { fullName: 'Jane Smith', phone: '09087654321', street: '456 Oak Ave', city: 'Abuja', state: 'FCT', zip: '900001' }, 
        customer_details: { email: 'wholesale@kingzy.com', userId: 'u1' },
        order_items: [ { id: 1, order_id: 102, product_id: 1, quantity: 10, unit_price: 2200, products: { name: 'Ibuprofen', image_url: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768819813/pr6_quh0rd.png' } }, ] as any,
    },
    { 
        id: 205, user_id: 'u2', created_at: new Date(Date.now() - 96400000).toISOString(), 
        status: 'DISPATCHED', 
        total_price: 50000, discount_applied: 1000, 
        delivery_address: { fullName: 'Bello Musa', phone: '07011112222', street: '111 Sahel Rd', city: 'Kano', state: 'Kano', zip: '700001' }, 
        customer_details: { email: 'bello.m@example.com', userId: 'u2' } 
    },
];

const LogisticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'profile'>('assignments');
    
    // Dynamic fuel allowance pulled from global settings
    const [fuelAllowance, setFuelAllowance] = useState(45000);

    useEffect(() => {
        const updateFromConfig = () => {
            const saved = localStorage.getItem('kingzy_system_config');
            if (saved) {
                const config = JSON.parse(saved);
                setFuelAllowance(config.fuelAllowance || 45000);
            }
        };

        updateFromConfig();
        window.addEventListener('storage', updateFromConfig);
        return () => window.removeEventListener('storage', updateFromConfig);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Logistics Terminal</h1>
                    <p className="text-gray-500 font-bold italic tracking-wide mt-1">Operational Dispatch & Fulfillment Center</p>
                </div>
                <div className="bg-brand-light px-8 py-4 rounded-3xl border-4 border-brand-primary/10 flex items-center gap-4 shadow-xl">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em]">Service Duty Active</span>
                </div>
            </div>

            <div className="flex gap-4 border-b-4 border-gray-50 mb-10 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'overview' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Performance Stats</button>
                <button onClick={() => setActiveTab('assignments')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'assignments' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Active Assignments</button>
                <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'profile' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Staff Record</button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fadeIn">
                    <div className="bg-white p-12 rounded-[3rem] border-4 border-gray-50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-brand-primary/5 w-32 h-32 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Aggregate Deliveries</p>
                        <h3 className="text-6xl font-black text-brand-dark tracking-tighter">14</h3>
                        <div className="flex items-center gap-3 mt-6">
                            <span className="bg-accent-green/10 text-accent-green px-3 py-1 rounded-lg text-[10px] font-black uppercase">↑ 15% Trend</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">since last terminal login</p>
                        </div>
                    </div>
                    <div className="bg-white p-12 rounded-[3rem] border-4 border-gray-50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-accent-green/5 w-32 h-32 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Integrity Rating</p>
                        <h3 className="text-6xl font-black text-accent-green tracking-tighter">98%</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-6 tracking-widest italic">Top 5% of Logistics Fleet</p>
                    </div>
                    <div className="bg-brand-dark p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden group text-white">
                        <div className="absolute bottom-0 left-0 bg-white/5 w-48 h-48 rounded-full -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-700"></div>
                        <p className="text-[11px] font-black uppercase text-brand-secondary tracking-[0.2em] mb-6">System Fuel Subsidy</p>
                        <h3 className="text-6xl font-black text-white tracking-tighter">₦{fuelAllowance.toLocaleString()}</h3>
                        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black text-brand-secondary uppercase tracking-[0.3em] mb-1">Provisioned By</p>
                            <p className="text-xs font-bold text-gray-300 italic">Root Administration Protocol</p>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'assignments' && <MyAssignments />}
            {activeTab === 'profile' && <MyProfile />}
        </div>
    );
};

// ... Rest of the components (MyAssignments, MyProfile) remain same as in the original LogisticsDashboard.tsx ...
// (Omitted here for length, but the logic above is the key requested update)

const MyAssignments: React.FC = () => {
    const [assignedOrders, setAssignedOrders] = useState<Order[]>(mockAssignedOrders);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});

    const syncToAdmin = (type: 'ACCEPTED_DISPATCH' | 'REJECTED_DISPATCH' | 'ORDER_STATUS_UPDATE', orderId: number, message: string, severity: 'success' | 'error' | 'info') => {
        const events = JSON.parse(localStorage.getItem('order_events_sync') || '[]');
        const newEvent = { id: Date.now(), type, orderId, message, severity, timestamp: Date.now() };
        localStorage.setItem('order_events_sync', JSON.stringify([...events, newEvent]));
        localStorage.setItem('admin_notification', JSON.stringify(newEvent));
        window.dispatchEvent(new Event('storage'));
    };

    const handleAccept = (orderId: number) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        setTimeout(() => {
            syncToAdmin('ACCEPTED_DISPATCH', orderId, `Staff accepted dispatch for Order #${orderId}`, 'success');
            setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DISPATCHED' } : o));
            setUpdating(prev => ({...prev, [orderId]: false}));
        }, 800);
    };

    const handleReject = (orderId: number) => {
        if (confirm("Protocol: Confirm rejection of this consignment assignment? Immediate Admin alert will be dispatched.")) {
            syncToAdmin('REJECTED_DISPATCH', orderId, `URGENT: Logistics staff REJECTED assignment for Order #${orderId}!`, 'error');
            setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
            alert("Record Sanitized: Assignment returned to Admin queue.");
        }
    };

    const handleStatusUpdate = (orderId: number, newStatus: OrderStatus) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        setTimeout(() => {
            syncToAdmin('ORDER_STATUS_UPDATE', orderId, `Order #${orderId} state transitioned to ${newStatus}`, 'info');
            setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setUpdating(prev => ({...prev, [orderId]: false}));
        }, 800);
    };

    const newAssignments = assignedOrders.filter(o => o.status === 'ORDER_ACKNOWLEDGED');
    const activeDeliveries = assignedOrders.filter(o => ['DISPATCHED', 'IN_TRANSIT'].includes(o.status));

    return (
        <div className="space-y-12 animate-fadeIn">
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-50 shadow-2xl">
                <h2 className="text-2xl font-black text-brand-dark mb-10 flex items-center gap-5 uppercase tracking-tighter">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                    Incoming Consignments
                </h2>
                {newAssignments.length === 0 ? (
                    <div className="py-24 text-center border-4 border-dashed rounded-[2rem] border-gray-50">
                        <p className="text-gray-300 font-black text-sm uppercase tracking-[0.3em]">Operational Vacuum: No Jobs Assigned</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {newAssignments.map(order => (
                            <div key={order.id} className="p-8 border-2 border-gray-50 rounded-[2rem] bg-gray-50/30 hover:border-brand-primary/20 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-2xl font-black text-brand-dark tracking-tighter">Unit #{order.id}</h4>
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Protocol Pending</span>
                                </div>
                                <div className="space-y-2 mb-8">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination Terminal</p>
                                    <p className="text-sm text-gray-700 font-black uppercase tracking-tight">{order.delivery_address.city} Central Hub</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleReject(order.id)} className="flex-1 bg-red-50 text-red-600 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">Reject</button>
                                    <button onClick={() => handleAccept(order.id)} disabled={updating[order.id]} className="flex-2 bg-brand-primary text-white py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-secondary disabled:bg-gray-200 shadow-xl transition-all transform hover:scale-[1.02]">
                                        {updating[order.id] ? 'Syncing...' : 'Verify & Accept'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-50 shadow-2xl">
                <h2 className="text-2xl font-black text-brand-dark mb-10 uppercase tracking-tighter">Verified Pipeline</h2>
                {activeDeliveries.length === 0 ? (
                    <p className="text-gray-300 font-black text-xs uppercase tracking-[0.2em] text-center py-20">Consignment pipeline currently empty.</p>
                ) : (
                    <div className="overflow-x-auto rounded-2xl">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase text-gray-400 border-b-2 border-gray-50 tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-6">Consignment ID</th>
                                    <th className="px-6 py-6">Current Phase</th>
                                    <th className="px-6 py-6 text-right">State Transition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeDeliveries.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-all">
                                        <td className="px-6 py-8 font-black text-brand-dark text-lg tracking-tighter">UNIT #{order.id}</td>
                                        <td className="px-6 py-8">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-2 shadow-sm ${order.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{order.status}</span>
                                        </td>
                                        <td className="px-6 py-8 text-right">
                                            {order.status === 'DISPATCHED' && <button onClick={() => handleStatusUpdate(order.id, 'IN_TRANSIT')} className="bg-brand-secondary text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary shadow-lg transition-all transform hover:scale-105">Initiate Transit</button>}
                                            {order.status === 'IN_TRANSIT' && <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} className="bg-accent-green text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 shadow-lg transition-all transform hover:scale-105">Confirm Fulfillment</button>}
                                        </td>
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

const MyProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({ name: 'Joshua Delivery', vehicle: 'Van #12 (LAG-552-AB)', depot: 'Ikeja Central Depot', phone: '0802 345 6789' });
    const [formState, setFormState] = useState(profileData);
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileData(formState);
        setIsEditing(false);
        alert("System Record Updated: Logistics Profile synchronized.");
    };
    return (
        <div className="bg-white p-12 rounded-[3rem] border shadow-2xl max-w-lg mx-auto relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-3 bg-brand-primary"></div>
            <button onClick={() => { setFormState(profileData); setIsEditing(true); }} className="absolute top-10 right-10 bg-brand-light text-brand-primary px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm">Refine Record</button>
            <div className="text-center mb-12 mt-6">
                <div className="w-32 h-32 bg-brand-light rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border-8 border-white shadow-2xl group-hover:scale-110 transition-transform duration-500"><span className="text-5xl font-black text-brand-primary uppercase">{profileData.name.split(' ').map(n => n[0]).join('')}</span></div>
                <h2 className="text-3xl font-black text-brand-dark tracking-tighter">{profileData.name}</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-3">Verified Operations Specialist</p>
            </div>
            <div className="space-y-8 border-t-2 border-gray-50 pt-10">
                <div className="flex justify-between items-center"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Mobile Unit</p><p className="font-black text-brand-dark tracking-tight">{profileData.vehicle}</p></div>
                <div className="flex justify-between items-center"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Base Terminal</p><p className="font-black text-brand-dark tracking-tight">{profileData.depot}</p></div>
                <div className="flex justify-between items-center"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emergency Comms</p><p className="font-black text-brand-primary tracking-widest">{profileData.phone}</p></div>
            </div>
            {isEditing && (
                <div className="fixed inset-0 bg-brand-dark/95 backdrop-blur-2xl flex items-center justify-center z-[300] p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden border border-white/10">
                        <form onSubmit={handleSave}>
                            <div className="p-10 border-b bg-gray-50/50 flex justify-between items-center"><h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Record Update</h3><button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-8 h-8"/></button></div>
                            <div className="p-10 space-y-8">
                                <div><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Full Legal Name</label><input value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-black text-sm uppercase bg-gray-50"/></div>
                                <div><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Consigned Vehicle ID</label><input value={formState.vehicle} onChange={e => setFormState({...formState, vehicle: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-black text-sm uppercase bg-gray-50"/></div>
                                <div><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Primary Comms Link</label><input value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-black text-sm tracking-widest bg-gray-50"/></div>
                            </div>
                            <div className="p-10 bg-gray-50/50 border-t-2 border-gray-100 flex gap-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-5 bg-white border-2 border-gray-100 font-black text-[10px] uppercase rounded-2xl hover:bg-gray-100 transition-all">Abort</button>
                                <button type="submit" className="flex-2 py-5 bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-brand-secondary transition-all transform hover:scale-[1.02]">Confirm Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsDashboard;