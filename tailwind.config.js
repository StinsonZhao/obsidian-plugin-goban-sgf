/** @type {import('tailwindcss').Config} */
export default {
  important: ".goban-sgf-plugin-container",
  darkMode: ['class', 'body.theme-dark'],
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}

