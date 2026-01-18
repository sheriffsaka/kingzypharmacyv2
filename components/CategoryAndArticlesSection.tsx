
import React from 'react';
import { Category } from '../types';
import CategoryCard from './CategoryCard';
import HealthArticles from './HealthArticles';

interface CategoryAndArticlesSectionProps {
    categories: Category[];
    onSelectCategory: (id: number) => void;
}

const articles = [
  {
    title: "Understanding Common Pain Relievers",
    summary: "Learn the difference between Paracetamol and Ibuprofen...",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673681/commonpainrelievers_oppbhh.jpg",
    link: "#"
  },
  {
    title: "The Importance of Vitamin D",
    summary: "Discover why Vitamin D is crucial for bone health and immunity...",
     imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673688/vitaminD2_n8ylyp.jpg",
    link: "#"
  },
  {
    title: "Tips for Managing Seasonal Allergies",
    summary: "Don't let allergies ruin your season. Here are some effective tips...",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673682/seasnalallegies_ercnva.jpg",
    link: "#"
  }
];

const CategoryAndArticlesSection: React.FC<CategoryAndArticlesSectionProps> = ({ categories, onSelectCategory }) => {
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
                        <HealthArticles articles={articles} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryAndArticlesSection;
