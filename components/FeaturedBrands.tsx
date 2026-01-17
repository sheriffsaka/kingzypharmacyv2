
import React from 'react';

const brands = [
  { name: 'PharmaCo', logoUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768675190/pharmaco_tekqma.jpg' },
  { name: 'HealthFirst', logoUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768675177/healthfirst_he6csi.jpg' },
  { name: 'Wellness Inc.', logoUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768675176/wellness_wgytix.jpg' },
  { name: 'MediCare', logoUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768675417/medicare_cehf53.jpg' },
  { name: 'VitaPlus', logoUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768675176/vitaplus_e6h3uq.jpg' },
];

const FeaturedBrands: React.FC = () => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">Featured Brands</h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {brands.map(brand => (
            <img 
              key={brand.name}
              src={brand.logoUrl}
              alt={brand.name} 
              className="h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBrands;