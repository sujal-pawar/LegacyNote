/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'primary-hover': 'var(--primary-hover)',
        'secondary-color': 'var(--secondary-color)',
        'dark-color': 'var(--dark-color)',
        'light-color': 'var(--light-color)',
        'danger-color': 'var(--danger-color)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
      },
      boxShadow: {
        DEFAULT: 'var(--box-shadow)',
      }
    },
  },
  plugins: [],
} 