import { motion } from 'framer-motion';

const variants = {
  primary:   'bg-amber text-navy hover:bg-amber-dim focus-visible:ring-amber/50',
  secondary: 'bg-transparent text-text border border-white/15 hover:border-white/25 hover:bg-white/5',
  ghost:     'bg-transparent text-muted hover:text-text hover:bg-white/5',
  danger:    'bg-red/10 text-red border border-red/20 hover:bg-red/20',
  success:   'bg-green/10 text-green border border-green/20 hover:bg-green/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  style,
  ...props
}) {
  const isDisabled = disabled || loading;
  const primaryShadow = variant === 'primary'
    ? { boxShadow: '0 0 24px rgba(245,166,35,0.25)' }
    : {};

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ ...primaryShadow, ...style }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        focus-visible:outline-none focus-visible:ring-2
        transition-[background-color,border-color,color,opacity] duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
