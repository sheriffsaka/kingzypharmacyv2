import React, { useEffect, useState } from 'react';
import { View } from '../types';
import { articles as defaultArticles, Article } from '../data/articles';
import { ArrowLeftIcon } from './Icons';

interface BlogDetailPageProps {
  articleId: string;
  onNavigate: (view: View) => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ articleId, onNavigate }) => {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const cmsDataRaw = localStorage.getItem('kingzy_cms_content');
    const articlesSource = cmsDataRaw ? JSON.parse(cmsDataRaw).articles : defaultArticles;
    
    const foundArticle = articlesSource.find((a: Article) => a.id === articleId);
    setArticle(foundArticle || null);
    window.scrollTo(0, 0);
  }, [articleId]);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <button onClick={() => onNavigate({ name: 'healthInsights' })} className="mt-4 text-brand-primary hover:underline">
          Back to Health Insights
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative h-80 flex items-end justify-center text-center text-white">
         <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black/60"></div>
         <div className="relative z-10 p-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{article.title}</h1>
            <p className="mt-4 text-lg text-gray-200">By {article.author} | Published on {article.publishedDate}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => onNavigate({ name: 'healthInsights' })} className="flex items-center gap-2 text-brand-primary font-semibold mb-8 hover:underline">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Health Insights
          </button>
          
          <div className="prose lg:prose-lg max-w-none text-gray-800">
            {article.content.split('\n\n').map((paragraph, index) => {
                // Check if the paragraph is a heading
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h3 key={index} className="font-bold text-2xl mt-6 mb-2 text-brand-dark">{paragraph.slice(2, -2)}</h3>;
                }
                return <p key={index}>{paragraph}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;