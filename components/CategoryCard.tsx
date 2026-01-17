
import React from 'react';
import { Category } from '../types';
import { PillIcon, HeartIcon, BabyIcon, SunIcon, ClipboardCheckIcon } from './Icons';

interface CategoryCardProps {
    category: Category;
    onSelectCategory: (id: number) => void;
}

const categoryIcons: { [key: string]: React.FC<{className?: string}> } = {
    'Pain Relief': PillIcon,
    'Vitamins & Supplements': SunIcon,
    'Allergy & Hay Fever': HeartIcon,
    'Digestive Health': ClipboardCheckIcon,
    'Cough, Cold & Flu': BabyIcon,
};


const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelectCategory }) => {
    const Icon = categoryIcons[category.name] || PillIcon;

    return (
        <button 
            onClick={() => onSelectCategory(category.id)}
            className="group flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border text-center"
        >
            <div className="p-4 bg-brand-light rounded-full mb-3">
                 <Icon className="w-8 h-8 text-brand-primary" />
            </div>
            <span className="font-semibold text-brand-dark">{category.name}</span>
        </button>
    )
}

export default CategoryCard;