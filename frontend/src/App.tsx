import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Hero from './components/home/Hero';
import Features from './components/home/Features';
import WhyUs from './components/home/WhyUs';
import Testimonials from './components/home/Testimonials';
import CTA from './components/home/CTA';
import Footer from './components/common/Footer';
import AdminPage from './pages/Admin/AdminPage';
import LearnWell from './pages/LearnWell';
import LoginPage from './pages/LoginPage';
import AuthModal from './components/auth/AuthModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('isAdminAuthenticated') === 'true'
  );

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    window.location.hash = '#';
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentPage('admin');
      } else if (hash === '#learnwell') {
        setCurrentPage('learnwell');
      } else if (hash === '#login') {
        setCurrentPage('login');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    
    // Check hash on initial load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);


  if (currentPage === 'admin') {
    return isAdminAuthenticated ? <AdminPage onLogout={handleLogout} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (currentPage === 'learnwell') {
    return (
      <div className="bg-light-bg overflow-x-hidden min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <LearnWell />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-light-bg overflow-x-hidden">
      <Header onGetStartedClick={() => setIsAuthModalOpen(true)} />
      <main>
        <Hero />
        <Features />
        <WhyUs />
        <Testimonials />
        <CTA onJoinClick={() => setIsAuthModalOpen(true)} />
      </main>
      <Footer />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default App;