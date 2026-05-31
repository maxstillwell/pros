import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f4f7f1",
          100: "#e1ead9",
          500: "#4a6940",
          700: "#273f2b",
          900: "#152519",
        },
        clay: "#a45f35",
        stone: "#f7f3eb",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(21, 37, 25, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
