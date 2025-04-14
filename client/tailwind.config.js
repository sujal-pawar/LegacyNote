/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-color': '#4F46E5',
        'primary-hover': 'var(--primary-hover)',
        'secondary-color': 'var(--secondary-color)',
        'dark-color': '#1F2937',
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
