/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
        colors: {
        brown: {
            600: "#6F4E37",
            700: "#5C4033",
            },
        },
    },
    },
  plugins: [],
};
