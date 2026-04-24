const variantMap = {
  amber:  'bg-amber/10 border border-amber/20 text-amber',
  blue:   'bg-blue/10  border border-blue/20  text-blue',
  green:  'bg-green/10 border border-green/20 text-green',
  red:    'bg-red/10   border border-red/20   text-red',
  purple: 'bg-purple/10 border border-purple/20 text-purple',
  muted:  'bg-white/5  border border-white/10 text-muted',
};

export default function Badge({ children, variant = 'muted', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
