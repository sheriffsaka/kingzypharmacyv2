import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';

const defaultPromos = {
    labTest: {
        value: '15%',
        title: 'First Lab Test',
        description: 'Apply code MIREVA15 at checkout for your first Mireva diagnostic booking.'
    },
    homeCollection: {
        value: 'FREE',
        title: 'Home Collection',
        description: 'On all laboratory test orders above ₦50,000 within Lagos state.'
    },
    referral: {
        value: '₦1k',
        title: 'Referral Credit',
        description: 'Get ₦1,000 credit for every successful referral to Kingzy Platinum Cluster.'
    }
};

const OffersPage: React.FC = () => {
    const [promos, setPromos] = useState(defaultPromos);

    useEffect(() => {
        const saved = localStorage.getItem('kingzy_cms_content');
        if (saved) {
            const config = JSON.parse(saved);
            if (config.offersPage) {
                setPromos(config.offersPage);
            }
        }
    }, []);

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
                            <p className="text-brand-primary font-bold text-5xl mb-4">{promos.labTest.value}</p>
                            <h3 className="text-xl font-bold mb-2">{promos.labTest.title}</h3>
                            <p className="text-sm text-gray-500">{promos.labTest.description}</p>
                        </div>
                        <div className="bg-brand-dark p-8 rounded-3xl text-white shadow-xl transform rotate-1">
                            <p className="text-yellow-400 font-bold text-5xl mb-4">{promos.homeCollection.value}</p>
                            <h3 className="text-xl font-bold mb-2">{promos.homeCollection.title}</h3>
                            <p className="text-sm text-brand-light/70">{promos.homeCollection.description}</p>
                        </div>
                        <div className="bg-brand-light p-8 rounded-3xl border-2 border-dashed border-brand-secondary shadow-sm">
                            <p className="text-brand-secondary font-bold text-5xl mb-4">{promos.referral.value}</p>
                            <h3 className="text-xl font-bold mb-2">{promos.referral.title}</h3>
                            <p className="text-sm text-gray-500">{promos.referral.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersPage;