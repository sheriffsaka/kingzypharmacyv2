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
import SuperAdminDashboard from './components/SuperAdminDashboard';
import WholesaleDashboard from './components/WholesaleDashboard';
import LogisticsDashboard from './components/LogisticsDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import MirevaPage from './components/MirevaPage';
import HealthInsights from './components/HealthInsights';
import PlusMembership from './components/PlusMembership';
import OffersPage from './components/OffersPage';
import AboutPage from './components/AboutPage';
import WholesalePublicPage from './components/WholesalePublicPage';
import ContactPage from './components/ContactPage';
import FAQPage from './components/FAQPage';
import TermsAndConditionsPage from './components/TermsAndConditionsPage';
import DevToolbar from './components/DevToolbar';
import InvoicePreviewPage from './components/InvoicePreviewPage';
import PaymentInstructionsPage from './components/PaymentInstructionsPage';
import BlogDetailPage from './components/BlogDetailPage';
import { View, Profile, Category } from './types';
import { supabase } from './lib/supabase/client';
import { useCart } from './contexts/CartContext';
import { categoriesData } from './data/categories';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentView, setCurrentView] = useState<View>({ name: 'home' });
  const { cartItemCount, setProfileForCart } = useCart();

  const handleNavigation = (view: View) => {
      window.scrollTo(0, 0); // Scroll to top on every navigation change
      setCurrentView(view);
  }

  const fetchProfile = async (user: User): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
      setProfileForCart(null);
      return null;
    } else {
      const profileWithEmail = data ? { ...data, email: user.email } : null;
      setProfile(profileWithEmail);
      setProfileForCart(profileWithEmail);
      return profileWithEmail;
    }
  };

  useEffect(() => {
    // Load categories from static data file
    setCategories(categoriesData);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const userProfile = await fetchProfile(session.user);
        if (userProfile) {
          switch (userProfile.role) {
            case 'super_admin': handleNavigation({ name: 'superAdmin' }); break;
            case 'admin': handleNavigation({ name: 'admin' }); break;
            case 'logistics': handleNavigation({ name: 'logistics' }); break;
            case 'wholesale_buyer': handleNavigation({ name: 'wholesale' }); break;
            case 'general_public':
              // If user was on the auth page, send them home. Otherwise, let them stay on the page they were on (e.g., Cart) to complete their action.
              setCurrentView(prevView => prevView.name === 'auth' ? { name: 'home' } : prevView);
              break;
            default:
              setCurrentView(prevView => prevView.name === 'auth' ? { name: 'home' } : prevView);
          }
        } else {
           setCurrentView({ name: 'home' });
        }
      } else {
        setProfile(null);
        setProfileForCart(null);
        setCurrentView({ name: 'home' });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleDevLogin = (mockProfile: Profile) => {
    // Create a fake session object for the presentation
    const mockSession: Session = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: mockProfile.id,
        email: mockProfile.email,
        app_metadata: {},
        user_metadata: { role: mockProfile.role, is_platinum: mockProfile.is_platinum },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    };
    
    setProfile(mockProfile);
    setProfileForCart(mockProfile);
    setSession(mockSession);

    // Navigate to the correct dashboard
    switch (mockProfile.role) {
      case 'super_admin': handleNavigation({ name: 'superAdmin' }); break;
      case 'admin': handleNavigation({ name: 'admin' }); break;
      case 'logistics': handleNavigation({ name: 'logistics' }); break;
      case 'wholesale_buyer': handleNavigation({ name: 'wholesale' }); break;
      case 'general_public': handleNavigation({ name: 'buyerDashboard' }); break;
      default: handleNavigation({ name: 'home' });
    }
  };

  const handleDevLogout = () => {
    setSession(null);
    setProfile(null);
    setProfileForCart(null);
    handleNavigation({ name: 'home' });
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
                  categories={categories}
               />;
      case 'cart':
        return <CartPage 
                  profile={profile}
                  session={session}
                  onContinueShopping={() => handleNavigation({ name: 'products' })}
                  onNavigate={handleNavigation}
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
        return <AuthPage initialIsPlatinum={currentView.isPlatinum} />;
      case 'admin':
        return profile?.role === 'admin' || profile?.role === 'super_admin' ? <AdminDashboard profile={profile} /> : <p className="text-center p-8">Access Denied. Please log in as an Admin.</p>;
      case 'superAdmin':
        return profile?.role === 'super_admin' ? <SuperAdminDashboard profile={profile} /> : <p className="text-center p-8">Access Denied. Please log in as a Super Admin.</p>;
      case 'wholesale':
        return profile?.role === 'wholesale_buyer' ? <WholesaleDashboard profile={profile} onNavigate={handleNavigation} /> : <p className="text-center p-8">Access Denied. Please log in as a Wholesale Buyer.</p>;
      case 'logistics':
        return profile?.role === 'logistics' ? <LogisticsDashboard profile={profile} /> : <p className="text-center p-8">Access Denied. Please log in as Logistics personnel.</p>;
      case 'buyerDashboard':
        return profile?.role === 'general_public' ? <BuyerDashboard profile={profile} onNavigate={handleNavigation} /> : <p className="text-center p-8">Access Denied. Please log in to view your dashboard.</p>;
      case 'invoicePreview':
          return <InvoicePreviewPage orderId={currentView.orderId} onNavigate={handleNavigation} />;
      case 'paymentInstructions':
          return <PaymentInstructionsPage orderId={currentView.orderId} onNavigate={handleNavigation} />;
      case 'pharmacists_public':
        return <WholesalePublicPage onNavigate={handleNavigation} isPlatinum={currentView.isPlatinum} />;
      case 'mireva':
        return <MirevaPage onNavigate={handleNavigation} />;
      case 'healthInsights':
        return <HealthInsights onNavigate={handleNavigation} />;
      case 'blogDetail':
        return <BlogDetailPage articleId={currentView.articleId} onNavigate={handleNavigation} />;
      case 'plusMembership':
        return <PlusMembership onNavigate={handleNavigation} />;
      case 'offers':
        return <OffersPage />;
      case 'about':
        return <AboutPage onNavigate={handleNavigation} />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'terms':
        return <TermsAndConditionsPage />;
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
    <div className="flex flex-col min-h-screen font-sans bg-white text-brand-dark pb-20">
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
      <DevToolbar 
        session={session} 
        profile={profile}
        onDevLogin={handleDevLogin}
        onDevLogout={handleDevLogout}
      />
    </div>
  );
};

export default App;