/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f5f3ee',
        ink: '#1f2a2e',
        mint: '#1f6f64',
        mintsoft: '#e3efeb',
        alert: '#b4532a',
        alertsoft: '#f6e6de',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
