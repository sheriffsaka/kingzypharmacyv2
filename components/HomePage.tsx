
import React, { useState, useEffect } from 'react';
import { Product, Profile, Category, View } from '../types';
import { supabase } from '../lib/supabase/client';
import { ArrowRightIcon } from './Icons';
import HeroCarousel from './HeroCarousel';
import DealsOfTheDay from './DealsOfTheDay';
import Testimonials from './Testimonials';
import WhyChooseUs from './WhyChooseUs';
import DownloadApp from './DownloadApp';
import ProductList from './ProductList';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';

interface HomePageProps {
  profile: Profile | null;
  onNavigate: (view: View) => void;
  categories: Category[];
  onProductSelect: (productId: number) => void;
  onSelectCategory: (categoryId: number | null) => void;
}

const articles = [
  {
    title: "Understanding Common Pain Relievers",
    summary: "Learn the difference between Paracetamol and Ibuprofen, their uses, and when to take them for effective and safe pain management.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673681/commonpainrelievers_oppbhh.jpg",
    link: "#"
  },
  {
    title: "The Importance of Vitamin D",
    summary: "Discover why Vitamin D is crucial for bone health, immune function, and overall well-being, especially during seasons with less sun exposure.",
     imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673688/vitaminD2_n8ylyp.jpg",
    link: "#"
  },
  {
    title: "Tips for Managing Seasonal Allergies",
    summary: "Don't let allergies ruin your season. Here are some effective tips and remedies to help you manage symptoms and breathe easier.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673682/seasnalallegies_ercnva.jpg",
    link: "#"
  }
];

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
          .limit(10); // Fetch 10 products for the page
        
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
  const previewProducts = products; // Use all 10 fetched products

  return (
    <div className="bg-white">
      <HeroCarousel onNavigate={onNavigate} />
      
      {/* Our Products Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Our Products</h2>
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

      <WhyChooseUs />
      
      {dealProduct && <DealsOfTheDay product={dealProduct} onProductSelect={onProductSelect} />}

      {/* Combined Category and Testimonials Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
            <div>
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">What Our Customers Say</h2>
              <Testimonials />
            </div>
          </div>
        </div>
      </section>

      {/* Health Articles Section */}
      <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Health Articles</h2>
              <HealthArticles articles={articles} />
          </div>
      </section>

      <DownloadApp />
    </div>
  );
};

export default HomePage;
