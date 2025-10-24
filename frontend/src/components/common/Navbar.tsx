import React, { useState, useEffect } from 'react';
import { MenuIcon } from '../icons/MenuIcon';
import { XIcon } from '../icons/XIcon';

interface NavbarProps {
  onGetStartedClick?: () => void;
  onNavigateToPage?: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStartedClick, onNavigateToPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get current date/time for debugging
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  const navLinks = [
    { 
      name: 'Home', 
      page: 'home',
      isPage: true 
    },
    { 
      name: 'Features', 
      page: 'features',
      isPage: true 
    },
    { 
      name: 'Why Us', 
      page: 'whyus',
      isPage: true 
    },
    { 
      name: 'Community', 
      page: 'community',
      isPage: true 
    },
    { 
      name: 'LearnWell', 
      page: 'learnwell',
      isPage: true 
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (link: any) => {
    console.log(`🧭 [${getCurrentDateTime()}] Navbar click:`, link.name, '-> Page:', link.page);
    
    if (link.isPage && onNavigateToPage) {
      onNavigateToPage(link.page);
    }
    
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleLogoClick = () => {
    console.log(`🏠 [${getCurrentDateTime()}] Logo clicked - navigating to home`);
    if (onNavigateToPage) {
      onNavigateToPage('home');
    }
  };

  const handleGetStartedClick = () => {
    console.log(`🚀 [${getCurrentDateTime()}] Get Started clicked - User: ArogoClin`);
    if (onGetStartedClick) {
      onGetStartedClick();
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={handleLogoClick}
            className="text-2xl font-heading font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-[#347EAD]">
              Totoz
            </span>
            <span className="text-[#F09232]">
              &nbsp;Wellness
            </span>
          </button>
          
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                className="font-semibold text-dark-text/80 hover:text-teal transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <button 
              onClick={handleGetStartedClick} 
              className="bg-teal text-white font-bold py-2 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-dark-text">
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
        <div className="flex flex-col items-center space-y-4 py-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className="font-semibold text-dark-text/80 hover:text-teal transition-colors py-2"
            >
              {link.name}
            </button>
          ))}
          <button 
            onClick={() => { 
              handleGetStartedClick(); 
              setIsOpen(false); 
            }} 
            className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 mt-4"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;