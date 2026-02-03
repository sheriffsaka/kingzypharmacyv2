import React, { useState, useMemo, useEffect } from 'react';
import { Product, Profile, Category } from '../types';
import ProductList from './ProductList';
import { SearchIcon } from './Icons';
import { productsData } from '../data/products';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';

interface ProductsPageProps {
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categories: Category[];
}

const ProductsPage: React.FC<ProductsPageProps> = ({ profile, onProductSelect, selectedCategoryId, onSelectCategory, categories }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');

  useEffect(() => {
    setLoading(true);
    // Enrich product data with category information
    const enrichedProducts = productsData.map(p => ({
      ...p,
      categories: categories.find(c => c.id === p.category_id)
    }));
    setProducts(enrichedProducts);
    setLoading(false);
  }, [categories]);

  useEffect(() => {
    setSearchQuery('');
  }, [selectedCategoryId]);

  const sortedAndFilteredProducts = useMemo(() => {
    return products
      .filter(product => {
        if (selectedCategoryId && product.category_id !== selectedCategoryId) return false;
        if (searchQuery && 
            !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
          switch (sortOption) {
              case 'name_asc': return a.name.localeCompare(b.name);
              case 'name_desc': return b.name.localeCompare(a.name);
              case 'price_asc': return (a.prices?.retail ?? 0) - (b.prices?.retail ?? 0);
              case 'price_desc': return (b.prices?.retail ?? 0) - (a.prices?.retail ?? 0);
              default: return 0;
          }
      });
  }, [products, searchQuery, selectedCategoryId, sortOption]);

  return (
    <div className="bg-white">
      {/* Search & Filter Section */}
      <section className="bg-brand-light py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            <label htmlFor="medicine-search" className="sr-only">Search for medicines</label>
            <input 
              id="medicine-search"
              type="search" 
              placeholder="Search for medicines, vitamins, and more..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-full border-2 border-transparent focus:border-brand-secondary focus:ring-brand-secondary focus:outline-none shadow-md"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Product List Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-4 sm:mb-0">
                {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : (searchQuery ? 'Search Results' : 'All Products')}
            </h2>
            <div className="flex items-center gap-2">
                <label htmlFor="sort-products" className="font-semibold text-gray-700">Sort by:</label>
                <select 
                    id="sort-products"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-secondary focus:border-brand-secondary"
                >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                </select>
            </div>
        </div>
        {loading && <p className="text-center">Loading products...</p>}
        {!loading && (
            <ProductList 
                products={sortedAndFilteredProducts}
                profile={profile}
                onProductSelect={onProductSelect}
            />
        )}
      </div>
    </div>
  );
};

export default ProductsPage;