import React from 'react';
import { View } from '../types';
import { Article } from '../data/articles';

interface HealthArticlesProps {
    articles: Article[];
    onNavigate: (view: View) => void;
}

const HealthArticles: React.FC<HealthArticlesProps> = ({ articles, onNavigate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article) => (
        <button 
          key={article.id}
          onClick={() => onNavigate({ name: 'blogDetail', articleId: article.id })}
          className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border overflow-hidden text-left"
        >
          <div className="relative aspect-video">
             <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          </div>
          <div className="p-6">
            <h4 className="text-xl font-semibold text-brand-dark group-hover:text-brand-primary transition-colors mb-2">{article.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{article.summary}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default HealthArticles;