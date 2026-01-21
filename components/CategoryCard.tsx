
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
            className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden text-center"
            aria-label={`Shop ${category.name}`}
        >
            <div className="relative aspect-[4/3] bg-gray-100">
                 <img 
                    src={category.image_url || 'https://images.unsplash.com/photo-1583324113620-91024589d19a?q=80&w=800'}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    loading="lazy" 
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">{category.name}</h3>
            </div>
        </button>
    )
}

export default CategoryCard;
