
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { ShoppingCartIcon, UserCircleIcon, LogoutIcon, MenuIcon, XIcon } from './Icons';
import { Profile, View, Category } from '../types';

interface HeaderProps {
  session: Session | null;
  profile: Profile | null;
  onNavigate: (view: View) => void;
  cartItemCount: number;
  categories: Category[];
}

const Header: React.FC<HeaderProps> = ({ session, profile, onNavigate, cartItemCount, categories }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      alert("An error occurred while signing out. Please try again.");
    }
  };
  
  const navButtonClasses = `w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-300 text-white hover:bg-brand-primary/80`;

  const handleMobileNav = (view: View) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };
  
  const handleDesktopNav = (view: View) => {
    onNavigate(view);
    setDropdownOpen(false);
  }

  const renderAuthSection = () => {
    if (session) {
      return (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-8 h-8"/>
            <span className="text-sm hidden lg:inline">{session.user.email}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-2 text-white hover:text-brand-secondary transition-colors"
            aria-label="Logout"
          >
            <LogoutIcon className="w-6 h-6"/>
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      );
    }
    return (
      <button onClick={() => onNavigate({ name: 'auth' })} className="font-semibold text-white hover:text-brand-secondary transition-colors">
        Login / Sign Up
      </button>
    );
  };
  
  return (
    <header className="bg-brand-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate({ name: 'products' })}>
          <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
            <img src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768670962/kingzylogo_rflzr9.png" alt="Kingzy Pharmaceuticals Logo" className="h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kingzy Pharmaceuticals</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex">
            {renderAuthSection()}
          </div>
          <button onClick={() => onNavigate({ name: 'cart' })} className="relative" aria-label={`View shopping cart with ${cartItemCount} items`}>
            <ShoppingCartIcon className="w-8 h-8" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open main menu">
                  {isMobileMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
              </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-dark hidden md:block">
          <nav className="container mx-auto px-4 flex justify-between items-center">
              <div className="flex items-center space-x-6">
                  <button onClick={() => handleDesktopNav({ name: 'products' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Medicine</button>
                  <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                      <button className="py-3 text-gray-200 hover:text-white font-medium transition-colors flex items-center">
                          Healthcare Products
                          <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      {isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg z-50 py-1">
                              {categories.map(cat => (
                                <a key={cat.id} onClick={() => handleDesktopNav({ name: 'products', categoryId: cat.id })} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{cat.name}</a>
                              ))}
                          </div>
                      )}
                  </div>
                  <button onClick={() => handleDesktopNav({ name: 'about' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">About</button>
                  <button onClick={() => handleDesktopNav({ name: 'labTests' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Lab Tests</button>
                  <button onClick={() => handleDesktopNav({ name: 'healthInsights' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Health Insights</button>
                  <button onClick={() => handleDesktopNav({ name: 'chat' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">AI Assistant</button>
              </div>
              <div className="flex items-center space-x-6">
                  <button onClick={() => handleDesktopNav({ name: 'plusMembership'})} className="py-3 text-yellow-300 hover:text-yellow-200 font-bold transition-colors">PLUS</button>
                  <button onClick={() => handleDesktopNav({ name: 'offers' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Offers</button>
                  {profile?.role === 'admin' && <button onClick={() => handleDesktopNav({ name: 'admin' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Admin</button>}
                  {profile?.role === 'wholesale_buyer' && <button onClick={() => handleDesktopNav({ name: 'wholesale' })} className="py-3 text-gray-200 hover:text-white font-medium transition-colors">Wholesale</button>}
              </div>
          </nav>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-dark shadow-lg">
            <nav className="flex flex-col p-4 space-y-2">
                <button onClick={() => handleMobileNav({ name: 'products' })} className={navButtonClasses}>Medicine</button>
                <div className="text-white font-semibold px-4 py-2">Healthcare Products</div>
                <div className="flex flex-col pl-4">
                  {categories.map(cat => (
                     <button key={cat.id} onClick={() => handleMobileNav({ name: 'products', categoryId: cat.id })} className={`${navButtonClasses} text-gray-300`}>{cat.name}</button>
                  ))}
                </div>
                <button onClick={() => handleMobileNav({ name: 'about' })} className={navButtonClasses}>About</button>
                <button onClick={() => handleMobileNav({ name: 'labTests' })} className={navButtonClasses}>Lab Tests</button>
                <button onClick={() => handleMobileNav({ name: 'healthInsights' })} className={navButtonClasses}>Health Insights</button>
                <button onClick={() => handleMobileNav({ name: 'chat' })} className={navButtonClasses}>AI Assistant</button>
                <button onClick={() => handleMobileNav({ name: 'plusMembership' })} className={`${navButtonClasses} text-yellow-300`}>PLUS</button>
                <button onClick={() => handleMobileNav({ name: 'offers' })} className={navButtonClasses}>Offers</button>
                
                {profile?.role === 'admin' && <button onClick={() => handleMobileNav({ name: 'admin' })} className={navButtonClasses}>Admin Dashboard</button>}
                {profile?.role === 'wholesale_buyer' && <button onClick={() => handleMobileNav({ name: 'wholesale' })} className={navButtonClasses}>Wholesale Area</button>}
                
                 <div className="pt-4 border-t border-gray-700">
                    {session ? (
                         <div className="flex flex-col space-y-4">
                            <div className="flex items-center space-x-2 px-4">
                                <UserCircleIcon className="w-8 h-8"/>
                                <span className="text-sm">{session.user.email}</span>
                            </div>
                            <button 
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false);}} 
                                className={`${navButtonClasses} flex items-center space-x-2`}
                                aria-label="Logout"
                            >
                                <LogoutIcon className="w-6 h-6"/>
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                         <button onClick={() => handleMobileNav({ name: 'auth' })} className={navButtonClasses}>
                            Login / Sign Up
                        </button>
                    )}
                 </div>
            </nav>
        </div>
      )}
    </header>
  );
};

export default Header;