import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        iimst: {
          orange: '#ea580c',
          'orange-dark': '#c2410c',
          'orange-light': '#f97316',
          'orange-50': '#fff7ed',
          'orange-100': '#ffedd5',
          'footer': '#0f172a',
          'footer-light': '#1e293b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
