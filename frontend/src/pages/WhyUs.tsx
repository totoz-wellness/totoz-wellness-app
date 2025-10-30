import React from 'react';
import { 
  BarChart3, 
  Users, 
  Shield, 
  Target, 
  Lock, 
  Heart,
  Microscope,
  UserCircle,
  TrendingUp,
  Search,
  Frown,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

interface WhyUsProps {
  onGetStartedClick: () => void;
  onNavigateToPage: (page: string) => void;
}

const CHART_DATA = [
  { name: 'Aware of Need', value: 85.7 },
  { name: 'Willing to Use App', value: 81.0 },
];

const CHART_COLORS = ['#A8D5BA', '#3AAFA9'];

const STATISTICS = [
  {
    number: '85.7%',
    label: 'of parents recognize the need for mental health support tools',
    icon: BarChart3,
    color: 'text-teal'
  },
  {
    number: '81.0%',
    label: 'are willing to use an app for their child\'s wellness',
    icon: Smartphone,
    color: 'text-blue-500'
  },
  {
    number: '92%',
    label: 'report feeling overwhelmed without proper support',
    icon: Frown,
    color: 'text-orange-500'
  },
  {
    number: '76%',
    label: 'struggle to find reliable mental health resources',
    icon: Search,
    color: 'text-purple-500'
  }
];

const BENEFITS = [
  {
    title: 'Evidence-Based Approach',
    description: 'Our methods are backed by child psychology research and proven therapeutic techniques.',
    icon: Microscope,
    color: 'bg-blue-50 text-blue-600',
    hoverColor: 'group-hover:bg-blue-100'
  },
  {
    title: 'Community-Driven Support',
    description: 'Connect with other caregivers who understand your journey and share similar challenges.',
    icon: Users,
    color: 'bg-teal-50 text-teal-600',
    hoverColor: 'group-hover:bg-teal-100'
  },
  {
    title: 'Professional Guidance',
    description: 'Access expert advice from licensed mental health professionals specializing in children.',
    icon: UserCircle,
    color: 'bg-indigo-50 text-indigo-600',
    hoverColor: 'group-hover:bg-indigo-100'
  },
  {
    title: 'Personalized Experience',
    description: 'Tailored resources and recommendations based on your child\'s specific needs and age.',
    icon: Target,
    color: 'bg-purple-50 text-purple-600',
    hoverColor: 'group-hover:bg-purple-100'
  },
  {
    title: 'Privacy & Security',
    description: 'Your family\'s information is protected with industry-leading security measures.',
    icon: Lock,
    color: 'bg-red-50 text-red-600',
    hoverColor: 'group-hover:bg-red-100'
  },
  {
    title: 'Accessible & Affordable',
    description: 'Available 24/7 on any device, with free resources and affordable premium options.',
    icon: Heart,
    color: 'bg-pink-50 text-pink-600',
    hoverColor: 'group-hover:bg-pink-100'
  }
];

const StatCard: React.FC<{
  stat: typeof STATISTICS[0];
  index: number;
}> = ({ stat, index }) => {
  const Icon = stat.icon;
  
  return (
    <div 
      className="bg-white p-8 rounded-xl shadow-lg text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`${stat.color} mb-4 flex justify-center`}>
        <Icon className="w-12 h-12" />
      </div>
      <div className="text-4xl font-bold text-teal mb-3">{stat.number}</div>
      <p className="text-dark-text/70 leading-relaxed">{stat.label}</p>
    </div>
  );
};

const BenefitCard: React.FC<{
  benefit: typeof BENEFITS[0];
  index: number;
}> = ({ benefit, index }) => {
  const Icon = benefit.icon;
  
  return (
    <div 
      className="bg-white p-8 rounded-xl shadow-lg group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`w-16 h-16 ${benefit.color} ${benefit.hoverColor} rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-heading text-dark-text mb-3">
        {benefit.title}
      </h3>
      <p className="text-dark-text/70 leading-relaxed">{benefit.description}</p>
    </div>
  );
};

const WhyUs: React.FC<WhyUsProps> = ({ onGetStartedClick, onNavigateToPage }) => {
  return (
    <div className="bg-light-bg overflow-x-hidden min-h-screen">
      <Navbar 
        onGetStartedClick={onGetStartedClick} 
        onNavigateToPage={onNavigateToPage} 
      />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#347EAD]/10 via-light-bg to-[#F09232]/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-teal/10 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-teal" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-dark-text mb-6">
              Why Choose Totoz Wellness?
            </h1>
            <p className="text-lg md:text-xl text-dark-text/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our approach is backed by research and a deep understanding of caregivers' needs. 
              Discover why families trust us with their mental wellness journey.
            </p>
            <div className="flex justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-teal" />
              <CheckCircle className="w-6 h-6 text-teal" />
              <CheckCircle className="w-6 h-6 text-teal" />
            </div>
          </div>
        </section>

        {/* Research Data Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-full mb-6">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Research-Backed</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-6">
                  Research-Backed Solutions
                </h2>
                <p className="text-lg text-dark-text/70 mb-6 leading-relaxed">
                  Our approach is backed by comprehensive research and surveys conducted with parents and caregivers. 
                  We found a strong desire for accessible, supportive tools like Totoz Wellness.
                </p>
                <p className="text-lg text-dark-text/70 mb-8 leading-relaxed">
                  The data shows that caregivers are not only aware of the challenges in children's mental health 
                  but are actively seeking solutions that fit into their busy lives.
                </p>
                <button 
                  onClick={() => onNavigateToPage('learnwell')}
                  className="bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 group"
                >
                  Explore Our Resources
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="bg-gradient-to-br from-teal/5 to-blue-50 p-8 rounded-2xl shadow-xl">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={CHART_DATA} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tickFormatter={(tick) => `${tick}%`}
                        stroke="#17252A"
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150} 
                        tick={{ fill: '#17252A', fontSize: 14 }} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(249, 250, 251, 0.5)' }} 
                        formatter={(value: number) => [`${value}%`, 'Percentage']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '8px 12px'
                        }}
                      />
                      <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]}>
                        {CHART_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-gradient-to-b from-light-bg to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                The Numbers Tell the Story
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto leading-relaxed">
                Our research reveals the urgent need for accessible mental health support tools for families.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STATISTICS.map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full mb-4">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Our Strengths</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                What Makes Us Different
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto leading-relaxed">
                We combine scientific research, community support, and practical tools to create a comprehensive wellness platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, index) => (
                <BenefitCard key={index} benefit={benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Join the Growing Community of Supported Families
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Be part of the 81% who are ready to embrace digital wellness tools. Start your family's journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={onGetStartedClick}
                className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 group"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigateToPage('community')}
                className="bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-all transform hover:scale-105 flex items-center gap-2 group"
              >
                Learn About Our Community
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
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

export default WhyUs;