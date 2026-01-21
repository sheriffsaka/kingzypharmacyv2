import React from 'react';
import HeroSection from './HeroSection';
import HealthArticles from './HealthArticles';
import { View } from '../types';
import { articles } from '../data/articles';

interface HealthInsightsProps {
    onNavigate: (view: View) => void;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ onNavigate }) => {
    return (
        <div className="bg-white">
            <HeroSection 
                title="Health Insights"
                subtitle="Explore expert articles, tips, and insights to help you live a healthier and more informed life."
                imageUrl="https://res.cloudinary.com/dzbibbld6/image/upload/v1768768164/blog2_jvugh6.jpg"
            />
            <div className="container mx-auto px-4 py-16">
                <HealthArticles articles={articles} onNavigate={onNavigate} />
            </div>
        </div>
    );
};

export default HealthInsights;