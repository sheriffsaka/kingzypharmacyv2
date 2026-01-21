
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Product, StockStatus } from '../types';

const AdminInventoryManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*, categories(name)')
                .order('name', { ascending: true });

            if (fetchError) throw fetchError;
            
            const transformedData = (data || []).map((p: any) => ({
                ...p,
                categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
            }));
            setProducts(transformedData as Product[]);

        } catch (err: any) {
            setError(`Failed to fetch products: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleStatusChange = async (productId: number, newStatus: StockStatus) => {
        setUpdating(prev => ({ ...prev, [productId]: true }));
        try {
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock_status: newStatus })
                .eq('id', productId);
            
            if (updateError) throw updateError;

            // Update local state for immediate UI feedback
            setProducts(prevProducts =>
                prevProducts.map(p => 
                    p.id === productId ? { ...p, stock_status: newStatus } : p
                )
            );

        } catch (err: any) {
            alert(`Error updating stock status: ${err.message}`);
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const getStatusSelectClasses = (status: StockStatus) => {
        const baseClasses = "p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary";
        switch (status) {
            case 'in_stock': return `${baseClasses} bg-green-100 border-green-300 text-green-800`;
            case 'low_stock': return `${baseClasses} bg-yellow-100 border-yellow-300 text-yellow-800`;
            case 'out_of_stock': return `${baseClasses} bg-red-100 border-red-300 text-red-800`;
            default: return baseClasses;
        }
    };

    if (loading) return <p>Loading inventory...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.image_url} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.dosage}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categories?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{product.prices.retail.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={product.stock_status}
                                        onChange={(e) => handleStatusChange(product.id, e.target.value as StockStatus)}
                                        disabled={updating[product.id]}
                                        className={getStatusSelectClasses(product.stock_status)}
                                    >
                                        <option value="in_stock">In Stock</option>
                                        <option value="low_stock">Low Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminInventoryManagement;