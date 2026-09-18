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
        // Paleta Psicología (Lavanda, derivada del logo EMUNÁ) - PREVIEW
        warm: {
          50: '#f6f5fa',
          100: '#e7e3f2',
          200: '#d2cce5',
          300: '#b4aad5',
          400: '#9382c4',
          500: '#7762b7', // Lavanda principal
          600: '#6953ac',
          700: '#56448d',
          800: '#4b3e75',
          900: '#3f355f',
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
