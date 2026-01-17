
import React from 'react';
import WhyChooseUs from './WhyChooseUs';
import Persona from './Persona';
import HeroSection from './HeroSection';

const teamMembers = [
  {
    name: 'Dr. Ada Okoro',
    title: 'Founder & Chief Pharmacist',
    bio: 'With over 20 years of experience in the pharmaceutical industry, Dr. Okoro founded Kingzy Pharma to make healthcare accessible to all Nigerians.',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Tunde Adebayo',
    title: 'Head of Operations',
    bio: 'Tunde is a logistics expert who ensures that your orders are processed efficiently and delivered on time, every time.',
    imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg',
  },
  {
    name: 'Chiamaka Nwosu',
    title: 'Lead Technologist',
    bio: 'Chiamaka leads the tech team, building the innovative platform that powers Kingzy Pharma with a focus on user experience.',
    imageUrl: 'https://randomuser.me/api/portraits/women/69.jpg',
  }
];


const AboutPage: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="About Kingzy Pharmaceuticals"
                subtitle="Your trusted partner in health and wellness, committed to providing accessible, affordable, and authentic pharmaceutical products."
                imageUrl="https://images.unsplash.com/photo-1584515933487-779824d27937?q=80&w=1200"
            />

            {/* Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800" alt="Pharmacists working" className="rounded-lg shadow-lg" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Our mission is to revolutionize the pharmaceutical landscape in Nigeria by leveraging technology to bridge the gap between patients and quality healthcare. We believe that everyone deserves access to genuine medications without the hassle of traditional pharmacy visits.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            At Kingzy Pharmaceuticals, we combine professional expertise with unparalleled convenience, ensuring that your health is always our top priority. From the moment you browse our catalog to the instant your package arrives, we guarantee a seamless and trustworthy experience.
                        </p>
                    </div>
                </div>
            </section>
            
            <WhyChooseUs />
            
            {/* Team Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">Meet Our Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map(member => (
                           <Persona key={member.name} {...member} />
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;