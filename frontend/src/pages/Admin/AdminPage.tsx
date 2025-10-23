import React, { useState, useEffect } from 'react';
import { Article } from '../LearnWell';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface AdminPageProps {
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    try {
        const storedArticles = localStorage.getItem('totoz-wellness-articles');
        if (storedArticles) {
          setArticles(JSON.parse(storedArticles));
        }
    } catch (error) {
        console.error("Failed to load or parse articles from localStorage", error);
        setArticles([]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category || !imageUrl) {
      alert('Please fill all fields');
      return;
    }
    const newArticle: Article = {
      id: new Date().toISOString(),
      title,
      content,
      category,
      imageUrl,
    };
    const updatedArticles = [...articles, newArticle];
    setArticles(updatedArticles);
    localStorage.setItem('totoz-wellness-articles', JSON.stringify(updatedArticles));
    
    setTitle('');
    setContent('');
    setCategory('');
    setImageUrl('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
        const updatedArticles = articles.filter(article => article.id !== id);
        setArticles(updatedArticles);
        localStorage.setItem('totoz-wellness-articles', JSON.stringify(updatedArticles));
    }
  };

  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '#';
  };

  return (
    <div className="min-h-screen bg-light-bg font-sans p-4 sm:p-8">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-teal">
            Admin Panel
          </h1>
          <div className="flex items-center space-x-6">
            <a href="#" onClick={handleBackToHome} className="font-semibold text-teal hover:text-teal/80 transition-colors">
              &larr; Back to Home
            </a>
            <button onClick={onLogout} className="bg-red-500 text-white font-bold py-2 px-5 rounded-full hover:bg-red-600 transition-colors text-sm">
                Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading mb-6 text-dark-text">Add New Resource</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-dark-text/80 mb-2">Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" required />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-bold text-dark-text/80 mb-2">Category</label>
                        <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" required />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-bold text-dark-text/80 mb-2">Image URL</label>
                        <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" required />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-bold text-dark-text/80 mb-2">Content</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" required ></textarea>
                    </div>
                    <button type="submit" className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md">
                        Publish Article
                    </button>
                </form>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading mb-6 text-dark-text">Published Resources</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {articles.length > 0 ? articles.map(article => (
                        <div key={article.id} className="flex items-center justify-between bg-light-bg/50 p-4 rounded-lg">
                            <div>
                                <h3 className="font-bold text-dark-text">{article.title}</h3>
                                <p className="text-sm text-dark-text/60">{article.category}</p>
                            </div>
                            <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Delete ${article.title}`}>
                                <TrashIcon />
                            </button>
                        </div>
                    )) : (
                        <p className="text-dark-text/60 text-center py-8">No articles published yet.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;