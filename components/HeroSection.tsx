
import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageUrl: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, imageUrl }) => {
  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat h-64 md:h-80 flex items-center justify-center text-center text-white"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
};

export default HeroSection;
