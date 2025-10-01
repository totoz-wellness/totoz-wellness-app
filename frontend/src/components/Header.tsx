import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';

interface HeaderProps {
  onGetStartedClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStartedClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'LearnWell', href: '#learnwell' },
    { name: 'Community', href: '#community' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="text-2xl font-heading font-bold text-teal">
            Totoz Wellness
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="font-semibold text-dark-text/80 hover:text-teal transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <button onClick={onGetStartedClick} className="bg-teal text-white font-bold py-2 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105">
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
        <nav className="flex flex-col items-center space-y-4 py-6">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="font-semibold text-dark-text/80 hover:text-teal transition-colors py-2" onClick={() => setIsOpen(false)}>
              {link.name}
            </a>
          ))}
          <button onClick={() => { onGetStartedClick(); setIsOpen(false); }} className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 mt-4">
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;