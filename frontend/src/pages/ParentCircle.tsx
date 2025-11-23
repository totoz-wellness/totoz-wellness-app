
import React, { useState } from 'react';
import { ThumbUpIcon } from './../components/icons/ThumbUpIcon';
import { ThumbDownIcon } from './../components/icons/ThumbDownIcon';
import { ChatIcon } from './../components/icons/ChatIcon';
import { PlusIcon } from './../components/icons/PlusIcon';
import { Post, PostType, Category } from '../../src/types'; //For post types purposes; modify as needed

const CATEGORIES: Category[] = ['General', 'Behavior', 'School', 'Sleep', 'Emotions', 'Teens'];

interface ParentCircleProps {
  posts: Post[];
  onAddPost: (post: Post) => void;
  onVote: (id: number, type: 'up' | 'down') => void;
  onAddComment: (postId: number, text: string) => void;
}

const ParentCircle: React.FC<ParentCircleProps> = ({ posts, onAddPost, onVote, onAddComment }) => {
  const [activeTab, setActiveTab] = useState<PostType>('question');
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Form State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('General');

  // Comment State
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      type: activeTab,
      category: newPostCategory,
      content: newPostContent,
      author: "Anonymous",
      upvotes: 0,
      downvotes: 0,
      comments: [],
      timestamp: "Just now",
      status: 'pending' // Set status to pending
    };

    onAddPost(newPost);
    setNewPostContent('');
    setShowForm(false);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  const handleSubmitComment = (postId: number) => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentText('');
    setActiveCommentId(null);
  };

  // Only show approved posts
  const visiblePosts = posts.filter(post => 
    post.status === 'approved' &&
    post.type === activeTab && 
    (filterCategory === 'All' || post.category === filterCategory)
  );

  return (
    <section id="parent-circle" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
            ParentCircle Community
          </h2>
          <p className="mt-4 text-lg text-dark-text/60 max-w-2xl mx-auto">
            A safe, anonymous space to share stories, ask questions, and support one another.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 bg-teal/10 p-6 border-r border-teal/10">
            <div className="mb-8">
              <button 
                onClick={() => { setShowForm(!showForm); setSubmissionSuccess(false); }}
                className="w-full bg-teal text-white font-bold py-3 px-4 rounded-xl hover:bg-teal/90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <PlusIcon className="w-5 h-5" />
                {activeTab === 'question' ? 'Ask Question' : 'Share Story'}
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-heading font-bold text-dark-text mb-3 uppercase text-sm tracking-wider">Feed Type</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => setActiveTab('question')}
                  className={`text-left px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'question' ? 'bg-white text-teal shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                >
                  Q&A Support
                </button>
                <button 
                  onClick={() => setActiveTab('story')}
                  className={`text-left px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'story' ? 'bg-white text-teal shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                >
                  Stories
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-dark-text mb-3 uppercase text-sm tracking-wider">Categories</h3>
              <div className="flex flex-col space-y-1">
                <button 
                   onClick={() => setFilterCategory('All')}
                   className={`text-left px-3 py-1.5 rounded text-sm transition-colors ${filterCategory === 'All' ? 'font-bold text-teal' : 'text-gray-600 hover:text-teal'}`}
                >
                  All Topics
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-left px-3 py-1.5 rounded text-sm transition-colors ${filterCategory === cat ? 'font-bold text-teal' : 'text-gray-600 hover:text-teal'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feed Area */}
          <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
            
            {/* Success Message */}
            {submissionSuccess && (
               <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm" role="alert">
                  <p className="font-bold">Submitted!</p>
                  <p>Your {activeTab} has been submitted for moderation and will appear once approved.</p>
               </div>
            )}

            {/* Create Post Form */}
            {showForm && (
              <div className="mb-8 bg-white p-6 rounded-2xl shadow-md border border-teal/20 animate-fade-in-down">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-dark-text">
                    {activeTab === 'question' ? 'Ask the Community' : 'Share Your Story'}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
                <form onSubmit={handleSubmitPost}>
                  <select 
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as Category)}
                    className="w-full mb-3 p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal/50 text-sm"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={activeTab === 'question' ? "E.g., How do I handle..." : "Today, something amazing happened..."}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal/50 min-h-[100px] mb-3"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-teal text-white font-bold py-2 px-6 rounded-full hover:bg-teal/90 transition-transform hover:scale-105">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {visiblePosts.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No posts found in this category yet. Be the first!</p>
                </div>
              ) : (
                visiblePosts.map(post => (
                  <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.type === 'story' ? 'bg-pastel-green/30 text-teal' : 'bg-blue-100 text-blue-600'}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">{post.timestamp} • {post.author}</span>
                    </div>

                    <p className="text-dark-text mb-4 whitespace-pre-wrap">{post.content}</p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => onVote(post.id, 'up')} className="flex items-center space-x-1 text-gray-500 hover:text-teal transition-colors">
                          <ThumbUpIcon />
                          <span className="text-sm font-semibold">{post.upvotes}</span>
                        </button>
                        <button onClick={() => onVote(post.id, 'down')} className="flex items-center space-x-1 text-gray-500 hover:text-red-400 transition-colors">
                          <ThumbDownIcon />
                          {post.downvotes > 0 && <span className="text-sm font-semibold">{post.downvotes}</span>}
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-teal"
                      >
                        <div className="w-5 h-5"><ChatIcon /></div>
                        <span className="text-sm">{post.comments.length} {post.type === 'question' ? 'Answers' : 'Comments'}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentId === post.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-xl p-3">
                        <div className="space-y-3 mb-4">
                          {post.comments.length === 0 && <p className="text-sm text-gray-400 italic">No comments yet.</p>}
                          {post.comments.map(comment => (
                            <div key={comment.id} className="bg-white p-3 rounded-lg text-sm shadow-sm">
                              <p className="text-gray-800">{comment.text}</p>
                              <p className="text-xs text-gray-400 mt-1">- {comment.author}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={post.type === 'question' ? "Add an answer..." : "Leave a supportive comment..."}
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal"
                          />
                          <button 
                            onClick={() => handleSubmitComment(post.id)}
                            className="bg-teal text-white text-sm px-4 py-2 rounded-lg hover:bg-teal/90"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentCircle;
