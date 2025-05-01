const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],

   // 👇 Add this block
   future: {
    strictUnknownClasses: false,
  },

  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ---------- color tokens that Tailwind will now accept ---------- */
      colors: {
        // allows bg-background / text-background with optional opacity
        background: ({ opacityValue }) =>
          opacityValue === undefined
            ? `hsl(var(--background))`
            : `hsl(var(--background) / ${opacityValue})`,
    
        foreground: ({ opacityValue }) =>
          opacityValue === undefined
            ? `hsl(var(--foreground))`
            : `hsl(var(--foreground) / ${opacityValue})`,
    
        border: ({ opacityValue }) =>
          opacityValue === undefined
            ? `hsl(var(--border))`
            : `hsl(var(--border) / ${opacityValue})`,
    
        input: ({ opacityValue }) =>
          opacityValue === undefined
            ? `hsl(var(--input))`
            : `hsl(var(--input) / ${opacityValue})`,
    
        ring: ({ opacityValue }) =>
          opacityValue === undefined
            ? `hsl(var(--ring))`
            : `hsl(var(--ring) / ${opacityValue})`,
      },
    
      /* ---------- the rest of your existing extend keys ---------- */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
