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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: "#000000",
        foreground: "#F5F5F7",
        forest: {
          900: "#000000", // True OLED Black
          800: "#1C1C1E", // Apple Dark Gray
          700: "#2C2C2E", // Elevated Dark Gray
          600: "#3A3A3C", // Higher Elevation
        },
        sage: "#32D74B", // Apple Green / Sage Accent
        powder: "#0A84FF", // Apple Blue Accent
        cream: {
          DEFAULT: "#F5F5F7",
          muted: "rgba(245, 245, 247, 0.6)",
        }
      },
      boxShadow: {
        'luxury': '0 10px 40px -10px rgba(0,0,0,0.5)',
        'luxury-inner': 'inset 0 1px 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        'luxury': '32px',
      }
    },
  },
  plugins: [],
};
