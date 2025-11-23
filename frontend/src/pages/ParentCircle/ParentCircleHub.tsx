/**
 * ============================================
 * PARENTCIRCLE HUB - WITH TWITTER-STYLE MODALS
 * ============================================
 * @version     3.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:40:02 UTC
 * @description Complete feed with modal detail views
 * ============================================
 */

import React, { useState, useCallback } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../../components/ParentCircle/Layout/Sidebar';
import TrendingSidebar from '../../components/ParentCircle/Layout/TrendingSidebar';
import FeedContainer from '../../components/ParentCircle/Feed/FeedContainer';
import QuestionDetailModal from '../../components/ParentCircle/Detail/QuestionDetailModal';
import StoryDetailModal from '../../components/ParentCircle/Detail/StoryDetailModal';
import CreateQuestionModal from '../../components/ParentCircle/Forms/CreateQuestionModal';
import CreateStoryModal from '../../components/ParentCircle/Forms/CreateStoryModal';
import { useQuestions, useStories, useCategories } from '../../hooks/useParentCircle';
import * as API from '../../services/parentcircle.service';

const ParentCircleHub: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'question' | 'story'>('question');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 🆕 Modal State
  const [detailModal, setDetailModal] = useState<{ 
    type: 'question' | 'story' | null; 
    id: number | null 
  }>({ type: null, id: null });

  // Fetch data with hooks
  const { categories, loading: categoriesLoading } = useCategories();
  
  const { 
    questions, 
    loading: questionsLoading, 
    hasMore: hasMoreQuestions,
    loadMore: loadMoreQuestions,
    refresh: refreshQuestions
  } = useQuestions({
    categoryId: selectedCategory ?? undefined,
    sortBy,
    search: searchQuery || undefined
  });

  const { 
    stories, 
    loading: storiesLoading,
    hasMore: hasMoreStories,
    loadMore: loadMoreStories,
    refresh: refreshStories
  } = useStories({
    categoryId: selectedCategory ?? undefined,
    sortBy,
    search: searchQuery || undefined
  });

  // Handlers
  const handleVoteQuestion = useCallback(async (id: number, isHelpful: boolean) => {
    try {
      await API.voteQuestion(id, isHelpful);
      toast.success(isHelpful ? '👍 Marked as helpful!' : '👎 Feedback recorded');
      refreshQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  }, [refreshQuestions]);

  const handleLikeStory = useCallback(async (id: number) => {
    try {
      await API.likeStory(id);
      toast.success('❤️ Story liked!');
      refreshStories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to like story');
    }
  }, [refreshStories]);

  // 🆕 Open Detail Modal (instead of navigation)
  const handleItemClick = (id: number) => {
    console.log(`[${new Date().toISOString()}] Opening ${activeTab} detail modal: ${id}`);
    setDetailModal({ type: activeTab, id });
    
    // Update URL without full navigation
    const url = `/${activeTab}/${id}`;
    window.history.pushState({ modal: activeTab, id }, '', url);
  };

  // 🆕 Close Detail Modal
  const handleCloseModal = () => {
    console.log(`[${new Date().toISOString()}] Closing detail modal`);
    setDetailModal({ type: null, id: null });
    
    // Restore feed URL
    window.history.pushState({}, '', '/parentcircle');
  };

  // Handle browser back button
  React.useEffect(() => {
    const handlePopState = () => {
      setDetailModal({ type: null, id: null });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleCreateNew = () => {
    setShowCreateModal(true);
    console.log(`[${new Date().toISOString()}] Create ${activeTab} modal opened`);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    console.log(`[${new Date().toISOString()}] ${activeTab} created successfully`);
    if (activeTab === 'question') {
      refreshQuestions();
    } else {
      refreshStories();
    }
  };

  const handleTabChange = (tab: 'question' | 'story') => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchQuery('');
    console.log(`[${new Date().toISOString()}] Tab switched to: ${tab}`);
  };

  const currentItems = activeTab === 'question' ? questions : stories;
  const currentLoading = activeTab === 'question' ? questionsLoading : storiesLoading;
  const currentHasMore = activeTab === 'question' ? hasMoreQuestions : hasMoreStories;
  const currentLoadMore = activeTab === 'question' ? loadMoreQuestions : loadMoreStories;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-dark-text mb-4">
            ParentCircle Community 👨‍👩‍👧‍👦
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A safe, anonymous space to share stories, ask questions, and support one another.
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto mb-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Tab Switcher */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => handleTabChange('question')}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === 'question'
                      ? 'bg-white text-teal shadow-md'
                      : 'text-gray-600 hover:text-teal'
                  }`}
                >
                  🙋 Q&A Support
                </button>
                <button
                  onClick={() => handleTabChange('story')}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                    activeTab === 'story'
                      ? 'bg-white text-teal shadow-md'
                      : 'text-gray-600 hover:text-teal'
                  }`}
                >
                  📖 Stories
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'question' ? 'questions' : 'stories'}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition-all"
                />
              </div>

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNew}
                className="bg-teal text-white font-bold py-2.5 px-6 rounded-xl hover:bg-teal/90 transition-all flex items-center gap-2 shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                {activeTab === 'question' ? 'Ask Question' : 'Share Story'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content - 3 Column Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar - Filters */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Sidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                activeTab={activeTab}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </motion.div>

            {/* Main Feed */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FeedContainer
                    type={activeTab}
                    items={currentItems}
                    loading={currentLoading}
                    hasMore={currentHasMore}
                    onLoadMore={currentLoadMore}
                    onItemClick={handleItemClick}
                    onVote={handleVoteQuestion}
                    onLike={handleLikeStory}
                    onCreateNew={handleCreateNew}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right Sidebar - Trending */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3 hidden lg:block"
            >
              <div className="sticky top-4">
                <TrendingSidebar />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Action Button (Mobile) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCreateNew}
          className="lg:hidden fixed bottom-6 right-6 bg-teal text-white p-4 rounded-full shadow-2xl z-40"
        >
          <PlusIcon className="w-6 h-6" />
        </motion.button>
      </div>

      {/* 🆕 Detail Modals */}
      {detailModal.type === 'question' && detailModal.id && (
        <QuestionDetailModal
          questionId={detailModal.id}
          onClose={handleCloseModal}
        />
      )}

      {detailModal.type === 'story' && detailModal.id && (
        <StoryDetailModal
          storyId={detailModal.id}
          onClose={handleCloseModal}
        />
      )}

      {/* Create Modals */}
      <CreateQuestionModal
        isOpen={showCreateModal && activeTab === 'question'}
        onClose={handleCloseCreateModal}
        categories={categories}
        onSuccess={handleCreateSuccess}
      />

      <CreateStoryModal
        isOpen={showCreateModal && activeTab === 'story'}
        onClose={handleCloseCreateModal}
        categories={categories}
        onSuccess={handleCreateSuccess}
      />
    </section>
  );
};

export default ParentCircleHub;