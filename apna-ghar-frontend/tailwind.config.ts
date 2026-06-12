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
        // Festive Craft palette — see design spec
        cream: "#FFF6E6",
        marigold: "#F2A007",
        sun: "#FFD34E",
        flame: { DEFAULT: "#E8540C", dark: "#C24509" },
        rani: { DEFAULT: "#B3186D", dark: "#7A1049" },
        teal: { DEFAULT: "#0E8C8C", dark: "#0A6B6B" },
        ink: "#3A2415",
        spice: "#8A5A2E", // warm secondary text
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        ui: ["var(--font-ui)", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
        sticker: "5px 5px 0 rgba(58,36,21,0.9)",
        "sticker-rani": "8px 9px 0 #B3186D",
        "offset-rani": "3.5px 3.5px 0 #B3186D",
        "offset-marigold": "3px 3px 0 rgba(242,160,7,0.45)",
      },
      keyframes: {
        sway: {
          "0%,100%": { transform: "rotate(-0.4deg)" },
          "50%": { transform: "rotate(0.4deg)" },
        },
      },
      animation: {
        sway: "sway 5s ease-in-out infinite",
        "spin-slow": "spin 24s linear infinite",
        "spin-slow-reverse": "spin 24s linear infinite reverse",
      },
    },
  },
  plugins: [],
};

export default config;
