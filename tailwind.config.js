/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2B6CB0",
        primaryButton: "#2B6CB0",
        navy: "#1A365D",
        growthOrange: "#F97316",
        processGreen: "#16A34A",
        coolBg: "#F4F8F9",
        charcoal: "#1E293B",
        blue: {
          600: "#2B6CB0",
          700: "#1A365D",
        },
        green: {
          600: "#16A34A",
        },
        myGreen: "#16A34A",
      },
    },
  },
  plugins: [],
};
