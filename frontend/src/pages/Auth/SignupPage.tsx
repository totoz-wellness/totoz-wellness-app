/**
 * ============================================
 * SIGNUP PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     6.0.0
 * @updated     2025-04-23
 * @description Brand-aligned signup with split layout
 * ============================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { setAuthTokens, setUser } from '../../utils/auth';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Please enter your name'); return false; }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) { setError('Please enter a valid age (1–120)'); return false; }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Please enter a valid email address'); return false; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    if (!formData.gender) { setError('Please select your gender'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await api.post('/auth/register', { ...signupData, age: parseInt(signupData.age) });
      if (response.data.success) {
        const { accessToken, refreshToken, expiresIn, user } = response.data.data;
        setAuthTokens(accessToken, refreshToken, expiresIn);
        setUser(user);
        toast.success(`Welcome to Totoz Wellness, ${user.name}!`);
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:border-[#e9924b] focus:ring-2 focus:ring-[#e9924b]/15 transition-all';

  const labelClass = 'block text-sm font-semibold text-[#1e3a6e]/80 mb-2';

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden bg-[#1e3a6e]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=70')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e]/80 to-[#1e3a6e]/95" />

        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="font-heading font-extrabold text-white text-lg tracking-tight hover:opacity-80 transition-opacity">
            Totoz Wellness
          </button>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Get started</span>
          </div>
          <h2 className="font-heading font-extrabold text-white text-3xl xl:text-4xl leading-tight mb-4">
            Join a community<br />
            <span className="text-[#e9924b]">raising emotionally</span><br />
            healthy children.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            Access tools, resources, and support designed for caregivers who want to be more equipped.
          </p>

          {/* Value pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['TalkEasy AI', 'GrowTrack', 'LearnWell', 'ParentCircle'].map((t) => (
              <span key={t} className="text-xs text-white/60 border border-white/15 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} Totoz Wellness
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#fbfbfb] overflow-y-auto">
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
            <h1 className="font-heading font-extrabold text-[#1e3a6e] text-3xl mb-1">Create account</h1>
            <p className="text-[#1e3a6e]/50 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-[#e9924b] font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className={labelClass}>Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  placeholder="30"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="gender" className={labelClass}>Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className={inputClass}
              />
              <p className="text-xs text-[#1e3a6e]/35 mt-1.5">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={inputClass}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
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

          <button
            onClick={() => navigate('/login')}
            className="w-full border border-[#1e3a6e]/20 text-[#1e3a6e] font-semibold py-3 px-6 rounded-xl hover:bg-[#1e3a6e]/5 transition-all text-sm"
          >
            Sign in instead
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

export default SignupPage;