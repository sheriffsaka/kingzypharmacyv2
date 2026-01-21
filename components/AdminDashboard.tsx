
import React from 'react';
import AdminUserApproval from './AdminUserApproval';
import AdminOrderManagement from './AdminOrderManagement';
import AdminInventoryManagement from './AdminInventoryManagement';

const AdminDashboard: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">Admin Dashboard</h1>

            {/* Inventory Management */}
             <div className="mb-8">
                <AdminInventoryManagement />
            </div>
            
            {/* User Approval Component */}
            <div className="mb-8">
                <AdminUserApproval />
            </div>

            {/* Order Management Component */}
            <div>
                <AdminOrderManagement />
            </div>
        </div>
    );
};

export default AdminDashboard;