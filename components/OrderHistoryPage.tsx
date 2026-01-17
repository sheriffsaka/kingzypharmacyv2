
import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { Order } from '../types';
import { getDocument } from '../services/documentService';

interface OrderHistoryPageProps {
  session: Session | null;
  onProductSelect: (productId: number) => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ session, onProductSelect }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

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
                    invoices ( id, invoice_number )
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

    const handleDownload = async (type: 'invoice' | 'receipt', docId: number, filename: string) => {
        const key = `${type}-${docId}`;
        setDownloading(prev => ({ ...prev, [key]: true }));
        try {
            const result = await getDocument(type, docId);
            if (result.downloadUrl) {
                // Create a temporary link to trigger the download
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


    const getStatusChip = (status: Order['status']) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'processing': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'shipped': return `${baseClasses} bg-green-100 text-green-800`;
            case 'delivered': return `${baseClasses} bg-green-200 text-green-900`;
            case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
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
                        const payment = order.payments?.find(p => p.payment_status === 'paid' || p.payment_status === 'pay_on_delivery');
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
                                        <span className={getStatusChip(order.status)}>{order.status}</span>
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
                                    {invoice && (
                                        <button 
                                            onClick={() => handleDownload('invoice', invoice.id, `${invoice.invoice_number}.pdf`)}
                                            disabled={downloading[`invoice-${invoice.id}`]}
                                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-primary/90 transition-colors disabled:bg-gray-400">
                                            {downloading[`invoice-${invoice.id}`] ? 'Generating...' : 'Download Invoice'}
                                        </button>
                                    )}
                                    {receipt && (
                                         <button
                                            onClick={() => handleDownload('receipt', receipt.id, `${receipt.receipt_number}.pdf`)}
                                            disabled={downloading[`receipt-${receipt.id}`]}
                                            className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400">
                                            {downloading[`receipt-${receipt.id}`] ? 'Generating...' : 'Download Receipt'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
