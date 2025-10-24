import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Features from './pages/Features'
import WhyUs from './pages/WhyUs';
import Community from './pages/Community';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ArticleManagement from './pages/Admin/ArticleManagement';
import CreateArticle from './pages/Admin/CreateArticle';
import ManageArticles from './pages/Admin/ManageArticles';
import EditArticle from './pages/Admin/EditArticle';
import ReviewQueue from './pages/Admin/ReviewQueue';
import LearnWell from './pages/LearnWell';
import ArticleReader from './pages/ArticleReader';
import LoginPage from './pages/Admin/LoginPage';
import AuthModal from './components/auth/AuthModal';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => {
      return sessionStorage.getItem('isAdminAuthenticated') === 'true' || 
             localStorage.getItem('token') !== null;
    }
  );

  // Get current date/time for debugging
  const getCurrentDateTime = () => {
    return '2025-10-24 13:56:17';
  };

  const navigateTo = (page: string, updateUrl: boolean = true, articleId?: string) => {
    console.log(`🧭 [${getCurrentDateTime()}] Navigation: ${page}${articleId ? ` (Article: ${articleId})` : ''} | User: ArogoClin`);
    setCurrentPage(page);
    if (articleId) {
      setCurrentArticleId(articleId);
    } else {
      setCurrentArticleId(null);
    }
    
    if (updateUrl) {
      let url = '/';
      if (page === 'home') url = '/';
      else if (page === 'features') url = '/features';
      else if (page === 'whyus') url = '/whyus';
      else if (page === 'community') url = '/community';
      else if (page === 'learnwell') url = '/learnwell';
      else if (page === 'admin-dashboard') url = '/admin';
      else if (page === 'admin-articles') url = '/admin/articles';
      else if (page === 'admin-create-article') url = '/admin/articles/create';
      else if (page === 'admin-manage-articles') url = '/admin/articles/manage';
      else if (page === 'admin-edit-article') url = `/admin/articles/edit/${articleId}`;
      else if (page === 'admin-review-queue') url = '/admin/articles/review';
      else if (page === 'read-article') url = `/article/${articleId}`;
      else if (page === 'login') url = '/login';
      
      window.history.pushState({ page, articleId }, '', url);
    }
  };

  const handleLoginSuccess = () => {
    console.log(`✅ [${getCurrentDateTime()}] Login success - User: ArogoClin`);
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    navigateTo('admin-dashboard');
  };

  const handleLogout = () => {
    console.log(`👋 [${getCurrentDateTime()}] Logout - User: ArogoClin`);
    sessionStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('token');
    setIsAdminAuthenticated(false);
    setCurrentArticleId(null);
    navigateTo('home');
  };

  // Navigation handlers
  const handleNavigateToPage = (page: string) => {
    navigateTo(page);
  };

  const handleNavigateToArticle = (articleId: string) => {
    navigateTo('read-article', true, articleId);
  };

  const handleNavigateToEditArticle = (articleId: string) => {
    navigateTo('admin-edit-article', true, articleId);
  };

  // Admin navigation handlers
  const handleNavigateToArticles = () => navigateTo('admin-articles');
  const handleNavigateToDashboard = () => navigateTo('admin-dashboard');
  const handleNavigateToCreateArticle = () => navigateTo('admin-create-article');
  const handleNavigateToManageArticles = () => navigateTo('admin-manage-articles');
  const handleNavigateToReviewQueue = () => navigateTo('admin-review-queue');

  const getPageFromPath = (path: string): { page: string; articleId?: string } => {
    const cleanPath = path.replace(/^\//, '');
    
    if (cleanPath === '' || cleanPath === '/') return { page: 'home' };
    if (cleanPath === 'features') return { page: 'features' };
    if (cleanPath === 'whyus') return { page: 'whyus' };
    if (cleanPath === 'community') return { page: 'community' };
    if (cleanPath === 'learnwell') return { page: 'learnwell' };
    if (cleanPath === 'admin') return { page: 'admin-dashboard' };
    if (cleanPath === 'admin/articles') return { page: 'admin-articles' };
    if (cleanPath === 'admin/articles/create') return { page: 'admin-create-article' };
    if (cleanPath === 'admin/articles/manage') return { page: 'admin-manage-articles' };
    if (cleanPath === 'admin/articles/review') return { page: 'admin-review-queue' };
    if (cleanPath.startsWith('admin/articles/edit/')) {
      const articleId = cleanPath.split('/')[3];
      return { page: 'admin-edit-article', articleId };
    }
    if (cleanPath.startsWith('article/')) {
      const articleId = cleanPath.split('/')[1];
      return { page: 'read-article', articleId };
    }
    if (cleanPath === 'login') return { page: 'login' };
    
    return { page: 'home' };
  };

  useEffect(() => {
    const { page, articleId } = getPageFromPath(window.location.pathname);
    console.log(`🚀 [${getCurrentDateTime()}] App initialized: ${page}${articleId ? ` (Article: ${articleId})` : ''} | User: ArogoClin`);
    setCurrentPage(page);
    if (articleId) setCurrentArticleId(articleId);

    const handlePopState = (event: PopStateEvent) => {
      const { page, articleId } = event.state || getPageFromPath(window.location.pathname);
      console.log(`⬅️ [${getCurrentDateTime()}] Browser navigation: ${page}${articleId ? ` (Article: ${articleId})` : ''}`);
      setCurrentPage(page);
      if (articleId) {
        setCurrentArticleId(articleId);
      } else {
        setCurrentArticleId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Debug current state
  console.log(`📍 [${getCurrentDateTime()}] Current state: Page=${currentPage}, Article=${currentArticleId}, Auth=${isAdminAuthenticated}, User=ArogoClin`);

  // Auth check for admin pages
  const adminPages = [
    'admin-dashboard', 
    'admin-articles', 
    'admin-create-article', 
    'admin-manage-articles', 
    'admin-edit-article', 
    'admin-review-queue'
  ];
  
  if (adminPages.includes(currentPage) && !isAdminAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Route to pages
  switch (currentPage) {
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
          <Footer />
        </div>
      );

    case 'read-article':
      if (!currentArticleId) return <div>Article not found</div>;
      return (
        <ArticleReader 
          articleId={currentArticleId}
          onNavigateBack={() => navigateTo('learnwell')}
        />
      );

    case 'admin-dashboard':
      return (
        <AdminDashboard 
          onLogout={handleLogout} 
          onNavigateToArticles={handleNavigateToArticles}
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
      if (!currentArticleId) return <div>Article not found</div>;
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

    case 'login':
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;

    default:
      return (
        <Home 
          onGetStartedClick={() => setIsAuthModalOpen(true)}
          onNavigateToPage={handleNavigateToPage}
        />
      );
  }

  // This won't be reached but keeping for completeness
  return (
    <>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};

export default App;