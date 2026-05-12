/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        navy:         '#080909',
        'navy-2':     '#0F1117',
        surface:      '#161B25',
        'surface-2':  '#1C2333',
        // Primary accent
        amber:        '#F0B429',
        'amber-dim':  '#F7C948',
        gold:         '#F0B429',
        // Secondary accents
        blue:         '#3B82F6',
        green:        '#10B981',
        red:          '#F43F5E',
        purple:       '#8B5CF6',
        // Text
        text:         '#FAFAFA',
        muted:        '#94A3B8',
        tertiary:     '#475569',
        inverse:      '#080909',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn:  '10px',
        pill: '9999px',
      },
      letterSpacing: {
        tight:  '-0.04em',
        snug:   '-0.03em',
        normal: '-0.01em',
      },
      boxShadow: {
        'card':       '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.5)',
        'gold':       '0 0 40px rgba(240,180,41,0.15)',
        'gold-sm':    '0 0 20px rgba(240,180,41,0.20)',
        'gold-lg':    '0 0 60px rgba(240,180,41,0.20)',
        'blue':       '0 0 40px rgba(59,130,246,0.15)',
        'float':      '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
        // Legacy aliases
        'amber-sm':   '0 0 12px rgba(240,180,41,0.15)',
        'amber-md':   '0 0 24px rgba(240,180,41,0.20)',
        'amber-lg':   '0 0 40px rgba(240,180,41,0.30)',
        'surface':    '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        'grid-amber': `
          linear-gradient(rgba(240,180,41,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(240,180,41,0.03) 1px, transparent 1px)
        `,
        'grid-gold': `
          linear-gradient(rgba(240,180,41,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(240,180,41,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid':    '40px 40px',
        'grid-lg': '60px 60px',
      },
      animation: {
        'fade-up':     'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':     'fadeIn 0.3s ease both',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down':  'slideDown 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':    'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'shimmer':     'shimmer 1.8s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
        'float':       'float 7s ease-in-out infinite',
        'ticker':      'ticker 35s linear infinite',
        'shake':       'shake 0.4s ease',
        'flip':        'flip 0.5s ease',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'draw-check':  'drawCheck 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      keyframes: {
        fadeUp:     { from: { opacity: 0, transform: 'translateY(20px)' },     to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: 0 },                                     to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(12px)' },      to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown:  { from: { opacity: 0, transform: 'translateY(-12px)' },     to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:    { from: { opacity: 0, transform: 'scale(0.95)' },           to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:    { '0%': { backgroundPosition: '-400% 0' },                  '100%': { backgroundPosition: '400% 0' } },
        pulseGlow:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(240,180,41,0)' },  '50%': { boxShadow: '0 0 24px 4px rgba(240,180,41,0.18)' } },
        float:      { '0%,100%': { transform: 'translateY(0px)' },              '50%': { transform: 'translateY(-12px)' } },
        ticker:     { from: { transform: 'translateX(0)' },                     to:   { transform: 'translateX(-50%)' } },
        shake:      { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        flip:       { '0%': { transform: 'rotateX(0)' }, '50%': { transform: 'rotateX(-90deg)' }, '100%': { transform: 'rotateX(0)' } },
        pulseAmber: { '0%,100%': { boxShadow: '0 0 0 0 rgba(240,180,41,0)' },  '50%': { boxShadow: '0 0 0 8px rgba(240,180,41,0.15)' } },
        drawCheck:  { from: { strokeDashoffset: 100 },                          to:   { strokeDashoffset: 0 } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
