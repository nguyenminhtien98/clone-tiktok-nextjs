import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    keyframes: {
      clockwise: {
        "0%": { transform: "translateX(0)", width: "20px" },
        "25%": { width: "25px" },
        "50%": { transform: "translateX(100%)", width: "20px" },
      },
      counterClockwise: {
        "0%": { transform: "translateX(0)" },
        "50%": { transform: "translateX(-100%)" },
      },
    },
    animation: {
      clockwise: "clockwise 1.2s linear infinite",
      "counter-clockwise": "counterClockwise 1.2s linear infinite",
    },
  },
  plugins: [],
} satisfies Config;
