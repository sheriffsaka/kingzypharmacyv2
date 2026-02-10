import React from 'react';
import HeroSection from './HeroSection';
import { View } from '../types';
import { ShieldCheckIcon, TruckIcon, ClipboardCheckIcon, PhoneIcon } from './Icons';

interface PlusMembershipProps {
    onNavigate: (view: View) => void;
}

const PlusMembership: React.FC<PlusMembershipProps> = ({ onNavigate }) => {
    const benefits = [
        {
            icon: TruckIcon,
            title: "Priority Express Delivery",
            description: "Platinum members receive priority in our dispatch queue, ensuring your medications arrive faster than ever."
        },
        {
            icon: PhoneIcon,
            title: "24/7 Dedicated Concierge",
            description: "Direct line to our senior pharmacists for medical guidance and order assistance at any time."
        },
        {
            icon: ShieldCheckIcon,
            title: "Exclusive Quality Assurance",
            description: "Direct tracking of manufacturing batches for absolute peace of mind regarding drug safety and origin."
        },
        {
            icon: ClipboardCheckIcon,
            title: "Custom Order Fulfillment",
            description: "Hard-to-find medications? Our global sourcing team works specifically for Platinum Cluster requests."
        }
    ];

    // You can add your actual partner logo URLs here
    const partnerLogos = [
        { name: "Supreme Darmatologist", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977494/clinic4-removebg-preview_f2azqg.png" },
        { name: "Nigeria Medical Association", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic2-removebg-preview_o5nu6e.png" },
        { name: "The Premier Specialist Medical Center", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic3-removebg-preview_ohderf.png" },
        { name: "St. Marys", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic1-removebg-preview_nbosky.png" },
    ];

    return (
        <div className="bg-white">
            <HeroSection 
                title="Kingzy Platinum Cluster"
                subtitle="The Gold Standard in Personalized Pharmaceutical Care & Service Excellence."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1769978308/Image_fx_16_zbmeqr.jpg"
            />
            
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-bold text-brand-dark mb-6">Experience Premium Healthcare</h2>
                    <p className="text-gray-600 text-xl leading-relaxed">
                        The Kingzy Platinum Cluster is an exclusive membership designed for individuals and healthcare providers 
                        who demand nothing but the best. We combine smart technology with white-glove service to manage 
                        your health needs with unprecedented efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-brand-light/30 p-8 rounded-2xl border border-brand-primary/10 hover:shadow-lg transition-all duration-300">
                            <div className="bg-brand-primary text-white w-12 h-12 rounded-full flex items-center justify-center mb-6">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-dark mb-3">{benefit.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-brand-dark rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">Elevate Your Health Journey</h2>
                        <p className="text-brand-light/80 text-lg mb-10 max-w-2xl mx-auto">
                            Join the elite circle of Kingzy partners and enjoy benefits tailored for the modern healthcare professional.
                        </p>
                        <button 
                            onClick={() => onNavigate({ name: 'pharmacists_public', isPlatinum: true })}
                            className="bg-yellow-500 hover:bg-yellow-400 text-brand-dark font-black py-5 px-12 rounded-full text-xl shadow-2xl transform hover:scale-105 transition-all"
                        >
                            JOIN THE PLATINUM CLUSTER
                        </button>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                </div>
            </div>

            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-brand-dark mb-8 uppercase tracking-widest opacity-80">Trusted by Premium Clinics Worldwide</h2>
                    <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20">
                        {partnerLogos.map((logo, idx) => (
                            <div key={idx} className="group">
                                <img 
                                    src={logo.url} 
                                    alt={logo.name} 
                                    className="h-12 md:h-16 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PlusMembership;