import React, { useState } from 'react';
import { XIcon } from './Icons';

// Mock Data
const initialMockUsers = {
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
type ManagedUser = {
    id: string;
    name: string;
    email: string;
    company: string;
    status: string;
}

const AdminUserManagement: React.FC = () => {
    const [usersData, setUsersData] = useState(initialMockUsers);
    const [activeTab, setActiveTab] = useState<UserTab>('wholesalers');
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [formState, setFormState] = useState<ManagedUser | null>(null);

    const handleEditClick = (user: ManagedUser) => {
        setEditingUser(user);
        setFormState(user);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormState(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (formState) {
            setFormState({ ...formState, [e.target.name]: e.target.value });
        }
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState || !editingUser) return;
        
        setUsersData(prevData => {
            const updatedUsers = [...prevData[activeTab]].map(user => 
                user.id === editingUser.id ? formState : user
            );
            return { ...prevData, [activeTab]: updatedUsers };
        });
        
        alert(`User ${formState.name} updated successfully.`);
        handleCancelEdit();
    };

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
        const users = usersData[activeTab];
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
                                <button onClick={() => handleEditClick(user)} className="text-brand-primary hover:underline">Edit</button>
                                <button onClick={() => confirm(`Are you sure you want to delete ${user.name}?`) && alert(`${user.name} deleted.`)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <>
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

            {editingUser && formState && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleSaveChanges}>
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold">Edit User: {editingUser.name}</h3>
                                <button type="button" onClick={handleCancelEdit}><XIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div><label className="text-sm font-semibold">Full Name</label><input name="name" value={formState.name} onChange={handleInputChange} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Email</label><input name="email" type="email" value={formState.email} onChange={handleInputChange} className="w-full p-2 border rounded-md"/></div>
                                {activeTab === 'wholesalers' && (
                                     <div><label className="text-sm font-semibold">Company</label><input name="company" value={formState.company} onChange={handleInputChange} className="w-full p-2 border rounded-md"/></div>
                                )}
                                <div>
                                    <label className="text-sm font-semibold">Status</label>
                                    <select name="status" value={formState.status} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                                        <option>Active</option>
                                        <option>Pending Approval</option>
                                        <option>Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                                <button type="button" onClick={handleCancelEdit} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUserManagement;