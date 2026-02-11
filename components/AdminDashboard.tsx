import React, { useState, useEffect } from 'react';
import AdminDashboardOverview from './AdminDashboardOverview';
import AdminUserManagement from './AdminUserManagement';
import AdminInventoryManagement from './AdminInventoryManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminUserApproval from './AdminUserApproval';
import CmsManagement from './CmsManagement'; // Import the new CMS component
import { Profile } from '../types';
import { XIcon, ChatBubbleIcon, ShieldCheckIcon } from './Icons';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'users' | 'approvals' | 'cms';

interface AdminDashboardProps {
    profile: Profile;
}

interface Notification {
    id: string;
    type: string;
    orderId: number;
    timestamp: number;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toasts, setToasts] = useState<Notification[]>([]);

    useEffect(() => {
        const checkNotifications = () => {
            const raw = localStorage.getItem('admin_notification');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as Notification;
                    parsed.id = `ntf-${parsed.timestamp}`;
                    
                    // Prevent state spamming
                    setNotifications(prev => {
                        if (prev.find(n => n.id === parsed.id)) return prev;
                        
                        // Show active toast for immediate feedback
                        setToasts(t => [...t, parsed]);
                        setTimeout(() => {
                            setToasts(t => t.filter(item => item.id !== parsed.id));
                        }, 7000);

                        return [parsed, ...prev];
                    });
                    
                    // Simulation Log: Show developers/testers that the system is working
                    console.log(`%c[SYSTEM ALERT] Real-time Logistics Event: ${parsed.message}`, 'color: #00529B; font-weight: bold;');
                    console.log(`%c[SIMULATION] Automated Alert Email dispatched to admin@kingzy.com for Order #${parsed.orderId}`, 'color: #888; font-style: italic;');
                    
                    // Clear trigger after reading
                    localStorage.removeItem('admin_notification');
                } catch (e) {
                    console.error("Failed to parse notification", e);
                }
            }
        };

        const intervalId = setInterval(checkNotifications, 1500); 
        return () => clearInterval(intervalId);
    }, []);

    const handleClearAll = () => {
        setNotifications([]);
        setShowNotifications(false);
    }

    const TabButton = ({ tab, label }: { tab: AdminTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 font-bold transition-all text-sm rounded-t-lg border-b-2 ${
                activeTab === tab 
                ? 'text-brand-primary border-brand-primary bg-brand-light/30' 
                : 'text-gray-400 border-transparent hover:text-brand-dark hover:border-gray-200'
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <AdminDashboardOverview />;
            case 'orders': return <AdminOrderManagement profile={profile} />;
            case 'inventory': return <AdminInventoryManagement />;
            case 'users': return <AdminUserManagement />;
            case 'approvals': return <AdminUserApproval />;
            case 'cms': return <CmsManagement setActiveTab={setActiveTab} />;
            default: return <AdminDashboardOverview />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 relative pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark">Admin Control Centre</h1>
                    <p className="text-gray-500 font-medium">Monitoring platform-wide health and fulfillment.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Real-time Notification Hub */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 bg-white rounded-2xl shadow-lg border hover:border-brand-primary transition-all relative group"
                        >
                            <ChatBubbleIcon className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-50 z-[100] overflow-hidden animate-fadeIn">
                                <div className="p-4 border-b bg-brand-light/50 flex justify-between items-center">
                                    <h3 className="font-black text-brand-dark uppercase text-xs tracking-widest">Activity Feed</h3>
                                    <button onClick={handleClearAll} className="text-[10px] font-black text-brand-primary uppercase hover:underline">Clear Hub</button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto divide-y">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center text-gray-300 italic text-sm">Nothing to report.</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${n.severity === 'error' ? 'bg-red-50/30' : ''}`}>
                                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.severity === 'error' ? 'bg-red-600' : 'bg-brand-primary'}`}></div>
                                                <div className="flex-grow">
                                                    <p className="text-[10px] font-bold text-gray-400 mb-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                                    <p className="text-sm font-bold text-gray-800 leading-tight">{n.message}</p>
                                                    <button onClick={() => { setActiveTab('orders'); setShowNotifications(false); }} className="text-[10px] font-black text-brand-primary uppercase mt-2 hover:underline tracking-tighter">Manage Order &rarr;</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-brand-dark text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md">
                         <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                         <span className="text-xs font-black uppercase tracking-widest">{profile.email}</span>
                    </div>
                </div>
            </div>

            <div className="border-b-2 border-gray-100 mb-8 overflow-x-auto">
                <nav className="-mb-[2px] flex space-x-6 min-w-max" aria-label="Tabs">
                    <TabButton tab="overview" label="Overview" />
                    <TabButton tab="orders" label="Order Pipeline" />
                    <TabButton tab="cms" label="Content Management" />
                    <TabButton tab="inventory" label="Products & Inventory" />
                    <TabButton tab="users" label="User Access" />
                    <TabButton tab="approvals" label="Partner KYC" />
                </nav>
            </div>

            <div className="animate-fadeIn">{renderContent()}</div>

            {/* Global Alert System (Floating Toasts) */}
            <div className="fixed top-24 right-6 z-[110] space-y-4 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto bg-white border-l-4 border-brand-primary shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl p-5 w-80 animate-slideInRight flex gap-4 items-start border border-gray-100">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${t.severity === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-black text-sm text-gray-900 uppercase tracking-tighter">Logistics Update</h4>
                            <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1">{t.message}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">APP NOTIFY</span>
                                <span className="bg-purple-50 text-purple-600 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">EMAIL SIMULATED</span>
                            </div>
                        </div>
                        <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-gray-300 hover:text-gray-500 transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;