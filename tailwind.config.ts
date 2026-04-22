import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        acid: '#00E5FF',
        'acid-dim': 'rgba(0, 229, 255, 0.10)',
        'acid-border': 'rgba(0, 229, 255, 0.22)',
        bg: '#0A0A0A',
        'bg-1': '#111111',
        'bg-2': '#161616',
        'bg-3': '#1C1C1C',
        text: '#F0EDE6',
        'text-2': '#A8A49E',
        'text-3': '#5C5955',
        border: 'rgba(255, 255, 255, 0.07)',
        'border-2': 'rgba(255, 255, 255, 0.12)',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
        8: '64px',
        9: '96px',
        10: '128px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config

