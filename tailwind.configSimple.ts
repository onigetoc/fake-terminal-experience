import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html", // Ajouter si nécessaire
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;