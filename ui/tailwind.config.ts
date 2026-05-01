import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-serif': ["var(--font-dm-serif)"],
        'syne': ["var(--font-syne)"],
        'martian': ["var(--font-martian-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
