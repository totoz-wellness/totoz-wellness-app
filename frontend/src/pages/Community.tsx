import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

interface CommunityProps {
  onGetStartedClick: () => void;
  onNavigateToPage: (page: string) => void;
}

const testimonials = [
  {
    quote: "Finally, a resource that understands what parents are going through. Totoz Wellness has been a game-changer for our family's communication.",
    author: 'Davine O., Mother of Two',
    avatar: 'https://picsum.photos/id/1027/100/100',
    location: 'Nairobi, Kenya',
    rating: 5
  },
  {
    quote: "Being part of the ParentCircle community makes me feel less alone. Sharing stories and advice with other caregivers is invaluable.",
    author: 'Arogo C., Guardian',
    avatar: 'https://picsum.photos/id/1005/100/100',
    location: 'Kisumu, Kenya',
    rating: 5
  },
  {
    quote: "LearnWell has become my go-to resource for understanding my child's emotional needs. The articles are practical and easy to implement.",
    author: 'Grace M., Single Mother',
    avatar: 'https://picsum.photos/id/1011/100/100',
    location: 'Eldoret, Kenya',
    rating: 5
  },
  
];

const communityStats = [
  { number: '500+', label: 'Active Families', icon: '👨‍👩‍👧‍👦' },
  { number: '1000+', label: 'Shared Stories', icon: '💬' },
  { number: '95%', label: 'Satisfaction Rate', icon: '⭐' },
  { number: '24/7', label: 'Support Available', icon: '🕐' }
];

const Community: React.FC<CommunityProps> = ({ onGetStartedClick, onNavigateToPage }) => {
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
              Stories from Our Community
            </h1>
            <p className="text-lg md:text-xl text-dark-text/70 mb-8 max-w-3xl mx-auto">
              Hear from caregivers who have found support and guidance with Totoz Wellness. 
              Join a community that understands your journey.
            </p>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                Our Growing Community
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto">
                Join thousands of families who have found support, guidance, and friendship through Totoz Wellness.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {communityStats.map((stat, index) => (
                <div key={index} className="bg-light-bg p-8 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className="text-3xl font-bold text-teal mb-2">{stat.number}</div>
                  <p className="text-dark-text/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20 bg-light-bg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-4">
                Real Stories, Real Impact
              </h2>
              <p className="text-lg text-dark-text/70 max-w-2xl mx-auto">
                Read authentic testimonials from parents, guardians, and caregivers in our community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author} 
                      className="w-16 h-16 rounded-full border-4 border-pastel-green" 
                    />
                    <div className="ml-4">
                      <h4 className="font-bold text-dark-text">{testimonial.author}</h4>
                      <p className="text-sm text-dark-text/60">{testimonial.location}</p>
                      <div className="flex mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500">⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-dark-text/80 italic flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Community CTA */}
        <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              Become Part of Our Supportive Community
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of families who share experiences, support each other, and grow together on their wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={onGetStartedClick}
                className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Join Our Community
              </button>
              <button 
                onClick={() => onNavigateToPage('learnwell')}
                className="bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-full hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Explore Resources
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;