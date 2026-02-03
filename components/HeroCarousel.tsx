import React, { useState, useEffect, useCallback } from 'react';
import { View } from '../types';
import { ArrowRightIcon } from './Icons';

interface HeroCarouselProps {
  onNavigate: (view: View) => void;
}

const slides = [
  {
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768757551/warehouse3_oabgkd.jpg',
    title: 'Become a Wholesale Partner',
    subtitle: 'Access exclusive bulk pricing and priority logistics. Join our network of pharmacies and grow your business today.',
    ctaText: 'Register Now',
    // FIX: Changed 'wholesale_public' to 'pharmacists_public' to match the View type.
    ctaView: { name: 'pharmacists_public' } as View,
  },
  {
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1768763581/authentic_binysa.jpg',
    title: 'Authenticity You Can Trust',
    subtitle: 'We source directly from manufacturers to guarantee 100% authentic medications for your customers.',
    ctaText: 'Learn About Us',
    ctaView: { name: 'about' } as View,
  },
  {
    imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769975903/kingzydeliveryvan_rv92k9.png',
    title: 'Seamless Ordering & Fast Delivery',
    subtitle: 'Our state-of-the-art platform ensures your orders are processed efficiently and delivered on time.',
    ctaText: 'Explore Products',
    ctaView: { name: 'products' } as View,
  },
];

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Auto-play every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      ))}
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center text-white">
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{slides[currentIndex].title}</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">{slides[currentIndex].subtitle}</p>
          <button 
            onClick={() => onNavigate(slides[currentIndex].ctaView)}
            className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-brand-secondary transition-all duration-300 transform hover:scale-105 group flex items-center gap-2"
          >
            {slides[currentIndex].ctaText} <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
