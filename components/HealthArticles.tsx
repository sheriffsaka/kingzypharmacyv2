
import React from 'react';

interface Article {
    title: string;
    summary: string;
    imageUrl: string;
    link: string;
}

interface HealthArticlesProps {
    articles: Article[];
}

const HealthArticles: React.FC<HealthArticlesProps> = ({ articles }) => {
  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <a 
          key={index} 
          href={article.link} 
          className="group flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border"
        >
          <img src={article.imageUrl} alt={article.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
          <div className="flex-grow">
            <h4 className="font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">{article.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2">{article.summary}</p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default HealthArticles;
