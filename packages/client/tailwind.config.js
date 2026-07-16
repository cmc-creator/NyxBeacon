module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        available: "#10B981",
        occupied: "#3B82F6",
        pending: "#F59E0B",
        maintenance: "#EF4444",
        icu: "#8B5CF6",
        "med-surg": "#0EA5E9",
        "skilled": "#14B8A6",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
      },
    },
  },
  plugins: [],
}
