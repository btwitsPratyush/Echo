/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Enforcing a strict palette if needed, but standard Zinc is great.
        // We can alias 'surface' and 'content' for semantic usage.
        surface: {
          50: '#fafafa',
          100: '#f4f4f5', // zinc-100
          900: '#18181b', // zinc-900
        },
        brand: {
          500: '#6366f1', // indigo-500
          600: '#4f46e5', // indigo-600
          700: '#4338ca', // indigo-700
        }
      }
    }
  },
  plugins: []
};

