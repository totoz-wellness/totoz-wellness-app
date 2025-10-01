
import React from 'react';

interface CTAProps {
  onJoinClick: () => void;
}

const CTA: React.FC<CTAProps> = ({ onJoinClick }) => {
  return (
    <section id="join" className="py-20 bg-gradient-to-r from-teal to-pastel-green">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-white mb-6">
          Ready to Start Your Journey?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Join a community of supportive caregivers today. Your space is safe, anonymous, and dedicated to helping you and your child thrive.
        </p>
        <button onClick={onJoinClick} className="bg-white text-teal font-bold py-4 px-10 rounded-full hover:bg-light-bg transition-all transform hover:scale-105 shadow-2xl text-lg">
          Join the Community
        </button>
      </div>
    </section>
  );
};

export default CTA;
