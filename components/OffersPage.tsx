
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
            <div className="container mx-auto px-4 py-16 text-center">
                 <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Deals Are On The Way!</h2>
                    <p className="text-gray-600 text-lg">
                        We're currently preparing the best deals for you. Check back soon to find amazing offers on a wide range of products. Great savings are just around the corner!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
