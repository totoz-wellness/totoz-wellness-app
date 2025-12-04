import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-[#347EAD]/50 via-light-bg to-[#F09232]/30 pt-10 pb-20 md:pt-20 md:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-dark-text leading-tight mb-6 max-w-3xl mx-auto">
          Supporting Caregivers, Nurturing Children's Mental Health
        </h1>
        <p className="text-lg md:text-xl text-dark-text/70 mb-10 max-w-2xl mx-auto">
          A welcoming space for parents and guardians to find support, resources, and community for their child's mental wellness journey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => navigate('/features')}
            className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
          >
            Explore Features
          </button>
          <button 
            onClick={() => navigate('/community')}
            className="bg-white text-teal border-2 border-teal font-bold py-3 px-8 rounded-full hover:bg-teal/10 transition-all transform hover:scale-105 w-full sm:w-auto"
          >
            Join Our Community
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-teal mb-2">500+</div>
            <div className="text-dark-text/70">Families Supported</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-teal mb-2">1000+</div>
            <div className="text-dark-text/70">Resources Available</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-teal mb-2">24/7</div>
            <div className="text-dark-text/70">Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Ready to Start Your Wellness Journey? 
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of caregivers who have found support, guidance, and community with Totoz Wellness.
        </p>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          Get Started Today - It's Free!
        </button>
        
        <div className="mt-12 text-white/80 text-sm">
          <p>🔒 Your privacy is our priority | 📱 Available on all devices | 💝 Always free to start</p>
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  return (
    <div className="bg-light-bg overflow-x-hidden min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;