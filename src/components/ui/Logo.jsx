/**
 * Brand-accurate logo components for Crackd.live
 * Based on official brand guidelines 2026.
 *
 * HexBolt  — Variation 3 (preferred abstract mark): hex lightning bolt icon
 * LogoMark — Variation 2: icon + wordmark (for nav, product UI)
 */

/** Hex lightning bolt — the preferred standalone mark */
export function HexBolt({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 116"
      fill="none"
      className={className}
      aria-label="Crackd.live"
    >
      {/* Hexagon background fill (very subtle) */}
      <polygon
        points="50,4 93,27.5 93,73.5 50,97 7,73.5 7,27.5"
        fill="rgba(245,166,35,0.08)"
        stroke="#F5A623"
        strokeWidth="3.5"
        strokeLinejoin="miter"
      />
      {/* Corner connector squares — brand detail */}
      <rect x="46.5" y="1"  width="7" height="6"  rx="1.5" fill="#F5A623" />
      <rect x="46.5" y="89" width="7" height="6"  rx="1.5" fill="#F5A623" />
      <rect x="4"   y="25"  width="6" height="6"  rx="1.5" fill="#F5A623" />
      <rect x="90"  y="25"  width="6" height="6"  rx="1.5" fill="#F5A623" />
      <rect x="4"   y="69"  width="6" height="6"  rx="1.5" fill="#F5A623" />
      <rect x="90"  y="69"  width="6" height="6"  rx="1.5" fill="#F5A623" />
      {/* Lightning bolt */}
      <path
        d="M54 20 L30 56 L46 56 L34 90 L72 51 L56 51 L70 20 Z"
        fill="#F5A623"
      />
    </svg>
  );
}

/** Inline lightning bolt SVG — replaces the "I" in ".LIVE" */
function BoltI({ height = 16 }) {
  return (
    <svg
      width={height * 0.65}
      height={height}
      viewBox="0 0 13 20"
      fill="none"
      className="inline-block"
      style={{ verticalAlign: '-0.1em' }}
      aria-hidden="true"
    >
      <path d="M8 0L1 11h4.5L2 20l10-12H8.5L12 0H8z" fill="#F5A623" />
    </svg>
  );
}

/**
 * Full logo lockup: hex icon + CRACKD.L⚡VE wordmark
 * - iconSize: size of the hex icon in px
 * - textSize: CSS class or pixel size for the wordmark text
 */
export function LogoMark({ iconSize = 32, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <HexBolt size={iconSize} />
      <span
        className="font-black tracking-[-0.03em] leading-none select-none"
        style={{ fontSize: iconSize * 0.56 }}
      >
        <span className="text-text">CRACKD</span>
        <span className="text-amber">.</span>
        <span className="text-amber">L</span>
        <BoltI height={iconSize * 0.56 * 1.2} />
        <span className="text-amber">VE</span>
      </span>
    </span>
  );
}
