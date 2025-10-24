import React, { useState } from 'react';
import api from '../../config/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstTimeAdmin, setIsFirstTimeAdmin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, try to login as regular user/existing admin
      const loginData = {
        email: email.toLowerCase().trim(),
        password: password
      };

      const response = await api.post('/auth/login', loginData);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Check if user has admin privileges
        if (['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN'].includes(user.role)) {
          // Store token and auth state
          localStorage.setItem('token', token);
          sessionStorage.setItem('isAdminAuthenticated', 'true');
          onLoginSuccess();
        } else {
          setError('You do not have admin privileges to access this area.');
        }
      }
    } catch (loginError: any) {
      // If login fails, check if it's a first-time admin setup
      if (loginError.response?.status === 401) {
        setIsFirstTimeAdmin(true);
        setError('User not found. If you are setting up admin access for the first time, please enter the admin code.');
      } else {
        setError(loginError.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const setupData = {
        email: email.toLowerCase().trim(),
        password: password,
        adminCode: adminCode
      };

      const response = await api.post('/auth/admin-setup', setupData);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Store token and auth state
        localStorage.setItem('token', token);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        onLoginSuccess();
      }
    } catch (setupError: any) {
      setError(setupError.response?.data?.message || 'Admin setup failed. Please check your admin code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({ page: 'home' }, '', '/');
    window.location.reload(); // Simple way to navigate back to home
  };

  const resetToLogin = () => {
    setIsFirstTimeAdmin(false);
    setAdminCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-teal mb-2">
            {isFirstTimeAdmin ? 'Admin Setup' : 'Admin Login'}
          </h1>
          <button 
            onClick={handleBackToHome}
            className="font-semibold text-sm text-teal hover:text-teal/80 transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>

        {!isFirstTimeAdmin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-dark-text/80 mb-2">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                required 
                disabled={loading}
                aria-label="Email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-dark-text/80 mb-2">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                required 
                disabled={loading}
                aria-label="Password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" role="alert">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFirstTimeAdminSetup} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Setting up admin access for the first time. Your password will be saved for future logins.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-dark-text/80 mb-2">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition bg-gray-50" 
                required 
                disabled
                aria-label="Email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-dark-text/80 mb-2">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition bg-gray-50" 
                required 
                disabled
                aria-label="Password"
              />
            </div>

            <div>
              <label htmlFor="adminCode" className="block text-sm font-bold text-dark-text/80 mb-2">
                Admin Code
              </label>
              <input 
                type="text" 
                id="adminCode" 
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                required 
                disabled={loading}
                placeholder="Enter admin setup code"
                aria-label="Admin Code"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={resetToLogin}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Setting up...' : 'Setup Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;