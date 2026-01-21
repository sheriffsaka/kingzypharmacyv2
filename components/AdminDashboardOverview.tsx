import React from 'react';

// Mock Data
const metrics = [
    { label: 'Pending Orders', value: 3, change: '+1 today' },
    { label: 'Pending Approvals', value: 2, change: '+2 today' },
    { label: 'Total Revenue (Today)', value: '₦450,500', change: '+15%' },
    { label: 'New Customers', value: 12, change: '+5 today' },
];

const activityLog = [
    { action: 'Payment confirmed for Order #105', user: 'admin@kingzy.com', time: '2m ago' },
    { action: 'New wholesale application from new.pharmacy@example.com', user: 'system', time: '15m ago' },
    { action: 'Order #103 assigned to logistics@kingzy.com', user: 'admin@kingzy.com', time: '45m ago' },
    { action: 'Stock status for "Ibuprofen" updated to in_stock', user: 'admin@kingzy.com', time: '1h ago' },
    { action: 'New order #105 placed by wholesale@kingzy.com', user: 'system', time: '2h ago' },
];

const AdminDashboardOverview: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map(metric => (
                    <div key={metric.label} className="bg-white p-6 rounded-lg shadow-md border">
                        <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                        <p className="text-3xl font-bold text-brand-dark mt-1">{metric.value}</p>
                        <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-xl font-semibold mb-4 text-brand-dark">Recent Activity</h3>
                <ul className="divide-y divide-gray-200">
                    {activityLog.map((log, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-800">{log.action}</p>
                                <p className="text-xs text-gray-500">by {log.user}</p>
                            </div>
                            <span className="text-xs text-gray-400">{log.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboardOverview;