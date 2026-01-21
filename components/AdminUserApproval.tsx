import React, { useState } from 'react';
import { Profile } from '../types';
import { EyeIcon, XIcon } from './Icons';

interface PendingBuyerDetails extends Profile {
    email: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    shippingAddress: string;
    idType: string;
}

// --- MOCK DATA FOR PRESENTATION ---
const mockPendingBuyers: PendingBuyerDetails[] = [
    { id: '00000000-0000-0000-0000-000000000004', email: 'pending.wholesale@kingzy.com', role: 'wholesale_buyer', approval_status: 'pending', created_at: new Date().toISOString(), loyalty_discount_percentage: 0, companyName: 'QuickMeds Supplies', contactPerson: 'Fatima Bello', phone: '08098765432', shippingAddress: '789 Business Rd, Abuja, FCT', idType: 'CAC Document' },
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', email: 'new.pharmacy@example.com', role: 'wholesale_buyer', approval_status: 'pending', created_at: new Date().toISOString(), loyalty_discount_percentage: 0, companyName: 'New Health Pharmacy', contactPerson: 'David Adekunle', phone: '07011223344', shippingAddress: '456 Wellness Ave, Port Harcourt, Rivers', idType: 'Pharmacist License' },
];
// ------------------------------------

type ApprovalTab = 'wholesaler' | 'buyer';

const AdminUserApproval: React.FC = () => {
    const [pendingBuyers, setPendingBuyers] = useState<PendingBuyerDetails[]>(mockPendingBuyers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<PendingBuyerDetails | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState<ApprovalTab>('wholesaler');


    const handleApprove = async (userId: string) => {
        setMessage(null);
        const approvedUser = pendingBuyers.find(b => b.id === userId);
        setMessage(`User ${approvedUser?.email} approved successfully.`);
        setPendingBuyers(prev => prev.filter(buyer => buyer.id !== userId));
        setSelectedUser(null);
    };

    const handleReject = async (userId: string) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        setMessage(null);
        const rejectedUser = pendingBuyers.find(b => b.id === userId);
        // In a real app, you'd update the user's status to 'rejected' in the DB.
        setMessage(`User ${rejectedUser?.email} has been rejected. Reason: ${rejectionReason}`);
        setPendingBuyers(prev => prev.filter(buyer => buyer.id !== userId));
        setSelectedUser(null);
        setRejectionReason('');
    };
    
    const handleViewDetails = (user: PendingBuyerDetails) => {
        setRejectionReason('');
        setSelectedUser(user);
    };

    const TabButton = ({ tab, label }: { tab: ApprovalTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === tab ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    const renderWholesalerApprovals = () => (
        <>
            {loading && <p>Loading pending approvals...</p>}
            {error && <p className="text-red-500 font-semibold bg-red-100 p-3 rounded-md">{error}</p>}
            
            {!loading && !error && (
                <div className="space-y-4">
                    {pendingBuyers.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingBuyers.map(buyer => (
                                <li key={buyer.id} className="py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-800">{buyer.email}</p>
                                        <p className="text-sm text-gray-500">Company: {buyer.companyName}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleViewDetails(buyer)}
                                        className="bg-gray-200 text-brand-dark font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                                    >
                                        <EyeIcon className="w-5 h-5"/>
                                        View Details
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No pending wholesale approvals at this time.</p>
                    )}
                </div>
            )}
        </>
    );
    
    const renderBuyerApprovals = () => (
        <div className="text-center text-gray-500 py-8">
            <p>Buyer approval workflow is not required for this role.</p>
            <p className="text-sm">All 'general_public' users are auto-approved on signup.</p>
        </div>
    );

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-semibold">User Approval Queues</h2>
                      <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                        <TabButton tab="wholesaler" label="Wholesaler Approval" />
                        <TabButton tab="buyer" label="Buyer Approval" />
                    </div>
                </div>
                {message && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{message}</p>}
                
                {activeTab === 'wholesaler' ? renderWholesalerApprovals() : renderBuyerApprovals()}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">Wholesaler Application</h3>
                            <button onClick={() => setSelectedUser(null)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div><h4 className="text-sm font-semibold text-gray-500">Company Name</h4><p>{selectedUser.companyName}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Contact Person</h4><p>{selectedUser.contactPerson}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Email</h4><p>{selectedUser.email}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Phone</h4><p>{selectedUser.phone}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Shipping Address</h4><p>{selectedUser.shippingAddress}</p></div>
                             <div><h4 className="text-sm font-semibold text-gray-500">ID Document Type</h4><p>{selectedUser.idType}</p></div>
                              <div><h4 className="text-sm font-semibold text-gray-500">Uploaded Document</h4><a href="#" className="text-brand-primary underline">view_document.pdf</a></div>
                            <div className="border-t pt-4">
                                <label htmlFor="rejectionReason" className="text-sm font-semibold text-gray-500">Rejection Reason (if rejecting)</label>
                                <textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-2 border rounded-md mt-1"
                                    placeholder="e.g., Invalid ID document provided."
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                            <button onClick={() => handleReject(selectedUser.id)} disabled={!rejectionReason.trim()} className="font-bold py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400">Reject</button>
                            <button onClick={() => handleApprove(selectedUser.id)} className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Approve Account</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUserApproval;