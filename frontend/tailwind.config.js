/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Institucional (Verde / Teal) - Estilo Imagen 2
        brand: {
          50: '#f0f9f8',
          100: '#dcefee',
          200: '#bee0dd',
          300: '#91cac6',
          400: '#5fabab',
          500: '#408f90', // Color principal botones
          600: '#327375',
          700: '#2a5d60',
          800: '#244d50',
          900: '#204144',
        },
        // Paleta Psicología (Cálidos / Tierra) - Estilo Imagen 1
        warm: {
          50: '#faf8f5', // Fondo principal psicología
          100: '#f2ece4',
          200: '#e5d8cb',
          300: '#d5bea9',
          400: '#c59f83',
          500: '#b78564', // Terracota principal
          600: '#ac7254',
          700: '#8e5b45',
          800: '#754d3d',
          900: '#5f4034',
        }
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgb(95 64 52 / 0.06)',
        'warm': '0 4px 16px -4px rgb(95 64 52 / 0.12), 0 2px 6px -3px rgb(95 64 52 / 0.08)',
        'warm-lg': '0 16px 40px -12px rgb(95 64 52 / 0.22)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
