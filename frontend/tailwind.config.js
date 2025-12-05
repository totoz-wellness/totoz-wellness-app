/** @type {import('tailwindcss').Config} */
module. exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom Colors
      colors: {
        teal: '#3AAFA9',
        'light-bg': '#F8F9FA',
        'dark-text': '#2B2D42',
        'pastel-green': '#DEF2F1',
        'light-text': '#FEFFFF',
      },
      
      // Custom Animations
      animation: {
        // Navbar animations
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        
        // Hero carousel animations
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-delay': 'fadeIn 0.8s ease-out 0.2s forwards',
        'fade-in-delay-2': 'fadeIn 0.8s ease-out 0.4s forwards',
        'fade-in-delay-3': 'fadeIn 0.8s ease-out 0.6s forwards',
      },
      
      // Keyframes
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
      },
      
      // Font Family (optional - if you have custom fonts)
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}