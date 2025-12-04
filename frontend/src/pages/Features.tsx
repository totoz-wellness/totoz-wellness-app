/**
 * ============================================
 * FEATURES PAGE
 * ============================================
 * @version     5.0.0
 * @author      ArogoClin
 * @updated     2025-11-27
 * @description Showcase of all Totoz Wellness features with React Router
 * ============================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ChatIcon } from '../components/icons/ChatIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';

const features = [
  {
    icon: <ChatIcon />,
    title: 'TalkEasy',
    description: 'Instant AI-powered chat support to navigate difficult conversations and build stronger connections with your child.',
    status: 'Available Now',
    color: 'bg-blue-50 border-blue-200',
    isAvailable: true,
    action: '/talkeasy'
  },
  {
    icon: <HeartIcon />,
    title: 'ConnectCare',
    description: 'Access to a curated network of professional counselors, therapists, and valuable mental health resources.',
    status: 'Available Now',
    color: 'bg-pink-50 border-pink-200',
    isAvailable: true,
    action: '/connectcare'
  },
  {
    icon: <BookOpenIcon />,
    title: 'LearnWell',
    description: 'A rich library of expert-led articles, guides, and practical parenting tips for mental wellness.',
    status: 'Available Now',
    color: 'bg-teal-50 border-teal-200',
    isAvailable: true,
    action: '/learnwell'
  },
  {
    icon: <UsersIcon />,
    title: 'ParentCircle',
    description: 'Join a supportive peer community to share experiences, ask questions, and get advice from other parents.  🆕',
    status: 'Available Now',
    color: 'bg-green-50 border-green-200',
    isAvailable: true,
    action: '/parentcircle'
  },
  {
    icon: <ChartBarIcon />,
    title: 'GrowTrack',
    description: 'Track moods, behaviors, and triggers for yourself and your children with AI-powered insights.  🆕',
    status: 'Available Now', // ✅ UPDATED
    color: 'bg-purple-50 border-purple-200',
    isAvailable: true, // ✅ NOW AVAILABLE
    action: '/growtrack' // ✅ WORKING ROUTE
  },
  {
    icon: <div className="text-3xl">🧸</div>,
    title: 'Kids Corner',
    description: 'Engaging activities and resources designed for children to learn about emotions in a fun, interactive way.',
    status: 'Coming Soon',
    color: 'bg-yellow-50 border-yellow-200',
    isAvailable: false,
  }
];

const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (feature.isAvailable && feature.action) {
      navigate(feature.action);
    }
  };

  return (
    <div 
      className={`${feature.color} border-2 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group h-full flex flex-col ${
        feature.isAvailable ? 'cursor-pointer' : 'opacity-75'
      }`}
      onClick={handleClick}
    >
      <div className="bg-white text-teal rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
        {feature. icon}
      </div>
      
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <h3 className="text-2xl font-bold font-heading text-dark-text">{feature.title}</h3>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          feature.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {feature.status}
        </span>
      </div>
      
      <p className="text-dark-text/70 flex-grow mb-4">{feature.description}</p>
      
      {feature.isAvailable && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <span className="text-teal font-semibold text-sm group-hover:text-teal/80 transition-colors flex items-center gap-2">
            Explore Now 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      )}

      {! feature.isAvailable && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <span className="text-gray-500 font-semibold text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Stay Tuned
          </span>
        </div>
      )}
    </div>
  );
};

const Features: React.FC = () => {
  const navigate = useNavigate();

  // Count available features
  const availableCount = features.filter(f => f.isAvailable).length;
  const totalCount = features.length;

  return (
    <div className="bg-light-bg overflow-x-hidden min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#347EAD]/10 via-light-bg to-[#F09232]/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-4">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                ✨ {availableCount} of {totalCount} Features Live Now
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-dark-text mb-6">
              Comprehensive Features for Family Wellness
            </h1>
            
            <p className="text-lg md:text-xl text-dark-text/70 mb-8 max-w-3xl mx-auto">
              Everything you need to support your child's mental wellness journey, all in one place.
              From AI-powered conversations to community support. 
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/growtrack')}
                className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg"
              >
                🆕 Try GrowTrack
              </button>
              <button 
                onClick={() => navigate('/parentcircle')}
                className="bg-purple-500 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Join ParentCircle
              </button>
              <button 
                onClick={() => navigate('/learnwell')}
                className="bg-white text-teal border-2 border-teal font-bold py-3 px-8 rounded-full hover:bg-teal/10 transition-all transform hover:scale-105"
              >
                Explore LearnWell
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                Our Complete Feature Suite
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto">
                Click on any available feature to explore it now
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                />
              ))}
            </div>

            {/* Feature Legend */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-600">Available Now ({availableCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span className="text-sm text-gray-600">Coming Soon ({totalCount - availableCount})</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 bg-gradient-to-br from-teal/5 to-blue-500/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                Why Choose Totoz Wellness?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-dark-text mb-3">AI-Powered Support</h3>
                <p className="text-dark-text/70">
                  Get instant, intelligent guidance with TalkEasy's conversational AI
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-bold text-dark-text mb-3">Community Driven</h3>
                <p className="text-dark-text/70">
                  Connect with other parents in ParentCircle for peer support
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-dark-text mb-3">Track Progress</h3>
                <p className="text-dark-text/70">
                  Monitor moods and behaviors with GrowTrack's AI insights
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Ready to Experience Our Features?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start exploring today with our growing suite of family wellness tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => navigate('/growtrack')}
                className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Try GrowTrack 🆕
              </button>
              <button 
                onClick={() => navigate('/talkeasy')}
                className="bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Try TalkEasy AI
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-[#F09232] text-white font-bold py-4 px-8 rounded-full hover:bg-[#F09232]/90 transition-all transform hover:scale-105"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;