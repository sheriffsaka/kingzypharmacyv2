import React from 'react';
import HeroSection from './HeroSection';
import Persona from './Persona';
import WhyChooseUs from './WhyChooseUs';
import { View } from '../types';

interface AboutPageProps {
  onNavigate: (view: View) => void;
}

const teamMembers = [
  {
    name: 'Dr. Kingsley Emeka (CEO)',
    title: 'Founder & Chief Pharmacist',
    bio: 'With over 20 years of experience in the pharmaceutical industry, Dr. Okoro founded Kingzy Pharma to make healthcare accessible to all Nigerians.',
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769975052/kngzyceo_jc7dpl.jpg',
  },
  {
    name: 'Tunde Adebayo',
    title: 'Head of Operations',
    bio: 'Tunde is a logistics expert who ensures that your orders are processed efficiently and delivered on time, every time.',
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769541476/guy1_w46lys.jpg',
  },
  {
    name: 'Chiamaka Nwosu',
    title: 'Lead Technologist',
    bio: 'Chiamaka leads the tech team, building the innovative platform that powers Kingzy Pharma with a focus on user experience.',
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769541475/lady2_qfoh5b.jpg',
  }
];

const coreValues = [
  { title: 'Integrity', description: 'We maintain the highest ethical standards in all our pharmaceutical dealings.' },
  { title: 'Quality', description: 'We source only authentic medications from certified manufacturers.' },
  { title: 'Efficiency', description: 'Using technology to streamline healthcare delivery across the nation.' },
  { title: 'Safety', description: 'Your health is our priority; we never compromise on drug safety protocols.' }
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white">
      <HeroSection 
        title="About Kingzy Pharmaceuticals"
        subtitle="Your trusted partner in health and wellness, committed to providing accessible, affordable, and authentic pharmaceutical products."
        imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1769975053/kngzyfrontdesk_py4sef.jpg"
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://res.cloudinary.com/dzbibbld6/image/upload/v1769975052/kngzy_headoffice_jtrgvp.jpg" 
                alt="Pharmacists at work" 
                className="rounded-2xl shadow-2xl z-10 relative"
              />
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-brand-light rounded-2xl -z-0"></div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-brand-dark mb-6">Our Mission & Vision</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 mb-2">
                    <span className="w-8 h-1 bg-brand-primary rounded-full"></span>
                    OUR VISION
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    To be a distinguished leader in premium health solutions around the globe, recognized for our commitment to authenticity and innovation.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2 mb-2">
                    <span className="w-8 h-1 bg-brand-primary rounded-full"></span>
                    OUR MISSION
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Providing accessible and reliable health solutions using smart technology in a placid environment and in collaboration with our purpose-driven staff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-dark mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:border-brand-secondary transition-all group">
                <h4 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-primary">{value.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Meet Our Leadership</h2>
            <p className="text-gray-500 italic">The dedicated team behind Kingzy Pharmaceuticals working round the clock to ensure your health is protected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {teamMembers.map((member, idx) => (
              <Persona key={idx} {...member} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-primary py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 italic">Ready to experience better health care?</h2>
          <p className="text-brand-light/80 mb-10 max-w-2xl mx-auto">Join thousands of Nigerians who trust Kingzy Pharmaceuticals for their healthcare needs.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => onNavigate({ name: 'products' })}
              className="bg-white text-brand-primary font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all"
            >
              Explore Products
            </button>
            <button 
              onClick={() => onNavigate({ name: 'contact' })}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-all"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;