/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9607A',
          light: '#F2A7BB',
          pale: '#FDF0F4',
        },
        accent: '#A0522D',
        neutral: {
          900: '#1A1219',
          500: '#7A6872',
          100: '#F7F3F5',
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
        card: '0 2px 12px rgba(201, 96, 122, 0.08)',
        modal: '0 8px 40px rgba(26, 18, 25, 0.18)',
      },
    },
  },
  plugins: [],
};
