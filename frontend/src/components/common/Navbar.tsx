/**
 * ============================================
 * NAVBAR WITH REACT ROUTER NAVIGATION
 * ============================================
 * @version     5.0. 0
 * @author      ArogoClin
 * @updated     2025-11-27
 * @description Clean navbar with React Router navigation
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

  // Get active link from current path
  const activeLink = location. pathname. split('/')[1] || 'home';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window. removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document. addEventListener('mousedown', handleClickOutside);
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
    localStorage.removeItem('token');
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      . map(n => n[0])
      . join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-700 border-purple-200',
      'MODERATOR': 'bg-orange-100 text-orange-700 border-orange-200',
      'CONTENT_LEAD': 'bg-blue-100 text-blue-700 border-blue-200',
      'CONTENT_WRITER': 'bg-green-100 text-green-700 border-green-200',
      'USER': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[role] || colors.USER;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 shadow-lg backdrop-blur-md border-b border-gray-100' 
        : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-90 transition-opacity group"
          >
            <div className="relative">
              <img 
                src={logo} 
                alt="Totoz Wellness" 
                className="w-40 h-28 rounded-full object-cover mt-6"
              />
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`relative px-5 py-2. 5 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === link.path
                    ? 'text-teal bg-teal/10 shadow-sm'
                    : 'text-gray-700 hover:text-teal hover:bg-gray-50'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-[#347EAD] rounded-t-full"></div>
                )}
              </button>
            ))}

            {/* Show GrowTrack if logged in */}
            {currentUser && (
              <button
                onClick={() => handleNavClick('/growtrack')}
                className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  location. pathname. startsWith('/growtrack')
                    ? 'text-teal bg-teal/10 shadow-sm'
                    : 'text-gray-700 hover:text-teal hover:bg-gray-50'
                }`}
              >
                GrowTrack
                {location. pathname.startsWith('/growtrack') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-[#347EAD] rounded-t-full"></div>
                )}
              </button>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              // Logged In - Show User Menu
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-gradient-to-r from-teal/10 to-blue-500/10 hover:from-teal/20 hover:to-blue-500/20 px-4 py-2. 5 rounded-xl transition-all border border-teal/20 shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-teal to-[#347EAD] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-sm text-gray-900 leading-none">
                      {currentUser. name. split(' ')[0]}
                    </span>
                    <span className="text-xs text-gray-500 leading-none mt-0.5">
                      {currentUser.role. replace('_', ' ')}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-br from-teal/5 to-blue-500/5 p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal to-[#347EAD] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {getInitials(currentUser.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {currentUser.role. replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                        <button
                          onClick={handleAdminDashboard}
                          className="w-full text-left px-4 py-3 hover:bg-teal/5 transition-colors flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center group-hover:bg-teal/20 transition-colors">
                            <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10. 325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-. 826 3.31-2. 37 2.37a1. 724 1.724 0 00-2.572 1. 065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543. 94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-. 94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2. 572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">Admin Dashboard</p>
                            <p className="text-xs text-gray-500">Manage your workspace</p>
                          </div>
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-600">Logout</p>
                          <p className="text-xs text-red-400">Sign out of your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not Logged In
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 text-teal font-bold rounded-lg hover:bg-teal/10 transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal to-[#347EAD] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-dark-text p-2">
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Same structure, just update onClick handlers */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between ${
                  location. pathname === link.path
                    ? 'bg-teal/10 text-teal'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <div className="w-2 h-2 bg-teal rounded-full"></div>
                )}
              </button>
            ))}

            {/* Mobile GrowTrack */}
            {currentUser && (
              <button
                onClick={() => handleNavClick('/growtrack')}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between ${
                  location. pathname.startsWith('/growtrack')
                    ? 'bg-teal/10 text-teal'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                GrowTrack
                {location.pathname.startsWith('/growtrack') && (
                  <div className="w-2 h-2 bg-teal rounded-full"></div>
                )}
              </button>
            )}

            {/* Mobile Auth Section - Same as before but with navigate() */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-teal/5 to-blue-500/5 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal to-[#347EAD] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {getInitials(currentUser.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2. 5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                      <span className="w-1.5 h-1. 5 rounded-full bg-current mr-1.5"></span>
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>

                  {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                    <button
                      onClick={handleAdminDashboard}
                      className="w-full px-4 py-3 bg-teal/10 text-teal font-bold rounded-xl hover:bg-teal/20 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1. 724 1.724 0 002.573 1.066c1.543-.94 3. 31.826 2.37 2.37a1.724 1.724 0 001. 065 2.572c1. 756.426 1.756 2.924 0 3. 35a1.724 1. 724 0 00-1. 066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-. 426 1.756-2. 924 1.756-3. 35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1. 724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 border-2 border-teal text-teal font-bold rounded-xl hover:bg-teal/5 transition-all"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal to-[#347EAD] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;