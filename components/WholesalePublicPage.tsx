
import React from 'react';
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
    return (
        <div className="bg-white">
            <HeroSection 
                title="Partner with Kingzy Pharmaceuticals"
                subtitle="Join our network of pharmacies and healthcare providers to access exclusive wholesale benefits and grow your business."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768757551/warehouse3_oabgkd.jpg"
            />
            
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Bento Box 1: Auth Form (takes more space) */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border overflow-hidden">
                            <WholesaleAuthForm />
                        </div>

                        {/* Bento Box 2: Benefits */}
                        <div className="bg-brand-primary text-white rounded-xl shadow-lg border p-8 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-6">Partnership Advantages</h3>
                            <ul className="space-y-6">
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
                        </div>

                        {/* Bento Box 3: Image */}
                        <div className="relative rounded-xl shadow-lg border overflow-hidden min-h-[250px] bg-cover bg-center" style={{backgroundImage: "url('https://res.cloudinary.com/dzbibbld6/image/upload/v1768758490/supplychain2_bzj3zk.jpg')"}}>
                           <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                               <h3 className="text-xl font-bold text-white">A Supply Chain You Can Trust</h3>
                           </div>
                        </div>

                        {/* Bento Box 4: Call to action */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-brand-dark">Ready to Get Started?</h3>
                                <p className="text-gray-600 mt-1">Our team is ready to help you with the onboarding process.</p>
                            </div>
                            <button onClick={() => onNavigate({ name: 'contact' })} className="bg-accent-green text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors duration-300 whitespace-nowrap">
                                Contact Our Team
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default WholesalePublicPage;
