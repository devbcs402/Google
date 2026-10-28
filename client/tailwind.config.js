/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        muted: '#778196',
        canvas: '#f6f7fb',
        brand: { DEFAULT: '#6258e8', dark: '#4d43d2', light: '#efedff' }
      },
      boxShadow: {
        card: '0 10px 35px rgba(32, 42, 75, 0.06)',
        float: '0 18px 45px rgba(32, 42, 75, 0.14)'
      }
    }
  },
  plugins: []
};
