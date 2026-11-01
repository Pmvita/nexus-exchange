/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: "#0a0a0c",
          panel: "#111114",
          border: "#222226",
          accent: "#00d9a5",
          accentDim: "#008f66",
          up: "#00d9a5",
          down: "#ff4d4f",
          muted: "#8a8a96"
        }
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      animation: { pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }
    }
  },
  plugins: []
};
