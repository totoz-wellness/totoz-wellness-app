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
        // Main App Colors
        teal: '#3AAFA9',
        'light-bg': '#F8F9FA',
        'dark-text': '#2B2D42',
        'pastel-green': '#DEF2F1',
        'light-text': '#FEFFFF',
        
        // KidsCorner Gradient Colors
        'kid-purple': {
          50: '#f3f0ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        'kid-pink': {
          50: '#fff0f6',
          100: '#ffe4f1',
          200: '#ffc9e3',
          300: '#ffa3d5',
          400: '#ff7ac7',
          500: '#f72585',
          600: '#d11d6f',
          700: '#ab1559',
          800: '#850d43',
          900: '#5f052d',
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
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)',
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
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.5)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  plugins: [],
}