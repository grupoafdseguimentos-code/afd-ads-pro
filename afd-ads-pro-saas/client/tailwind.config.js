/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080808',
        panel: '#ffffff',
        redline: '#E53935',
        profit: '#00C853',
        warning: '#FFC107'
      },
      boxShadow: {
        soft: '0 16px 36px rgba(8,8,8,0.08)'
      }
    }
  },
  plugins: []
};
