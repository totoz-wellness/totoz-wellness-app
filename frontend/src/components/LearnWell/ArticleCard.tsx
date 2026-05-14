/**
 * ============================================
 * ARTICLE CARD — LEARNWELL
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Brand-aligned article card
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

  const imageUrl =
    article.coverImage ||
    article.imageUrl ||
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=70';

  const displayContent = article.excerpt || article.content;
  const category = article.category || 'Wellness';

  const handleClick = () => navigate(`/article/${article.id}`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 cursor-pointer flex flex-col border border-[#1e3a6e]/6 hover:border-[#e9924b]/20 hover:-translate-y-1"
      role="article"
      aria-labelledby={`article-title-${article.id}`}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#fbfbfb]">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
          src={imageUrl}
          alt={article.title}
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/95 text-[#e9924b] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          {article.author && (
            <span className="text-xs text-[#1e3a6e]/45 font-medium">{article.author.name}</span>
          )}
          {article.readTime && (
            <div className="flex items-center gap-1 text-[#1e3a6e]/40">
              <ClockIcon className="w-3.5 h-3.5" />
              <span className="text-xs">{article.readTime} min</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          id={`article-title-${article.id}`}
          className="font-heading font-bold text-[#1e3a6e] text-base leading-snug mb-2.5 line-clamp-2 group-hover:text-[#e9924b] transition-colors"
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[#1e3a6e]/55 text-sm leading-relaxed line-clamp-3 flex-grow">
          {displayContent?.substring(0, 140)}...
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[#e9924b]/8 text-[#e9924b] px-2 py-0.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read more */}
        <div className="mt-4 pt-4 border-t border-[#1e3a6e]/6 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#e9924b] group-hover:text-[#d4762a] transition-colors">
            Read article
          </span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-[#e9924b] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;