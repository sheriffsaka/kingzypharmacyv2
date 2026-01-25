import React, { useState, useEffect } from 'react';
import AdminDashboardOverview from './AdminDashboardOverview';
import AdminUserManagement from './AdminUserManagement';
import AdminInventoryManagement from './AdminInventoryManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminUserApproval from './AdminUserApproval';
import { Profile } from '../types';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'users' | 'approvals';

interface AdminDashboardProps {
    profile: Profile;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const checkNotifications = () => {
            const notification = localStorage.getItem('admin_notification');
            if (notification) {
                const parsed = JSON.parse(notification);
                // Avoid adding duplicate notifications
                setNotifications(prev => {
                    if (!prev.find(n => n.timestamp === parsed.timestamp)) {
                        return [...prev, parsed];
                    }
                    return prev;
                });
                localStorage.removeItem('admin_notification');
            }
        };

        const intervalId = setInterval(checkNotifications, 3000); // Check every 3 seconds
        return () => clearInterval(intervalId);
    }, []);

    const handleClearNotifications = () => {
        const messages = notifications.map(n => `Order #${n.orderId} was rejected by logistics.`).join('\n');
        alert(`New Notifications:\n\n${messages}`);
        setNotifications([]);
    }

    const tabLabels: Record<AdminTab, string> = {
        overview: 'Overview',
        orders: 'Order Management',
        inventory: 'Inventory',
        users: 'User Management',
        approvals: 'Approvals',
    };

    const TabButton = ({ tab, label }: { tab: AdminTab, label: string }) => (
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
            case 'overview': return <AdminDashboardOverview />;
            case 'orders': return <AdminOrderManagement profile={profile} />;
            case 'inventory': return <AdminInventoryManagement />;
            case 'users': return <AdminUserManagement />;
            case 'approvals': return <AdminUserApproval />;
            default: return <AdminDashboardOverview />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 mb-6">Manage all aspects of the Kingzy Pharmaceuticals platform from one central hub.</p>
            
            <nav className="text-sm font-medium text-gray-500 mb-4" aria-label="Breadcrumb">
                <ol className="list-none p-0 inline-flex items-center">
                    <li>
                        <button onClick={() => setActiveTab('overview')} className="hover:text-brand-primary transition-colors">Dashboard</button>
                    </li>
                    {activeTab !== 'overview' && (
                    <>
                        <li className="mx-2">/</li>
                        <li className="text-gray-800">{tabLabels[activeTab]}</li>
                    </>
                    )}
                </ol>
            </nav>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tab="overview" label="Overview" />
                    <div className="relative">
                        <TabButton tab="orders" label="Order Management" />
                        {notifications.length > 0 && (
                            <button onClick={handleClearNotifications} className="absolute top-0 right-0 -mt-1 flex h-5 w-5" aria-label={`${notifications.length} new notifications`}>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{notifications.length}</span>
                            </button>
                        )}
                    </div>
                    <TabButton tab="inventory" label="Inventory" />
                    <TabButton tab="users" label="User Management" />
                    <TabButton tab="approvals" label="Approvals" />
                </nav>
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;