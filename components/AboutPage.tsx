import React from 'react';
import WhyChooseUs from './WhyChooseUs';
import Persona from './Persona';
import HeroSection from './HeroSection';

const teamMembers = [
  {
    name: 'Dr. Ada Okoro',
    title: 'Founder & Chief Pharmacist',
    bio: 'With over 20 years of experience in the pharmaceutical industry, Dr. Okoro founded Kingzy Pharma to make healthcare accessible to all Nigerians.',
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769541476/lady1_ff4ank.jpg',
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
    'Integrity',
    'Quality',
    'Efficiency',
    'Trustworthy',
    'Responsiveness',
    'Safety'
];


const AboutPage: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="About Kingzy Pharmaceuticals"
                subtitle="Your trusted partner in health and wellness, committed to providing accessible, affordable, and authentic pharmaceutical products."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768765153/aboutbanner_d1s8jg.jpg"
            />

            {/* Vision Section */}
            <section className="py-16 text-center bg-brand-light">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Vision</h2>
                    <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto text-xl">
                        To be a distinguished leader in premium health solutions around the globe.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img src="https://res.cloudinary.com/dzbibbld6/image/upload/v1768765153/aboutimage_t72nez.jpg" alt="Pharmacists working" className="rounded-lg shadow-lg" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark mb-4">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed text-xl">
                            Providing accessible and reliable health solutions using smart technology in a placid environment and in collaboration with our purpose driven staff.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {coreValues.map(value => (
                            <div key={value} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                                <h3 className="font-bold text-brand-primary text-lg">{value}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <WhyChooseUs />
            
            {/* Team Section */}
            <section className="py-16 bg-white">
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