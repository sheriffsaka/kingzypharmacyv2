
import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { Order, OrderStatus } from '../types';
import { getDocument } from '../services/documentService';
import OrderTrackingTimeline from './OrderTrackingTimeline';

interface OrderHistoryPageProps {
  session: Session | null;
  onProductSelect: (productId: number) => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ session, onProductSelect }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items ( *, products ( name, dosage, image_url ) ),
                    payments ( *, receipts ( id, receipt_number ) ),
                    invoices ( id, invoice_number ),
                    order_status_history ( * )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data as Order[]);
        } catch (err: any) {
            setError(`Failed to fetch orders: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleToggleTrack = (orderId: number) => {
        setExpandedOrder(prev => (prev === orderId ? null : orderId));
    };

    const handleDownload = async (type: 'invoice' | 'receipt', docId: number, filename: string) => {
        const key = `${type}-${docId}`;
        setDownloading(prev => ({ ...prev, [key]: true }));
        try {
            const result = await getDocument(type, docId);
            if (result.downloadUrl) {
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(result.error || 'Unknown error occurred.');
            }
        } catch (err: any) {
            alert(`Failed to download document: ${err.message}`);
        } finally {
            setDownloading(prev => ({ ...prev, [key]: false }));
        }
    };


    const getStatusChip = (status: OrderStatus) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
        const statusText = status.replace(/_/g, ' ').toLowerCase();
        switch (status) {
            case 'ORDER_RECEIVED': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{statusText}</span>;
            case 'ORDER_ACKNOWLEDGED': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{statusText}</span>;
            case 'PROCESSING': return <span className={`${baseClasses} bg-blue-200 text-blue-900`}>{statusText}</span>;
            case 'DISPATCHED': return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>{statusText}</span>;
            case 'IN_TRANSIT': return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{statusText}</span>;
            case 'DELIVERED': return <span className={`${baseClasses} bg-green-100 text-green-800`}>{statusText}</span>;
            case 'CANCELLED': return <span className={`${baseClasses} bg-red-100 text-red-800`}>{statusText}</span>;
            default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{statusText}</span>;
        }
    };

    if (loading) return <p className="text-center py-12">Loading your order history...</p>;
    if (error) return <p className="text-center py-12 text-red-500">{error}</p>;
    if (!session) return <p className="text-center py-12">Please log in to view your orders.</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-brand-dark mb-6">My Orders</h1>
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-600">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const invoice = order.invoices?.[0];
                        // Fixed: Removed comparison to 'pay_on_delivery' as it is no longer a valid PaymentStatus
                        const payment = order.payments?.find(p => p.payment_status === 'paid');
                        const receipt = payment?.receipts?.[0];
                        
                        return (
                            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                                        <p className="text-sm text-gray-500">
                                            Placed on: {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusChip(order.status)}
                                        <span className="text-lg font-bold">₦{order.total_price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Items:</h3>
                                    {order.order_items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 py-2 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => onProductSelect(item.product_id)}>
                                            <img src={item.products?.image_url} alt={item.products?.name} className="w-16 h-16 object-cover rounded-md" />
                                            <div>
                                                <p className="font-semibold">{item.products?.name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                 <div className="border-t pt-4 mt-4 flex flex-wrap gap-4">
                                    <button onClick={() => handleToggleTrack(order.id)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300 transition-colors">
                                      {expandedOrder === order.id ? 'Hide Tracking' : 'Track Order'}
                                    </button>
                                    {invoice && (
                                        <button 
                                            onClick={() => handleDownload('invoice', invoice.id, `${invoice.invoice_number}.pdf`)}
                                            disabled={downloading[`invoice-${invoice.id}`]}
                                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-gray-400">
                                            {downloading[`invoice-${invoice.id}`] ? 'Generating...' : 'Download Invoice'}
                                        </button>
                                    )}
                                    {receipt && (
                                         <button
                                            onClick={() => handleDownload('receipt', receipt.id, `${receipt.receipt_number}.pdf`)}
                                            disabled={downloading[`receipt-${receipt.id}`]}
                                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-gray-400">
                                            {downloading[`receipt-${receipt.id}`] ? 'Generating...' : 'Download Receipt'}
                                        </button>
                                    )}
                                </div>
                                {expandedOrder === order.id && <OrderTrackingTimeline history={order.order_status_history || []} />}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
