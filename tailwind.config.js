/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        surface: "#1a1a1a",
        border: "#2a2a2a",
        "text-primary": "#e5e5e5",
        "text-muted": "#888888",
        accent: "#4ade80",
        error: "#f87171",
      },
    },
  },
  plugins: [],
}
