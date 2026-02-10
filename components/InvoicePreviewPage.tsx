import React, { useState, useEffect } from 'react';
import { View, Order, OrderItem, Product } from '../types';
import { getDocument } from '../services/documentService';

// --- MOCK DATA FOR PRESENTATION ---
// This mock function simulates fetching a complete order object by its ID
const fetchMockOrder = async (orderId: number): Promise<Order | null> => {
    // In a real app, this would be a Supabase call.
    // Here we'll just create a detailed mock order.
    console.log(`Fetching mock data for order #${orderId}`);
    await new Promise(res => setTimeout(res, 300)); // Simulate network latency

    if (orderId === 0) return null; // Simulate not found

    return {
        id: orderId,
        user_id: '00000000-0000-0000-0000-000000000003', // Mock wholesaler user ID
        created_at: new Date().toISOString(),
        status: 'ORDER_RECEIVED',
        total_price: 247500.00,
        discount_applied: 27500.00,
        delivery_address: {
            fullName: 'Chidi Okonkwo (GoodHealth Pharmacy Ltd.)',
            street: '123, Commerce Avenue',
            city: 'Victoria Island',
            state: 'Lagos',
            zip: '101241',
            phone: '08012345678'
        },
        customer_details: {
            email: 'wholesale@kingzy.com',
            userId: '00000000-0000-0000-0000-000000000003'
        },
        order_items: [
            { id: 1, order_id: orderId, product_id: 1, quantity: 20, unit_price: 8000, products: { name: 'Paracetamol (Bulk)', dosage: 'Jar of 1000' } },
            { id: 2, order_id: orderId, product_id: 2, quantity: 5, unit_price: 22000, products: { name: 'Ibuprofen (Case)', dosage: 'Case of 48' } },
        ] as (OrderItem & { products: Pick<Product, 'name' | 'dosage'>})[],
        payments: [
            { payment_method: 'bank_transfer', payment_status: 'awaiting_confirmation' }
        ] as any, // Mock payment details
        invoices: [ { id: 1, invoice_number: `INV-20240726-${orderId}` } ] as any
    };
};
// ------------------------------------

interface InvoicePreviewPageProps {
  orderId: number;
  onNavigate: (view: View) => void;
}

const InvoicePreviewPage: React.FC<InvoicePreviewPageProps> = ({ orderId, onNavigate }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                // Now fetching from the central localStorage store for consistency
                const allOrdersRaw = localStorage.getItem('kingzy_all_orders');
                const allOrders: Order[] = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];
                const data = allOrders.find(o => o.id === orderId) || null;
                
                if (!data) throw new Error("Order not found in the system.");
                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId]);

    const handleDownload = async () => {
        if (!order?.invoices?.[0]) return;
        setDownloading(true);
        try {
            const result = await getDocument('invoice', order.invoices[0].id);
            if (result.downloadUrl) {
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.setAttribute('download', `${order.invoices[0].invoice_number}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(result.error || 'Unknown error occurred.');
            }
        } catch (err: any) {
            alert(`Failed to download document: ${err.message}`);
        } finally {
            setDownloading(false);
        }
    };
    
    const handleProceed = () => {
        onNavigate({ name: 'paymentInstructions', orderId });
    };


    if (loading) return <p className="text-center py-12">Generating your invoice...</p>;
    if (error) return <p className="text-center py-12 text-red-500">Error: {error}</p>;
    if (!order) return <p className="text-center py-12">Could not load invoice details.</p>;

    const subtotal = order.order_items?.reduce((acc, item) => acc + item.unit_price * item.quantity, 0) ?? 0;
    const deliveryFee = order.total_price - subtotal + order.discount_applied;

    return (
        <div className="bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div>
                            <div className="flex items-center mb-4">
                                <img src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768670962/kingzylogo_rflzr9.png" alt="Kingzy Logo" className="h-16 mr-3"/>
                                <div>
                                    <h1 className="text-2xl font-bold text-brand-dark">Kingzy Pharmaceuticals Ltd.</h1>
                                    <p className="text-sm text-gray-500">123 Health Way, Ikeja, Lagos</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold uppercase text-gray-600">Invoice</h2>
                            <p className="text-sm text-gray-500">#{order.id}</p>
                            <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h3>
                        <p className="font-bold text-gray-800">{order.delivery_address.fullName}</p>
                        <p className="text-gray-600">{order.delivery_address.street}, {order.delivery_address.city}, {order.delivery_address.state}</p>
                        <p className="text-gray-600">{order.customer_details.email}</p>
                        <p className="text-gray-600">{order.delivery_address.phone}</p>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-2 px-4 font-semibold text-gray-600">Item Description</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-600">Qty</th>
                                <th className="text-right py-2 px-4 font-semibold text-gray-600">Unit Price</th>
                                <th className="text-right py-2 px-4 font-semibold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.order_items?.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold">{item.products?.name}</p>
                                        <p className="text-sm text-gray-500">{item.products?.dosage}</p>
                                    </td>
                                    <td className="text-center py-3 px-4">{item.quantity}</td>
                                    <td className="text-right py-3 px-4">₦{item.unit_price.toLocaleString()}</td>
                                    <td className="text-right py-3 px-4">₦{(item.quantity * item.unit_price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>₦{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-green-600">-₦{order.discount_applied.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Delivery Fee:</span><span>₦{deliveryFee.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span className="text-brand-dark">Grand Total:</span><span className="text-brand-dark">₦{order.total_price.toLocaleString()}</span></div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-4">
                        <button onClick={handleDownload} disabled={downloading} className="bg-gray-200 text-brand-dark font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-400">
                            {downloading ? 'Generating...' : 'Download Invoice'}
                        </button>
                        <button onClick={handleProceed} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-secondary transition-colors">
                            Confirm & Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreviewPage;
