
import React, { useState, useEffect } from 'react';

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
}

const defaultArticles: Article[] = [
    {
        id: '1',
        title: 'Understanding Anxiety in Young Children',
        content: 'Anxiety is a normal part of childhood, but it can sometimes become overwhelming. This guide helps you recognize the signs and provides strategies to support your child through their worries.',
        category: 'Anxiety',
        imageUrl: 'https://images.unsplash.com/photo-1594409903991-3721115330a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '2',
        title: 'Building Stronger Connections Through Communication',
        content: 'Effective communication is the bedrock of a healthy parent-child relationship. Learn active listening techniques and ways to create a safe space for open conversation.',
        category: 'Communication',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: '3',
        title: 'The Importance of Self-Care for Caregivers',
        content: 'You can\'t pour from an empty cup. This article explores why caregiver self-care is crucial for family well-being and offers practical tips to recharge your batteries.',
        category: 'Self-Care',
        imageUrl: 'https://images.unsplash.com/photo-1594736139994-372be0a59976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
];

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-all duration-300">
        <img className="h-56 w-full object-cover" src={article.imageUrl} alt={article.title} />
        <div className="p-6 flex flex-col flex-grow">
            <p className="text-sm font-semibold text-teal mb-2 uppercase tracking-wide">{article.category}</p>
            <h3 className="text-xl font-bold font-heading mb-3 text-dark-text group-hover:text-teal transition-colors">{article.title}</h3>
            <p className="text-dark-text/70 flex-grow">{article.content}</p>
        </div>
    </div>
);


const LearnWell: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        try {
            const storedArticles = localStorage.getItem('totoz-wellness-articles');
            if (storedArticles) {
                setArticles(JSON.parse(storedArticles));
            } else {
                setArticles(defaultArticles);
                localStorage.setItem('totoz-wellness-articles', JSON.stringify(defaultArticles));
            }
        } catch (error) {
            console.error("Failed to parse articles from localStorage", error);
            setArticles(defaultArticles);
        }
    }, []);

    if (articles.length === 0) {
        return null;
    }

    return (
        <section id="learnwell" className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
                        LearnWell Resources
                    </h2>
                    <p className="mt-4 text-lg text-dark-text/60 max-w-2xl mx-auto">
                        Explore our library of guides and practical tips for mental wellness.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LearnWell;
