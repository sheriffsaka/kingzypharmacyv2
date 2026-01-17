
import React from 'react';
import HeroSection from './HeroSection';
import HealthArticles from './HealthArticles';

const HealthInsights: React.FC = () => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="Health Insights"
                subtitle="Explore expert articles, tips, and insights to help you live a healthier and more informed life."
                imageUrl="https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1200"
            />
            <HealthArticles />
        </div>
    );
};

export default HealthInsights;
