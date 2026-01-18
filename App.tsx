
import React, { useState, useCallback, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import Chatbot from './components/Chatbot';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import WholesaleDashboard from './components/WholesaleDashboard';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import LabTests from './components/LabTests';
import HealthInsights from './components/HealthInsights';
import PlusMembership from './components/PlusMembership';
import OffersPage from './components/OffersPage';
import AboutPage from './components/AboutPage';
import WholesalePublicPage from './components/WholesalePublicPage';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import { View, Profile, Category } from './types';
import { supabase } from './lib/supabase/client';
import { useCart } from './contexts/CartContext';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentView, setCurrentView] = useState<View>({ name: 'home' });
  const { cartItemCount, setProfileForCart } = useCart();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user);
      }
    };

    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };

    getSession();
    fetchCategories();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user);
        // If the user was on the auth page, redirect them to the home page after login.
        setCurrentView(prevView => prevView.name === 'auth' ? { name: 'home' } : prevView);
      } else {
        setProfile(null);
        setProfileForCart(null); // Clear profile in cart context on logout
        setCurrentView({ name: 'home' });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
      setProfileForCart(null);
    } else {
      setProfile(data);
      setProfileForCart(data); // Update profile in cart context
    }
  };
  
  const handleNavigation = (view: View) => {
      window.scrollTo(0, 0); // Scroll to top on every navigation change
      setCurrentView(view);
  }

  const handlePlaceOrder = (orderId: number) => {
    setCurrentView({ name: 'orderSuccess', orderId });
  };

  const renderContent = () => {
    switch(currentView.name) {
      case 'home':
        return <HomePage 
                 profile={profile}
                 onNavigate={handleNavigation}
                 categories={categories}
                 onProductSelect={(productId) => handleNavigation({ name: 'productDetail', productId })}
                 onSelectCategory={(categoryId) => handleNavigation({ name: 'products', categoryId: categoryId })}
               />;
      case 'products':
        return <ProductsPage 
                  profile={profile}
                  onProductSelect={(productId) => handleNavigation({ name: 'productDetail', productId })}
                  onSelectCategory={(categoryId) => handleNavigation({ name: 'products', categoryId: categoryId })}
                  selectedCategoryId={currentView.categoryId ?? null}
                  categories={categories}
               />;
      case 'productDetail':
        return <ProductDetailPage
                  productId={currentView.productId}
                  profile={profile}
                  onBack={() => handleNavigation({ name: 'products' })}
                  onProductSelect={(productId) => handleNavigation({ name: 'productDetail', productId })}
               />;
      case 'cart':
        return <CartPage 
                  profile={profile}
                  session={session}
                  onContinueShopping={() => handleNavigation({ name: 'products' })}
                  onPlaceOrder={handlePlaceOrder}
                />;
      case 'orderSuccess':
        return <OrderSuccessPage
                  orderId={currentView.orderId}
                  onGoToProducts={() => handleNavigation({ name: 'products' })}
                  onViewOrders={() => handleNavigation({ name: 'orders' })}
                />
      case 'orders':
          return <OrderHistoryPage session={session} onProductSelect={(productId) => handleNavigation({ name: 'productDetail', productId })}/>;
      case 'chat':
         return <div className="container mx-auto px-4 py-8"><Chatbot /></div>;
      case 'auth':
        return <AuthPage />;
      case 'admin':
        return profile?.role === 'admin' ? <AdminDashboard /> : <p>Access Denied</p>;
      case 'wholesale':
        return profile?.role === 'wholesale_buyer' ? <WholesaleDashboard profile={profile} /> : <p>Access Denied</p>;
      case 'wholesale_public':
        return <WholesalePublicPage onNavigate={handleNavigation} />;
      case 'labTests':
        return <LabTests />;
      case 'healthInsights':
        return <HealthInsights />;
      case 'plusMembership':
        return <PlusMembership />;
      case 'offers':
        return <OffersPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      default:
        return <HomePage 
                 profile={profile}
                 onNavigate={handleNavigation}
                 categories={categories}
                 onProductSelect={(productId) => handleNavigation({ name: 'productDetail', productId })}
                 onSelectCategory={(categoryId) => handleNavigation({ name: 'products', categoryId: categoryId })}
               />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-brand-dark">
      <Header 
        session={session}
        profile={profile}
        onNavigate={handleNavigation} 
        cartItemCount={cartItemCount}
        categories={categories}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer onNavigate={handleNavigation} categories={categories} />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
