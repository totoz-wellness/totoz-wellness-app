/**
 * ============================================
 * LOGIN PAGE
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:55:24 UTC
 * @description Professional login page with proper error handling
 * ============================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../config/api';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
  onNavigateToHome: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  onNavigateToSignup,
  onNavigateToHome 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear errors on input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success(`Welcome back, ${response.data.data.user.name}! 👋`);
        
        // Small delay for better UX
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal/10 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <button 
            onClick={onNavigateToHome}
            className="inline-block mb-4 text-3xl font-heading font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-[#347EAD]">Totoz</span>
            <span className="text-[#F09232]">&nbsp;Wellness</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your wellness journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal focus:outline-none transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal text-white font-bold py-3 px-6 rounded-xl hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Totoz Wellness?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            onClick={onNavigateToSignup}
            className="w-full border-2 border-teal text-teal font-bold py-3 px-6 rounded-xl hover:bg-teal/5 transition-all"
          >
            Create an Account
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={onNavigateToHome}
            className="text-gray-600 hover:text-teal font-semibold transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;