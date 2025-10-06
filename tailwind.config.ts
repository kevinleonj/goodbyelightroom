import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f9ff",
          100: "#e6efff",
          200: "#bfd3ff",
          300: "#8aaeff",
          400: "#4a7eff",
          500: "#2158f5",
          600: "#0f41cc",
          700: "#0c339e",
          800: "#0c2b79",
          900: "#0d2563"
        }
      }
    }
  },
  plugins: []
};

export default config;
