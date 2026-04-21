import React, { useState } from 'react';
import { Post, PostStatus } from '../../types';
import { TrashIcon } from './../../components/icons/TrashIcon';
import { ThumbUpIcon } from './../../components/icons/ThumbUpIcon';
import { XIcon } from './../../components/icons/XIcon';

interface AdminDashboardProps {
  posts: Post[];
  onUpdateStatus: (id: number, status: PostStatus) => void;
  onDelete: (id: number) => void;
  onBackToHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, onUpdateStatus, onDelete, onBackToHome }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - simplified for demo
    if (password.toLowerCase() === 'admin') {
      setIsLoggedIn(true);
    } else {
      alert('Incorrect password. Try "admin"');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-dark-text mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                placeholder="Enter admin password"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-teal text-white font-bold py-3 rounded-lg hover:bg-teal/90 transition-colors"
            >
              Login
            </button>
          </form>
          <button onClick={onBackToHome} className="w-full mt-4 text-gray-500 text-sm hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => p.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-dark-text text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Totoz Admin Dashboard</h1>
          <button onClick={onBackToHome} className="text-sm bg-white/10 px-4 py-2 rounded hover:bg-white/20">
            Exit to App
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 text-center font-bold ${activeTab === 'pending' ? 'bg-teal/10 text-teal border-b-2 border-teal' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Pending Review ({posts.filter(p => p.status === 'pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-4 text-center font-bold ${activeTab === 'approved' ? 'bg-teal/10 text-teal border-b-2 border-teal' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Live Posts ({posts.filter(p => p.status === 'approved').length})
            </button>
          </div>

          {/* List */}
          <div className="p-6 space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No {activeTab} posts found.</p>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${post.type === 'question' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} font-bold uppercase`}>
                        {post.type}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-400">{post.timestamp}</span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {activeTab === 'pending' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(post.id, 'approved')}
                          className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors text-sm font-bold"
                        >
                          <ThumbUpIcon className="w-4 h-4"/> Approve
                        </button>
                        <button 
                          onClick={() => onDelete(post.id)}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors text-sm font-bold"
                        >
                          <XIcon /> Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onDelete(post.id)}
                        className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-2 rounded transition-colors border border-red-200"
                      >
                        <TrashIcon className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
