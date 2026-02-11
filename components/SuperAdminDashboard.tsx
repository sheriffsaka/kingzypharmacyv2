import React, { useState, useMemo, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { UserCircleIcon, EyeIcon, SearchIcon, ClipboardCheckIcon, ShoppingCartIcon, XIcon, TrashIcon } from './Icons';
import AdminOrderManagement from './AdminOrderManagement';
import CmsManagement from './CmsManagement';

interface AdminActivity {
    id: number;
    adminEmail: string;
    action: string;
    target: string;
    timestamp: string;
}

const initialAdmins: (Profile & {email: string})[] = [
    { id: 'admin-1', email: 'admin@kingzy.com', role: 'admin', approval_status: 'approved', created_at: '2024-01-01', loyalty_discount_percentage: 0 },
    { id: 'admin-2', email: 'support@kingzy.com', role: 'admin', approval_status: 'approved', created_at: '2024-02-15', loyalty_discount_percentage: 0 },
];

const mockActivities: AdminActivity[] = [
    { id: 1, adminEmail: 'admin@kingzy.com', action: 'Updated Global Delivery Fee', target: '₦1,500', timestamp: 'Just Now' },
    { id: 2, adminEmail: 'admin@kingzy.com', action: 'Approved Wholesale Account', target: 'pharma.plus@example.com', timestamp: '2024-07-28 10:30' },
    { id: 3, adminEmail: 'support@kingzy.com', action: 'Placed Order on Behalf', target: 'john.buyer@test.com', timestamp: '2024-07-28 11:15' },
];

type SuperAdminTab = 'admins' | 'orders' | 'activity' | 'global_settings' | 'cms';

const SuperAdminDashboard: React.FC<{profile: Profile | null}> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState<SuperAdminTab>('admins');
    const [searchQuery, setSearchQuery] = useState('');
    const [admins, setAdmins] = useState<(Profile & {email: string})[]>(initialAdmins);
    
    // CRUD Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<(Profile & {email: string}) | null>(null);
    const [adminForm, setAdminForm] = useState({ email: '', role: 'admin' as UserRole, approval_status: 'approved' as 'approved' | 'pending' });

    // Global System Configuration (Persistent via LocalStorage)
    const [activeSettingsView, setActiveSettingsView] = useState<'main' | 'operations' | 'analytics' | 'banking'>('main');
    
    const [systemConfig, setSystemConfig] = useState(() => {
        const defaultConfig = {
            deliveryConfig: { flatRate: 500, freeDeliveryThreshold: 50000 },
            bankDetails: { accountName: 'Kingzy Pharmaceuticals Ltd.', accountNumber: '0123456789', bankName: 'Zenith Bank Plc' },
            fuelAllowance: 45000,
            minWholesaleOrder: 50000,
            taxPercentage: 7.5,
            retailDiscount: 2.5,
            wholesaleDiscount: 10.0,
            platinumDiscount: 15.0,
        };
        const saved = localStorage.getItem('kingzy_system_config');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            // Deep merge to ensure new properties are added if they don't exist in localStorage
            return {
                ...defaultConfig,
                ...savedConfig,
                deliveryConfig: { ...defaultConfig.deliveryConfig, ...(savedConfig.deliveryConfig || {}) },
                bankDetails: { ...defaultConfig.bankDetails, ...(savedConfig.bankDetails || {}) },
            };
        }
        return defaultConfig;
    });

    const filteredAdmins = useMemo(() => {
        return admins.filter(a => a.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, admins]);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('kingzy_system_config', JSON.stringify(systemConfig));
        alert("Global Parameters Synchronized: Changes are now active for all Logistics and Checkout sessions.");
        setActiveSettingsView('main');
        window.dispatchEvent(new Event('storage'));
    };

    const handleOpenCreateModal = () => {
        setEditingAdmin(null);
        setAdminForm({ email: '', role: 'admin', approval_status: 'approved' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (admin: Profile & {email: string}) => {
        setEditingAdmin(admin);
        setAdminForm({ email: admin.email || '', role: admin.role, approval_status: admin.approval_status as 'approved' | 'pending' });
        setIsModalOpen(true);
    };

    const handleDeleteAdmin = (id: string) => {
        if (confirm("Revoke Access? This administrator will immediately lose access to all secure portals.")) {
            setAdmins(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAdmin) {
            setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? { ...a, email: adminForm.email, role: adminForm.role, approval_status: adminForm.approval_status as any } : a));
            alert("Administrative record updated.");
        } else {
            const newAdmin: Profile & {email: string} = {
                id: `admin-${Date.now()}`,
                email: adminForm.email,
                role: adminForm.role,
                approval_status: adminForm.approval_status as any,
                created_at: new Date().toISOString().split('T')[0],
                loyalty_discount_percentage: 0
            };
            setAdmins(prev => [...prev, newAdmin]);
            alert("New staff member onboarded successfully.");
        }
        setIsModalOpen(false);
    };
    
    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        const val = type === 'number' ? Number(value) : value;

        setSystemConfig((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = val;
            return newState;
        });
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'admins': return (
                 <div className="bg-white p-6 rounded-xl shadow-lg border animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-brand-dark">Administrator Access Control</h2>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="relative flex-grow"><input type="search" placeholder="Search admins..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary" /><SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /></div>
                            <button onClick={handleOpenCreateModal} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-secondary transition-all shadow-md">Add New Admin</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider"><tr><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Onboarded</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredAdmins.map(admin => (<tr key={admin.id} className="hover:bg-gray-50 text-sm">
                        <td className="p-4 font-semibold text-gray-800">{admin.email}</td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full font-bold text-xs ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{admin.role.replace('_', ' ')}</span></td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full font-bold text-xs ${admin.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{admin.approval_status}</span></td>
                        <td className="p-4 text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-4"><button onClick={() => handleOpenEditModal(admin)} className="font-bold text-brand-primary hover:underline">Edit</button><button onClick={() => handleDeleteAdmin(admin.id)} className="font-bold text-red-500 hover:underline">Revoke</button></td>
                    </tr>))}</tbody></table></div>
                </div>
            );
            case 'orders': return profile ? <AdminOrderManagement profile={profile} /> : null;
            case 'activity': return (
                <div className="bg-white p-6 rounded-xl shadow-lg border animate-fadeIn"><h2 className="text-xl font-bold text-brand-dark mb-6">Administrator Audit Ledger</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider"><tr><th className="p-4">Timestamp</th><th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4">Target/Details</th></tr></thead><tbody className="divide-y divide-gray-100">{mockActivities.map(act => (<tr key={act.id} className="hover:bg-gray-50 text-sm"><td className="p-4 text-gray-500">{act.timestamp}</td><td className="p-4 font-semibold text-gray-800">{act.adminEmail}</td><td className="p-4">{act.action}</td><td className="p-4 text-gray-600 font-mono text-xs">{act.target}</td></tr>))}</tbody></table></div></div>
            );
            case 'cms': return <CmsManagement setActiveTab={setActiveTab as any} />;
            case 'global_settings': return (
                 <div className="bg-white p-6 rounded-xl shadow-lg border animate-fadeIn">
                    <h2 className="text-xl font-bold text-brand-dark mb-6">Global System Parameters</h2>
                    
                    {activeSettingsView === 'main' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => setActiveSettingsView('operations')} className="group p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-primary hover:bg-white transition-all text-left space-y-2"><h3 className="text-lg font-bold text-brand-dark">Delivery & Operations</h3><p className="text-sm text-gray-500">Configure logistics fuel subsidy, delivery fees, and order thresholds.</p></button>
                            <button onClick={() => setActiveSettingsView('analytics')} className="group p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-primary hover:bg-white transition-all text-left space-y-2"><h3 className="text-lg font-bold text-brand-dark">Financials & Discounts</h3><p className="text-sm text-gray-500">Set system-wide tax rates and baseline customer loyalty discounts.</p></button>
                            <button onClick={() => setActiveSettingsView('banking')} className="group p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-primary hover:bg-white transition-all text-left space-y-2"><h3 className="text-lg font-bold text-brand-dark">Payment & Banking</h3><p className="text-sm text-gray-500">Manage company bank account details for customer payments.</p></button>
                        </div>
                    ) : (
                         <form onSubmit={handleSaveConfig} className="space-y-8">
                            {activeSettingsView === 'operations' && (
                                <fieldset className="p-6 border rounded-lg animate-fadeIn"><legend className="text-lg font-bold px-2">Delivery & Operations</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"><div><label className="font-semibold text-sm">Flat Rate Delivery Fee (₦)</label><input type="number" name="deliveryConfig.flatRate" value={systemConfig.deliveryConfig.flatRate} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Free Delivery Threshold (₦)</label><input type="number" name="deliveryConfig.freeDeliveryThreshold" value={systemConfig.deliveryConfig.freeDeliveryThreshold} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Logistics Fuel Allowance (₦)</label><input type="number" name="fuelAllowance" value={systemConfig.fuelAllowance} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Min. Wholesale Order (₦)</label><input type="number" name="minWholesaleOrder" value={systemConfig.minWholesaleOrder} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div></div></fieldset>
                            )}
                             {activeSettingsView === 'analytics' && (
                                <fieldset className="p-6 border rounded-lg animate-fadeIn"><legend className="text-lg font-bold px-2">Financials & Discounts</legend><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"><div><label className="font-semibold text-sm">System VAT (%)</label><input type="number" name="taxPercentage" value={systemConfig.taxPercentage} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Retail Loyalty Discount (%)</label><input type="number" name="retailDiscount" value={systemConfig.retailDiscount} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Wholesale Loyalty Discount (%)</label><input type="number" name="wholesaleDiscount" value={systemConfig.wholesaleDiscount} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm text-yellow-600">Platinum Cluster Discount (%)</label><input type="number" name="platinumDiscount" value={systemConfig.platinumDiscount} onChange={handleConfigChange} className="w-full mt-1 p-2 border-2 border-yellow-300 rounded-md" /></div></div></fieldset>
                            )}
                             {activeSettingsView === 'banking' && (
                                <fieldset className="p-6 border rounded-lg animate-fadeIn"><legend className="text-lg font-bold px-2">Payment & Banking</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"><div><label className="font-semibold text-sm">Bank Name</label><input type="text" name="bankDetails.bankName" value={systemConfig.bankDetails.bankName} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div><label className="font-semibold text-sm">Account Name</label><input type="text" name="bankDetails.accountName" value={systemConfig.bankDetails.accountName} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div><div className="md:col-span-2"><label className="font-semibold text-sm">Account Number</label><input type="text" name="bankDetails.accountNumber" value={systemConfig.bankDetails.accountNumber} onChange={handleConfigChange} className="w-full mt-1 p-2 border rounded-md" /></div></div></fieldset>
                            )}
                            <div className="flex justify-end gap-4"><button type="button" onClick={() => setActiveSettingsView('main')} className="font-bold py-2 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Back</button><button type="submit" className="font-bold py-2 px-6 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary shadow-md">Save Global Changes</button></div>
                        </form>
                    )}
                </div>
            )
        }
    }


    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark tracking-tighter uppercase">Super Admin Hub</h1>
                    <p className="text-gray-500 font-medium italic tracking-wide">Infrastructure Governance & Global Parameters</p>
                </div>
                <div className="bg-brand-dark text-white p-5 rounded-2xl flex items-center gap-4 border-r-4 border-brand-secondary shadow-lg">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                        <UserCircleIcon className="w-8 h-8 text-brand-secondary"/>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-black text-brand-secondary tracking-widest leading-none mb-1">Authority Level: ROOT</p>
                        <p className="font-semibold text-base">{profile?.email || 'admin@kingzy.com'}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 border-b-2 border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('admins')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'admins' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Admin Management</button>
                <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Orders</button>
                <button onClick={() => setActiveTab('cms')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'cms' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Content Management</button>
                <button onClick={() => setActiveTab('activity')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'activity' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Audit Ledger</button>
                <button onClick={() => setActiveTab('global_settings')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'global_settings' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Global Settings</button>
            </div>

            {renderContent()}

             {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scaleIn">
                        <form onSubmit={handleAdminSubmit}>
                            <div className="flex justify-between items-center p-4 border-b"><h3 className="text-xl font-semibold">{editingAdmin ? 'Edit Administrator' : 'Create Administrator'}</h3><button type="button" onClick={() => setIsModalOpen(false)}><XIcon className="w-6 h-6"/></button></div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-sm font-semibold">Email</label><input type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="text-sm font-semibold">Role</label><select value={adminForm.role} onChange={e => setAdminForm({...adminForm, role: e.target.value as UserRole})} className="w-full p-2 border rounded-md"><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></div>
                                <div><label className="text-sm font-semibold">Status</label><select value={adminForm.approval_status} onChange={e => setAdminForm({...adminForm, approval_status: e.target.value as 'approved' | 'pending'})} className="w-full p-2 border rounded-md"><option value="approved">Approved</option><option value="pending">Pending</option></select></div>
                                {!editingAdmin && <div><label className="text-sm font-semibold">Password</label><input type="password" placeholder="Set initial password" className="w-full p-2 border rounded-md" required /></div>}
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg"><button type="button" onClick={() => setIsModalOpen(false)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button><button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;