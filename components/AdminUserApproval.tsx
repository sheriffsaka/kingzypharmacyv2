
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

const AdminUserApproval: React.FC = () => {
    const [pendingBuyers, setPendingBuyers] = useState<PendingBuyerDetails[]>(mockPendingBuyers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<PendingBuyerDetails | null>(null);

    const handleApprove = async (userId: string) => {
        setMessage(null);
        const approvedUser = pendingBuyers.find(b => b.id === userId);
        setMessage(`User ${approvedUser?.email} approved successfully.`);
        setPendingBuyers(prev => prev.filter(buyer => buyer.id !== userId));
        setSelectedUser(null); // Close modal on success
    };
    
    const handleViewDetails = (user: PendingBuyerDetails) => {
        setSelectedUser(user);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Wholesale Buyer Approval</h2>
                {loading && <p>Loading pending approvals...</p>}
                {error && <p className="text-red-500 font-semibold bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{message}</p>}
                
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
                            <p>No pending approvals at this time.</p>
                        )}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">Wholesaler Application</h3>
                            <button onClick={() => setSelectedUser(null)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><h4 className="text-sm font-semibold text-gray-500">Company Name</h4><p>{selectedUser.companyName}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Contact Person</h4><p>{selectedUser.contactPerson}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Email</h4><p>{selectedUser.email}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Phone</h4><p>{selectedUser.phone}</p></div>
                            <div><h4 className="text-sm font-semibold text-gray-500">Shipping Address</h4><p>{selectedUser.shippingAddress}</p></div>
                             <div><h4 className="text-sm font-semibold text-gray-500">ID Document Type</h4><p>{selectedUser.idType}</p></div>
                              <div><h4 className="text-sm font-semibold text-gray-500">Uploaded Document</h4><a href="#" className="text-brand-primary underline">view_document.pdf</a></div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                            <button onClick={() => setSelectedUser(null)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Close</button>
                            <button onClick={() => handleApprove(selectedUser.id)} className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Approve Account</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUserApproval;
