import React from 'react';
import HeroSection from './HeroSection';
import HealthArticles from './HealthArticles';

// FIX: Add mock article data required by the HealthArticles component.
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

const HealthInsights: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="Health Insights"
                subtitle="Explore expert articles, tips, and insights to help you live a healthier and more informed life."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768768164/blog2_jvugh6.jpg"
            />
            {/* FIX: Pass the required 'articles' prop to the HealthArticles component and wrap it in a container for proper page layout. */}
            <div className="container mx-auto px-4 py-16">
                <HealthArticles articles={articles} />
            </div>
        </div>
    );
};

export default HealthInsights;