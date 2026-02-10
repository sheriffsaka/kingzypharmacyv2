
import React from 'react';
import { Product, Profile } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
}

const StockBadge: React.FC<{ status: Product['stock_status'] }> = ({ status }) => {
  const baseClasses = "absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full text-white z-10";
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
  
  const isWholesale = profile?.role === 'wholesale_buyer' && profile.approval_status === 'approved';

  const getDisplayPrice = () => {
    if (isWholesale && product.prices.wholesale_tiers && product.prices.wholesale_tiers.length > 0) {
      const lowestPrice = product.prices.wholesale_tiers.reduce((min, tier) => tier.price < min ? tier.price : min, product.prices.wholesale_tiers[0].price);
      return { price: lowestPrice.toLocaleString(), prefix: "₦" };
    }
    const retailPrice = product.prices?.retail ?? 0;
    return { price: retailPrice.toLocaleString(), prefix: "₦" };
  };

  const { price, prefix } = getDisplayPrice();
  
  // Use wholesale display unit if available and user is a wholesaler, otherwise fallback to dosage
  const displayUnit = isWholesale && product.wholesale_display_unit ? product.wholesale_display_unit : product.dosage;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onProductSelect(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const quantityToAdd = isWholesale ? product.min_order_quantity : 1;
    addToCart(product, quantityToAdd);
    alert(`${product.name} has been added to your cart.`);
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative border group"
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
            className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
        />
        {isWholesale && (
            <div className="absolute bottom-2 left-2 bg-brand-dark/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                MIN: {product.min_order_quantity}
            </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-brand-dark mb-1 truncate">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-2">{displayUnit}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-base font-bold text-brand-primary">{prefix}{price}</span>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock_status === 'out_of_stock'}
            className="bg-brand-primary text-white font-bold py-1.5 px-3 text-sm rounded-full hover:bg-brand-secondary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;