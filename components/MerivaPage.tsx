import React from 'react';
import HeroSection from './HeroSection';

const MerivaPage: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection
                title="Meriva Diagnostic Services"
                subtitle="Book lab tests, get home sample collection, and receive your results online with our trusted diagnostic partner."
                imageUrl="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800"
            />
            <div className="container mx-auto px-4 py-16 text-center">
                 <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Coming Soon!</h2>
                    <p className="text-gray-600 text-lg">
                        We are integrating with Meriva to bring you seamless diagnostic services. Soon, you'll be able to book a wide range of lab tests directly from our platform.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MerivaPage;