/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17231c',
        forest: '#17603b',
        moss: '#355243',
        clay: '#8a5a16',
        paper: '#f3f0e8',
        cream: '#fbfaf7',
        line: '#dfd8ca',
        danger: '#a33a2b'
      },
      boxShadow: {
        soft: '0 20px 40px rgba(23, 35, 28, 0.08)'
      }
    }
  },
  plugins: []
};
