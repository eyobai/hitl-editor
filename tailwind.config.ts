import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Lesan AI Brand Colors
        brand: {
          primary: "#4C8BF5",
          "primary-hover": "#3B7AE4",
          dark: "#0f0f0f",
          "dark-secondary": "#1a1a1a",
          "dark-tertiary": "#252525",
          "dark-card": "#2a2a2a",
          "dark-border": "#333333",
          "dark-input": "#333333",
        },
      },
    },
  },
  plugins: [],
};
export default config;
