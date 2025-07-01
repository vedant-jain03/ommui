/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "hover:bg-tertiary",
    "hover:bg-hover",
    "hover:bg-primary",
    "hover:text-primary",
    "hover:text-secondary",
    "group-hover:opacity-100",
  ],
};
