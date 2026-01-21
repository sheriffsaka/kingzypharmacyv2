import React, { useState, useEffect } from 'react';
import { Product, Profile, Category, View } from '../types';
import { ArrowRightIcon } from './Icons';
import HeroCarousel from './HeroCarousel';
import DealsOfTheDay from './DealsOfTheDay';
import Testimonials from './Testimonials';
import WhyChooseUs from './WhyChooseUs';
import DownloadApp from './DownloadApp';
import ProductList from './ProductList';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';
import { articles } from '../data/articles';
import { productsData } from '../data/products';

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

  const dealProduct = products.find(p => p.stock_status === 'in_stock');
  const previewProducts = products.slice(0, 10); // Take the first 10 for the homepage

  return (
    <div className="bg-white">
      <HeroCarousel onNavigate={onNavigate} />
      
      {/* Our Products Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Our Products</h2>
               {loading && <p className="text-center">Loading products...</p>}
               {!loading && (
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

      <WhyChooseUs />
      
      {dealProduct && <DealsOfTheDay product={dealProduct} onProductSelect={onProductSelect} />}

      {/* Combined Category and Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Shop by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {categories.slice(0, 6).map(cat => (
                      <CategoryCard key={cat.id} category={cat} onSelectCategory={() => onSelectCategory(cat.id)} />
                  ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">What Our Customers Say</h2>
              <Testimonials />
            </div>
          </div>
        </div>
      </section>

      {/* Health Articles Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Health Insights</h2>
              <HealthArticles articles={articles} onNavigate={onNavigate} />
          </div>
      </section>

      <DownloadApp />
    </div>
  );
};

export default HomePage;