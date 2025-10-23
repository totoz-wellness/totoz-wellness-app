import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demonstration purposes.
    // In a real application, these would be handled by a secure backend.
    const VITE_ADMIN_EMAIL = 'admin@totoz.com';
    const VITE_ADMIN_PASSWORD = 'password123';
    const VITE_ADMIN_CODE = 'TOTOZ2025';

    if (email === VITE_ADMIN_EMAIL && password === VITE_ADMIN_PASSWORD && adminCode === VITE_ADMIN_CODE) {
      setError('');
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      onLoginSuccess();
      window.location.hash = '#admin';
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };
  
  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '#';
  };

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-teal mb-2">
                Admin Login
            </h1>
            <a href="#" onClick={handleBackToHome} className="font-semibold text-sm text-teal hover:text-teal/80 transition-colors">
                &larr; Back to Home
            </a>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-dark-text/80 mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
              required 
              aria-label="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-dark-text/80 mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
              required 
              aria-label="Password"
            />
          </div>
          <div>
            <label htmlFor="adminCode" className="block text-sm font-bold text-dark-text/80 mb-2">Admin Code</label>
            <input 
              type="text" 
              id="adminCode" 
              value={adminCode} 
              onChange={(e) => setAdminCode(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition" 
              required 
              aria-label="Admin Code"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
          <button type="submit" className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-md">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
