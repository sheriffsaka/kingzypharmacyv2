import React, { useState, useMemo, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { UserCircleIcon, EyeIcon, SearchIcon, ClipboardCheckIcon, ShoppingCartIcon, XIcon, TrashIcon } from './Icons';
import AdminOrderManagement from './AdminOrderManagement';

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

const SuperAdminDashboard: React.FC<{profile: Profile | null}> = ({ profile }) => {
    const [activeTab, setActiveTab] = useState<'admins' | 'orders' | 'activity' | 'global_settings'>('admins');
    const [searchQuery, setSearchQuery] = useState('');
    const [admins, setAdmins] = useState<(Profile & {email: string})[]>(initialAdmins);
    
    // CRUD Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<(Profile & {email: string}) | null>(null);
    const [adminForm, setAdminForm] = useState({ email: '', role: 'admin' as UserRole, approval_status: 'approved' as 'approved' | 'pending' });

    // Global System Configuration (Persistent via LocalStorage)
    const [activeSettingsView, setActiveSettingsView] = useState<'main' | 'operations' | 'analytics'>('main');
    const [systemConfig, setSystemConfig] = useState(() => {
        const saved = localStorage.getItem('kingzy_system_config');
        return saved ? JSON.parse(saved) : {
            deliveryFee: 500,
            fuelAllowance: 45000,
            minWholesaleOrder: 50000,
            taxPercentage: 7.5,
            retailDiscount: 2.5,
            wholesaleDiscount: 10.0,
            platinumDiscount: 15.0
        };
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
                <button onClick={() => setActiveTab('activity')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'activity' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Audit Ledger</button>
                <button onClick={() => setActiveTab('global_settings')} className={`whitespace-nowrap pb-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === 'global_settings' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}>Global Settings</button>
            </div>

            {activeTab === 'admins' && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                        <h2 className="text-xl font-bold text-brand-dark uppercase tracking-wider">Manage Admin Accounts</h2>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <input type="text" placeholder="Filter by user email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-primary transition-all text-sm font-medium shadow-inner" />
                                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <button onClick={handleOpenCreateModal} className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-brand-secondary transition-all shadow-md">+ Add Admin</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                                <tr>
                                    <th className="py-4 px-6">Identity</th>
                                    <th className="py-4 px-6">Access Level</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAdmins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-50 group transition-colors">
                                        <td className="py-4 px-6 font-semibold text-brand-dark">{admin.email}</td>
                                        <td className="py-4 px-6"><span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">{admin.role.replace('_', ' ')}</span></td>
                                        <td className="py-4 px-6"><span className={`text-xs font-bold uppercase tracking-wider ${admin.approval_status === 'approved' ? 'text-accent-green' : 'text-red-500'}`}>● {admin.approval_status}</span></td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleOpenEditModal(admin)} className="p-2 bg-gray-100 text-gray-600 hover:bg-brand-primary hover:text-white rounded-lg transition-all shadow-sm"><EyeIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDeleteAdmin(admin.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'global_settings' && (
                <div className="space-y-8 animate-fadeIn">
                    {activeSettingsView === 'main' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-lg hover:border-brand-primary transition-all cursor-pointer group" onClick={() => setActiveSettingsView('operations')}>
                                <div className="bg-brand-primary text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform font-black text-2xl">₦</div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-3 uppercase tracking-wider">Operational Constants</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">Modify delivery overheads, staff fuel subsidies, and commercial order minimums.</p>
                                <button className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-brand-secondary shadow-md transition-all">Configure Parameters</button>
                            </div>
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-lg hover:border-brand-primary transition-all cursor-pointer group" onClick={() => setActiveSettingsView('analytics')}>
                                <div className="bg-brand-dark text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform font-black text-2xl">📈</div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-3 uppercase tracking-wider">Market Intelligence</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">Analyze transaction density, fulfillment speeds, and category revenue performance.</p>
                                <button className="w-full bg-brand-dark text-white py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black shadow-md transition-all">Review Insights</button>
                            </div>
                        </div>
                    )}

                    {activeSettingsView === 'operations' && (
                        <div className="bg-white p-10 rounded-2xl border shadow-xl max-w-5xl mx-auto animate-scaleIn relative overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-brand-dark uppercase tracking-wider">Global Parameters</h3>
                                    <p className="text-gray-500 font-medium text-sm mt-1">Adjust system-wide operational constants</p>
                                </div>
                                <button onClick={() => setActiveSettingsView('main')} className="bg-gray-100 p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-all shadow-sm"><XIcon className="w-6 h-6"/></button>
                            </div>
                            <form onSubmit={handleSaveConfig} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {/* Logistics */}
                                    <div className="space-y-6 lg:col-span-1">
                                        <h4 className="text-xs font-bold uppercase text-brand-primary tracking-widest border-b-2 border-brand-primary/20 pb-2">Logistics</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Delivery Fee (Retail)</label>
                                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-brand-primary">₦</span><input type="number" value={systemConfig.deliveryFee} onChange={e => setSystemConfig({...systemConfig, deliveryFee: Number(e.target.value)})} className="w-full p-3 pl-8 border border-gray-200 rounded-lg outline-none focus:border-brand-primary font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Staff Petrol Allowance</label>
                                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-brand-primary">₦</span><input type="number" value={systemConfig.fuelAllowance} onChange={e => setSystemConfig({...systemConfig, fuelAllowance: Number(e.target.value)})} className="w-full p-3 pl-8 border border-gray-200 rounded-lg outline-none focus:border-brand-primary font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                    </div>
                                    {/* Commercial */}
                                    <div className="space-y-6 lg:col-span-1">
                                        <h4 className="text-xs font-bold uppercase text-brand-secondary tracking-widest border-b-2 border-brand-secondary/20 pb-2">Commercial</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Min. Wholesale Value</label>
                                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-brand-secondary">₦</span><input type="number" value={systemConfig.minWholesaleOrder} onChange={e => setSystemConfig({...systemConfig, minWholesaleOrder: Number(e.target.value)})} className="w-full p-3 pl-8 border border-gray-200 rounded-lg outline-none focus:border-brand-secondary font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sales VAT (%)</label>
                                            <div className="relative"><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-brand-secondary">%</span><input type="number" step="0.1" value={systemConfig.taxPercentage} onChange={e => setSystemConfig({...systemConfig, taxPercentage: Number(e.target.value)})} className="w-full p-3 pr-8 border border-gray-200 rounded-lg outline-none focus:border-brand-secondary font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                    </div>
                                    {/* Discounts */}
                                    <div className="space-y-6 lg:col-span-1">
                                        <h4 className="text-xs font-bold uppercase text-accent-green tracking-widest border-b-2 border-accent-green/20 pb-2">Loyalty Discounts</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Retail Buyer (%)</label>
                                            <div className="relative"><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-accent-green">%</span><input type="number" step="0.1" value={systemConfig.retailDiscount} onChange={e => setSystemConfig({...systemConfig, retailDiscount: Number(e.target.value)})} className="w-full p-3 pr-8 border border-gray-200 rounded-lg outline-none focus:border-accent-green font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Wholesale Buyer (%)</label>
                                            <div className="relative"><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-accent-green">%</span><input type="number" step="0.1" value={systemConfig.wholesaleDiscount} onChange={e => setSystemConfig({...systemConfig, wholesaleDiscount: Number(e.target.value)})} className="w-full p-3 pr-8 border border-gray-200 rounded-lg outline-none focus:border-accent-green font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                         <div className="p-4 bg-gray-50 rounded-lg border shadow-inner">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Platinum Member (%)</label>
                                            <div className="relative"><span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-accent-green">%</span><input type="number" step="0.1" value={systemConfig.platinumDiscount} onChange={e => setSystemConfig({...systemConfig, platinumDiscount: Number(e.target.value)})} className="w-full p-3 pr-8 border border-gray-200 rounded-lg outline-none focus:border-accent-green font-bold text-xl bg-white shadow-sm"/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-6 border-t mt-6">
                                    <button type="button" onClick={() => setActiveSettingsView('main')} className="flex-1 py-3 bg-gray-100 font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-colors shadow-sm">Discard</button>
                                    <button type="submit" className="flex-2 py-3 bg-brand-primary text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-brand-secondary shadow-lg transition-all transform hover:-translate-y-1">Save & Sync</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'orders' && profile && (<div className="animate-fadeIn"><AdminOrderManagement profile={profile} /></div>)}
            {activeTab === 'activity' && (<div className="bg-white rounded-lg shadow-lg border p-8 animate-fadeIn"><h2 className="text-xl font-bold text-brand-dark mb-6">Platform Integrity Log</h2><div className="space-y-3">{mockActivities.map(activity => (<div key={activity.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"><div className="flex gap-4 items-center"><div className="w-2 h-2 bg-brand-primary rounded-full"></div><div><p className="font-semibold text-sm text-brand-dark">{activity.action}</p><p className="text-xs text-gray-500">By: <span className="font-medium text-brand-primary">{activity.adminEmail}</span></p></div></div><div className="text-right"><p className="text-sm font-semibold text-gray-800">{activity.target}</p><p className="text-xs text-gray-400">{activity.timestamp}</p></div></div>))}</div></div>)}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scaleIn">
                        <form onSubmit={handleAdminSubmit}>
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-lg font-bold text-brand-dark">{editingAdmin ? 'Edit Admin Account' : 'Create New Admin'}</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)}><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-700"/></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-sm font-semibold text-gray-600">Email Address</label><input type="email" required value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"/></div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Role</label>
                                    <select required value={adminForm.role} onChange={(e) => setAdminForm({...adminForm, role: e.target.value as UserRole})} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="logistics">Logistics</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Status</label>
                                    <select required value={adminForm.approval_status} onChange={(e) => setAdminForm({...adminForm, approval_status: e.target.value as 'approved' | 'pending'})} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary">{editingAdmin ? 'Save Changes' : 'Create Admin'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
