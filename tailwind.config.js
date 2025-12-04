/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 🌅 Brand
        coral: "#FF6B6B",
        gold: "#FFD580",

        // 🎨 Backgrounds & Surfaces
        "bg-base": "#1B1A1E",
        "bg-card": "#242428",
        "bg-input": "#2E2D33",

        // 💬 Text
        "text-primary": "#FFFFFF",
        "text-secondary": "#B5B5B5",
        "text-muted": "#8A8A8A",

        // ⚙️ States
        success: "#72E0A8",
        warning: "#FFB84C",
        error: "#FF4D4D",
        info: "#58F5E1",

        // ✨ Extras
        "glow-accent": "#FF9671",
        "outline-active": "#FF6B6B",
      },
      backgroundImage: {
        // Gradient helpers
        "gradient-cta": "linear-gradient(135deg, #FF6B6B 0%, #FFD580 100%)",
        "gradient-header": "linear-gradient(90deg, #1B1A1E 0%, #27282C 100%)",
        "gradient-success": "linear-gradient(135deg, #FF9671 0%, #FFD580 100%)",
      },
      borderRadius: {
        xl: "18px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
