/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./assets/js/**/*.js",
    "./frontend/js/**/*.js"
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