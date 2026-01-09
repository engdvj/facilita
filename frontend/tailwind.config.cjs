module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onest', 'sans-serif'],
        heading: ['Fraunces', 'serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
}
