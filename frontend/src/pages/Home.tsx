import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const slides = [
  {
    image: '/bg_1.jpg',
    title: "Supporting Caregivers, Nurturing Children's Mental Health",
    subtitle: "A welcoming space for parents and guardians to find support, resources, and community.",
    primaryCTA: 'Explore',
    primaryAction: '/features',
    secondaryCTA: 'Community',
    secondaryAction: '/community'
  },
  {
    image: '/bg_2.jpg',
    title: "Connect with a Supportive Community",
    subtitle: "Share experiences and get advice from caregivers who understand your journey.",
    primaryCTA: 'Join Now',
    primaryAction: '/parentcircle',
    secondaryCTA: 'Resources',
    secondaryAction: '/learnwell'
  },
  {
    image: '/bg_3.jpg',
    title: "Expert Resources for Your Child's Wellness",
    subtitle: "Access professional articles, counselors, and AI-powered support tools.",
    primaryCTA: 'Learn More',
    primaryAction: '/learnwell',
    secondaryCTA: 'Talk to AI',
    secondaryAction: '/talkeasy'
  }
];

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[550px] sm:h-[600px] md:h-[700px] lg:h-[750px] overflow-hidden mt-16 sm:mt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url('${slide.image}')`,
          transform: isAutoPlaying ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#347EAD]/90 via-black/60 to-[#F09232]/80 sm:from-[#347EAD]/85 sm:via-black/50 sm:to-[#F09232]/75" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-8 py-4 sm:py-8 md:py-12">
        <div className="container mx-auto text-center">
          {/* Title */}
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold font-heading text-white leading-tight mb-3 sm:mb-4 md:mb-6 max-w-4xl mx-auto drop-shadow-2xl px-2"
            key={`title-${currentSlide}`}
          >
            {slide.title}
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 mb-5 sm:mb-8 md:mb-10 max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-4"
            key={`subtitle-${currentSlide}`}
          >
            {slide.subtitle}
          </p>
          
          {/* CTA Buttons - Improved for mobile */}
          <div 
            className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6 sm:mb-12 md:mb-16 px-4 max-w-md sm:max-w-none mx-auto"
            key={`cta-${currentSlide}`}
          >
            <button 
              onClick={() => navigate(slide.primaryAction)}
              className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-2xl w-full sm:w-auto text-sm"
            >
              {slide.primaryCTA}
            </button>
            <button 
              onClick={() => navigate(slide.secondaryAction)}
              className="bg-white/95 backdrop-blur-sm text-teal border-2 border-white font-bold py-3 px-8 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-xl w-full sm:w-auto text-sm"
            >
              {slide.secondaryCTA}
            </button>
          </div>

          {/* Quick Stats - Compact on mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto px-2">
            <div className="bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-teal mb-0.5 sm:mb-2">500+</div>
              <div className="text-dark-text/70 font-medium text-[10px] sm:text-xs md:text-sm leading-tight">Families</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-teal mb-0.5 sm:mb-2">1000+</div>
              <div className="text-dark-text/70 font-medium text-[10px] sm:text-xs md:text-sm leading-tight">Resources</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-5 md:p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-teal mb-0.5 sm:mb-2">24/7</div>
              <div className="text-dark-text/70 font-medium text-[10px] sm:text-xs md:text-sm leading-tight">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-8 sm:w-10 md:w-12 bg-white'
                : 'w-2 sm:w-3 bg-white/50 hover:bg-white/75'
            } h-2 sm:h-2.5 md:h-3 rounded-full shadow-lg`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-teal to-[#347EAD]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4 sm:mb-6 leading-tight px-2">
          Ready to Start Your Wellness Journey?
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          Join thousands of caregivers who have found support and community.
        </p>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-white text-teal font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
        >
          Get Started Free
        </button>
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