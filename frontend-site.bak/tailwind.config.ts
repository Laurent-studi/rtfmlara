import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'deconstruct': 'deconstruct 0.8s ease-in-out forwards',
        'shine': 'shine var(--duration, 14s) infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        deconstruct: {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '100%': {
            opacity: 0,
            transform: 'translateY(-100px) rotate(720deg) scale(0)',
          },
        },
        shine: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
