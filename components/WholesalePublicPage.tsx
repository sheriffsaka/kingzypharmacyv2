import React, { useState } from 'react';
import HeroSection from './HeroSection';
import WholesaleAuthForm from './WholesaleAuthForm';
import { View } from '../types';
import { BriefcaseIcon, TruckIcon, ShieldCheckIcon } from './Icons';

interface WholesalePublicPageProps {
  onNavigate: (view: View) => void;
}

const benefits = [
    {
        icon: BriefcaseIcon,
        title: "Competitive Pricing",
        description: "Access exclusive bulk pricing tiers designed to maximize your profit margins.",
    },
    {
        icon: TruckIcon,
        title: "Priority Logistics",
        description: "Benefit from our dedicated logistics network for faster and more reliable delivery across the nation.",
    },
    {
        icon: ShieldCheckIcon,
        title: "Guaranteed Authentic",
        description: "Source with confidence. All our products are 100% authentic and verified.",
    },
];

const WholesalePublicPage: React.FC<WholesalePublicPageProps> = ({ onNavigate }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signup');

    return (
        <div className="bg-white">
            <HeroSection 
                title="For Pharmacists & Healthcare Providers"
                subtitle="Join our network of pharmacies and healthcare providers to access exclusive wholesale benefits and grow your business."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768757551/warehouse3_oabgkd.jpg"
            />
            
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Auth Form */}
                        <div className={mode === 'signup' ? "lg:col-span-2" : "lg:col-span-3"}>
                            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                                <WholesaleAuthForm mode={mode} setMode={setMode} />
                            </div>
                        </div>

                        {/* Conditionally render the info box only for signup mode */}
                        {mode === 'signup' && (
                            <div className="bg-brand-primary text-white rounded-xl shadow-lg border p-8 flex flex-col">
                                {/* Advert Message */}
                                <h3 className="text-3xl font-bold mb-2">Elevate Your Business</h3>
                                <p className="text-gray-200 mb-8">Partner with us to streamline your procurement process and offer your customers the best in pharmaceutical care.</p>
                                
                                {/* Partnership Advantage */}
                                <h4 className="text-xl font-bold mb-4">Partnership Advantages</h4>
                                <ul className="space-y-6 mb-8">
                                    {benefits.map(benefit => (
                                        <li key={benefit.title} className="flex items-start gap-4">
                                            <div className="bg-white/20 p-2 rounded-full">
                                                <benefit.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{benefit.title}</h4>
                                                <p className="text-sm text-gray-200">{benefit.description}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                 {/* Image */}
                                <img 
                                    src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768758490/supplychain2_bzj3zk.jpg" 
                                    alt="A trusted supply chain for pharmaceuticals" 
                                    className="w-full h-auto object-cover rounded-lg shadow-md mb-8" 
                                />
                                
                                {/* CTA */}
                                <div className="text-center mt-auto">
                                     <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
                                     <p className="text-gray-200 mt-2 mb-6">Our team is ready to help you with the onboarding process.</p>
                                     <button 
                                         onClick={() => onNavigate({ name: 'contact' })} 
                                         className="bg-transparent border-2 border-brand-secondary text-brand-secondary font-bold py-3 px-8 rounded-full hover:bg-brand-secondary hover:text-white transition-colors duration-300"
                                     >
                                        Contact Our Team
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WholesalePublicPage;