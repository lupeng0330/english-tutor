/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef7ff', 100: '#d8ecff', 500: '#1682f3', 600: '#0869d3', 700: '#0954a5', 900: '#123968' },
      },
      boxShadow: { soft: '0 8px 30px rgba(15, 42, 75, 0.08)' },
    },
  },
  plugins: [],
};
