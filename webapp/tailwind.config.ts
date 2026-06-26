import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#eef9f9',
          100: '#d4f0f0',
          200: '#aee1e1',
          300: '#7acbcb',
          400: '#4aafaf',
          500: '#2d9595',
          600: '#0d7675',
          700: '#0b5f5e',
          800: '#0d4d4c',
          900: '#0f4040',
          950: '#032424',
        },
      },
    },
  },
  plugins: [],
};

export default config;
