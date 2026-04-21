import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// Icon Components
function FamilyIcon() {
  return (
    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarRatingIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
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
  { number: '500+', label: 'Active Families', IconComponent: FamilyIcon },
  { number: '1000+', label: 'Shared Stories', IconComponent: ChatIcon },
  { number: '95%', label: 'Satisfaction Rate', IconComponent: StarIcon },
  { number: '24/7', label: 'Support Available', IconComponent: ClockIcon }
];

const Community: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-light-bg overflow-x-hidden min-h-screen">
      <Navbar />
      
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
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-teal to-[#347EAD] text-white font-bold py-4 px-8 rounded-full hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                Join Our Community
              </button>
              <button 
                onClick={() => navigate('/learnwell')}
                className="bg-white text-teal border-2 border-teal font-bold py-4 px-8 rounded-full hover:bg-teal/5 transition-all transform hover:scale-105 shadow-md"
              >
                Explore Resources
              </button>
            </div>
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
              {communityStats.map((stat, index) => {
                const Icon = stat.IconComponent;
                return (
                  <div key={index} className="bg-light-bg p-8 rounded-xl shadow-lg text-center group hover:shadow-xl transition-all duration-300">
                    <div className="text-teal mb-4">
                      <Icon />
                    </div>
                    <div className="text-3xl font-bold text-teal mb-2">{stat.number}</div>
                    <p className="text-dark-text/70">{stat.label}</p>
                  </div>
                );
              })}
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
                      <div className="flex mt-1 gap-0.5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500">
                            <StarRatingIcon />
                          </span>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;