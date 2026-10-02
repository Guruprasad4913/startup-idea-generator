import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        slate: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#d9dce4",
          300: "#b8bdcb",
          400: "#9197a8",
          500: "#6d7384",
          600: "#4f5564",
          700: "#363a45",
          750: "#2b2f38",
          800: "#21232b",
          850: "#1a1c22",
          900: "#16171c",
          950: "#111215",
        },
        charcoal: {
          base: "#121316",
          surface: "#16171c",
          elevated: "#1c1e24",
          border: "#252731",
          hover: "#2e313d",
          muted: "#9197a8",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          emerald: "#10b981",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#f43f5e"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
};
export default config;
