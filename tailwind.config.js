/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0D0F14',
        surface: '#161B25',
        'surface-2': '#1E2535',
        amber:   '#F5A623',
        'amber-dim': '#C4841C',
        blue:    '#4A9EFF',
        green:   '#22C55E',
        red:     '#EF4444',
        purple:  '#A855F7',
        muted:   '#8B95A1',
        text:    '#F0F0F0',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tight:  '-0.04em',
        snug:   '-0.03em',
        normal: '-0.01em',
      },
      boxShadow: {
        'amber-sm': '0 0 12px rgba(245,166,35,0.15)',
        'amber-md': '0 0 24px rgba(245,166,35,0.2)',
        'amber-lg': '0 0 40px rgba(245,166,35,0.3)',
        'surface':  '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
        'float':    '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'grid-amber': `
          linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease forwards',
        'slide-up':  'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-down':'slideDown 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'scale-in':  'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        'shake':     'shake 0.4s ease',
        'flip':      'flip 0.5s ease',
        'pulse-amber':'pulseAmber 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                          to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shake:     { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        flip:      { '0%': { transform: 'rotateX(0)' }, '50%': { transform: 'rotateX(-90deg)' }, '100%': { transform: 'rotateX(0)' } },
        pulseAmber:{ '0%,100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0)' }, '50%': { boxShadow: '0 0 0 8px rgba(245,166,35,0.15)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
