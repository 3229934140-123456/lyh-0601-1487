/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "24px",
    },
    extend: {
      colors: {
        ink: {
          50: "#F4F7FB",
          100: "#E6ECF4",
          200: "#C8D5E5",
          300: "#9CB0CC",
          400: "#64748B",
          500: "#475569",
          600: "#334155",
          700: "#1E293B",
          800: "#0E2A47",
          900: "#071827",
        },
        mint: {
          50: "#E8FBF6",
          100: "#C5F5E8",
          200: "#88EBD1",
          300: "#4ADFB9",
          400: "#00D4AA",
          500: "#00B894",
          600: "#00997A",
          700: "#007A61",
        },
        amber: {
          50: "#FFF4E8",
          100: "#FFE2C2",
          200: "#FFCB91",
          300: "#FFB062",
          400: "#FF8A3D",
          500: "#F26A16",
          600: "#CC540C",
        },
        status: {
          pending: "#F59E0B",
          negotiating: "#3B82F6",
          signing: "#8B5CF6",
          delivered: "#10B981",
          closed: "#6B7280",
        },
      },
      fontFamily: {
        display: ['"Charter BT"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        cardHover: "0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.12)",
        innerSoft: "inset 0 1px 2px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl2: "14px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        dash: {
          "0%": { strokeDashoffset: "300" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
        scaleIn: "scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both",
        slideRight: "slideRight 0.35s cubic-bezier(0.4, 0, 0.2, 1) both",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #0E2A47 0%, #1E40AF 100%)",
        "grad-mint": "linear-gradient(135deg, #00D4AA 0%, #00997A 100%)",
        "grad-ink": "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        "grid-texture":
          "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
