import React from 'react';
import { Category, View } from '../types';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';
import { articles } from '../data/articles';

interface CategoryAndArticlesSectionProps {
    categories: Category[];
    onSelectCategory: (id: number) => void;
    onNavigate: (view: View) => void;
}

const CategoryAndArticlesSection: React.FC<CategoryAndArticlesSectionProps> = ({ categories, onSelectCategory, onNavigate }) => {
    // Take only the first 5 categories to feature
    const featuredCategories = categories.slice(0, 5);

    return (
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Categories Section */}
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark mb-6">Shop by Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {featuredCategories.map(cat => (
                                <CategoryCard key={cat.id} category={cat} onSelectCategory={onSelectCategory} />
                            ))}
                        </div>
                    </div>

                    {/* Health Articles Section */}
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark mb-6">Health Articles</h2>
                        <HealthArticles articles={articles} onNavigate={onNavigate} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryAndArticlesSection;