/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#F5F5F7',
        accent: '#0071e3',
      },
      fontFamily: {
        sans: ['Inter', 'Microsoft JhengHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}