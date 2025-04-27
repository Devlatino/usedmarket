/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        /* ... resto palette come prima ... */
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius)-2px)" }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
