/**
 * ============================================
 * ARTICLE CARD COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-27
 * @description Reusable article card with animations
 * ============================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  imageUrl?: string;
  readTime?: number;
  status: string;
  author?: {
    id: string;
    name: string;
  };
  publishedAt?: string;
  tags?: string[];
}

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index = 0 }) => {
  const navigate = useNavigate();
  
  const imageUrl = article.coverImage || article.imageUrl || 
    'https://images.unsplash.com/photo-1594736139994-372be0a59976? ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const displayContent = article.excerpt || article.content;
  const category = article.category || 'Wellness';

  const handleClick = () => {
    console.log('📱 Article card clicked:', article.id, article.title);
    navigate(`/article/${article.id}`);
  };

  const handleMouseEnter = () => {
    // Prefetch article data on hover (optional - requires React Query)
    console.log('🔮 Prefetching article:', article.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group cursor-pointer hover:shadow-2xl transition-shadow duration-300"
      role="article"
      aria-labelledby={`article-title-${article.id}`}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          src={imageUrl} 
          alt={article.title}
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-teal-600 text-xs font-bold uppercase tracking-wide rounded-full shadow-md">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          {article.author && (
            <span className="text-sm text-gray-500 font-medium">
              By {article.author.name}
            </span>
          )}
          {article.readTime && (
            <div className="flex items-center gap-1 text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">{article.readTime} min</span>
            </div>
          )}
        </div>
        
        <h3 
          id={`article-title-${article.id}`}
          className="text-xl font-bold mb-3 text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2"
        >
          {article.title}
        </h3>

        <p className="text-gray-600 flex-grow line-clamp-3 text-sm leading-relaxed">
          {displayContent?. substring(0, 150)}... 
        </p>
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Read More Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-teal-600 font-semibold text-sm group-hover:text-teal-700">
            <span>Read Full Article</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;