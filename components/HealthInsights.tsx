import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import HealthArticles from './HealthArticles';
import { View } from '../types';
import { articles as defaultArticles, Article } from '../data/articles';

interface HealthInsightsProps {
    onNavigate: (view: View) => void;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ onNavigate }) => {
    const [articles, setArticles] = useState<Article[]>(defaultArticles);

    useEffect(() => {
        const cmsDataRaw = localStorage.getItem('kingzy_cms_content');
        if (cmsDataRaw) {
            const cmsData = JSON.parse(cmsDataRaw);
            if (cmsData.articles) {
                setArticles(cmsData.articles);
            }
        }
    }, []);

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