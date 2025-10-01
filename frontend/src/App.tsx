
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import WhyUs from './components/WhyUs';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="bg-light-bg overflow-x-hidden">
      <Header onGetStartedClick={() => setIsAuthModalOpen(true)} />
      <main>
        <Hero />
        <Features />
        <WhyUs />
        <Testimonials />
        <CTA onJoinClick={() => setIsAuthModalOpen(true)} />
      </main>
      <Footer />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default App;
