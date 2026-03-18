/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#1B3A5C",
        orange: "#FF4600",
        lapak: "#10B981",
        sewa: "#3B82F6",
        warga: "#8B5CF6",
        hajat: "#EC4899",
        "dark-text": "#1E293B",
        "grey-text": "#64748B",
        "light-bg": "#F8FAFC",
        "border-color": "#E2E8F0",
      },
    },
  },
  plugins: [],
};
