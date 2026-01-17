
import React from 'react';
import { Product, Profile } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, profile, onProductSelect }) => {
  if (products.length === 0) {
    return <p className="text-center text-gray-600">No products found matching your criteria.</p>;
  }
  
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            profile={profile}
            onProductSelect={onProductSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductList;