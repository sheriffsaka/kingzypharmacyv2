import React, { useState } from 'react';

// Mock Data
const mockUsers = {
    wholesalers: [
        { id: 'wh-1', name: 'Chidi Okonkwo', email: 'wholesale@kingzy.com', company: 'GoodHealth Pharmacy', status: 'Active' },
        { id: 'wh-2', name: 'Fatima Bello', email: 'pending.wholesale@kingzy.com', company: 'QuickMeds Supplies', status: 'Pending Approval' },
    ],
    buyers: [
        { id: 'b-1', name: 'Bolanle Adeoye', email: 'buyer@kingzy.com', company: 'N/A', status: 'Active' },
    ],
    logistics: [
        { id: 'l-1', name: 'Logistics Staff', email: 'logistics@kingzy.com', company: 'N/A', status: 'Active' },
    ],
};

type UserTab = 'wholesalers' | 'buyers' | 'logistics';

const AdminUserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<UserTab>('wholesalers');

    const TabButton = ({ tab, label }: { tab: UserTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === tab ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    const renderTable = () => {
        const users = mockUsers[activeTab];
        if (users.length === 0) {
            return <p className="text-center text-gray-500 py-8">No users found in this category.</p>;
        }
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.company}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.status}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onClick={() => alert(`Editing user: ${user.name}`)} className="text-brand-primary hover:underline">Edit</button>
                                <button onClick={() => confirm(`Are you sure you want to delete ${user.name}?`) && alert(`${user.name} deleted.`)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-brand-dark">User Management</h3>
                <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                    <TabButton tab="wholesalers" label="Wholesalers" />
                    <TabButton tab="buyers" label="Buyers" />
                    <TabButton tab="logistics" label="Logistics" />
                </div>
            </div>
            <div className="overflow-x-auto">
                {renderTable()}
            </div>
        </div>
    );
};

export default AdminUserManagement;