import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FacebookIcon } from '../icons/FacebookIcon';
import { InstagramIcon } from '../icons/InstagramIcon';
import { LinkedInIcon } from '../icons/LinkedInIcon';
import { XLogo } from '../icons/XLogo';
import { TiktokIcon } from '../icons/TiktokIcon';
import { YoutubeIcon } from '../icons/YoutubeIcon';
import { WhatsappChannelIcon } from '../icons/WhatsappChannelIcon';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer id="contact" className="bg-dark-text text-light-text">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold font-heading text-white mb-2">Totoz Wellness</h3>
            <p className="text-sm text-light-text/70 mb-4">Nurturing the mental health of the next generation, together.</p>
            
            {/* Social Icons - Compact on mobile */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a href="https://x.com/totozwellness" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <XLogo />
              </a>
              <a href="https://web.facebook.com/profile.php?id=61582845514552" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <FacebookIcon />
              </a>
              <a href="https://www.instagram.com/totozwellness" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <InstagramIcon />
              </a>
              <a href="https://www.linkedin.com/company/totozwellness/" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <LinkedInIcon />
              </a>
              <a href="https://www.tiktok.com/@totoz.wellness" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <TiktokIcon />
              </a>
              <a href="https://www.youtube.com/@totozwellness" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <YoutubeIcon />
              </a>
              <a href="https://whatsapp.com/channel/0029Vb796fyId7nG2ecaJQ2F" target="_blank" rel="noopener noreferrer" className="text-light-text/70 hover:text-white transition">
                <WhatsappChannelIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <button onClick={() => navigate('/')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/features')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/whyus')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  Why Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/community')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  Community
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/learnwell')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  LearnWell
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Support</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <button onClick={() => navigate('/faq')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  FAQ
                </button>
              </li>
              <li>
                <a href="mailto:contact@totoz.com" className="text-sm text-light-text/70 hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="text-sm text-light-text/70 hover:text-white transition text-left">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Contact</h4>
            <p className="text-sm text-light-text/70">
              +254 797 641 690<br/>
              contact@totoz.com
            </p>
          </div>
        </div>

        {/* Copyright - Compact on mobile */}
        <div className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 border-t border-gray-700 text-center">
          <p className="text-xs sm:text-sm text-light-text/50">
            &copy; {new Date().getFullYear()} Totoz Wellness. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;