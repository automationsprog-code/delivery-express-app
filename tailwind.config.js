/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E11D48',
          'red-dark': '#BE123C',
          'red-light': '#FFE4E6',
          gold: '#F59E0B',
          'gold-light': '#FEF3C7',
          black: '#18181B',
          dark: '#09090B',
          surface: '#27272A',
          muted: '#71717A'
        }
      }
    },
  },
  plugins: [],
}