/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ukrainian: {
          blue: '#0057B7',
          yellow: '#FFD700',
        }
      }
    },
  },
  plugins: [],
}
