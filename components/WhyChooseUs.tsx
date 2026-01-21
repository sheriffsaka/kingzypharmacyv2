
import React from 'react';
import { ShieldCheckIcon, TruckIcon, ClipboardCheckIcon } from './Icons';

const features = [
  {
    icon: ShieldCheckIcon,
    title: "100% Authentic",
    description: "All our products are sourced directly from manufacturers and authorized distributors."
  },
  {
    icon: TruckIcon,
    title: "Fast Delivery",
    description: "Get your orders delivered to your doorstep with our express shipping options across Nigeria."
  },
  {
    icon: ClipboardCheckIcon,
    title: "Wide Selection",
    description: "We offer a vast range of healthcare products to meet all your needs."
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="bg-brand-primary/5 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-left text-brand-dark mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="flex justify-center items-center mb-4">
                 <div className="bg-white p-4 rounded-full shadow-md">
                    <feature.icon className="w-10 h-10 text-brand-secondary" />
                 </div>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
