/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1db954',
        secondary: '#457e59',
        tertiary: '#191414',
        accent: '#212121',
        dark: '#0d1117',
        gray: '#b3b3b3',
        light: '#e1ece3'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          '-ms-overflow-style': 'none', // IE and Edge
          'scrollbar-width': 'none' // Firefox
        },
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none' // Chrome, Safari, and Opera
        }
      })
    }
  ]
}
