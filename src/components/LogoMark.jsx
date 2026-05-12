// <LogoIcon size={n} />   — hexagon + cracked-C icon only
// <LogoMark size={n} />  — icon + CRACKD.LIVE wordmark (default export)

export function LogoIcon({ size = 36, glowIntensity = 0.65 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Crackd logo"
    >
      <defs>
        <filter id="glow-crack" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0B429" />
          <stop offset="100%" stopColor="#F7C948" />
        </linearGradient>
        <linearGradient id="hex-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#161B25" />
          <stop offset="100%" stopColor="#0F1117" />
        </linearGradient>
      </defs>

      {/* Hexagon shell */}
      <polygon
        points="50,8 91,28 91,72 50,92 9,72 9,28"
        fill="url(#hex-fill)"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1.5"
      />
      {/* Inner subtle ring */}
      <polygon
        points="50,15 86,32 86,68 50,85 14,68 14,32"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />

      {/* Letter C */}
      <path
        d="M 63,33 A 20,20 0 1 0 63,67"
        stroke="#FAFAFA"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
        opacity="0.92"
      />

      {/* Crack — glow bloom */}
      <line x1="45" y1="27" x2="59" y2="73"
        stroke="#F0B429" strokeWidth="7" strokeLinecap="round" opacity="0.07" />
      {/* Crack — main */}
      <line x1="45" y1="27" x2="59" y2="73"
        stroke="url(#gold-grad)" strokeWidth="2.5" strokeLinecap="round"
        filter="url(#glow-crack)" opacity={glowIntensity} />
      {/* Crack — top fork */}
      <line x1="45" y1="27" x2="51" y2="37"
        stroke="url(#gold-grad)" strokeWidth="1.5" strokeLinecap="round"
        filter="url(#glow-crack)" opacity={glowIntensity * 0.6} />
      {/* Crack — bottom fork */}
      <line x1="59" y1="63" x2="53" y2="73"
        stroke="url(#gold-grad)" strokeWidth="1.5" strokeLinecap="round"
        filter="url(#glow-crack)" opacity={glowIntensity * 0.6} />
    </svg>
  );
}

export function LogoMark({ size = 36, showTagline = false }) {
  const namePx = Math.round(size * 0.44);
  const livePx = Math.round(size * 0.37);
  const tagPx  = Math.round(size * 0.21);
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <LogoIcon size={size} />
      <div className="flex flex-col leading-none">
        <div style={{ lineHeight: 1 }}>
          <span
            className="font-display font-bold text-text"
            style={{ fontSize: namePx, letterSpacing: '-0.03em' }}
          >
            CRACKD
          </span>
          <span
            className="font-display font-bold text-gradient-gold"
            style={{ fontSize: livePx, letterSpacing: '-0.02em' }}
          >
            .LIVE
          </span>
        </div>
        {showTagline && (
          <span
            className="font-mono text-tertiary tracking-widest uppercase"
            style={{ fontSize: tagPx, marginTop: 3 }}
          >
            Daily mental reset
          </span>
        )}
      </div>
    </div>
  );
}

export default LogoMark;
