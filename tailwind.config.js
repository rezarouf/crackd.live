/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ────────────────────────────────────────
        navy:         '#0E0E14',   // Void
        void:         '#0E0E14',
        'navy-2':     '#0E0E14',
        surface:      '#18181F',   // Cards
        'surface-2':  '#1E1E27',   // Hover
        'surface-3':  '#222230',   // Elevated

        // ── Sharp Lime — earned / active / success ─────────────
        amber:        '#C8F55A',   // Primary CTA (remapped to lime)
        'amber-dim':  '#D4FF6B',   // Lime hover
        lime:         '#C8F55A',
        'lime-hover': '#D4FF6B',
        gold:         '#C8F55A',   // Legacy alias

        // ── Focus Violet — streaks, XP, achievements ──────────
        blue:         '#A67CFF',   // Info (remapped to violet)
        violet:       '#A67CFF',
        purple:       '#A67CFF',

        // ── Fire Amber — urgency / timers only ────────────────
        fire:         '#FF9052',

        // ── States ────────────────────────────────────────────
        green:        '#C8F55A',   // Success = Lime
        red:          '#FF5C5C',   // Error

        // ── Text ──────────────────────────────────────────────
        text:         '#F0EEE6',   // Warm White
        muted:        '#7A7A8C',
        tertiary:     '#4A4A5C',
        inverse:      '#0E0E14',
      },
      fontFamily: {
        sans:    ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        tight:  '-0.04em',
        snug:   '-0.03em',
        normal: '-0.01em',
        wide:   '0.08em',
        wider:  '0.15em',
      },
      boxShadow: {
        'card':        '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':  '0 0 0 1px rgba(200,245,90,0.15), 0 8px 32px rgba(0,0,0,0.6)',
        'lime':        '0 0 24px rgba(200,245,90,0.15), 0 0 48px rgba(200,245,90,0.08)',
        'lime-sm':     '0 0 12px rgba(200,245,90,0.20)',
        'lime-lg':     '0 0 40px rgba(200,245,90,0.18), 0 0 80px rgba(200,245,90,0.08)',
        'violet':      '0 0 24px rgba(166,124,255,0.15)',
        'violet-sm':   '0 0 12px rgba(166,124,255,0.20)',
        'fire':        '0 0 24px rgba(255,144,82,0.20)',
        'float':       '0 8px 40px rgba(0,0,0,0.6)',
        // Legacy aliases
        'amber-sm':    '0 0 12px rgba(200,245,90,0.15)',
        'amber-md':    '0 0 24px rgba(200,245,90,0.20)',
        'amber-lg':    '0 0 40px rgba(200,245,90,0.18)',
        'surface':     '0 4px 24px rgba(0,0,0,0.5)',
        'gold':        '0 0 24px rgba(200,245,90,0.15)',
        'gold-sm':     '0 0 12px rgba(200,245,90,0.20)',
        'gold-lg':     '0 0 40px rgba(200,245,90,0.18)',
      },
      backgroundImage: {
        'grid-subtle': `
          repeating-linear-gradient(rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)
        `,
        'grid-amber': `
          repeating-linear-gradient(rgba(200,245,90,0.03) 0, rgba(200,245,90,0.03) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(200,245,90,0.03) 0, rgba(200,245,90,0.03) 1px, transparent 1px, transparent 40px)
        `,
        'grid-bg': `
          repeating-linear-gradient(rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)
        `,
      },
      animation: {
        'fade-up':     'fadeUp 0.4s ease forwards',
        'fade-in':     'fadeIn 0.3s ease forwards',
        'lime-flash':  'limeFlash 0.6s ease',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'ticker':      'ticker 30s linear infinite',
        'pulse-violet':'pulseViolet 2.5s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'count-up':    'countUp 0.4s ease forwards',
        'shake':       'shake 0.4s ease',
        'flip':        'flip 0.5s ease',
        'draw-check':  'drawCheck 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'scale-in':    'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        // Legacy
        'pulse-amber': 'limeFlash 2s ease-in-out infinite',
        'slide-up':    'fadeUp 0.4s ease forwards',
        'slide-down':  'slideDown 0.4s ease forwards',
      },
      keyframes: {
        fadeUp:      { from: { opacity: 0, transform: 'translateY(20px)' },       to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: 0 },                                       to: { opacity: 1 } },
        limeFlash:   { '0%': { boxShadow: '0 0 0 rgba(200,245,90,0)' },           '50%': { boxShadow: '0 0 32px rgba(200,245,90,0.4)' }, '100%': { boxShadow: '0 0 8px rgba(200,245,90,0.1)' } },
        shimmer:     { from: { backgroundPosition: '-200% 0' },                    to: { backgroundPosition: '200% 0' } },
        ticker:      { from: { transform: 'translateX(0)' },                       to: { transform: 'translateX(-50%)' } },
        pulseViolet: { '0%,100%': { boxShadow: '0 0 0 rgba(166,124,255,0)' },     '50%': { boxShadow: '0 0 20px rgba(166,124,255,0.3)' } },
        float:       { '0%,100%': { transform: 'translateY(0px)' },               '50%': { transform: 'translateY(-8px)' } },
        countUp:     { from: { opacity: 0, transform: 'translateY(10px)' },       to: { opacity: 1, transform: 'translateY(0)' } },
        shake:       { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        flip:        { '0%': { transform: 'rotateX(0)' }, '50%': { transform: 'rotateX(-90deg)' }, '100%': { transform: 'rotateX(0)' } },
        drawCheck:   { from: { strokeDashoffset: 100 },                            to: { strokeDashoffset: 0 } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.95)' },            to: { opacity: 1, transform: 'scale(1)' } },
        slideDown:   { from: { opacity: 0, transform: 'translateY(-12px)' },      to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
