
import React from 'react';
import { Product, Profile, Category } from '../types';
import ProductList from './ProductList';
import { supabase } from '../lib/supabase/client';
import { SearchIcon } from './Icons';
import DealsOfTheDay from './DealsOfTheDay';
import FeaturedBrands from './FeaturedBrands';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';
import Testimonials from './Testimonials';
import WhyChooseUs from './WhyChooseUs';
import DownloadApp from './DownloadApp';


interface ProductListPageProps {
  profile: Profile | null;
  onProductSelect: (productId: number) => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categories: Category[];
}

const ProductListPage: React.FC<ProductListPageProps> = ({ profile, onProductSelect, selectedCategoryId, onSelectCategory, categories }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, description, category_id, dosage, prices, stock_status, image_url, min_order_quantity, categories(id, name, description)');
        
        if (productsError) throw productsError;
        setProducts(productsData as Product[]);
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

  const filteredProducts = React.useMemo(() => {
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
      });
  }, [products, searchQuery, selectedCategoryId]);
  
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
        <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">
            {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : (searchQuery ? 'Search Results' : 'All Products')}
        </h2>
        {loading && <p className="text-center">Loading products...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
            <ProductList 
                products={filteredProducts}
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

      <FeaturedBrands />
      <HealthArticles />
      <Testimonials />
      <WhyChooseUs />
      <DownloadApp />
    </div>
  );
};

export default ProductListPage;