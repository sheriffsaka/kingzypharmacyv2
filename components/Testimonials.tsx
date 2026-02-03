import React, { useState, useEffect, useCallback } from 'react';

const testimonials = [
  {
    name: "Adebayo Kolawole",
    quote: "The service is incredibly fast and reliable. I got my medications delivered to my doorstep in Lagos within hours. Highly recommended!",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Chidinma Okoro",
    quote: "I love the wide selection of products. The AI assistant was also very helpful in answering my questions about a specific supplement.",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Musa Aliyu",
    quote: "As a wholesale buyer, the tiered pricing is a game-changer for my pharmacy. The platform is easy to use and the process is seamless.",
    imageUrl: "https://randomuser.me/api/portraits/men/46.jpg"
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="flex-grow relative bg-brand-primary text-white p-8 rounded-lg shadow-lg flex flex-col justify-between min-h-[280px]">
      {/* The testimonial content with transition */}
      <div className="transition-opacity duration-500 ease-in-out" key={currentIndex}>
        <p className="text-gray-200 mb-4 italic text-lg">"{currentTestimonial.quote}"</p>
        <div className="flex items-center">
          <img src={currentTestimonial.imageUrl} alt={currentTestimonial.name} className="w-14 h-14 rounded-full mr-4 border-2 border-white/50" />
          <div>
            <h4 className="font-bold text-white">{currentTestimonial.name}</h4>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;