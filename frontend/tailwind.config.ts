import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        titillium: ["var(--font-titillium)", "system-ui", "sans-serif"],
      },
      colors: {
        f1: {
          red: "#e10600",
          dark: "#080808",
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
