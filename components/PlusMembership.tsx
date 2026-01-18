
import React from 'react';
import HeroSection from './HeroSection';

const PlusMembership: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="Kingzy PLUS"
                subtitle="Unlock exclusive benefits, free delivery, and priority service with our upcoming premium membership."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768767278/premiummain1_z3ryqz.jpg"
            />
            <div className="container mx-auto px-4 py-16 text-center">
                 <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Coming Soon!</h2>
                    <p className="text-gray-600 text-lg">
                        We are putting the finishing touches on our PLUS membership program. Get ready for an enhanced experience with benefits designed to save you time and money on your healthcare needs. Stay tuned for the official launch!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlusMembership;
