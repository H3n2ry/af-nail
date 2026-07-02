/** @type {import('tailwindcss').Config} */

function v(name) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgb(var(${name}) / ${opacityValue})`
      : `rgb(var(${name}))`;
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: v('--color-primary'),
          light: v('--color-primary-light'),
          pale: v('--color-primary-pale'),
        },
        accent: v('--color-accent'),
        neutral: {
          900: v('--color-neutral-900'),
          500: v('--color-neutral-500'),
          100: v('--color-neutral-100'),
        },
        success: v('--color-success'),
        warning: v('--color-warning'),
        error: v('--color-error'),
        surface: v('--color-surface'),
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
        card: '0 2px 12px rgb(var(--color-primary) / 0.10)',
        modal: '0 8px 40px rgb(var(--color-neutral-900) / 0.18)',
      },
    },
  },
  plugins: [],
};
