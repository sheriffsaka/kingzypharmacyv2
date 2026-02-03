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
            className="group flex flex-col w-full h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden text-center"
            aria-label={`Shop ${category.name}`}
        >
            {/* Image Container with Fixed Aspect Ratio */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                 <img 
                    src={category.image_url || 'https://images.unsplash.com/photo-1583324113620-91024589d19a?q=80&w=800'}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    loading="lazy" 
                />
                <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-300"></div>
            </div>

            {/* Text Content Area with Standardized Padding and Alignment */}
            <div className="p-4 flex flex-col justify-center items-center flex-grow min-h-[60px]">
                <h3 className="text-sm md:text-base font-bold text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight">
                    {category.name}
                </h3>
                {category.group && (
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.group}
                    </span>
                )}
            </div>
        </button>
    )
}

export default CategoryCard;