/**
 * ============================================
 * NAVBAR - TOTOZ WELLNESS
 * ============================================
 * @version     10.0.0
 * @updated     2025-04-23
 * @description Refined navbar aligned with revamped homepage
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home',        path: '/' },
    { name: 'Features',    path: '/features' },
    { name: 'Programs',    path: '/programs' },
    { name: 'Get Involved',path: '/get-involved' },
    { name: 'About',       path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
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

  const getAvatarUrl = (user: any) => {
    const seed = encodeURIComponent(user.email);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-sm border-b border-gray-100'
          : 'bg-white/98 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* ── Logo ─────────────────────────────────── */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <img
              src={logo}
              alt="Totoz Wellness"
              className={`rounded-full object-cover transition-all duration-300 ${
                isScrolled ? 'w-9 h-9' : 'w-11 h-11'
              }`}
            />
            <span className="font-heading font-bold text-[#1e3a6e] text-base hidden sm:block tracking-tight">
              Totoz Wellness
            </span>
          </button>

          {/* ── Desktop Nav ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'text-[#e9924b]'
                    : 'text-[#1e3a6e]/70 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5'
                }`}
              >
                {link.name}
                {/* Active underline */}
                {isActive(link.path) && (
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#e9924b] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Right Side ───────────────────────────── */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              // ── User Avatar + Dropdown ──
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#e9924b]/30 rounded-full transition-all"
                  aria-expanded={showUserMenu}
                  aria-label="Open user menu"
                >
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={`${currentUser.name}'s avatar`}
                    className="w-9 h-9 rounded-full border-2 border-[#e9924b]/30 shadow-sm"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-scale-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarUrl(currentUser)}
                          alt={`${currentUser.name}'s avatar`}
                          className="w-9 h-9 rounded-full border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1e3a6e] text-sm truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <ul className="py-1.5 text-sm">
                      {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                        <li>
                          <button
                            onClick={handleAdminDashboard}
                            className="flex items-center gap-3 w-full px-4 py-2 text-[#1e3a6e]/80 hover:bg-gray-50 hover:text-[#1e3a6e] transition-colors text-left"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              // ── Auth Buttons ──
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-[#1e3a6e]/70 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-lg transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#e9924b] hover:bg-[#d4762a] rounded-full transition-all hover:shadow-md hover:shadow-[#e9924b]/25 hover:-translate-y-px"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* ── Mobile Hamburger ── */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 text-[#1e3a6e]/70 hover:text-[#1e3a6e] hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────── */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="px-5 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`flex w-full items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-[#e9924b]/10 text-[#e9924b]'
                    : 'text-[#1e3a6e]/70 hover:bg-gray-50 hover:text-[#1e3a6e]'
                }`}
              >
                {link.name}
              </button>
            ))}

            {/* Mobile Auth */}
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <img
                      src={getAvatarUrl(currentUser)}
                      alt={`${currentUser.name}'s avatar`}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1e3a6e] text-sm truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  {['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role) && (
                    <button
                      onClick={handleAdminDashboard}
                      className="w-full px-4 py-2.5 text-sm text-[#1e3a6e]/70 hover:bg-gray-50 rounded-xl transition-all text-left font-medium"
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all text-left font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-2.5 text-sm font-medium text-[#1e3a6e] border border-[#1e3a6e]/20 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#e9924b] hover:bg-[#d4762a] rounded-xl transition-all"
                  >
                    Get Started
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