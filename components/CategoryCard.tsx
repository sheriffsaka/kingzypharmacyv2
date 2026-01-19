
import React from 'react';
import { Category } from '../types';

interface CategoryCardProps {
    category: Category;
    onSelectCategory: (id: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelectCategory }) => {
    return (
        <button 
            onClick={() => onSelectCategory(category.id)}
            className="group relative block w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            aria-label={`Shop ${category.name}`}
        >
            <img 
                src={category.image_url || 'https://images.unsplash.com/photo-1583324113620-91024589d19a?q=80&w=800'}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-colors duration-300"></div>
            <div className="relative h-full flex items-center justify-center p-4">
                <h3 className="text-white text-lg font-bold text-center shadow-sm">{category.name}</h3>
            </div>
        </button>
    )
}

export default CategoryCard;
