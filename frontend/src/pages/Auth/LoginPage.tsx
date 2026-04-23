/**
 * ============================================
 * LOGIN PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     7.0.0
 * @updated     2025-04-23
 * @description Brand-aligned login with split layout
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { setAuthTokens, setUser } from '../../utils/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        const { accessToken, refreshToken, expiresIn, user } = response.data.data;
        setAuthTokens(accessToken, refreshToken, expiresIn);
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        setTimeout(() => navigate(from, { replace: true }), 500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden bg-[#1e3a6e]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&auto=format&fit=crop&q=70')` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e]/80 to-[#1e3a6e]/95" />

        {/* Content */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-heading font-extrabold text-white text-lg tracking-tight">Totoz Wellness</span>
          </button>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Welcome back</span>
          </div>
          <h2 className="font-heading font-extrabold text-white text-3xl xl:text-4xl leading-tight mb-4">
            Supporting Caregivers,<br />
            <span className="text-[#e9924b]">Nurturing Children's</span><br />
            Mental Health
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Sign in to access your tools, track your child's wellbeing, and connect with the community.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} Totoz Wellness
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-14 bg-[#fbfbfb]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <button onClick={() => navigate('/')} className="font-heading font-extrabold text-[#1e3a6e] text-xl">
              Totoz <span className="text-[#e9924b]">Wellness</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading font-extrabold text-[#1e3a6e] text-3xl mb-1">Sign in</h1>
            <p className="text-[#1e3a6e]/50 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup', { state: { from: location.state?.from } })}
                className="text-[#e9924b] font-semibold hover:underline"
              >
                Create one
              </button>
            </p>
          </div>

          {/* Redirect notice */}
          {from !== '/' && (
            <div className="mb-6 bg-[#659ec3]/10 border border-[#659ec3]/20 rounded-xl px-4 py-3">
              <p className="text-sm text-[#1e3a6e]/70">
                Please sign in to access <span className="font-semibold text-[#1e3a6e]">{from}</span>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1e3a6e]/80 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b] focus:ring-2 focus:ring-[#e9924b]/15 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-[#1e3a6e]/80">
                  Password
                </label>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b] focus:ring-2 focus:ring-[#e9924b]/15 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e9924b] hover:bg-[#d4762a] text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e3a6e]/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#fbfbfb] text-[#1e3a6e]/35 text-xs">or</span>
            </div>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate('/signup', { state: { from: location.state?.from } })}
            className="w-full border border-[#1e3a6e]/20 text-[#1e3a6e] font-semibold py-3 px-6 rounded-xl hover:bg-[#1e3a6e]/5 transition-all text-sm"
          >
            Create an account
          </button>

          {/* Back */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-[#1e3a6e]/40 hover:text-[#1e3a6e] text-sm transition-colors"
            >
              Back to home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;