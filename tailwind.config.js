/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#F4F4F0",
        card: "#FFFFFF",
        rule: "#DDDCD4",
        ink: "#1C1B19",
        soft: "#615E56",
        tag: {
          canary: "#FFD91A",
          "canary-deep": "#F0C800",
          orange: "#B54700",
          red: "#D91E18",
          green: "#0B7A4B",
        },
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', "Hiragino Sans", "system-ui", "sans-serif"],
        mono: ['"Spline Sans Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        tag: "0 2px 3px rgba(28,27,25,0.10), 0 10px 22px -12px rgba(28,27,25,0.35)",
        sticker: "0 1px 2px rgba(28,27,25,0.18), 0 6px 14px -6px rgba(28,27,25,0.4)",
      },
    },
  },
  plugins: [],
};
