import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WhyUsProps {
  onGetStartedClick: () => void;
  onNavigateToPage: (page: string) => void;
}

const data = [
  { name: 'Aware of Need', value: 85.7 },
  { name: 'Willing to Use App', value: 81.0 },
];

const COLORS = ['#A8D5BA', '#3AAFA9'];

const stats = [
  {
    number: '85.7%',
    label: 'of parents recognize the need for mental health support tools',
    icon: '📊'
  },
  {
    number: '81.0%',
    label: 'are willing to use an app for their child\'s wellness',
    icon: '📱'
  },
  {
    number: '92%',
    label: 'report feeling overwhelmed without proper support',
    icon: '😔'
  },
  {
    number: '76%',
    label: 'struggle to find reliable mental health resources',
    icon: '🔍'
  }
];

const benefits = [
  {
    title: 'Evidence-Based Approach',
    description: 'Our methods are backed by child psychology research and proven therapeutic techniques.',
    icon: '🔬'
  },
  {
    title: 'Community-Driven Support',
    description: 'Connect with other caregivers who understand your journey and share similar challenges.',
    icon: '👥'
  },
  {
    title: 'Professional Guidance',
    description: 'Access expert advice from licensed mental health professionals specializing in children.',
    icon: '👨‍⚕️'
  },
  {
    title: 'Personalized Experience',
    description: 'Tailored resources and recommendations based on your child\'s specific needs and age.',
    icon: '🎯'
  },
  {
    title: 'Privacy & Security',
    description: 'Your family\'s information is protected with industry-leading security measures.',
    icon: '🔒'
  },
  {
    title: 'Accessible & Affordable',
    description: 'Available 24/7 on any device, with free resources and affordable premium options.',
    icon: '💝'
  }
];

const WhyUs: React.FC<WhyUsProps> = ({ onGetStartedClick, onNavigateToPage }) => {
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
              Why Choose Totoz Wellness?
            </h1>
            <p className="text-lg md:text-xl text-dark-text/70 mb-8 max-w-3xl mx-auto">
              Our approach is backed by research and a deep understanding of caregivers' needs. 
              Discover why families trust us with their mental wellness journey.
            </p>
            <p className="text-sm text-dark-text/60">
              Current user: <span className="font-semibold text-teal">ArogoClin</span> | 
              Research data updated: <span className="font-semibold">2025-10-24 13:56:17</span>
            </p>
          </div>
        </section>

        {/* Research Data Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-6">
                  Research-Backed Solutions
                </h2>
                <p className="text-lg text-dark-text/70 mb-6">
                  Our approach is backed by comprehensive research and surveys conducted with parents and caregivers. 
                  We found a strong desire for accessible, supportive tools like Totoz Wellness.
                </p>
                <p className="text-lg text-dark-text/70 mb-6">
                  The data shows that caregivers are not only aware of the challenges in children's mental health 
                  but are actively seeking solutions that fit into their busy lives.
                </p>
                <button 
                  onClick={() => onNavigateToPage('learnwell')}
                  className="bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105"
                >
                  Explore Our Resources
                </button>
              </div>
              <div className="lg:w-1/2 w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#17252A' }} />
                    <Tooltip cursor={{fill: 'rgba(249, 250, 251, 0.5)'}} formatter={(value: number) => [`${value}%`, 'Percentage']} />
                    <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-light-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                The Numbers Tell the Story
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto">
                Our research reveals the urgent need for accessible mental health support tools for families.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className="text-3xl font-bold text-teal mb-2">{stat.number}</div>
                  <p className="text-dark-text/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                What Makes Us Different
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto">
                We combine scientific research, community support, and practical tools to create a comprehensive wellness platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-light-bg p-8 rounded-xl shadow-lg group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold font-heading text-dark-text mb-3">{benefit.title}</h3>
                  <p className="text-dark-text/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Join the Growing Community of Supported Families
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Be part of the 81% who are ready to embrace digital wellness tools. Start your family's journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={onGetStartedClick}
                className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Now
              </button>
              <button 
                onClick={() => onNavigateToPage('community')}
                className="bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Learn About Our Community
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default WhyUs;