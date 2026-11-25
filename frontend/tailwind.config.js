/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ft: {
          bg: "#0a0b0d",
          surface: "#13161b",
          raised: "#1a1e24",
          emerald: "#1d9e75",
          mint: "#5ee9b5",
          gold: "#e8c468",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#1d9e75",
          600: "#178564",
          700: "#0f6b4f",
        },
        surface: "#13161b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        elevated: "0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
      },
    },
  },
  plugins: [],
};
