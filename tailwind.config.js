/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: 'var(--fg)',
        muted: 'var(--muted)',
        dim: 'var(--dim)',
      },
    },
  },
  plugins: [],
}
