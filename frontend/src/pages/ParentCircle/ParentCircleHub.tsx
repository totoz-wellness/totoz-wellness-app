/**
 * ============================================
 * PARENTCIRCLE HUB - COMPLETE COMMUNITY PLATFORM
 * ============================================
 * @version     6.0.0
 * @author      ArogoClin
 * @updated     2025-12-05
 * @description Production-ready community hub with drawers
 * ============================================
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Sidebar from '../../components/ParentCircle/Layout/Sidebar';
import TrendingSidebar from '../../components/ParentCircle/Layout/TrendingSidebar';
import FeedContainer from '../../components/ParentCircle/Feed/FeedContainer';
import QuestionDrawer from '../../components/ParentCircle/Detail/QuestionDrawer';
import StoryDrawer from '../../components/ParentCircle/Detail/StoryDrawer';
import CreateQuestionModal from '../../components/ParentCircle/Forms/CreateQuestionModal';
import CreateStoryModal from '../../components/ParentCircle/Forms/CreateStoryModal';
import { useQuestions, useStories, useCategories } from '../../hooks/useParentCircle';
import * as API from '../../services/parentcircle.service';

const ParentCircleHub: React. FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [activeTab, setActiveTab] = useState<'question' | 'story'>('question');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Drawer State
  const [detailModal, setDetailModal] = useState<{ 
    type: 'question' | 'story' | null; 
    id: number | null 
  }>({ type: null, id: null });

  // Parse URL to detect drawer state on mount
  useEffect(() => {
    const path = location.pathname;
    const questionMatch = path.match(/\/parentcircle\/question\/(\d+)/);
    const storyMatch = path.match(/\/parentcircle\/story\/(\d+)/);

    if (questionMatch) {
      const id = parseInt(questionMatch[1]);
      setDetailModal({ type: 'question', id });
      setActiveTab('question');
    } else if (storyMatch) {
      const id = parseInt(storyMatch[1]);
      setDetailModal({ type: 'story', id });
      setActiveTab('story');
    } else {
      setDetailModal({ type: null, id: null });
    }
  }, [location.pathname]);

  // Fetch data with custom hooks
  const { categories, loading: categoriesLoading } = useCategories();
  
  const { 
    questions, 
    loading: questionsLoading, 
    hasMore: hasMoreQuestions,
    loadMore: loadMoreQuestions,
    refresh: refreshQuestions
  } = useQuestions({
    categoryId: selectedCategory ??  undefined,
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

  // Event Handlers
  const handleVoteQuestion = useCallback(async (id: number, isHelpful: boolean) => {
    try {
      await API.voteQuestion(id, isHelpful);
      toast.success(isHelpful ? 'Marked as helpful!' : 'Feedback recorded');
      refreshQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  }, [refreshQuestions]);

  const handleLikeStory = useCallback(async (id: number) => {
    try {
      await API.likeStory(id);
      toast.success('Story liked! ');
      refreshStories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to like story');
    }
  }, [refreshStories]);

  const handleItemClick = (id: number) => {
    setDetailModal({ type: activeTab, id });
    navigate(`/parentcircle/${activeTab}/${id}`, { replace: false });
  };

  const handleCloseModal = () => {
    setDetailModal({ type: null, id: null });
    navigate('/parentcircle', { replace: false });
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const path = location.pathname;
      if (! path.includes('/question/') && !path.includes('/story/')) {
        setDetailModal({ type: null, id: null });
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    if (activeTab === 'question') {
      refreshQuestions();
    } else {
      refreshStories();
    }
    setShowCreateModal(false);
    toast.success(`${activeTab === 'question' ? 'Question' : 'Story'} submitted for moderation! `);
  };

  const handleTabChange = (tab: 'question' | 'story') => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('recent');
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Computed values
  const currentItems = activeTab === 'question' ? questions : stories;
  const currentLoading = activeTab === 'question' ? questionsLoading : storiesLoading;
  const currentHasMore = activeTab === 'question' ? hasMoreQuestions : hasMoreStories;
  const currentLoadMore = activeTab === 'question' ? loadMoreQuestions : loadMoreStories;

  return (
    <>
      <Navbar />
      
      <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-20">
        <Toaster position="top-right" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              ParentCircle Community
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A safe, anonymous space to share stories, ask questions, and support one another
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Tab Switcher */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                  <button
                    onClick={() => handleTabChange('question')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2. 5 rounded-lg font-bold transition-all ${
                      activeTab === 'question'
                        ? 'bg-white text-teal shadow-md'
                        : 'text-gray-600 hover:text-teal'
                    }`}
                  >
                    Q&A Support
                  </button>
                  <button
                    onClick={() => handleTabChange('story')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg font-bold transition-all ${
                      activeTab === 'story'
                        ? 'bg-white text-teal shadow-md'
                        : 'text-gray-600 hover:text-teal'
                    }`}
                  >
                    Stories
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 w-full md:max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={`Search ${activeTab === 'question' ? 'questions' : 'stories'}...`}
                    className="w-full pl-10 pr-4 py-2. 5 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition-all"
                  />
                </div>

                {/* Create Button - Desktop */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateNew}
                  className="hidden md:flex items-center gap-2 bg-teal text-white font-bold py-2. 5 px-6 rounded-xl hover:bg-teal/90 transition-all shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  {activeTab === 'question' ?  'Ask Question' : 'Share Story'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content - 3 Column Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Sidebar - Filters */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3"
              >
                <div className="sticky top-4">
                  <Sidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    activeTab={activeTab}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                  />
                </div>
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
            className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-teal to-blue-600 text-white p-4 rounded-full shadow-2xl z-30"
          >
            <PlusIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Detail Drawers */}
        <QuestionDrawer
          questionId={detailModal.id! }
          isOpen={detailModal.type === 'question' && detailModal.id !== null}
          onClose={handleCloseModal}
        />

        <StoryDrawer
          storyId={detailModal.id! }
          isOpen={detailModal.type === 'story' && detailModal.id !== null}
          onClose={handleCloseModal}
        />

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


    </>
  );
};

export default ParentCircleHub;