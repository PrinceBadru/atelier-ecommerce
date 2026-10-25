import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "scale-12": ["0.75rem", { lineHeight: "1rem" }],
        "scale-14": ["0.875rem", { lineHeight: "1.25rem" }],
        "scale-16": ["1rem", { lineHeight: "1.5rem" }],
        "scale-20": ["1.25rem", { lineHeight: "1.75rem" }],
        "scale-24": ["1.5rem", { lineHeight: "2rem" }],
        "scale-32": ["2rem", { lineHeight: "2.375rem" }],
        "scale-48": ["3rem", { lineHeight: "1" }],
        "scale-64": ["4rem", { lineHeight: "1" }],
      },
      boxShadow: {
        elevation1: "var(--shadow-1)",
        elevation2: "var(--shadow-2)",
        elevation3: "var(--shadow-3)",
      },
      transitionDuration: {
        "120": "120ms",
        "200": "200ms",
        "320": "320ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0.0, 0, 1.0)",
      },
    },
  },
  plugins: [],
};

export default config;
