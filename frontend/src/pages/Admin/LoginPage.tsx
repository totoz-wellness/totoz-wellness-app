import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Add this import
import api from '../../config/api';
import { setAuthTokens, setUser } from '../../utils/auth'; // ✅ Add this import

// ✅ Remove the props interface entirely
const LoginPage: React.FC = () => { // ✅ Remove props parameter
  const navigate = useNavigate(); // ✅ Add this hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData = {
        email: email.toLowerCase().trim(),
        password: password
      };

      const response = await api.post('/auth/login', loginData);

      if (response.data.success) {
        // ✅ Updated to use new token structure
        const { user, accessToken, refreshToken, expiresIn } = response.data.data;
        
        // Check if user has admin/staff privileges
        const allowedRoles = ['CONTENT_WRITER', 'CONTENT_LEAD', 'MODERATOR', 'SUPER_ADMIN'];
        
        if (allowedRoles.includes(user.role)) {
          // ✅ Store tokens using new auth utilities
          setAuthTokens(accessToken, refreshToken, expiresIn);
          setUser(user);
          sessionStorage.setItem('isAdminAuthenticated', 'true');
          
          // ✅ Navigate directly instead of calling callback
          navigate('/admin/dashboard');
        } else {
          setError('You do not have admin/staff privileges to access this area.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiration');
          localStorage.removeItem('user');
        }
      }
    } catch (loginError: any) {
      console.error('Login error:', loginError);
      
      if (loginError.response?.status === 401) {
        setError('Invalid email or password. If you are setting up a new admin/staff account, click "First Time Setup".');
      } else if (loginError.response?.data?.message) {
        setError(loginError.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const setupData = {
        name: name.trim() || 'Admin User',
        email: email.toLowerCase().trim(),
        password: password,
        adminCode: adminCode.trim()
      };

      const response = await api.post('/auth/admin-setup', setupData);

      if (response.data.success) {
        // ✅ Updated to use new token structure
        const { user, accessToken, refreshToken, expiresIn } = response.data.data;
        
        // ✅ Store tokens using new auth utilities
        setAuthTokens(accessToken, refreshToken, expiresIn);
        setUser(user);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        
        // ✅ Navigate directly instead of calling callback
        navigate('/admin/dashboard');
      }
    } catch (setupError: any) {
      console.error('Setup error:', setupError);
      
      if (setupError.response?.data?.message) {
        setError(setupError.response.data.message);
      } else {
        setError('Admin setup failed. Please check your admin code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/'); // ✅ Use navigate instead of window.location
  };

  const toggleSetupMode = () => {
    setIsFirstTimeSetup(!isFirstTimeSetup);
    setAdminCode('');
    setName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-teal rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-teal mb-2">
            {isFirstTimeSetup ? 'Staff Setup' : 'Staff Login'}
          </h1>
          <p className="text-gray-600 text-sm">
            {isFirstTimeSetup 
              ? 'Create your admin or staff account' 
              : 'Access the content management system'}
          </p>
          <button 
            onClick={handleBackToHome}
            className="mt-4 font-semibold text-sm text-teal hover:text-teal/80 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Login Form */}
        {!isFirstTimeSetup ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                placeholder="your@email.com"
                required 
                disabled={loading}
                aria-label="Email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                placeholder="••••••••"
                required 
                disabled={loading}
                aria-label="Password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>

            <div className="text-center pt-4 border-t">
              <button
                type="button"
                onClick={toggleSetupMode}
                className="text-sm text-teal hover:text-teal/80 font-semibold"
              >
                First time here? Set up your account →
              </button>
            </div>
          </form>
        ) : (
          // First Time Setup Form
          <form onSubmit={handleFirstTimeSetup} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-semibold mb-1">Staff Account Setup</p>
                  <p className="text-xs text-blue-700">
                    You'll need an admin code from your organization. Different codes provide different access levels (Writer, Lead, or Super Admin).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="setup-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                id="setup-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                placeholder="John Doe"
                disabled={loading}
                aria-label="Full Name"
              />
            </div>

            <div>
              <label htmlFor="setup-email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                id="setup-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                placeholder="your@email.com"
                required 
                disabled={loading}
                aria-label="Email"
              />
            </div>
            
            <div>
              <label htmlFor="setup-password" className="block text-sm font-semibold text-gray-700 mb-2">
                Create Password
              </label>
              <input 
                type="password" 
                id="setup-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                placeholder="••••••••"
                required 
                disabled={loading}
                minLength={6}
                aria-label="Password"
              />
            </div>

            <div>
              <label htmlFor="adminCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Code
              </label>
              <input 
                type="text" 
                id="adminCode" 
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
                required 
                disabled={loading}
                placeholder="Enter your admin code"
                aria-label="Admin Code"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact your administrator to get your setup code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={toggleSetupMode}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition-all"
                disabled={loading}
              >
                Back to Login
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Role Information */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center mb-2">Access Levels:</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="font-semibold text-green-700">Writer</p>
              <p className="text-green-600">Create & edit</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="font-semibold text-blue-700">Lead</p>
              <p className="text-blue-600">Review & publish</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <p className="font-semibold text-purple-700">Admin</p>
              <p className="text-purple-600">Full access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;