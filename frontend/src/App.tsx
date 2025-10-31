import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Features from './pages/Features';
import WhyUs from './pages/WhyUs';
import Community from './pages/Community';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ArticleManagement from './pages/Admin/ArticleManagement';
import CreateArticle from './pages/Admin/CreateArticle';
import ManageArticles from './pages/Admin/ManageArticles';
import EditArticle from './pages/Admin/EditArticle';
import ReviewQueue from './pages/Admin/ReviewQueue';
import ConnectCareAdmin from './pages/Admin/ConnectCareAdmin';
import LearnWell from './pages/LearnWell';
import ArticleReader from './pages/ArticleReader';
import LoginPage from './pages/Admin/LoginPage';
import AuthModal from './components/auth/AuthModal';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ConnectCare from './pages/ConnectCare';
import { isAuthenticated, getCurrentUser, logUserAction } from './utils/roleUtils';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => isAuthenticated());

  // Get current date/time for logging
  const getCurrentDateTime = (): string => {
    return '2025-10-31 15:13:04';
  };

  /**
   * Navigate to a different page with optional article ID
   * Updates both component state and browser history
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
      'admin-dashboard': '/admin',
      'admin-articles': '/admin/articles',
      'admin-create-article': '/admin/articles/create',
      'admin-manage-articles': '/admin/articles/manage',
      'admin-review-queue': '/admin/articles/review',
      'admin-connectcare': '/admin/connectcare',
      'login': '/login',
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
    if (cleanPath === 'login') return { page: 'login' };
    
    // Admin pages
    if (cleanPath === 'admin') return { page: 'admin-dashboard' };
    if (cleanPath === 'admin/articles') return { page: 'admin-articles' };
    if (cleanPath === 'admin/articles/create') return { page: 'admin-create-article' };
    if (cleanPath === 'admin/articles/manage') return { page: 'admin-manage-articles' };
    if (cleanPath === 'admin/articles/review') return { page: 'admin-review-queue' };
    if (cleanPath === 'admin/connectcare') return { page: 'admin-connectcare' };
    
    // Dynamic routes with IDs
    if (cleanPath.startsWith('admin/articles/edit/')) {
      const articleId = cleanPath.split('/')[3];
      return { page: 'admin-edit-article', articleId };
    }
    if (cleanPath.startsWith('article/')) {
      const articleId = cleanPath.split('/')[1];
      return { page: 'read-article', articleId };
    }
    
    // Default fallback
    return { page: 'home' };
  };

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (): void => {
    const currentUser = getCurrentUser();
    logUserAction('Login successful', { 
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
    
    // Clear all auth data
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

  // Public navigation
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
  const handleNavigateToEditArticle = (articleId: string): void => {
    navigateTo('admin-edit-article', true, articleId);
  };

  // ============================================
  // Effects
  // ============================================

  /**
   * Initialize app on mount and handle browser navigation
   */
  useEffect(() => {
    // Set initial page from URL
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
   * Log current state changes for debugging
   */
  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log(`📍 [${getCurrentDateTime()}] Current state:`, {
      page: currentPage,
      articleId: currentArticleId ? currentArticleId.substring(0, 8) : 'none',
      authenticated: isAdminAuthenticated,
      user: currentUser?.name || 'Not logged in',
      role: currentUser?.role || 'N/A'
    });
  }, [currentPage, currentArticleId, isAdminAuthenticated]);

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
    'admin-connectcare'
  ];

  // Redirect to login if trying to access admin pages without auth
  if (adminPages.includes(currentPage) && !isAdminAuthenticated) {
    console.log(`🔒 [${getCurrentDateTime()}] Unauthorized access attempt to ${currentPage} - Redirecting to login`);
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ============================================
  // Page Rendering
  // ============================================

  /**
   * Render the current page based on state
   */
  const renderPage = (): React.JSX.Element => {
    switch (currentPage) {
      // ========== Public Pages ==========
      case 'home':
        return (
          <Home 
            onGetStartedClick={() => setIsAuthModalOpen(true)}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'features':
        return (
          <Features 
            onGetStartedClick={() => setIsAuthModalOpen(true)}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'whyus':
        return (
          <WhyUs 
            onGetStartedClick={() => setIsAuthModalOpen(true)}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'community':
        return (
          <Community 
            onGetStartedClick={() => setIsAuthModalOpen(true)}
            onNavigateToPage={handleNavigateToPage}
          />
        );

      case 'learnwell':
        return (
          <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
            <Navbar 
              onGetStartedClick={() => setIsAuthModalOpen(true)}
              onNavigateToPage={handleNavigateToPage}
            />
            <main className="flex-grow">
              <LearnWell onNavigateToArticle={handleNavigateToArticle} />
            </main>
            <Footer
              onGetStartedClick={() => setIsAuthModalOpen(true)}
              onNavigateToPage={handleNavigateToPage}
            />
          </div>
        );

      case 'connectcare':
        return (
          <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
            <Navbar 
              onGetStartedClick={() => setIsAuthModalOpen(true)}
              onNavigateToPage={handleNavigateToPage}
            />
            <main className="flex-grow">
              <ConnectCare onNavigate={handleNavigateToPage} />
            </main>
            <Footer 
              onGetStartedClick={() => setIsAuthModalOpen(true)}
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

      // ========== Admin Pages ==========
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            onLogout={handleLogout}
            onNavigateToArticles={handleNavigateToArticles}
            onNavigateToConnectCare={handleNavigateToConnectCare}
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

      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;

      // ========== Default/Fallback ==========
      default:
        console.warn(`⚠️ [${getCurrentDateTime()}] Unknown page: ${currentPage} - Redirecting to home`);
        return (
          <Home 
            onGetStartedClick={() => setIsAuthModalOpen(true)}
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
      {renderPage()}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default App;