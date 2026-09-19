export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f7f6f1',
          DEFAULT: '#1b5e20',
          dark: '#0d3b13',
          accent: '#ff8f00',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
