import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const slides = [
  {
    image: '/bg_1.jpg',
    title: "Supporting Caregivers, Nurturing Children's Mental Health",
    subtitle: "A welcoming space for parents and guardians to find support, resources, and community for their child's mental wellness journey.",
    primaryCTA: 'Explore Features',
    primaryAction: '/features',
    secondaryCTA: 'Join Community',
    secondaryAction: '/community'
  },
  {
    image: '/bg_2.jpg',
    title: "Connect with a Supportive Community of Parents",
    subtitle: "Share experiences, ask questions, and get advice from caregivers who understand your journey.",
    primaryCTA: 'Join ParentCircle',
    primaryAction: '/parentcircle',
    secondaryCTA: 'View Resources',
    secondaryAction: '/learnwell'
  },
  {
    image: '/bg_3.jpg',
    title: "Expert Resources for Your Child's Wellness Journey",
    subtitle: "Access professional articles, counselors, and AI-powered support tools anytime, anywhere.",
    primaryCTA: 'Start Learning',
    primaryAction: '/learnwell',
    secondaryCTA: 'Talk to AI',
    secondaryAction: '/signup'
  }
];

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (! isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides. length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[650px] md:h-[750px] overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url('${slide.image}')`,
          transform: isAutoPlaying ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#347EAD]/85 via-black/50 to-[#F09232]/75" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center pt-10 pb-20 md:pt-20 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-heading text-white leading-tight mb-6 max-w-4xl mx-auto drop-shadow-2xl animate-fade-in"
            key={`title-${currentSlide}`}
          >
            {slide. title}
          </h1>
          
          <p 
            className="text-base md:text-lg lg:text-xl text-white/95 mb-10 max-w-2xl mx-auto drop-shadow-lg animate-fade-in-delay leading-relaxed"
            key={`subtitle-${currentSlide}`}
          >
            {slide.subtitle}
          </p>
          
          <div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 animate-fade-in-delay-2"
            key={`cta-${currentSlide}`}
          >
            <button 
              onClick={() => navigate(slide. primaryAction)}
              className="bg-teal text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-2xl w-full sm:w-auto text-sm md:text-base"
            >
              {slide.primaryCTA}
            </button>
            <button 
              onClick={() => navigate(slide.secondaryAction)}
              className="bg-white/95 backdrop-blur-sm text-teal border-2 border-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-xl w-full sm:w-auto text-sm md:text-base"
            >
              {slide.secondaryCTA}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto animate-fade-in-delay-3">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-3xl md:text-4xl font-bold text-teal mb-2">500+</div>
              <div className="text-dark-text/70 font-medium text-sm md:text-base">Families Supported</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-3xl md:text-4xl font-bold text-teal mb-2">1000+</div>
              <div className="text-dark-text/70 font-medium text-sm md:text-base">Resources Available</div>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-all">
              <div className="text-3xl md:text-4xl font-bold text-teal mb-2">24/7</div>
              <div className="text-dark-text/70 font-medium text-sm md:text-base">Community Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-3 bg-white/50 hover:bg-white/75'
            } h-3 rounded-full shadow-lg`}
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
    <section className="py-20 bg-gradient-to-r from-teal to-[#347EAD]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Ready to Start Your Wellness Journey? 
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of caregivers who have found support, guidance, and community with Totoz Wellness.
        </p>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-white text-teal font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-base md:text-lg"
        >
          Get Started Today - It's Free!
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