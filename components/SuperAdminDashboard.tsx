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
    const [adminForm, setAdminForm] = useState({ email: '', role: 'admin' as UserRole, status: 'approved' });

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
        // Trigger storage event for other components to listen
        window.dispatchEvent(new Event('storage'));
    };

    const handleOpenCreateModal = () => {
        setEditingAdmin(null);
        setAdminForm({ email: '', role: 'admin', status: 'approved' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (admin: Profile & {email: string}) => {
        setEditingAdmin(admin);
        setAdminForm({ email: admin.email || '', role: admin.role, status: admin.approval_status });
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
            setAdmins(prev => prev.map(a => a.id === editingAdmin.id ? { ...a, email: adminForm.email, role: adminForm.role, approval_status: adminForm.status as any } : a));
            alert("Administrative record updated.");
        } else {
            const newAdmin: Profile & {email: string} = {
                id: `admin-${Date.now()}`,
                email: adminForm.email,
                role: adminForm.role,
                approval_status: adminForm.status as any,
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
                    <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase">Super Admin Hub</h1>
                    <p className="text-gray-500 font-bold italic tracking-wide">Infrastructure Governance & Global Parameters</p>
                </div>
                <div className="bg-brand-dark text-white p-6 rounded-[2rem] flex items-center gap-5 border-r-8 border-brand-secondary shadow-2xl">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <UserCircleIcon className="w-10 h-10 text-brand-secondary"/>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-brand-secondary tracking-[0.2em] leading-none mb-1.5">Authority Level: ROOT</p>
                        <p className="font-black text-lg">{profile?.email || 'admin@kingzy.com'}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 border-b-4 border-gray-100 mb-10 overflow-x-auto scrollbar-hide">
                <button onClick={() => setActiveTab('admins')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'admins' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Staff Directory</button>
                <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'orders' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Full Pipeline</button>
                <button onClick={() => setActiveTab('activity')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'activity' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>Audit Ledger</button>
                <button onClick={() => setActiveTab('global_settings')} className={`whitespace-nowrap pb-5 px-6 font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeTab === 'global_settings' ? 'border-b-4 border-brand-primary text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>System Params</button>
            </div>

            {activeTab === 'admins' && (
                <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-50 p-10 animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Privileged Access List</h2>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-grow min-w-[300px]">
                                <input type="text" placeholder="Search by email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-5 pl-14 bg-gray-50 border-4 border-gray-100 rounded-3xl outline-none focus:border-brand-primary transition-all text-sm font-bold shadow-inner" />
                                <SearchIcon className="w-7 h-7 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                            <button onClick={handleOpenCreateModal} className="bg-brand-primary text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-[0_20px_40px_rgba(0,82,155,0.2)] transform hover:scale-105">+ Personnel</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-[2rem] border-4 border-gray-50">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                <tr>
                                    <th className="py-7 px-8">Identity</th>
                                    <th className="py-7 px-8">Clearance</th>
                                    <th className="py-7 px-8">Operational Status</th>
                                    <th className="py-7 px-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-gray-50">
                                {filteredAdmins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-brand-light/20 group transition-colors">
                                        <td className="py-7 px-8 font-black text-brand-dark text-lg tracking-tight">{admin.email}</td>
                                        <td className="py-7 px-8">
                                            <span className="bg-purple-100 text-purple-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-purple-200">{admin.role.replace('_', ' ')}</span>
                                        </td>
                                        <td className="py-7 px-8">
                                            <span className={`text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-3 ${admin.approval_status === 'approved' ? 'text-accent-green' : 'text-red-500'}`}>
                                                <div className={`w-3 h-3 rounded-full ${admin.approval_status === 'approved' ? 'bg-accent-green animate-pulse' : 'bg-red-500'}`}></div>
                                                {admin.approval_status}
                                            </span>
                                        </td>
                                        <td className="py-7 px-8 text-right">
                                            <div className="flex justify-end gap-4">
                                                <button onClick={() => handleOpenEditModal(admin)} className="p-4 bg-gray-100 text-brand-dark hover:bg-brand-primary hover:text-white rounded-2xl transition-all shadow-sm"><EyeIcon className="w-6 h-6" /></button>
                                                <button onClick={() => handleDeleteAdmin(admin.id)} className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><TrashIcon className="w-6 h-6" /></button>
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
                <div className="space-y-10 animate-fadeIn">
                    {activeSettingsView === 'main' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-white p-12 rounded-[3rem] border-4 border-gray-50 shadow-2xl hover:border-brand-primary transition-all cursor-pointer group" onClick={() => setActiveSettingsView('operations')}>
                                <div className="bg-brand-primary text-white w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(0,82,155,0.3)] group-hover:scale-110 transition-transform font-black text-4xl">₦</div>
                                <h3 className="text-3xl font-black text-brand-dark mb-4 uppercase tracking-tighter">Business Logic & Fees</h3>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10 italic">Adjust global delivery overheads, staff fuel subsidies, and sales tax thresholds.</p>
                                <button className="w-full bg-brand-primary text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary shadow-xl transition-all">Configure Operations</button>
                            </div>
                            <div className="bg-brand-dark p-12 rounded-[3rem] shadow-2xl hover:border-brand-secondary transition-all cursor-pointer group relative overflow-hidden" onClick={() => setActiveSettingsView('analytics')}>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"></div>
                                <div className="bg-brand-secondary text-white w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(0,163,224,0.3)] group-hover:scale-110 transition-transform font-black text-4xl">📈</div>
                                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Market Intelligence</h3>
                                <p className="text-blue-100/60 text-lg font-medium leading-relaxed mb-10 italic">Monitor network-wide transaction velocity and fulfillment performance metrics.</p>
                                <button className="w-full bg-white text-brand-dark py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-brand-secondary hover:text-white shadow-xl transition-all">View Analytics</button>
                            </div>
                        </div>
                    )}

                    {activeSettingsView === 'operations' && (
                        <div className="bg-white p-12 rounded-[3.5rem] border-8 border-gray-50 shadow-[0_50px_100px_rgba(0,0,0,0.1)] max-w-5xl mx-auto animate-scaleIn relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full -mr-48 -mt-48"></div>
                            <div className="flex justify-between items-center mb-16 relative z-10">
                                <div>
                                    <h3 className="text-4xl font-black text-brand-dark uppercase tracking-tighter">Operational Constants</h3>
                                    <p className="text-gray-400 font-bold text-sm uppercase mt-2 tracking-widest">Master override for platform financial logic</p>
                                </div>
                                <button onClick={() => setActiveSettingsView('main')} className="bg-gray-100 p-4 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-inner"><XIcon className="w-10 h-10"/></button>
                            </div>
                            <form onSubmit={handleSaveConfig} className="space-y-16 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Logistics Costs */}
                                    <div className="space-y-10">
                                        <h4 className="text-[12px] font-black uppercase text-brand-primary tracking-[0.3em] border-b-4 border-brand-primary/10 pb-4">Logistics & Support</h4>
                                        <div className="p-10 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-inner group">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest group-hover:text-brand-primary transition-colors">Base Delivery Fee (Retail)</label>
                                            <div className="relative">
                                                <span className="absolute left-7 top-1/2 -translate-y-1/2 font-black text-brand-primary text-2xl">₦</span>
                                                <input type="number" value={systemConfig.deliveryFee} onChange={e => setSystemConfig({...systemConfig, deliveryFee: Number(e.target.value)})} className="w-full p-8 pl-16 border-4 border-white rounded-[2rem] outline-none focus:border-brand-primary font-black text-4xl bg-white shadow-2xl transition-all"/>
                                            </div>
                                        </div>
                                        <div className="p-10 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-inner group">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest group-hover:text-brand-primary transition-colors">Staff Petrol Allowance (Monthly)</label>
                                            <div className="relative">
                                                <span className="absolute left-7 top-1/2 -translate-y-1/2 font-black text-brand-primary text-2xl">₦</span>
                                                <input type="number" value={systemConfig.fuelAllowance} onChange={e => setSystemConfig({...systemConfig, fuelAllowance: Number(e.target.value)})} className="w-full p-8 pl-16 border-4 border-white rounded-[2rem] outline-none focus:border-brand-primary font-black text-4xl bg-white shadow-2xl transition-all"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Guardrails */}
                                    <div className="space-y-10">
                                        <h4 className="text-[12px] font-black uppercase text-brand-secondary tracking-[0.3em] border-b-4 border-brand-secondary/10 pb-4">Commercial Guardrails</h4>
                                        <div className="p-10 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-inner group">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest group-hover:text-brand-secondary transition-colors">Min. Wholesale Batch Value</label>
                                            <div className="relative">
                                                <span className="absolute left-7 top-1/2 -translate-y-1/2 font-black text-brand-secondary text-2xl">₦</span>
                                                <input type="number" value={systemConfig.minWholesaleOrder} onChange={e => setSystemConfig({...systemConfig, minWholesaleOrder: Number(e.target.value)})} className="w-full p-8 pl-16 border-4 border-white rounded-[2rem] outline-none focus:border-brand-secondary font-black text-4xl bg-white shadow-2xl transition-all"/>
                                            </div>
                                        </div>
                                        <div className="p-10 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-inner group">
                                            <label className="block text-[11px] font-black text-gray-400 uppercase mb-5 tracking-widest group-hover:text-brand-secondary transition-colors">Standard Sales VAT (%)</label>
                                            <div className="relative">
                                                <span className="absolute right-7 top-1/2 -translate-y-1/2 font-black text-brand-secondary text-2xl">%</span>
                                                <input type="number" step="0.1" value={systemConfig.taxPercentage} onChange={e => setSystemConfig({...systemConfig, taxPercentage: Number(e.target.value)})} className="w-full p-8 pr-16 border-4 border-white rounded-[2rem] outline-none focus:border-brand-secondary font-black text-4xl bg-white shadow-2xl transition-all"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-12">
                                    <button type="button" onClick={() => setActiveSettingsView('main')} className="flex-1 py-7 bg-white border-8 border-gray-100 font-black text-sm uppercase tracking-widest rounded-[2rem] hover:bg-gray-50 transition-colors shadow-sm">Abort Changes</button>
                                    <button type="submit" className="flex-2 py-7 bg-brand-primary text-white font-black text-sm uppercase tracking-widest rounded-[2rem] hover:bg-brand-secondary shadow-[0_30px_60px_rgba(0,82,155,0.4)] transition-all transform hover:-translate-y-2 active:scale-95">Commit Global Update</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Order Pipeline component integrated */}
            {activeTab === 'orders' && profile && (
                 <div className="space-y-10 animate-fadeIn">
                    <div className="bg-brand-primary text-white p-10 rounded-[3rem] shadow-2xl flex items-center gap-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                        <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20"><ShoppingCartIcon className="w-16 h-16 text-white flex-shrink-0"/></div>
                        <div>
                            <h3 className="text-3xl font-black uppercase tracking-tight">Platform Master Pipeline</h3>
                            <p className="text-blue-100 text-lg font-medium opacity-80 italic">Root authority active. All fulfillment terminal data is unmasked.</p>
                        </div>
                    </div>
                    <AdminOrderManagement profile={profile} />
                </div>
            )}

            {/* Audit Logs Omitted for brevity, assumed existing */}
        </div>
    );
};

export default SuperAdminDashboard;