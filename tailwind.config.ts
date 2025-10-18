import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          accent: '#0ea5e9',
          soft: '#e0f2fe',
        },
        category: {
          living_home: {
            rent: '#6366f1',
            utilities: '#facc15',
            groceries: '#f97316',
            home_garden: '#84cc16',
          },
          mobility_transport: {
            fuel: '#22d3ee',
            car_maintenance: '#0ea5e9',
            car_insurance: '#14b8a6',
            travel_commuting: '#38bdf8',
          },
          personal_health: {
            healthcare: '#10b981',
            personal_care: '#f9a8d4',
            fitness: '#34d399',
            supplements: '#65a30d',
          },
          family_education: {
            school_fees: '#9333ea',
            childcare: '#c084fc',
            gifts_celebrations: '#fbbf24',
          },
          leisure_lifestyle: {
            clothing: '#f472b6',
            eating_out: '#fb923c',
            entertainment: '#ec4899',
            travel_holidays: '#8b5cf6',
            subscriptions: '#94a3b8',
          },
        },
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.15)',
      },
      fontFamily: {
        display: ['"Inter var"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
