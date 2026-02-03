
import React, { useState, useEffect } from 'react';
import { Product, Profile } from '../types';
import { useCart } from '../contexts/CartContext';

interface DealsOfTheDayProps {
  product: Product;
  onProductSelect: (productId: number) => void;
}

const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const difference = endOfDay.getTime() - now.getTime();
        
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });
    
    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        return (
            <div key={interval} className="text-center">
                <span className="text-2xl md:text-3xl font-bold">{String(value).padStart(2, '0')}</span>
                <span className="text-xs uppercase tracking-wider">{interval}</span>
            </div>
        )
    });

    return (
        <div className="flex justify-center gap-4 text-white">
            {timerComponents.length ? timerComponents : <span>Deal has ended!</span>}
        </div>
    );
}


const DealsOfTheDay: React.FC<DealsOfTheDayProps> = ({ product, onProductSelect }) => {
  const { addToCart } = useCart();
  const dealPrice = Math.round((product.prices?.retail ?? 0) * 0.9); // 10% discount

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  }

  return (
    <section className="py-16 bg-gradient-to-br from-brand-primary to-brand-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Deal of the Day</h2>
        <p className="text-center text-brand-secondary mb-8">Grab it before it's gone!</p>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="relative w-full h-64 md:h-full min-h-[300px]">
                <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-contain p-4"
                />
            </div>

            <div className="p-8 md:p-12">
                <h3 className="text-2xl font-bold text-brand-dark">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{product.dosage}</p>
                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">{product.description}</p>
                
                <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-4xl font-bold text-accent-green">₦{dealPrice.toLocaleString()}</span>
                    <span className="text-xl text-gray-400 line-through">₦{(product.prices?.retail ?? 0).toLocaleString()}</span>
                </div>

                <div className="bg-brand-dark rounded-lg p-4 mb-6">
                    <CountdownTimer />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-secondary transition-colors transform hover:scale-105"
                    >
                        Add to Cart
                    </button>
                    <button 
                        onClick={() => onProductSelect(product.id)}
                        className="flex-1 bg-gray-200 text-brand-dark font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;
