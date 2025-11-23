/**
 * ============================================
 * TOTOZ WELLNESS - MAIN APP COMPONENT
 * ============================================
 * @version     4.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 10:04:22 UTC
 * @description Complete app with auth system, modals, and error handling
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Home from './pages/Home';
import Features from './pages/Features';
import WhyUs from './pages/WhyUs';
import Community from './pages/Community';
import TalkEasy from './pages/TalkEasy';
import LearnWell from './pages/LearnWell';
import ArticleReader from './pages/ArticleReader';
import ConnectCare from './pages/ConnectCare';
import ParentCircleHub from './pages/ParentCircle/ParentCircleHub';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import AdminLoginPage from './pages/Admin/LoginPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ArticleManagement from './pages/Admin/ArticleManagement';
import CreateArticle from './pages/Admin/CreateArticle';
import ManageArticles from './pages/Admin/ManageArticles';
import EditArticle from './pages/Admin/EditArticle';
import ReviewQueue from './pages/Admin/ReviewQueue';
import ConnectCareAdmin from './pages/Admin/ConnectCareAdmin';
import TalkEasyStats from './pages/Admin/TalkEasyStats';
import TalkEasyInsights from './pages/Admin/TalkEasyInsights';
import TalkEasyExport from './pages/Admin/TalkEasyExport';
import ParentCircleModerationDashboard from './pages/Admin/ParentCircleModerationDashboard';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Utils
import { isAuthenticated, getCurrentUser, logUserAction } from './utils/roleUtils';
import api from './config/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => isAuthenticated());
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  /**
   * Get current date/time for logging (UTC format)
   */
  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  };

  /**
   * Navigate to a different page with optional article ID
   */
  const navigateTo = (page: string, updateUrl: boolean = true, articleId?: string): void => {
    const currentUser = getCurrentUser();
    logUserAction(
      `Navigation to ${page}${articleId ? ` (Article: ${articleId.substring(0, 8)})` : ''}`,
      { page, articleId, timestamp: getCurrentDateTime() }
    );

    setCurrentPage(page);
    if (articleId) {
      setCurrentArticleId(articleId);
    } else {
      setCurrentArticleId(null);
    }
    
    if (updateUrl) {
      const url = getUrlForPage(page, articleId);
      window.history.pushState({ page, articleId }, '', url);
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Get URL path for a given page
   */
  const getUrlForPage = (page: string, articleId?: string): string => {
    const routes: Record<string, string> = {
      'home': '/',
      'features': '/features',
      'whyus': '/whyus',
      'community': '/community',
      'learnwell': '/learnwell',
      'connectcare': '/connectcare',
      'talkeasy': '/talkeasy',
      'parentcircle': '/parentcircle',
      'login': '/login',
      'signup': '/signup',
      'admin-login': '/admin/login',
      'admin-dashboard': '/admin',
      'admin-articles': '/admin/articles',
      'admin-create-article': '/admin/articles/create',
      'admin-manage-articles': '/admin/articles/manage',
      'admin-review-queue': '/admin/articles/review',
      'admin-connectcare': '/admin/connectcare',
      'admin-talkeasy-stats': '/admin/talkeasy/stats',
      'admin-talkeasy-insights': '/admin/talkeasy/insights',
      'admin-talkeasy-export': '/admin/talkeasy/export',
      'admin-parentcircle-moderation': '/admin/parentcircle/moderation',
    };

    if (page === 'admin-edit-article' && articleId) {
      return `/admin/articles/edit/${articleId}`;
    }
    if (page === 'read-article' && articleId) {
      return `/article/${articleId}`;
    }

    return routes[page] || '/';
  };

  /**
   * Parse URL path to get page and article ID
   */
  const getPageFromPath = (path: string): { page: string; articleId?: string } => {
    const cleanPath = path.replace(/^\//, '');
    
    // Public pages
    if (cleanPath === '' || cleanPath === '/') return { page: 'home' };
    if (cleanPath === 'features') return { page: 'features' };
    if (cleanPath === 'whyus') return { page: 'whyus' };
    if (cleanPath === 'community') return { page: 'community' };
    if (cleanPath === 'learnwell') return { page: 'learnwell' };
    if (cleanPath === 'connectcare') return { page: 'connectcare' };
    if (cleanPath === 'talkeasy') return { page: 'talkeasy' };
    if (cleanPath === 'parentcircle') return { page: 'parentcircle' };
    if (cleanPath === 'login') return { page: 'login' };
    if (cleanPath === 'signup') return { page: 'signup' };
    
    // Admin pages
    if (cleanPath === 'admin/login') return { page: 'admin-login' };
    if (cleanPath === 'admin') return { page: 'admin-dashboard' };
    if (cleanPath === 'admin/articles') return { page: 'admin-articles' };
    if (cleanPath === 'admin/articles/create') return { page: 'admin-create-article' };
    if (cleanPath === 'admin/articles/manage') return { page: 'admin-manage-articles' };
    if (cleanPath === 'admin/articles/review') return { page: 'admin-review-queue' };
    if (cleanPath === 'admin/connectcare') return { page: 'admin-connectcare' };
    if (cleanPath === 'admin/talkeasy/stats') return { page: 'admin-talkeasy-stats' };
    if (cleanPath === 'admin/talkeasy/insights') return { page: 'admin-talkeasy-insights' };
    if (cleanPath === 'admin/talkeasy/export') return { page: 'admin-talkeasy-export' };
    if (cleanPath === 'admin/parentcircle/moderation') return { page: 'admin-parentcircle-moderation' };
    
    // Dynamic routes with IDs
    if (cleanPath.startsWith('admin/articles/edit/')) {
      const articleId = cleanPath.split('/')[3];
      return { page: 'admin-edit-article', articleId };
    }
    if (cleanPath.startsWith('article/')) {
      const articleId = cleanPath.split('/')[1];
      return { page: 'read-article', articleId };
    }
    
    return { page: 'home' };
  };

  /**
   * Handle successful user login (public)
   */
  const handleLoginSuccess = (): void => {
    const currentUser = getCurrentUser();
    logUserAction('Public login successful', { 
      timestamp: getCurrentDateTime(),
      role: currentUser?.role 
    });
    
    // Check if user has admin role
    if (currentUser && ['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'].includes(currentUser.role)) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
    }
    
    // Navigate to home or previous page
    navigateTo('home');
  };

  /**
   * Handle successful signup
   */
  const handleSignupSuccess = (): void => {
    const currentUser = getCurrentUser();
    logUserAction('Signup successful', { 
      timestamp: getCurrentDateTime(),
      user: currentUser?.name 
    });
    
    navigateTo('home');
  };

  /**
   * Handle successful admin login
   */
  const handleAdminLoginSuccess = (): void => {
    const currentUser = getCurrentUser();
    logUserAction('Admin login successful', { 
      timestamp: getCurrentDateTime(),
      role: currentUser?.role 
    });
    
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    navigateTo('admin-dashboard');
  };

  /**
   * Handle user logout
   */
  const handleLogout = (): void => {
    const currentUser = getCurrentUser();
    logUserAction('Logout', { 
      timestamp: getCurrentDateTime(),
      user: currentUser?.name 
    });
    
    sessionStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAdminAuthenticated(false);
    setCurrentArticleId(null);
    navigateTo('home');
  };

  // ============================================
  // Navigation Handlers
  // ============================================

  const handleNavigateToPage = (page: string): void => {
    navigateTo(page);
  };

  const handleNavigateToArticle = (articleId: string): void => {
    navigateTo('read-article', true, articleId);
  };

  // Admin navigation
  const handleNavigateToDashboard = (): void => navigateTo('admin-dashboard');
  const handleNavigateToArticles = (): void => navigateTo('admin-articles');
  const handleNavigateToCreateArticle = (): void => navigateTo('admin-create-article');
  const handleNavigateToManageArticles = (): void => navigateTo('admin-manage-articles');
  const handleNavigateToReviewQueue = (): void => navigateTo('admin-review-queue');
  const handleNavigateToConnectCare = (): void => navigateTo('admin-connectcare');
  const handleNavigateToTalkEasyStats = (): void => navigateTo('admin-talkeasy-stats');
  const handleNavigateToTalkEasyInsights = (): void => navigateTo('admin-talkeasy-insights');
  const handleNavigateToTalkEasyExport = (): void => navigateTo('admin-talkeasy-export');
  const handleNavigateToParentCircleModeration = (): void => navigateTo('admin-parentcircle-moderation');
  const handleNavigateToEditArticle = (articleId: string): void => {
    navigateTo('admin-edit-article', true, articleId);
  };

  // ============================================
  // Effects
  // ============================================

  /**
   * Initialize app and set up navigation callback for api.ts
   */
  useEffect(() => {
    const { page, articleId } = getPageFromPath(window.location.pathname);
    const currentUser = getCurrentUser();
    
    console.log(`🚀 [${getCurrentDateTime()}] App initialized:`, {
      page,
      articleId: articleId ? articleId.substring(0, 8) : 'none',
      user: currentUser?.name || 'Not logged in',
      role: currentUser?.role || 'N/A',
      authenticated: isAdminAuthenticated
    });
    
    setCurrentPage(page);
    if (articleId) setCurrentArticleId(articleId);
    setAuthCheckComplete(true);

    // Set navigation callback for api.ts to handle 401 redirects
    if ((api as any).setNavigationCallback) {
      (api as any).setNavigationCallback((page: string) => {
        navigateTo(page);
      });
    }

    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent): void => {
      const { page, articleId } = event.state || getPageFromPath(window.location.pathname);
      
      console.log(`⬅️ [${getCurrentDateTime()}] Browser navigation:`, {
        page,
        articleId: articleId ? articleId.substring(0, 8) : 'none'
      });
      
      setCurrentPage(page);
      setCurrentArticleId(articleId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Log state changes for debugging
   */
  useEffect(() => {
    if (!authCheckComplete) return;
    
    const currentUser = getCurrentUser();
    console.log(`📍 [${getCurrentDateTime()}] Current state:`, {
      page: currentPage,
      articleId: currentArticleId ? currentArticleId.substring(0, 8) : 'none',
      authenticated: isAdminAuthenticated,
      user: currentUser?.name || 'Not logged in',
      role: currentUser?.role || 'N/A'
    });
  }, [currentPage, currentArticleId, isAdminAuthenticated, authCheckComplete]);

  /**
   * Check auth state changes (for cross-tab sync)
   */
  useEffect(() => {
    const checkAuth = () => {
      const authState = isAuthenticated();
      if (authState !== isAdminAuthenticated) {
        setIsAdminAuthenticated(authState);
      }
    };

    // Check every second
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated]);

  // ============================================
  // Auth Check for Admin Pages
  // ============================================

  const adminPages = [
    'admin-dashboard',
    'admin-articles',
    'admin-create-article',
    'admin-manage-articles',
    'admin-edit-article',
    'admin-review-queue',
    'admin-connectcare',
    'admin-talkeasy-stats',
    'admin-talkeasy-insights',
    'admin-talkeasy-export',
    'admin-parentcircle-moderation'
  ];

  if (adminPages.includes(currentPage) && !isAdminAuthenticated) {
    console.log(`🔒 [${getCurrentDateTime()}] Unauthorized access attempt to ${currentPage} - Redirecting to admin login`);
    return (
      <AdminLoginPage 
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // ============================================
  // Page Rendering
  // ============================================

  const renderPage = (): React.JSX.Element => {
    switch (currentPage) {
      // ========== Public Pages ==========
      case 'home':
        return (
          <Home 
            onGetStartedClick={() => navigateTo('signup')}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'features':
        return (
          <Features 
            onGetStartedClick={() => navigateTo('signup')}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'whyus':
        return (
          <WhyUs 
            onGetStartedClick={() => navigateTo('signup')}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'community':
        return (
          <Community 
            onGetStartedClick={() => navigateTo('signup')}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'learnwell':
        return (
          <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
            <Navbar 
              onNavigateToPage={handleNavigateToPage}
            />
            <main className="flex-grow">
              <LearnWell onNavigateToArticle={handleNavigateToArticle} />
            </main>
            <Footer
              onGetStartedClick={() => navigateTo('signup')}
              onNavigateToPage={handleNavigateToPage}
            />
          </div>
        );

      case 'connectcare':
        return (
          <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
            <Navbar 
              onNavigateToPage={handleNavigateToPage}
            />
            <main className="flex-grow">
              <ConnectCare onNavigate={handleNavigateToPage} />
            </main>
            <Footer 
              onGetStartedClick={() => navigateTo('signup')}
              onNavigateToPage={handleNavigateToPage}
            />
          </div>
        );

      case 'talkeasy':
        return <TalkEasy />;

      case 'parentcircle':
        return (
          <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
            <Navbar 
              onNavigateToPage={handleNavigateToPage}
            />
            <main className="flex-grow">
              <ParentCircleHub />
            </main>
            <Footer 
              onGetStartedClick={() => navigateTo('signup')}
              onNavigateToPage={handleNavigateToPage}
            />
          </div>
        );

      case 'read-article':
        if (!currentArticleId) {
          console.error(`❌ [${getCurrentDateTime()}] Article ID missing for read-article page`);
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
                <button
                  onClick={() => navigateTo('learnwell')}
                  className="px-6 py-2 bg-teal text-white rounded-full hover:bg-teal/90 transition"
                >
                  ← Back to LearnWell
                </button>
              </div>
            </div>
          );
        }
        return (
          <ArticleReader 
            articleId={currentArticleId}
            onNavigateBack={() => navigateTo('learnwell')}
          />
        );

      // ========== Auth Pages ==========
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => navigateTo('signup')}
            onNavigateToHome={() => navigateTo('home')}
          />
        );

      case 'signup':
        return (
          <SignupPage
            onSignupSuccess={handleSignupSuccess}
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateToHome={() => navigateTo('home')}
          />
        );

      case 'admin-login':
        return (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
          />
        );

      // ========== Admin Pages ==========
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            onLogout={handleLogout}
            onNavigateToArticles={handleNavigateToArticles}
            onNavigateToConnectCare={handleNavigateToConnectCare}
            onNavigateToTalkEasyStats={handleNavigateToTalkEasyStats}
            onNavigateToTalkEasyInsights={handleNavigateToTalkEasyInsights}
            onNavigateToTalkEasyExport={handleNavigateToTalkEasyExport}
            onNavigateToParentCircleModeration={handleNavigateToParentCircleModeration}
          />
        );

      case 'admin-articles':
        return (
          <ArticleManagement 
            onLogout={handleLogout}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToCreate={handleNavigateToCreateArticle}
            onNavigateToManage={handleNavigateToManageArticles}
            onNavigateToReview={handleNavigateToReviewQueue}
          />
        );

      case 'admin-create-article':
        return (
          <CreateArticle 
            onNavigateBack={handleNavigateToArticles}
            onLogout={handleLogout}
          />
        );

      case 'admin-manage-articles':
        return (
          <ManageArticles 
            onNavigateBack={handleNavigateToArticles}
            onNavigateToCreate={handleNavigateToCreateArticle}
            onNavigateToEdit={handleNavigateToEditArticle}
            onLogout={handleLogout}
          />
        );

      case 'admin-edit-article':
        if (!currentArticleId) {
          console.error(`❌ [${getCurrentDateTime()}] Article ID missing for edit-article page`);
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
                <button
                  onClick={() => navigateTo('admin-manage-articles')}
                  className="px-6 py-2 bg-teal text-white rounded-full hover:bg-teal/90 transition"
                >
                  ← Back to Manage Articles
                </button>
              </div>
            </div>
          );
        }
        return (
          <EditArticle 
            articleId={currentArticleId}
            onNavigateBack={handleNavigateToManageArticles}
            onLogout={handleLogout}
          />
        );

      case 'admin-review-queue':
        return (
          <ReviewQueue 
            onNavigateBack={handleNavigateToArticles}
            onLogout={handleLogout}
          />
        );

      case 'admin-connectcare':
        return (
          <ConnectCareAdmin 
            onBack={handleNavigateToDashboard}
          />
        );

      case 'admin-talkeasy-stats':
        return (
          <TalkEasyStats
            onBack={handleNavigateToDashboard}
            onLogout={handleLogout}
          />
        );

      case 'admin-talkeasy-insights':
        return (
          <TalkEasyInsights
            onBack={handleNavigateToDashboard}
            onLogout={handleLogout}
          />
        );

      case 'admin-talkeasy-export':
        return (
          <TalkEasyExport
            onBack={handleNavigateToDashboard}
            onLogout={handleLogout}
          />
        );

      case 'admin-parentcircle-moderation':
        return (
          <ParentCircleModerationDashboard
            onBack={handleNavigateToDashboard}
          />
        );

      default:
        console.warn(`⚠️ [${getCurrentDateTime()}] Unknown page: ${currentPage} - Redirecting to home`);
        return (
          <Home 
            onGetStartedClick={() => navigateTo('signup')}
            onNavigateToPage={handleNavigateToPage}
          />
        );
    }
  };

  // ============================================
  // Main Render
  // ============================================

  return (
    <>
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Page Content */}
      {authCheckComplete ? renderPage() : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal/10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading Totoz Wellness...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;