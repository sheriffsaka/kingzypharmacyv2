import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { Product, StockStatus } from '../types';
import { XIcon } from './Icons';

const AdminInventoryManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

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
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setImageFile(null);
        setImagePreview(null);
    };
    
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            let updatedProduct = { ...editingProduct };
            if (imagePreview && imageFile) {
                // In a real app, upload imageFile to Supabase Storage and get a public URL.
                // For this mock, we use the local blob URL for instant UI feedback.
                updatedProduct.image_url = imagePreview; 
                alert(`(Mock) Image "${imageFile.name}" uploaded and product #${editingProduct.id} updated successfully.`);
            } else {
                 alert(`Product #${editingProduct.id} updated successfully (mock).`);
            }
            
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setEditingProduct(null);
            setImageFile(null);
            setImagePreview(null);
        }
    };
    
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editingProduct) return;
        const { name, value } = e.target;
        if (name.startsWith('prices.')) {
            const priceField = name.split('.')[1];
            setEditingProduct({
                ...editingProduct,
                prices: { ...editingProduct.prices, [priceField]: Number(value) }
            });
        } else {
            setEditingProduct({ ...editingProduct, [name]: value });
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
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenEditModal(product)} className="text-brand-primary hover:underline">Edit</button>
                                        <button onClick={() => setIsHistoryVisible(true)} className="text-gray-500 hover:underline">History</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <form onSubmit={handleSaveEdit}>
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold">Edit Product: {editingProduct.name}</h3>
                                <button type="button" onClick={() => setEditingProduct(null)}><XIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                                <div><label className="text-sm font-semibold">Product Name</label><input name="name" value={editingProduct.name} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Dosage</label><input name="dosage" value={editingProduct.dosage} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                <div className="md:col-span-2"><label className="text-sm font-semibold">Description</label><textarea name="description" value={editingProduct.description} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                <div><label className="text-sm font-semibold">Retail Price (₦)</label><input name="prices.retail" type="number" value={editingProduct.prices.retail} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold">Product Image</label>
                                    <div className="mt-1 flex items-center gap-4">
                                        <img src={imagePreview || editingProduct.image_url} alt="Product Preview" className="w-24 h-24 object-contain rounded-md bg-gray-100 border"/>
                                        <label htmlFor="image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            <span>Change Image</span>
                                            <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                                <button type="button" onClick={() => setEditingProduct(null)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-accent-green text-white font-bold py-2 px-4 rounded-md hover:bg-green-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* History Modal */}
            {isHistoryVisible && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">Inventory Audit Trail (Mock)</h3>
                            <button type="button" onClick={() => setIsHistoryVisible(false)}><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6">
                            <p>This is where a log of all changes to this product would appear, showing who made the change, what was changed, and when.</p>
                            <ul className="list-disc pl-5 mt-4 text-sm text-gray-600">
                                <li><strong>July 25, 2024:</strong> Stock status changed to 'in_stock' by admin@kingzy.com.</li>
                                <li><strong>July 24, 2024:</strong> Retail price updated to ₦1,500 by admin@kingzy.com.</li>
                            </ul>
                        </div>
                         <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                            <button type="button" onClick={() => setIsHistoryVisible(false)} className="font-bold py-2 px-4 rounded-md bg-gray-200 text-brand-dark hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminInventoryManagement;