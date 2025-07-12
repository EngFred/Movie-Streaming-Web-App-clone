/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#E50914', // Netflix brand color
        'netflix-dark': '#141414', // Dark background for Netflix-like UI
      },
    },
  },
  plugins: [],
}