import React from 'react';
import { FacebookIcon } from '../icons/FacebookIcon';
import { InstagramIcon } from '../icons/InstagramIcon';
import { LinkedInIcon } from '../icons/LinkedInIcon';
import { XLogo } from '../icons/XLogo';

interface FooterProps {
  onGetStartedClick?: () => void;
  onNavigateToPage?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onGetStartedClick, onNavigateToPage }) => {

  const handleNavClick = (page: string) => {
    if (onNavigateToPage) {
      onNavigateToPage(page);
    }
  };

  const handleGetStartedClick = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    }
  };

  return (
    <footer id="contact" className="bg-dark-text text-light-text">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold font-heading text-white mb-2">Totoz Wellness</h3>
            <p className="text-light-text/70">Nurturing the mental health of the next generation, together.</p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-light-text/70 hover:text-white"><XLogo /></a>
              <a href="#" className="text-light-text/70 hover:text-white"><FacebookIcon /></a>
              <a href="#" className="text-light-text/70 hover:text-white"><InstagramIcon /></a>
              <a href="#" className="text-light-text/70 hover:text-white"><LinkedInIcon /></a>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavClick('home')} className="text-light-text/70 hover:text-white">Home</button></li>
                <li><button onClick={() => handleNavClick('features')} className="text-light-text/70 hover:text-white">Features</button></li>
                <li><button onClick={() => handleNavClick('whyus')} className="text-light-text/70 hover:text-white">Why Us</button></li>
                <li><button onClick={() => handleNavClick('community')} className="text-light-text/70 hover:text-white">Community</button></li>
                <li><button onClick={() => handleNavClick('learnwell')} className="text-light-text/70 hover:text-white">LearnWell</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavClick('faq')} className="text-light-text/70 hover:text-white">FAQ</button></li>
                <li><a href="mailto:contact@totoz.com" className="text-light-text/70 hover:text-white">Contact Us</a></li>
                <li><button onClick={() => handleNavClick('privacy')} className="text-light-text/70 hover:text-white">Privacy Policy</button></li>
                <li><button onClick={handleGetStartedClick} className="text-light-text/70 hover:text-white">Admin Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <p className="text-light-text/70">+254 *** *** ***<br/>contact@totoz.com</p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-light-text/50">
          <p>&copy; {new Date().getFullYear()} Totoz Wellness. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;