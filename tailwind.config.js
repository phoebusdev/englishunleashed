/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Plus Jakarta Sans', 'sans-serif'],
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'serif': ['Lora', 'serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        'primary': '#20b2aa',
        'secondary': '#ff6b8a',
        'primary-dark': '#0f8080',
        'secondary-light': '#ff9bb0',
        'accent': '#10B981',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #20b2aa 0%, #ff6b8a 100%)',
        'gradient-podcast': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-light': 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
      },
    },
  },
  plugins: [],
}