import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ChatIcon } from '../components/icons/ChatIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';

interface FeaturesProps {
  onGetStartedClick: () => void;
  onNavigateToPage: (page: string) => void;
}

const features = [
  {
    icon: <ChatIcon />,
    title: 'TalkEasy',
    description: 'Instant caregiver-child chat support to navigate difficult conversations and build stronger connections.',
    status: 'Available Now',
    color: 'bg-blue-50 border-blue-200',
    isAvailable: true,
    action: 'talkeasy'
  },
  {
    icon: <HeartIcon />,
    title: 'ConnectCare',
    description: 'Access to a curated network of professional counselors and valuable mental health resources.',
    status: 'Available Now',
    color: 'bg-pink-50 border-pink-200',
    isAvailable: true,
    action: 'connectcare'
  },
  {
    icon: <ChartBarIcon />,
    title: 'GrowTrack',
    description: 'A simple and effective tracker for monitoring behavior, wellness patterns, and progress over time.',
    status: 'Coming Soon',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    icon: <UsersIcon />,
    title: 'ParentCircle',
    description: 'Join a supportive peer community to share experiences, advice, and encouragement with other caregivers.',
    status: 'Coming Soon',
    color: 'bg-green-50 border-green-200',
  },
  {
    icon: <BookOpenIcon />,
    title: 'LearnWell',
    description: 'A rich library of expert-led guides, videos, and practical parenting tips for mental wellness.',
    status: 'Available Now',
    color: 'bg-teal-50 border-teal-200',
    isAvailable: true,
    action: 'learnwell'
  },
  {
    icon: <div className="text-3xl">🧸</div>,
    title: 'Kids Corner',
    description: 'Engaging activities and resources designed for children to learn about emotions in a fun way.',
    status: 'Coming Soon',
    color: 'bg-yellow-50 border-yellow-200',
  }
];

const FeatureCard: React.FC<{ 
  feature: any; 
  onNavigateToPage: (page: string) => void;
}> = ({ feature, onNavigateToPage }) => {
  const handleClick = () => {
    if (feature.isAvailable && feature.action) {
      console.log(`🎯 [2025-10-24 13:56:17] Feature clicked: ${feature.title} -> ${feature.action}`);
      onNavigateToPage(feature.action);
    }
  };

  return (
    <div 
      className={`${feature.color} border-2 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group h-full flex flex-col ${feature.isAvailable ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="bg-white text-teal rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
        {feature.icon}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-2xl font-bold font-heading text-dark-text">{feature.title}</h3>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          feature.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {feature.status}
        </span>
      </div>
      <p className="text-dark-text/70 flex-grow">{feature.description}</p>
      {feature.isAvailable && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-teal font-semibold text-sm group-hover:text-teal/80 transition-colors">
            Explore Now →
          </span>
        </div>
      )}
    </div>
  );
};

const Features: React.FC<FeaturesProps> = ({ onGetStartedClick, onNavigateToPage }) => {
  return (
    <div className="bg-light-bg overflow-x-hidden min-h-screen">
      <Navbar 
        onGetStartedClick={onGetStartedClick} 
        onNavigateToPage={onNavigateToPage} 
      />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#347EAD]/10 via-light-bg to-[#F09232]/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-dark-text mb-6">
              Comprehensive Features for Family Wellness
            </h1>
            <p className="text-lg md:text-xl text-dark-text/70 mb-8 max-w-3xl mx-auto">
              Everything you need to support your child's mental wellness journey, all in one place. 
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => onNavigateToPage('learnwell')}
                className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg"
              >
                Try LearnWell Now
              </button>
              <button 
                onClick={onGetStartedClick}
                className="bg-white text-teal border-2 border-teal font-bold py-3 px-8 rounded-full hover:bg-teal/10 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  onNavigateToPage={onNavigateToPage}
                />
              ))}
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
              Start with LearnWell today and explore our growing library of wellness resources.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => onNavigateToPage('learnwell')}
                className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Explore LearnWell
              </button>
              <button 
                onClick={onGetStartedClick}
                className="bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Join Our Community
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer
        onGetStartedClick={onGetStartedClick}
        onNavigateToPage={onNavigateToPage}
      />
      
    </div>
  );
};

export default Features;