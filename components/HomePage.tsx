
import React, { useState, useMemo } from 'react';
import { Product, Profile, Category } from '../types';
import ProductList from './ProductList';
import { supabase } from '../lib/supabase/client';
import { SearchIcon } from './Icons';
import DealsOfTheDay from './DealsOfTheDay';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';
import Testimonials from './Testimonials';
import WhyChooseUs from './WhyChooseUs';
import DownloadApp from './DownloadApp';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';

interface ProductListPageProps {
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categories: Category[];
}

const ProductListPage: React.FC<ProductListPageProps> = ({ profile, onProductSelect, selectedCategoryId, onSelectCategory, categories }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, description, category_id, dosage, prices, stock_status, image_url, min_order_quantity, categories(id, name, description)');
        
        if (productsError) throw productsError;
        // FIX: The Supabase query returns 'categories' as an array, but the 'Product' type expects an object.
        // We transform the data to match the expected type by taking the first element of the 'categories' array.
        const transformedData = (productsData || []).map((p: any) => ({
          ...p,
          categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
        }));
        setProducts(transformedData as Product[]);
      } catch (err: any) {
        setError('Failed to fetch product data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // When category changes, clear search
  React.useEffect(() => {
    setSearchQuery('');
  }, [selectedCategoryId]);

  const sortedAndFilteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Category filter
        if (selectedCategoryId && product.category_id !== selectedCategoryId) {
          return false;
        }
        // Search filter (name and description)
        if (searchQuery && 
            !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
          switch (sortOption) {
              case 'name_asc':
                  return a.name.localeCompare(b.name);
              case 'name_desc':
                  return b.name.localeCompare(a.name);
              case 'price_asc':
                  return (a.prices?.retail ?? 0) - (b.prices?.retail ?? 0);
              case 'price_desc':
                  return (b.prices?.retail ?? 0) - (a.prices?.retail ?? 0);
              default:
                  return 0;
          }
      });
  }, [products, searchQuery, selectedCategoryId, sortOption]);
  
  const dealsProducts = React.useMemo(() => products.slice(0, 5), [products]);

  return (
    <div className="bg-white">
      {/* Search Section */}
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
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
            <ProductList 
                products={sortedAndFilteredProducts}
                profile={profile}
                onProductSelect={onProductSelect}
            />
        )}
      </div>

      <DealsOfTheDay products={dealsProducts} profile={profile} onProductSelect={onProductSelect} />

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
               <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">Shop by Category</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {categories.map(cat => (
                      <CategoryCard key={cat.id} category={cat} onSelectCategory={onSelectCategory} />
                  ))}
               </div>
          </div>
      </section>

      <HealthArticles />
      <Testimonials />
      <WhyChooseUs />
      <DownloadApp />
    </div>
  );
};

export default ProductListPage;
