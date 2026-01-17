
import React from 'react';

const articles = [
  {
    title: "Understanding Common Pain Relievers",
    summary: "Learn the difference between Paracetamol and Ibuprofen, and which one is right for your needs.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673681/commonpainrelievers_oppbhh.jpg",
    link: "#"
  },
  {
    title: "The Importance of Vitamin D in Your Diet",
    summary: "Discover why Vitamin D is crucial for bone health and immune function, especially during colder months.",
     imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673688/vitaminD2_n8ylyp.jpg",
    link: "#"
  },
  {
    title: "Tips for Managing Seasonal Allergies",
    summary: "Don't let allergies ruin your season. Here are some effective tips to manage your symptoms.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673682/seasnalallegies_ercnva.jpg",
    link: "#"
  }
];

const HealthArticles: React.FC = () => {
  return (
    <section className="bg-brand-light py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-brand-dark mb-8">Health Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.summary}</p>
                <a href={article.link} className="font-semibold text-brand-primary hover:text-brand-secondary transition-colors">Read More &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthArticles;