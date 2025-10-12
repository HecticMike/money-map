import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          accent: '#0ea5e9',
          soft: '#e0f2fe'
        },
        categories: {
          housing: '#6366f1',
          food: '#f97316',
          transportation: '#22d3ee',
          entertainment: '#ec4899',
          healthcare: '#10b981',
          utilities: '#facc15',
          travel: '#9333ea',
          other: '#94a3b8'
        }
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.15)'
      },
      fontFamily: {
        display: ['"Inter var"', '"Inter"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
