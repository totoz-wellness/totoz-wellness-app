import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { UserIcon } from './icons/UserIcon';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Later, this will be connected to the backend.
    console.log('Login form submitted');
    onClose(); 
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Later, this will be connected to the backend.
    console.log('Register form submitted');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-8">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close authentication modal"
          >
            <XIcon />
          </button>
          
          <div className="mb-8">
            <h2 className="text-center text-3xl font-extrabold font-heading text-dark-text">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-dark-text/60 mt-2">
              {activeTab === 'login' ? 'Sign in to continue your journey' : 'Join our community of caregivers'}
            </p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'login' ? 'text-teal border-b-2 border-teal' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 font-bold text-center transition-colors ${activeTab === 'register' ? 'text-teal border-b-2 border-teal' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="login-email" name="email" type="email" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="login-password" name="password" type="password" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal" placeholder="Password" />
                </div>
              </div>
              <div className="text-right">
                <a href="#" className="text-sm font-medium text-teal hover:underline">Forgot password?</a>
              </div>
              <button type="submit" className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="register-name" className="sr-only">Full name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="register-name" name="name" type="text" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal" placeholder="Full name" />
                </div>
              </div>
              <div>
                <label htmlFor="register-email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="register-email" name="email" type="email" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label htmlFor="register-password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="register-password" name="password" type="password" required className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal" placeholder="Password" />
                </div>
              </div>
               <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded" />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the <a href="#" className="font-medium text-teal hover:underline">Terms</a> and <a href="#" className="font-medium text-teal hover:underline">Privacy Policy</a>.
                </label>
              </div>
              <button type="submit" className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105">
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
