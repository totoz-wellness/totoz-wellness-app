/**
 * ============================================
 * TOTOZ WELLNESS - MAIN APP COMPONENT
 * ============================================
 * @version     5.0.0
 * @author      ArogoClin
 * @updated     2025-11-27
 * @description Clean router-based architecture
 * ============================================
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ========== PUBLIC PAGES ==========
import Home from './pages/Home';
import Features from './pages/Features';
import WhyUs from './pages/WhyUs';
import Community from './pages/Community';
import LearnWell from './pages/LearnWell';
import ArticleReader from './pages/ArticleReader';
import ConnectCare from './pages/ConnectCare';
import ParentCircleHub from './pages/ParentCircle/ParentCircleHub';
import QuestionDetail from './pages/ParentCircle/QuestionDetail';  // 🆕 ADD THIS
import StoryDetail from './pages/ParentCircle/StoryDetail';        // 🆕 ADD THIS

// ========== AUTH PAGES ==========
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import AdminLogin from './pages/Admin/LoginPage';

// ========== USER PROTECTED PAGES ==========
import TalkEasy from './pages/TalkEasy';
import GrowTrackHome from './pages/GrowTrack/GrowTrackHome';
import GrowTrackCreate from './pages/GrowTrack/CreateEntry';
import GrowTrackEntries from './pages/GrowTrack/ViewEntries';
import GrowTrackInsights from './pages/GrowTrack/Insights';
import GrowTrackChildren from './pages/GrowTrack/ChildManager';

// ========== ADMIN PAGES ==========
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
import ParentCircleModeration from './pages/Admin/ParentCircleModerationDashboard';

// ========== COMPONENTS ==========
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'

function App() {
  return (
    <BrowserRouter>
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
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      />

      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/whyus" element={<WhyUs />} />
        <Route path="/community" element={<Community />} />
        
        {/* LearnWell */}
        <Route path="/learnwell" element={<LearnWell />} />
        <Route path="/article/:id" element={<ArticleReader />} />
        
        {/* ConnectCare */}
        <Route path="/connectcare" element={
          <PublicLayout>
            <ConnectCare />
          </PublicLayout>
        } />
        
        {/* ParentCircle - Hub and Detail Pages */}
        <Route path="/parentcircle" element={
          <PublicLayout>
            <ParentCircleHub />
          </PublicLayout>
        } />
        
        {/* 🆕 ADD THESE TWO ROUTES */}
        <Route path="/question/:id" element={
          <PublicLayout>
            <QuestionDetail />
          </PublicLayout>
        } />
        
        <Route path="/story/:id" element={
          <PublicLayout>
            <StoryDetail />
          </PublicLayout>
        } />

        {/* ========== AUTH ROUTES ========== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ========== PROTECTED USER ROUTES (Authenticated Users) ========== */}
        <Route 
          path="/talkeasy" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <TalkEasy />
            </ProtectedRoute>
          } 
        />

        {/* GrowTrack Routes */}
        <Route 
          path="/growtrack" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <GrowTrackHome />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/growtrack/create" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <GrowTrackCreate />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/growtrack/entries" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <GrowTrackEntries />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/growtrack/insights" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <GrowTrackInsights />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/growtrack/children" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <GrowTrackChildren />
            </ProtectedRoute>
          } 
        />

        {/* ========== ADMIN ROUTES ========== */}
        
        {/* Admin Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Article Management */}
        <Route 
          path="/admin/articles" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN']}>
              <ArticleManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/articles/create" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN']}>
              <CreateArticle />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/articles/manage" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN']}>
              <ManageArticles />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/articles/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN']}>
              <EditArticle />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/articles/review" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_LEAD', 'SUPER_ADMIN']}>
              <ReviewQueue />
            </ProtectedRoute>
          } 
        />

        {/* ConnectCare Admin */}
        <Route 
          path="/admin/connectcare" 
          element={
            <ProtectedRoute allowedRoles={['CONTENT_LEAD', 'SUPER_ADMIN']}>
              <ConnectCareAdmin />
            </ProtectedRoute>
          } 
        />

        {/* TalkEasy Admin */}
        <Route 
          path="/admin/talkeasy/stats" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <TalkEasyStats />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/talkeasy/insights" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <TalkEasyInsights />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/talkeasy/export" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <TalkEasyExport />
            </ProtectedRoute>
          } 
        />

        {/* ParentCircle Moderation */}
        <Route 
          path="/admin/parentcircle/moderation" 
          element={
            <ProtectedRoute allowedRoles={['MODERATOR', 'SUPER_ADMIN']}>
              <ParentCircleModeration />
            </ProtectedRoute>
          } 
        />

        {/* Admin Root - Redirect based on role */}
        <Route path="/admin" element={<AdminRedirect />} />

        {/* ========== 404 FALLBACK ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Helper component to redirect /admin based on user role
 */
function AdminRedirect() {
  const userData = localStorage.getItem('user');
  
  if (!userData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON. parse(userData);
    const role = user.role;

    // Role-based redirects
    if (role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'MODERATOR') {
      return <Navigate to="/admin/parentcircle/moderation" replace />;
    } else if (role === 'CONTENT_LEAD') {
      return <Navigate to="/admin/articles/review" replace />;
    } else if (role === 'CONTENT_WRITER') {
      return <Navigate to="/admin/articles" replace />;
    } else {
      // Regular user - no admin access
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
}

export default App;