import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "rgb(var(--brand-red) / <alpha-value>)",
          "red-hover": "rgb(var(--brand-red-hover) / <alpha-value>)",
          "red-glow": "rgba(192, 33, 43, 0.4)",
          jet: "rgb(var(--brand-jet) / <alpha-value>)",
          "jet-light": "rgb(var(--brand-jet-light) / <alpha-value>)",
          graphite: "rgb(var(--brand-graphite) / <alpha-value>)",
          "graphite-light": "rgb(var(--brand-graphite-light) / <alpha-value>)",
          ash: "rgb(var(--brand-ash) / <alpha-value>)",
          silver: "rgb(var(--brand-silver) / <alpha-value>)",
          smoke: "rgb(var(--brand-smoke) / <alpha-value>)",
          white: "rgb(var(--brand-white) / <alpha-value>)",
          cream: "rgb(var(--brand-cream) / <alpha-value>)",
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#16A34A",
        },
        warning: {
          DEFAULT: "#EAB308",
          dark: "#CA8A04",
        },
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "red-glow": "0 6px 16px rgba(192, 33, 43, 0.18), 0 2px 6px rgba(192, 33, 43, 0.12)",
        "red-glow-lg": "0 10px 28px rgba(192, 33, 43, 0.22), 0 4px 10px rgba(192, 33, 43, 0.14)",
        "card": "0 4px 20px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.05)",
        "card-hover": "0 10px 32px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(15, 23, 42, 0.07)",
      },
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
      transitionDuration: {
        "400": "400ms",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out-expo forwards",
        "fade-in": "fade-in 0.4s ease-out-expo forwards",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;