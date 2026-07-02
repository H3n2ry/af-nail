/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A3',
          pale: '#FAF6ED',
        },
        accent: '#1A1A1A',
        neutral: {
          900: '#1A1A1A',
          500: '#6B5E56',
          100: '#F5F1ED',
        },
        success: '#5C9E7F',
        warning: '#D4A853',
        error: '#C0392B',
        surface: '#FFFFFF',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(201, 168, 76, 0.10)',
        modal: '0 8px 40px rgba(26, 18, 25, 0.18)',
      },
    },
  },
  plugins: [],
};
