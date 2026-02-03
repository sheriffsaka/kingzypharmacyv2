
import React from 'react';
import HeroSection from './HeroSection';

const OffersPage: React.FC = () => {
    return (
         <div className="bg-white">
            <HeroSection 
                title="Special Offers"
                subtitle="Discover exciting discounts, bundle deals, and seasonal promotions on your favorite healthcare products."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768767750/speciaoffer1_jrk6be.jpg"
            />
            <div className="container mx-auto px-4 py-20 text-center">
                 <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-brand-dark mb-6 italic">Big Savings Await You!</h2>
                    <p className="text-gray-600 text-xl mb-12">
                        We are currently refreshing our inventory with exclusive deals for our community. 
                        Check back frequently to find unbeatable offers on top-tier pharmaceuticals and laboratory services.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-brand-light p-8 rounded-3xl border-2 border-dashed border-brand-primary shadow-sm">
                            <p className="text-brand-primary font-bold text-5xl mb-4">15%</p>
                            <h3 className="text-xl font-bold mb-2">First Lab Test</h3>
                            <p className="text-sm text-gray-500">Apply code MIREVA15 at checkout for your first Mireva diagnostic booking.</p>
                        </div>
                        <div className="bg-brand-dark p-8 rounded-3xl text-white shadow-xl transform rotate-1">
                            <p className="text-yellow-400 font-bold text-5xl mb-4">FREE</p>
                            <h3 className="text-xl font-bold mb-2">Home Collection</h3>
                            <p className="text-sm text-brand-light/70">On all laboratory test orders above ₦50,000 within Lagos state.</p>
                        </div>
                        <div className="bg-brand-light p-8 rounded-3xl border-2 border-dashed border-brand-secondary shadow-sm">
                            <p className="text-brand-secondary font-bold text-5xl mb-4">₦1k</p>
                            <h3 className="text-xl font-bold mb-2">Referral Credit</h3>
                            <p className="text-sm text-gray-500">Get ₦1,000 credit for every successful referral to Kingzy Platinum Cluster.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
