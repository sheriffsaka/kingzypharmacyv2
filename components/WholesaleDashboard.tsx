
import React, { useState, useEffect } from 'react';
import { Profile, Product, View } from '../types';
import { supabase } from '../lib/supabase/client';
import ProductList from './ProductList';
import { SearchIcon } from './Icons';

interface WholesaleDashboardProps {
  profile: Profile;
  onNavigate: (view: View) => void;
}

const WholesaleDashboard: React.FC<WholesaleDashboardProps> = ({ profile, onNavigate }) => {
  const isApproved = profile.approval_status === 'approved';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isApproved) {
      const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('stock_status', 'out_of_stock');

        if (error) {
          console.error("Error fetching wholesale products:", error);
        } else {
          setProducts(data as Product[]);
          setFilteredProducts(data as Product[]);
        }
        setLoading(false);
      };
      fetchProducts();
    }
  }, [isApproved]);

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchQuery, products]);

  if (!isApproved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-6">Wholesale Buyer Area</h1>
        <div className="p-6 rounded-lg shadow-md bg-yellow-100">
          <h2 className="text-xl font-semibold mb-2">Account Status: <span className="capitalize">{profile.approval_status}</span></h2>
          <p className="text-yellow-800">
            Your application is currently pending review. An administrator will approve your account shortly. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-brand-dark">Wholesale Product Catalog</h1>
        <div className="relative w-full md:w-auto">
          <input
            type="search"
            placeholder="Search wholesale products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 p-3 pl-10 rounded-full border-2 border-gray-200 focus:outline-none focus:border-brand-primary"
          />
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ProductList
          products={filteredProducts}
          profile={profile}
          onProductSelect={(productId) => onNavigate({ name: 'productDetail', productId })}
        />
      )}
    </div>
  );
};

export default WholesaleDashboard;
