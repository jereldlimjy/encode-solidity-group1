/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: "#48cbd9",
        "neon-blue": "#79e7e7",
        purple: "#9980ec",
        "dark-purple": "#8973d4",
        grey: "#f5f5f5",
        slate: "#475569",
      },
    },
  },
  plugins: [],
};
