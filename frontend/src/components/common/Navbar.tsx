/**
 * ============================================
 * PROFESSIONAL NAVBAR - FLOWBITE INSPIRED
 * ============================================
 * @version     9.0.0
 * @author      ArogoClin
 * @updated     2025-01-02
 * @description Clean navbar with generated avatars
 * ============================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuIcon } from '../icons/MenuIcon';
import { XIcon } from '../icons/XIcon';
import { getCurrentUser } from '../../utils/roleUtils';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update user state when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      setCurrentUser(getCurrentUser());
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Community', path: '/community' },
    { name: 'LearnWell', path: '/learnwell' },
    { name: 'ConnectCare', path: '/connectcare' },
    { name: 'ParentCircle', path: '/parentcircle' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('user');
    sessionStorage.removeItem('isAdminAuthenticated');
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleAdminDashboard = () => {
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    navigate('/admin/dashboard');
    setShowUserMenu(false);
  };

  /**
   * Generate avatar URL using DiceBear API
   * Uses user's email as seed for consistent avatars
   */
  const getAvatarUrl = (user: any) => {
    // Use email as seed for consistent avatar generation
    const seed = encodeURIComponent(user.email);
    
    // Available styles: adventurer, avataaars, big-ears, bottts, croodles, fun-emoji, 
    // identicon, initials, lorelei, micah, miniavs, notionists, open-peeps, personas, pixel-art
    const style = 'avataaars'; // Change this to try different styles!
    
    // Generate avatar URL
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-md border-gray-200' 
        : 'bg-white/95 backdrop-blur-sm border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}>
          
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <img 
              src={logo} 
              alt="Totoz Wellness" 
              className={`rounded-full object-cover transition-all duration-300 ${
                isScrolled ? 'w-10 h-10' : 'w-12 h-12'
              }`}
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Totoz Wellness
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`font-medium text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'text-teal'
                    : 'text-gray-700 hover:text-teal'
                }`}
              >
                {link.name}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => handleNavClick('/growtrack')}
                className={`font-medium text-sm transition-colors ${
                  location.pathname.startsWith('/growtrack')
                    ? 'text-teal'
                    : 'text-gray-700 hover:text-teal'
                }`}
              >
                GrowTrack
              </button>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              // User Menu Button with Avatar
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm bg-white rounded-full focus:ring-4 focus:ring-gray-100 hover:ring-4 hover:ring-gray-50 transition-all"
                  aria-expanded={showUserMenu}
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={`${currentUser.name}'s avatar`}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-md"
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-scale-in">
                    {/* User Info */}
                    <div className="px-4 py-3 text-sm border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getAvatarUrl(currentUser)}
                          alt={`${currentUser.name}'s avatar`}
                          className="w-10 h-10 rounded-full border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{currentUser.name}</div>
                          <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <ul className="py-2 text-sm text-gray-700">
                      {currentUser && (
                        <li>
                          <button
                            onClick={() => {
                              handleNavClick('/growtrack');
                              setShowUserMenu(false);
                            }}
                            className="inline-flex items-center w-full px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Dashboard
                          </button>
                        </li>
                      )}

                      {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                        <li>
                          <button
                            onClick={() => {
                              handleAdminDashboard();
                            }}
                            className="inline-flex items-center w-full px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Admin Panel
                          </button>
                        </li>
                      )}

                      <li>
                        <button
                          onClick={handleLogout}
                          className="inline-flex items-center w-full px-4 py-2 hover:bg-gray-100 transition-colors text-left text-red-600"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // Login / Signup
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 text-sm font-medium text-teal hover:bg-teal/10 rounded-lg transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal to-blue-600 rounded-lg hover:shadow-lg transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname === link.path
                    ? 'text-white bg-teal'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.name}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => handleNavClick('/growtrack')}
                className={`block w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                  location.pathname.startsWith('/growtrack')
                    ? 'text-white bg-teal'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                GrowTrack
              </button>
            )}

            {/* Mobile Auth */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              {currentUser ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(currentUser)}
                        alt={`${currentUser.name}'s avatar`}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{currentUser.name}</div>
                        <div className="text-sm text-gray-500 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                  </div>

                  {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                    <button
                      onClick={handleAdminDashboard}
                      className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-left font-medium"
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-left font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2 border-2 border-teal text-teal font-medium rounded-lg hover:bg-teal/5 transition-all"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-teal to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;