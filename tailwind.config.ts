import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: '#090b1d',
          ocean: '#11193b',
          slate: '#1e264c',
          line: '#2f355a',
          highlight: '#facc15',
          accent: '#f87171',
          neutral: '#fef3c7'
        },
        category: {
          living_home: {
            rent: '#4c6ef5',
            utilities: '#facc15',
            groceries: '#fb923c',
            home_garden: '#84cc16'
          },
          mobility_transport: {
            fuel: '#22d3ee',
            car_maintenance: '#0ea5e9',
            car_insurance: '#14b8a6',
            travel_commuting: '#38bdf8'
          },
          personal_health: {
            healthcare: '#10b981',
            personal_care: '#f9a8d4',
            fitness: '#34d399',
            supplements: '#65a30d'
          },
          family_education: {
            school_fees: '#9333ea',
            childcare: '#c084fc',
            gifts_celebrations: '#fbbf24'
          },
          leisure_lifestyle: {
            clothing: '#f472b6',
            eating_out: '#fb7185',
            entertainment: '#ec4899',
            travel_holidays: '#8b5cf6',
            subscriptions: '#94a3b8'
          }
        }
      },
      boxShadow: {
        panel: '0 18px 40px rgba(8, 12, 32, 0.55)'
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
