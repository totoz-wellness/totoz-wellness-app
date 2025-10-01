
import React from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

const features = [
  {
    icon: <ChatIcon />,
    title: 'TalkEasy',
    description: 'Instant caregiver-child chat support to navigate difficult conversations and build stronger connections.',
  },
  {
    icon: <HeartIcon />,
    title: 'ConnectCare',
    description: 'Access to a curated network of professional counselors and valuable mental health resources.',
  },
  {
    icon: <ChartBarIcon />,
    title: 'GrowTrack',
    description: 'A simple and effective tracker for monitoring behavior, wellness patterns, and progress over time.',
  },
  {
    icon: <UsersIcon />,
    title: 'ParentCircle',
    description: 'Join a supportive peer community to share experiences, advice, and encouragement with other caregivers.',
  },
  {
    icon: <BookOpenIcon />,
    title: 'LearnWell',
    description: 'A rich library of expert-led guides, videos, and practical parenting tips for mental wellness.',
  },
  {
    icon: <div className="text-3xl">🧸</div>,
    title: 'Kids Corner',
    description: 'Engaging activities and resources designed for children to learn about emotions in a fun way. (Coming soon!)',
  }
];

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
    <div className="bg-pastel-green text-teal rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold font-heading mb-3 text-dark-text">{title}</h3>
    <p className="text-dark-text/70">{description}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-light-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
            Our Core Features
          </h2>
          <p className="mt-4 text-lg text-dark-text/60 max-w-2xl mx-auto">
            Everything you need to support your child's mental wellness journey, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
