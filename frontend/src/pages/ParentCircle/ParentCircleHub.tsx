/**
 * ============================================
 * PARENTCIRCLE HUB
 * ============================================
 * @version     7.0.0
 * @updated     2025-04-23
 * @description Warm, human-centered community hub
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

const ParentCircleHub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'question' | 'story'>('question');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    type: 'question' | 'story' | null;
    id: number | null;
  }>({ type: null, id: null });

  // Parse URL on mount
  useEffect(() => {
    const path = location.pathname;
    const questionMatch = path.match(/\/parentcircle\/question\/(\d+)/);
    const storyMatch = path.match(/\/parentcircle\/story\/(\d+)/);
    if (questionMatch) {
      setDetailModal({ type: 'question', id: parseInt(questionMatch[1]) });
      setActiveTab('question');
    } else if (storyMatch) {
      setDetailModal({ type: 'story', id: parseInt(storyMatch[1]) });
      setActiveTab('story');
    } else {
      setDetailModal({ type: null, id: null });
    }
  }, [location.pathname]);

  const { categories } = useCategories();

  const { questions, loading: questionsLoading, hasMore: hasMoreQuestions, loadMore: loadMoreQuestions, refresh: refreshQuestions } =
    useQuestions({ categoryId: selectedCategory ?? undefined, sortBy, search: searchQuery || undefined });

  const { stories, loading: storiesLoading, hasMore: hasMoreStories, loadMore: loadMoreStories, refresh: refreshStories } =
    useStories({ categoryId: selectedCategory ?? undefined, sortBy, search: searchQuery || undefined });

  const handleVoteQuestion = useCallback(async (id: number, isHelpful: boolean) => {
    try {
      await API.voteQuestion(id, isHelpful);
      toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded');
      refreshQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    }
  }, [refreshQuestions]);

  const handleLikeStory = useCallback(async (id: number) => {
    try {
      await API.likeStory(id);
      refreshStories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to like story');
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

  useEffect(() => {
    const handlePopState = () => {
      const path = location.pathname;
      if (!path.includes('/question/') && !path.includes('/story/')) {
        setDetailModal({ type: null, id: null });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  const handleCreateSuccess = () => {
    activeTab === 'question' ? refreshQuestions() : refreshStories();
    setShowCreateModal(false);
    toast.success('Submitted for review — thank you for contributing.');
  };

  const handleTabChange = (tab: 'question' | 'story') => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('recent');
  };

  const currentItems = activeTab === 'question' ? questions : stories;
  const currentLoading = activeTab === 'question' ? questionsLoading : storiesLoading;
  const currentHasMore = activeTab === 'question' ? hasMoreQuestions : hasMoreStories;
  const currentLoadMore = activeTab === 'question' ? loadMoreQuestions : loadMoreStories;

  return (
    <>
      <Navbar />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e3a6e', color: '#fff', fontSize: '14px', borderRadius: '12px' },
        success: { iconTheme: { primary: '#e9924b', secondary: '#fff' } },
      }} />

      <div className="min-h-screen bg-[#fbfbfb] pt-20">

        {/* ── Hero ─────────────────────────────────────── */}
        <div className="bg-[#1e3a6e] py-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#e9924b]" />
                <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">ParentCircle</span>
              </div>
              <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-3 max-w-2xl">
                You are not alone in this.
              </h1>
              <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-lg">
                A calm, moderated space for parents and caregivers — ask questions, share stories, and find understanding from people who get it.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Action bar ───────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
          <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">

            {/* Tab switcher */}
            <div className="flex gap-1.5 bg-[#fbfbfb] border border-[#1e3a6e]/10 p-1 rounded-xl w-full md:w-auto">
              {(['question', 'story'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-[#1e3a6e] shadow-sm border border-[#1e3a6e]/8'
                      : 'text-[#1e3a6e]/50 hover:text-[#1e3a6e]'
                  }`}
                >
                  {tab === 'question' ? 'Q&A Support' : 'Stories'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a6e]/30 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'question' ? 'Search questions...' : 'Search stories...'}
                className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b]/40 transition-all"
              />
            </div>

            {/* Create CTA — desktop */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 hover:-translate-y-px flex-shrink-0"
            >
              <PlusIcon className="w-4 h-4" />
              {activeTab === 'question' ? 'Ask something' : 'Share a story'}
            </button>
          </div>
        </div>

        {/* ── 3-column layout ──────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-3"
            >
              <div className="sticky top-24">
                <Sidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  activeTab={activeTab}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>
            </motion.div>

            {/* Main feed */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
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
                    onCreateNew={() => setShowCreateModal(true)}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-3 hidden lg:block"
            >
              <div className="sticky top-24">
                <TrendingSidebar />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile FAB */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowCreateModal(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-[#e9924b] hover:bg-[#d4762a] text-white p-4 rounded-full shadow-2xl shadow-[#e9924b]/30 z-30 flex items-center justify-center"
          aria-label={activeTab === 'question' ? 'Ask a question' : 'Share a story'}
        >
          <PlusIcon className="w-6 h-6" />
        </motion.button>

        {/* Drawers */}
        <QuestionDrawer
          questionId={detailModal.id!}
          isOpen={detailModal.type === 'question' && detailModal.id !== null}
          onClose={handleCloseModal}
        />
        <StoryDrawer
          storyId={detailModal.id!}
          isOpen={detailModal.type === 'story' && detailModal.id !== null}
          onClose={handleCloseModal}
        />

        {/* Create modals */}
        <CreateQuestionModal
          isOpen={showCreateModal && activeTab === 'question'}
          onClose={() => setShowCreateModal(false)}
          categories={categories}
          onSuccess={handleCreateSuccess}
        />
        <CreateStoryModal
          isOpen={showCreateModal && activeTab === 'story'}
          onClose={() => setShowCreateModal(false)}
          categories={categories}
          onSuccess={handleCreateSuccess}
        />
      </div>

      <Footer />
    </>
  );
};

export default ParentCircleHub;