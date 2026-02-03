import React, { useState, useEffect, useRef } from 'react';
import { Product, Profile, Category, View } from '../types';
import { ArrowRightIcon, ArrowLeftIcon } from './Icons';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const enrichedProducts = productsData.map(p => ({
      ...p,
      categories: categories.find(c => c.id === p.category_id)
    }));
    setProducts(enrichedProducts);
    setLoading(false);
  }, [categories]);

  const dealProduct = products.find(p => p.stock_status === 'in_stock');
  // Adjusted slice to 10 products to ensure 2 full rows on desktop (5 columns each)
  const previewProducts = products.slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      <HeroCarousel onNavigate={onNavigate} />
      
      {/* Our Products Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-left text-brand-dark mb-8 border-l-4 border-brand-primary pl-4">Our Products</h2>
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
                    onClick={() => onNavigate({ name: 'products', categoryId: null })}
                    className="bg-brand-primary text-white font-bold py-4 px-10 rounded-full hover:bg-brand-secondary transition-all duration-300 shadow-lg transform hover:scale-105 group flex items-center gap-2 mx-auto"
                   >
                     View All Products <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
               </div>
          </div>
      </section>

      <WhyChooseUs />
      
      {dealProduct && <DealsOfTheDay product={dealProduct} onProductSelect={onProductSelect} />}

      {/* Optimized Category and Testimonials Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Scrollable Categories - 2/3 width */}
            <div className="lg:col-span-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-2 border-l-4 border-brand-secondary pl-4">Shop by Category</h2>
                <p className="text-gray-500">Explore our extensive range of health solutions.</p>
              </div>
              
              <div className="relative group">
                {/* Left Scroll Arrow - Middle Left Position */}
                <button 
                  onClick={() => scroll('left')} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 p-3 rounded-full bg-white shadow-xl border border-gray-100 text-brand-primary hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                  aria-label="Scroll left"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>

                <div 
                  ref={scrollRef}
                  className="overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="grid grid-rows-2 grid-flow-col gap-4 auto-cols-[180px] md:auto-cols-[220px]">
                      {categories.map(cat => (
                          <div key={cat.id} className="snap-start h-full">
                            <CategoryCard category={cat} onSelectCategory={() => onSelectCategory(cat.id)} />
                          </div>
                      ))}
                  </div>
                </div>

                {/* Right Scroll Arrow - Middle Right Position */}
                <button 
                  onClick={() => scroll('right')} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 p-3 rounded-full bg-white shadow-xl border border-gray-100 text-brand-primary hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                  aria-label="Scroll right"
                >
                  <ArrowRightIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Testimonials - 1/3 width */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <h2 className="text-3xl font-bold text-brand-dark mb-8 border-l-4 border-accent-green pl-4">What our Customers Say</h2>
              <div className="flex-grow flex flex-col min-h-[350px]">
                <Testimonials />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Health Articles Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-left text-brand-dark mb-10 border-l-4 border-brand-primary pl-4">Health Insights</h2>
              <HealthArticles articles={articles} onNavigate={onNavigate} />
          </div>
      </section>

      <DownloadApp />
    </div>
  );
};

export default HomePage;