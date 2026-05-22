/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: "#071006",
        foreground: "#FFF2E6",
        forest: {
          900: "#071006", // Primary Bg
          800: "#0D180C", // Secondary Surface
          700: "#173117", // Card Surface
          600: "#1D3D1C", // Elevated
        },
        sage: "#A7D1AE",
        powder: "#BCDDF0",
        cream: {
          DEFAULT: "#FFF2E6",
          muted: "rgba(255,242,230,0.72)",
        }
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0,0,0,0.5)',
        'luxury-inner': 'inset 0 2px 4px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        'luxury': '28px',
      }
    },
  },
  plugins: [],
};
