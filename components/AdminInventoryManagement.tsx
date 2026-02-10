import React, { useState, useEffect } from 'react';
import { Product, StockStatus, Category } from '../types';
import { XIcon } from './Icons';
import { productsData } from '../data/products';
import { categoriesData } from '../data/categories';

const AdminInventoryManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<Record<number, boolean>>({});
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        try {
            // Enrich product data with category names from static data
            const enrichedProducts = productsData.map(p => {
                const category = categoriesData.find(c => c.id === p.category_id);
                return {
                    ...p,
                    categories: category,
                };
            });
            setProducts(enrichedProducts as Product[]);
        } catch (err: any) {
            setError(`Failed to load products: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = (productId: number, newStatus: StockStatus) => {
        setUpdating(prev => ({ ...prev, [productId]: true }));
        // Simulate async update for UI feedback
        setTimeout(() => {
            setProducts(prevProducts =>
                prevProducts.map(p => 
                    p.id === productId ? { ...p, stock_status: newStatus } : p
                )
            );
            alert(`(Mock) Stock status for product #${productId} updated to '${newStatus}'.`);
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }, 300);
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const handleOpenEditModal = (product: Product) => {
        // Ensure technical_details object exists for the form
        const productWithDetails = {
            ...product,
            technical_details: product.technical_details || { active_ingredients: '', pharmacology: '', storage_conditions: '' }
        };
        setEditingProduct(productWithDetails);
        setImageFile(null);
        setImagePreview(null);
    };
    
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            let updatedProduct = { ...editingProduct };
            if (imagePreview && imageFile) {
                updatedProduct.image_url = imagePreview; 
                alert(`(Mock) Image "${imageFile.name}" uploaded and product #${editingProduct.id} updated successfully.`);
            } else {
                 alert(`(Mock) Product #${editingProduct.id} updated successfully.`);
            }
            
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            setEditingProduct(null);
            setImageFile(null);
            setImagePreview(null);
        }
    };
    
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editingProduct) return;
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? Number(value) : value;

        if (name.startsWith('prices.')) {
            const priceField = name.split('.')[1];
            setEditingProduct({
                ...editingProduct,
                prices: { ...editingProduct.prices, [priceField]: Number(value) }
            });
        } else if (name.startsWith('technical_details.')) {
            const detailField = name.split('.')[1];
             setEditingProduct({
                ...editingProduct,
                technical_details: { ...(editingProduct.technical_details || {}), [detailField]: value }
            });
        }
        else {
            setEditingProduct({ ...editingProduct, [name]: finalValue });
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Inventory Management</h2>
                    <div className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        QUANTITIES SYNCED FROM OFFLINE WAREHOUSE
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        {product.stock_quantity.toLocaleString()} 
                                        <span className="ml-1 text-[10px] text-gray-400 font-normal italic">(Read-only)</span>
                                    </td>
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
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
                        <form onSubmit={handleSaveEdit}>
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-xl font-semibold">Edit Product: {editingProduct.name}</h3>
                                <button type="button" onClick={() => setEditingProduct(null)}><XIcon className="w-6 h-6"/></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                {/* Basic Details */}
                                <div className="md:col-span-2 space-y-4">
                                    <div><label className="text-sm font-semibold">Product Name</label><input name="name" value={editingProduct.name} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="text-sm font-semibold">Dosage</label><input name="dosage" value={editingProduct.dosage} onChange={handleEditChange} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="text-sm font-semibold">Description</label><textarea name="description" value={editingProduct.description} onChange={handleEditChange} className="w-full p-2 border rounded-md" rows={3}/></div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold">Retail Price (₦)</label>
                                            <input name="prices.retail" type="number" value={editingProduct.prices.retail} onChange={handleEditChange} className="w-full p-2 border rounded-md"/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold">Min. Order Qty (Wholesale)</label>
                                            <input name="min_order_quantity" type="number" value={editingProduct.min_order_quantity} onChange={handleEditChange} className="w-full p-2 border rounded-md"/>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-400">Current Stock (Synced)</label>
                                            <input type="text" value={editingProduct.stock_quantity} disabled className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed font-bold" />
                                        </div>
                                    </div>
                                </div>
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
                                 {/* Technical Details */}
                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                     <h4 className="text-lg font-semibold mb-2">Technical Drug Details</h4>
                                     <div className="space-y-4">
                                        <div><label className="text-sm font-semibold">Active Ingredients</label><textarea name="technical_details.active_ingredients" value={editingProduct.technical_details?.active_ingredients || ''} onChange={handleEditChange} className="w-full p-2 border rounded-md" rows={2}/></div>
                                        <div><label className="text-sm font-semibold">Pharmacology</label><textarea name="technical_details.pharmacology" value={editingProduct.technical_details?.pharmacology || ''} onChange={handleEditChange} className="w-full p-2 border rounded-md" rows={3}/></div>
                                        <div><label className="text-sm font-semibold">Storage Conditions</label><textarea name="technical_details.storage_conditions" value={editingProduct.technical_details?.storage_conditions || ''} onChange={handleEditChange} className="w-full p-2 border rounded-md" rows={2}/></div>
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
                            <p>History of automated quantity syncs and manual status changes.</p>
                            <ul className="list-disc pl-5 mt-4 text-sm text-gray-600 space-y-2">
                                <li><strong>Just Now:</strong> Quantity synced from warehouse: 1250 units.</li>
                                <li><strong>July 25, 2024:</strong> Stock status manually changed to 'in_stock' by admin@kingzy.com.</li>
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