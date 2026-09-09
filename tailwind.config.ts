import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Тёплый бумажный фон + глубокий зелёный + латунный акцент —
        // визуальный язык школьного информационного стенда, а не типовой SaaS-палитры.
        ink: {
          DEFAULT: "#1B2E22",
          soft: "#3E5347",
          faint: "#7C8C81",
        },
        paper: {
          DEFAULT: "#F7F3E8",
          muted: "#EFEAD9",
          line: "#DED3B4",
        },
        brass: {
          50: "#FBF3E2",
          100: "#F3E1B9",
          400: "#C89A3E",
          500: "#B8862E",
          600: "#96691F",
        },
        sage: {
          50: "#EEF2ED",
          100: "#D8E3D6",
          500: "#4B6455",
          600: "#3A4F42",
        },
        rust: {
          50: "#F7E9E4",
          100: "#EFCFC3",
          500: "#A23B2E",
          600: "#832F24",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 46, 34, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
