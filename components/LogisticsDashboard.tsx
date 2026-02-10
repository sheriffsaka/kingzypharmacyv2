import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderItem, Product, Profile } from '../types';
import { EyeIcon, XIcon, UserCircleIcon } from './Icons';

interface DashboardProps {
    profile: Profile;
}

const LogisticsDashboard: React.FC<DashboardProps> = ({ profile }) => {
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
                    <h1 className="text-3xl font-bold text-brand-dark">Logistics Terminal</h1>
                    <p className="text-gray-500 font-medium">Operational Dispatch & Fulfillment Center</p>
                </div>
                <div className="bg-brand-light px-6 py-3 rounded-2xl border-2 border-brand-primary/10 flex items-center gap-3 shadow-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Service Duty Active</span>
                </div>
            </div>

            <div className="flex gap-4 border-b-2 border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Performance Stats</button>
                <button onClick={() => setActiveTab('assignments')} className={`whitespace-nowrap pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${activeTab === 'assignments' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Active Assignments</button>
                <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${activeTab === 'profile' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Staff Record</button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                    <div className="bg-white p-8 rounded-xl border shadow-md">
                        <p className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-2">Aggregate Deliveries</p>
                        <h3 className="text-5xl font-bold text-brand-dark">14</h3>
                        <p className="text-sm font-semibold text-green-600 mt-2">↑ 15% Trend</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl border shadow-md">
                        <p className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-2">Integrity Rating</p>
                        <h3 className="text-5xl font-bold text-accent-green">98%</h3>
                        <p className="text-sm font-medium text-gray-500 mt-2">Top 5% of Logistics Fleet</p>
                    </div>
                    <div className="bg-brand-dark text-white p-8 rounded-xl shadow-lg">
                         <p className="text-sm font-semibold uppercase text-brand-secondary tracking-wider mb-2">System Fuel Subsidy</p>
                        <h3 className="text-5xl font-bold">₦{fuelAllowance.toLocaleString()}</h3>
                        <p className="text-xs text-blue-200/70 mt-2">Provisioned by Root Admin</p>
                    </div>
                </div>
            )}
            
            {activeTab === 'assignments' && <MyAssignments profile={profile} />}
            {activeTab === 'profile' && <MyProfile profile={profile} />}
        </div>
    );
};

interface MyAssignmentsProps {
    profile: Profile;
}

const MyAssignments: React.FC<MyAssignmentsProps> = ({ profile }) => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const loadAndSyncOrders = () => {
            const storedOrdersRaw = localStorage.getItem('kingzy_all_orders');
            const ordersSource: Order[] = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
            setAllOrders(ordersSource);
        };

        loadAndSyncOrders();
        window.addEventListener('storage', loadAndSyncOrders);
        return () => window.removeEventListener('storage', loadAndSyncOrders);
    }, []);

    const syncToAdmin = (type: 'ACCEPTED_DISPATCH' | 'REJECTED_DISPATCH' | 'ORDER_STATUS_UPDATE', orderId: number, message: string, severity: 'success' | 'error' | 'info', orderPayload?: Order) => {
        const events = JSON.parse(localStorage.getItem('order_events_sync') || '[]');
        const newEvent = { id: Date.now(), type, orderId, message, severity, timestamp: Date.now(), order: orderPayload };
        localStorage.setItem('order_events_sync', JSON.stringify([...events, newEvent]));
        localStorage.setItem('admin_notification', JSON.stringify(newEvent));
        // No need to dispatch 'storage' event here; localStorage.setItem does that automatically across tabs.
    };
    
    const handleAccept = (orderId: number) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        setAllOrders(currentOrders => {
            const updatedOrders = currentOrders.map(o => 
                o.id === orderId ? { ...o, status: 'DISPATCHED' as OrderStatus } : o
            );
            localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
            syncToAdmin('ACCEPTED_DISPATCH', orderId, `Staff accepted dispatch for Order #${orderId}`, 'success');
            return updatedOrders;
        });
        setUpdating(prev => ({...prev, [orderId]: false}));
    };

    const handleReject = (orderId: number) => {
        if (confirm("Protocol: Confirm rejection of this consignment assignment? The order will be removed from your queue and an immediate alert dispatched to the Admin.")) {
            setUpdating(prev => ({...prev, [orderId]: true}));
            setAllOrders(currentOrders => {
                const orderToReject = currentOrders.find(o => o.id === orderId);
                if (!orderToReject) {
                    alert("Error: Could not find the order to reject. It may have been updated by an administrator.");
                    return currentOrders; // Return original state if order not found
                }

                const updatedOrders = currentOrders.map(o => 
                    o.id === orderId ? { ...o, status: 'LOGISTICS_REJECTED' as OrderStatus } : o
                );
                
                localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
                syncToAdmin('REJECTED_DISPATCH', orderId, `URGENT: Logistics staff REJECTED assignment for Order #${orderId}!`, 'error', orderToReject);
                
                alert("Record Sanitized: Assignment has been rejected and returned to the Admin queue for review.");
                return updatedOrders;
            });
            setUpdating(prev => ({...prev, [orderId]: false}));
        }
    };

    const handleStatusUpdate = (orderId: number, newStatus: OrderStatus) => {
        setUpdating(prev => ({...prev, [orderId]: true}));
        setAllOrders(currentOrders => {
            const updatedOrders = currentOrders.map(o => 
                o.id === orderId ? { ...o, status: newStatus } : o
            );
            localStorage.setItem('kingzy_all_orders', JSON.stringify(updatedOrders));
            syncToAdmin('ORDER_STATUS_UPDATE', orderId, `Order #${orderId} state transitioned to ${newStatus}`, 'info');
            return updatedOrders;
        });
        setUpdating(prev => ({...prev, [orderId]: false}));
    };

    const myId = profile.id;
    const myAssignments = allOrders.filter(o => {
        const latestAssignment = o.logistics_assignments?.[o.logistics_assignments.length - 1];
        // An order is considered an active assignment if it's assigned to the current user
        // AND its status requires action from them. Rejected or Delivered orders are removed from this view.
        return latestAssignment?.profiles.id === myId && 
               ['ASSIGNED_TO_LOGISTICS', 'DISPATCHED', 'IN_TRANSIT'].includes(o.status);
    });

    const newAssignments = myAssignments.filter(o => o.status === 'ASSIGNED_TO_LOGISTICS');
    const activeDeliveries = myAssignments.filter(o => ['DISPATCHED', 'IN_TRANSIT'].includes(o.status));

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg border shadow-md">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Incoming Assignments</h2>
                {newAssignments.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed rounded-lg border-gray-200">
                        <p className="text-gray-400 font-semibold">No new jobs assigned.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newAssignments.map(order => (
                            <div key={order.id} className="p-6 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start mb-4"><h4 className="text-xl font-bold text-brand-dark">Order #{order.id}</h4><span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Pending</span></div>
                                <div className="space-y-1 mb-6 text-sm"><p className="font-semibold text-gray-500">Destination</p><p className="text-gray-800 font-medium">{order.delivery_address.city}, {order.delivery_address.state}</p></div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleReject(order.id)} disabled={updating[order.id]} className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all disabled:bg-gray-300">
                                        {updating[order.id] ? 'Rejecting...' : 'Reject'}
                                    </button>
                                    <button onClick={() => handleAccept(order.id)} disabled={updating[order.id]} className="flex-2 bg-brand-primary text-white py-3 px-6 rounded-lg font-bold text-xs uppercase hover:bg-brand-secondary disabled:bg-gray-300 shadow-md">{updating[order.id] ? 'Syncing...' : 'Accept'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-md">
                <h2 className="text-xl font-semibold text-brand-dark mb-4">Active Deliveries</h2>
                {activeDeliveries.length === 0 ? (
                    <p className="text-gray-400 text-center py-16">No active deliveries.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs font-semibold uppercase text-gray-500 border-b">
                                <tr><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                            </thead>
                            <tbody className="divide-y">
                                {activeDeliveries.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 font-bold text-brand-dark">#{order.id}</td>
                                        <td className="px-4 py-4"><span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${order.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{order.status}</span></td>
                                        <td className="px-4 py-4 text-right">
                                            {order.status === 'DISPATCHED' && <button onClick={() => handleStatusUpdate(order.id, 'IN_TRANSIT')} disabled={updating[order.id]} className="bg-brand-secondary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-brand-primary shadow-md disabled:bg-gray-300">Start Transit</button>}
                                            {order.status === 'IN_TRANSIT' && <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} disabled={updating[order.id]} className="bg-accent-green text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-green-600 shadow-md disabled:bg-gray-300">Confirm Delivery</button>}
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

const MyProfile: React.FC<{ profile: Profile }> = ({ profile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const mockData = { vehicle: 'Van #12 (LAG-552-AB)', depot: 'Ikeja Central Depot', phone: '0802 345 6789' };
    const [profileData, setProfileData] = useState({ 
        name: profile.email?.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Joshua Delivery', 
        ...mockData 
    });
    const [formState, setFormState] = useState(profileData);
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileData(formState);
        setIsEditing(false);
        alert("System Record Updated: Logistics Profile synchronized.");
    };
    return (
        <div className="bg-white p-8 rounded-xl border shadow-md max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-dark">My Staff Profile</h2>
                <button onClick={() => { setFormState(profileData); setIsEditing(true); }} className="bg-brand-light text-brand-primary px-4 py-2 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-brand-primary hover:text-white">Edit</button>
            </div>
            <div className="text-center mb-8">
                <div className="w-24 h-24 bg-brand-light rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg"><span className="text-4xl font-black text-brand-primary">{profileData.name.split(' ').map(n => n[0]).join('')}</span></div>
                <h2 className="text-2xl font-bold text-brand-dark">{profileData.name}</h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">Operations Specialist</p>
                <p className="text-sm font-semibold text-brand-primary mt-1">{profile.email}</p>
            </div>
            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><p className="font-semibold text-gray-500 uppercase">Vehicle</p><p className="font-bold text-brand-dark">{profileData.vehicle}</p></div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><p className="font-semibold text-gray-500 uppercase">Base Depot</p><p className="font-bold text-brand-dark">{profileData.depot}</p></div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><p className="font-semibold text-gray-500 uppercase">Phone</p><p className="font-bold text-brand-primary">{profileData.phone}</p></div>
            </div>
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scaleIn">
                        <form onSubmit={handleSave}>
                            <div className="p-6 border-b flex justify-between items-center"><h3 className="text-lg font-bold text-brand-dark">Edit Profile</h3><button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500"><XIcon className="w-6 h-6"/></button></div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-sm font-semibold text-gray-600">Full Name</label><input value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold text-gray-600">Vehicle ID</label><input value={formState.vehicle} onChange={e => setFormState({...formState, vehicle: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold text-gray-600">Phone</label><input value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full mt-1 p-2 border rounded-md"/></div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                                <button type="button" onClick={() => setIsEditing(false)} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsDashboard;