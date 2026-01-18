
import React, { useState, useEffect } from 'react';
import { Product, Profile, Category, View } from '../types';
import { supabase } from '../lib/supabase/client';
import { ArrowRightIcon } from './Icons';
import HeroCarousel from './HeroCarousel';
import DealsOfTheDay from './DealsOfTheDay';
import CategoryAndArticlesSection from './CategoryAndArticlesSection';
import Testimonials from './Testimonials';
import WhyChooseUs from './WhyChooseUs';
import DownloadApp from './DownloadApp';
import ProductList from './ProductList';

interface HomePageProps {
  profile: Profile | null;
  onNavigate: (view: View) => void;
  categories: Category[];
  onProductSelect: (productId: number) => void;
  onSelectCategory: (categoryId: number | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ profile, onNavigate, categories, onProductSelect, onSelectCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, category_id, dosage, prices, stock_status, image_url, min_order_quantity, categories(id, name, description)')
          .limit(10); // Fetch a few products for the page
        
        if (error) throw error;
        const transformedData = (data || []).map((p: any) => ({
          ...p,
          categories: Array.isArray(p.categories) ? p.categories[0] : p.categories,
        }));
        setProducts(transformedData as Product[]);
      } catch (err: any) {
        setError('Failed to fetch product data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const dealProduct = products.find(p => p.stock_status === 'in_stock');
  const previewProducts = products.slice(0, 8);

  return (
    <div className="bg-white">
      <HeroCarousel onNavigate={onNavigate} />
      
      <WhyChooseUs />
      
      {dealProduct && <DealsOfTheDay product={dealProduct} onProductSelect={onProductSelect} />}
      
      {/* Our Products Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">Our Products</h2>
               {loading && <p className="text-center">Loading products...</p>}
               {error && <p className="text-center text-red-500">{error}</p>}
               {!loading && !error && (
                   <ProductList 
                       products={previewProducts}
                       profile={profile}
                       onProductSelect={onProductSelect}
                   />
               )}
               <div className="text-center mt-12">
                   <button 
                    onClick={() => onNavigate({name: 'products'})}
                    className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-brand-secondary transition-all duration-300 transform hover:scale-105 group flex items-center gap-2 mx-auto"
                   >
                     View All Products <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
               </div>
          </div>
      </section>

      <CategoryAndArticlesSection categories={categories} onSelectCategory={onSelectCategory} />

      <Testimonials />

      <DownloadApp />
    </div>
  );
};

export default HomePage;
