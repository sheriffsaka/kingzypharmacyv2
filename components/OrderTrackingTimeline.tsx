
import React from 'react';
import { OrderStatusHistory } from '../types';

interface OrderTrackingTimelineProps {
    history: OrderStatusHistory[];
}

const statusDescriptions: Record<string, string> = {
    ORDER_RECEIVED: "Your order has been received and is awaiting confirmation.",
    ORDER_ACKNOWLEDGED: "We have confirmed your order and payment.",
    PROCESSING: "Your order is being prepared for dispatch.",
    DISPATCHED: "Your order has left our facility.",
    IN_TRANSIT: "Your package is on its way to you.",
    DELIVERED: "Your order has been successfully delivered.",
    CANCELLED: "This order has been cancelled."
};

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return <p>No tracking history available yet.</p>;
    }

    // Sort history chronologically just in case
    const sortedHistory = [...history].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

    return (
        <div className="mt-4 border-t pt-4">
             <h3 className="text-lg font-semibold mb-4 text-brand-dark">Order History</h3>
             <ol className="relative border-l border-gray-200">
                {sortedHistory.map((item, index) => (
                     <li key={item.id} className="mb-6 ml-4">
                        <div className={`absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 border border-white ${index === sortedHistory.length - 1 ? 'bg-brand-primary' : 'bg-gray-400'}`}></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                            {new Date(item.updated_at).toLocaleString()}
                        </time>
                        <h4 className="text-md font-semibold text-gray-900 capitalize">{item.status.replace(/_/g, ' ').toLowerCase()}</h4>
                        <p className="text-sm font-normal text-gray-600">{statusDescriptions[item.status] || item.note}</p>
                     </li>
                ))}
             </ol>
        </div>
    );
};

export default OrderTrackingTimeline;
