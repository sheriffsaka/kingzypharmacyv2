
import React from 'react';

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
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.imageUrl} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-bold text-brand-dark">{testimonial.name}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;