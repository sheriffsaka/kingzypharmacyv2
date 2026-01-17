
import React from 'react';

const HealthInsights: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-brand-dark mt-4">Health Insights</h1>
                <p className="text-gray-600 mt-4">
                    Our health and wellness blog is coming soon! Stay tuned for expert articles, tips, and insights to help you live a healthier life.
                </p>
                <img src="https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800" alt="Health insights illustration" className="mt-8 rounded-lg mx-auto" />
            </div>
        </div>
    );
};

export default HealthInsights;
