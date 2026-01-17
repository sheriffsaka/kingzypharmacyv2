
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase/client';
import { Product, Profile, WholesaleTier } from '../types';
import ProductCard from './ProductCard';
import { ArrowLeftIcon } from './Icons';
import { useCart } from '../contexts/CartContext';

interface ProductDetailPageProps {
    productId: number;
    profile: Profile | null;
    onBack: () => void;
    onProductSelect: (productId: number) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, profile, onBack, onProductSelect }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const isWholesale = profile?.role === 'wholesale_buyer' && profile.approval_status === 'approved';

    useEffect(() => {
        setProduct(null);
        setRelatedProducts([]);
        setLoading(true);
        setError(null);
        
        const fetchProductData = async () => {
            if (!productId) return;
            
            try {
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('id, name, description, category_id, dosage, prices, stock_status, image_url, min_order_quantity, categories(id, name, description)')
                    .eq('id', productId)
                    .single();
                
                if (productError) throw new Error(`Product fetch failed: ${productError.message}`);
                setProduct(productData as Product);
                setQuantity(isWholesale ? productData.min_order_quantity : 1);

                const { data: relatedIdsData, error: relatedIdsError } = await supabase
                    .from('related_products')
                    .select('product_id_2')
                    .eq('product_id_1', productId);
                
                if (relatedIdsError) throw new Error(`Related IDs fetch failed: ${relatedIdsError.message}`);
                const relatedIds = relatedIdsData.map(r => r.product_id_2);

                if (relatedIds.length > 0) {
                    const { data: relatedProductsData, error: relatedProductsError } = await supabase
                        .from('products')
                        .select('id, name, description, category_id, dosage, prices, stock_status, image_url, min_order_quantity, categories(id, name, description)')
                        .in('id', relatedIds);
                    
                    if (relatedProductsError) throw new Error(`Related products fetch failed: ${relatedProductsError.message}`);
                    setRelatedProducts(relatedProductsData as Product[]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId, isWholesale]);
    
    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            alert(`${quantity} x ${product.name} has been added to your cart.`);
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(isNaN(value) || value < 1 ? 1 : value);
    };

    const getPriceForQuantity = (p: Product, q: number): number => {
        if (isWholesale && p.prices.wholesale_tiers && p.prices.wholesale_tiers.length > 0) {
            const sortedTiers = [...p.prices.wholesale_tiers].sort((a, b) => b.min_quantity - a.min_quantity);
            const applicableTier = sortedTiers.find(tier => q >= tier.min_quantity);
            if (applicableTier) {
                return applicableTier.price;
            }
        }
        // FIX: Add optional chaining and a fallback to 0.
        return p.prices?.retail ?? 0;
    };
    
    const { unitPrice, subtotal, discount, total } = useMemo(() => {
        if (!product) return { unitPrice: 0, subtotal: 0, discount: 0, total: 0 };

        const price = getPriceForQuantity(product, quantity);
        const sub = price * quantity;
        const disc = (profile?.loyalty_discount_percentage ?? 0) / 100 * sub;
        const finalTotal = sub - disc;

        return {
            unitPrice: price,
            subtotal: sub,
            discount: disc,
            total: finalTotal
        };
    }, [product, quantity, profile]);


    const isAddToCartDisabled = product?.stock_status === 'out_of_stock' || (isWholesale && quantity < (product?.min_order_quantity ?? 1));

    if (loading) return <p className="text-center py-12">Loading product details...</p>;
    if (error) return <p className="text-center py-12 text-red-500">Error: {error}</p>;
    if (!product) return <p className="text-center py-12">Product not found.</p>;

    const renderPriceSection = () => {
        if (isWholesale) {
            return (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Wholesale Pricing</h3>
                    <table className="w-full text-left text-sm mb-4">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Minimum Quantity</th>
                                <th className="py-2 text-right">Price per Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.prices.wholesale_tiers?.map((tier) => (
                                <tr key={tier.min_quantity} className={`border-b ${quantity >= tier.min_quantity ? 'bg-green-100' : ''}`}>
                                    <td className="py-2">{tier.min_quantity}+ units</td>
                                    <td className="py-2 text-right">₦{tier.price.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="flex items-center gap-4 my-4">
                        <label htmlFor="quantity" className="font-semibold">Quantity:</label>
                        <input 
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min={product.min_order_quantity}
                            className="w-24 p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                     {quantity < product.min_order_quantity && <p className="text-red-600 text-sm">Minimum order quantity is {product.min_order_quantity}.</p>}
                    <div className="bg-gray-100 p-4 rounded-lg mt-4 space-y-2">
                         <div className="flex justify-between font-semibold">
                            <span>Unit Price:</span>
                            <span>₦{unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Subtotal ({quantity} units):</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                             <div className="flex justify-between text-green-600">
                                <span>Loyalty Discount ({profile?.loyalty_discount_percentage}%):</span>
                                <span>-₦{discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )}
                         <div className="flex justify-between text-xl font-bold text-brand-primary pt-2 border-t">
                            <span>Total:</span>
                            <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            )
        }
        
        // General Public View
        // FIX: Add optional chaining and a fallback to 0.
        const retailPrice = product.prices?.retail ?? 0;
        const finalPrice = retailPrice - ((profile?.loyalty_discount_percentage ?? 0) / 100 * retailPrice);

        return (
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                <div>
                {discount > 0 ? (
                    <>
                        <span className="text-xl text-gray-500 line-through mr-2">₦{retailPrice.toLocaleString()}</span>
                        <span className="text-3xl font-bold text-brand-primary">₦{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="block text-sm font-semibold text-green-600">{profile?.loyalty_discount_percentage}% loyalty discount applied!</span>
                    </>
                ) : (
                    <span className="text-3xl font-bold text-brand-primary">₦{retailPrice.toLocaleString()}</span>
                )}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-brand-primary font-semibold mb-6 hover:underline">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to All Products
            </button>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="absolute inset-0 w-full h-full object-contain p-4" 
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-brand-secondary">{product.categories?.name}</span>
                        <h1 className="text-3xl font-bold text-brand-dark mt-1 mb-2">{product.name}</h1>
                        <p className="text-gray-500 mb-4">{product.dosage}</p>
                         {isWholesale && <p className="text-sm text-gray-600 font-semibold mb-4">Minimum Order: {product.min_order_quantity} units</p>}
                        <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                        
                        {renderPriceSection()}

                        <button 
                            onClick={handleAddToCart}
                            disabled={isAddToCartDisabled}
                            className="bg-accent-green text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed w-full mt-6"
                        >
                            {product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-brand-dark mb-6">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {relatedProducts.map(rp => (
                            <ProductCard 
                                key={rp.id}
                                product={rp}
                                profile={profile}
                                onProductSelect={onProductSelect}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailPage;