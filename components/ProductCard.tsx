
import React from 'react';
import { Product, Profile } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
}

const StockBadge: React.FC<{ status: Product['stock_status'] }> = ({ status }) => {
  const baseClasses = "absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full text-white z-10";
  switch (status) {
    case 'in_stock':
      return <div className={`${baseClasses} bg-green-500`}>In Stock</div>;
    case 'low_stock':
      return <div className={`${baseClasses} bg-yellow-500`}>Low Stock</div>;
    case 'out_of_stock':
      return <div className={`${baseClasses} bg-red-500`}>Out of Stock</div>;
    default:
      return null;
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ product, profile, onProductSelect }) => {
  const { addToCart } = useCart();
  
  const getDisplayPrice = () => {
    const isWholesale = profile?.role === 'wholesale_buyer' && profile.approval_status === 'approved';
    
    if (isWholesale && product.prices.wholesale_tiers && product.prices.wholesale_tiers.length > 0) {
      // Find the lowest price in the tiers
      const lowestPrice = product.prices.wholesale_tiers.reduce((min, tier) => tier.price < min ? tier.price : min, product.prices.wholesale_tiers[0].price);
      return { price: lowestPrice.toLocaleString(), prefix: "From ₦" };
    }
    // FIX: Add optional chaining and a fallback to 0 to prevent crashes if retail price is missing.
    const retailPrice = product.prices?.retail ?? 0;
    return { price: retailPrice.toLocaleString(), prefix: "₦" };
  };

  const { price, prefix } = getDisplayPrice();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent navigation when the 'Add to Cart' button is clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onProductSelect(product.id);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`${product.name} has been added to your cart.`);
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col cursor-pointer relative border"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onProductSelect(product.id)}
    >
      <StockBadge status={product.stock_status} />
      <div className="relative w-full aspect-square bg-gray-100">
        <img 
            src={product.image_url} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-brand-dark mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{product.dosage}</p>
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xl font-bold text-brand-primary">{prefix}{price}</span>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock_status === 'out_of_stock'}
            className="bg-accent-green text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;