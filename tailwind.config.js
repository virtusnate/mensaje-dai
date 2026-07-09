/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        body: ['"Cormorant Infant"', 'serif'],
      },
    },
  },
  plugins: [],
}
