/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/*.html",
    "./public/assets/js/**/*.js",
    "./public/frontend/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: '#1DC82B',
      }
    },
  },
  plugins: [],
  // Enable dark mode support as per project specifications
  darkMode: 'class',
}