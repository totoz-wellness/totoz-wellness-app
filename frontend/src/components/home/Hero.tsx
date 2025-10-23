
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-pastel-green/50 via-light-bg to-teal/30 pt-10 pb-20 md:pt-20 md:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-dark-text leading-tight mb-6 max-w-3xl mx-auto">
          Supporting Caregivers, Nurturing Children's Mental Health
        </h1>
        <p className="text-lg md:text-xl text-dark-text/70 mb-10 max-w-2xl mx-auto">
          A welcoming space for parents and guardians to find support, resources, and community for their child's mental wellness journey.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a href="#features" className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto">
            Explore Features
          </a>
          <a href="#quiz" className="bg-white text-teal border-2 border-teal font-bold py-3 px-8 rounded-full hover:bg-teal/10 transition-all transform hover:scale-105 w-full sm:w-auto">
            Take a Wellness Quiz
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
