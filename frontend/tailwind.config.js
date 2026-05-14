/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ========================================
      // CUSTOM COLORS
      // ========================================
      colors: {
        // Main App Colors — Totoz Wellness Brand
        teal: '#659ec3',              // Steel Blue (secondary brand color)
        'light-bg': '#fbfbfb',        // Brand light background
        'dark-text': '#1e3a6e',       // Brand navy (from color palette)
        'pastel-green': '#fde9d4',    // Light tint of Tan Hide for soft backgrounds
        'light-text': '#FEFFFF',

        // Totoz Wellness Brand Colors
        'brand-orange': '#e9924b',    // Tan Hide — primary brand color
        'brand-blue': '#659ec3',      // Steel Blue — secondary brand color
        'brand-navy': '#1e3a6e',      // Deep Navy — accent/dark color
        'brand-light': '#fbfbfb',     // Off-white background

        // Orange (Tan Hide) scale
        'kid-purple': {
          50: '#fef6ee',
          100: '#fdecd8',
          200: '#fbd5af',
          300: '#f8b87d',
          400: '#f3954a',
          500: '#e9924b',
          600: '#d4762a',
          700: '#b05d22',
          800: '#8c4a21',
          900: '#713e1f',
        },
        // Steel Blue scale
        'kid-pink': {
          50: '#f0f6fb',
          100: '#ddeaf5',
          200: '#c2d8ed',
          300: '#99bfe0',
          400: '#659ec3',
          500: '#4d87b2',
          600: '#3b6d96',
          700: '#31587a',
          800: '#2c4a66',
          900: '#293f56',
        },
      },
      
      // ========================================
      // FONT FAMILIES
      // ========================================
      fontFamily: {
        // Main App Fonts
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Nunito', 'sans-serif'],
        
        // KidsCorner Fonts
        'kid-display': ['Fredoka', 'sans-serif'], // Playful headings
        'kid-body': ['Inter', 'sans-serif'],      // Clean body text
      },
      
      // ========================================
      // ANIMATIONS
      // ========================================
      animation: {
        // Navbar animations
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        
        // Hero carousel animations
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-delay': 'fadeIn 0.8s ease-out 0.2s forwards',
        'fade-in-delay-2': 'fadeIn 0.8s ease-out 0.4s forwards',
        'fade-in-delay-3': 'fadeIn 0.8s ease-out 0.6s forwards',
        
        // KidsCorner animations
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'sticker-bounce': 'stickerBounce 0.6s ease-in-out',
        'gradient-shift': 'gradient-shift 3s linear infinite',
      },
      
      // ========================================
      // KEYFRAMES
      // ========================================
      keyframes: {
        // Navbar animations
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        
        // Hero carousel animations
        fadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        
        // KidsCorner animations
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(233, 146, 75, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(233, 146, 75, 0.8)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        stickerBounce: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.2) rotate(10deg)',
          },
        },
        'gradient-shift': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      },
      
      // ========================================
      // CUSTOM UTILITIES
      // ========================================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      // Box Shadows
      boxShadow: {
        'glow-purple': '0 0 30px rgba(233, 146, 75, 0.5)',   // orange glow
        'glow-pink': '0 0 30px rgba(101, 158, 195, 0.5)',    // steel blue glow
        'glow-blue': '0 0 30px rgba(30, 58, 110, 0.5)',      // navy glow
      },
    },
  },
  plugins: [],
}