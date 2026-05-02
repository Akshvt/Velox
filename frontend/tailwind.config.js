/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#FFFDF5",
        cream: "#FFDC8B",
        mustard: "#F7CB46",
        mint: "#99E885",
        sky: "#C0F7FE",
        pink: "#FE90E8",
        lilac: "#D9C7FF",
        coral: "#FF6B6B",
      },
      fontFamily: {
        display: ['"Archivo Black"', "system-ui", "sans-serif"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #000",
        "brutal-sm": "2px 2px 0 0 #000",
        "brutal-lg": "8px 8px 0 0 #000",
        "brutal-xl": "12px 12px 0 0 #000",
        "brutal-inset": "inset 4px 4px 0 0 #000",
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        brutal: "12px",
        "brutal-lg": "20px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        brutal: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        wiggle: "wiggle 1.6s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
