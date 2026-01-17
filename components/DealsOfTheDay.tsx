
import React from 'react';
import { Product, Profile } from '../types';
import ProductCard from './ProductCard';

interface DealsOfTheDayProps {
  products: Product[];
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
}

const DealsOfTheDay: React.FC<DealsOfTheDayProps> = ({ products, profile, onProductSelect }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">Deals of the Day</h2>
        <div className="flex overflow-x-auto space-x-6 pb-4">
          {products.map(product => (
            <div key={product.id} className="flex-shrink-0 w-80">
              <ProductCard
                product={product}
                profile={profile}
                onProductSelect={onProductSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;