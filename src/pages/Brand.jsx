const palette = [
  { name: 'Background', hex: '#0D0F14', role: 'Primary bg' },
  { name: 'Surface',    hex: '#161B25', role: 'Cards, panels' },
  { name: 'Amber',      hex: '#F5A623', role: 'Primary accent, CTAs' },
  { name: 'Blue',       hex: '#4A9EFF', role: 'Info, links, secondary' },
  { name: 'Green',      hex: '#22C55E', role: 'Success, correct' },
  { name: 'Red',        hex: '#EF4444', role: 'Error, wrong' },
  { name: 'Text',       hex: '#F0F0F0', role: 'Primary text' },
  { name: 'Muted',      hex: '#8B95A1', role: 'Secondary text' },
];

export default function BrandPage() {
  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 60px' }}>
        <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Design System</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px' }}>Brand Kit</h1>
        <p style={{ fontSize: 16, color: '#8B95A1', marginBottom: 64 }}>The visual foundation of Crackd.live — logos, colors, and typography.</p>

        {/* LOGOS */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Logo Variations</h2>
          <p style={{ fontSize: 14, color: '#8B95A1', marginBottom: 32 }}>Three expressions of the Crackd.live brand identity.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

            {/* V1: Wordmark */}
            <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: '#0D0F14', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
                    <span>CR</span>
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      A
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 40 50">
                        <line x1="20" y1="5" x2="28" y2="48" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                        <line x1="20" y1="5" x2="12" y2="48" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      </svg>
                    </span>
                    <span>CKD</span>
                    <span style={{ fontSize: 22, fontWeight: 500, color: '#F5A623', marginLeft: 4 }}>.live</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8B95A1', marginTop: 8, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500 }}>Crack the puzzle. Beat the world.</div>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Variation 1 — Wordmark</div>
                <div style={{ fontSize: 12, color: '#8B95A1' }}>Sharp sans-serif with crack effect on A. ".live" in amber accent weight. Use on dark backgrounds.</div>
              </div>
            </div>

            {/* V2: Icon + Wordmark */}
            <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: '#0D0F14', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <rect width="64" height="64" rx="14" fill="#F5A623" />
                    <rect x="8"  y="8"  width="20" height="20" rx="3" fill="rgba(0,0,0,0.25)" />
                    <rect x="36" y="8"  width="20" height="20" rx="3" fill="rgba(0,0,0,0.15)" />
                    <rect x="8"  y="36" width="20" height="20" rx="3" fill="rgba(0,0,0,0.15)" />
                    <rect x="36" y="36" width="20" height="20" rx="3" fill="rgba(0,0,0,0.08)" />
                    <path d="M32 8 L28 28 L36 24 L30 56" stroke="#0D0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>Crackd</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#F5A623', letterSpacing: '0.02em' }}>.live</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Variation 2 — Icon + Wordmark</div>
                <div style={{ fontSize: 12, color: '#8B95A1' }}>Geometric cracked-grid tile beside the wordmark. Versatile for headers and product UI.</div>
              </div>
            </div>

            {/* V3: Abstract mark */}
            <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: '#0D0F14', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" fill="rgba(245,166,35,0.05)" />
                    <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="4 60" strokeDashoffset="0" />
                    <path d="M40 15 L44 32 L52 28 L40 65 L36 45 L28 50 Z" fill="#F5A623" opacity="0.9" />
                    <circle cx="40" cy="40" r="4" fill="#0D0F14" />
                  </svg>
                  <div style={{ fontSize: 11, color: '#8B95A1', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Crackd.live</div>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Variation 3 — Abstract Mark</div>
                <div style={{ fontSize: 12, color: '#8B95A1' }}>Hexagonal crack-lightning symbol. Works as a favicon, app icon, and standalone brand mark.</div>
              </div>
            </div>
          </div>
        </section>

        {/* COLOR PALETTE */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Color Palette</h2>
          <p style={{ fontSize: 14, color: '#8B95A1', marginBottom: 32 }}>The full design token set, from backgrounds to accents.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {palette.map(c => (
              <div key={c.name} style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 80, background: c.hex, position: 'relative' }}>
                  {c.hex === '#0D0F14' && <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.08)' }} />}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#F5A623', marginBottom: 4 }}>{c.hex}</div>
                  <div style={{ fontSize: 11, color: '#8B95A1' }}>{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Typography</h2>
          <p style={{ fontSize: 14, color: '#8B95A1', marginBottom: 32 }}>Two typefaces — one for UI, one for puzzle tiles.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px' }}>
              <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Inter — UI Typeface</div>
              <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 24 }}>Aa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['900', '36px', 'Hero headings'], ['800', '24px', 'Section headings'], ['700', '18px', 'Labels, buttons'], ['600', '14px', 'Body emphasis'], ['400', '14px', 'Body copy']].map(([weight, size, use]) => (
                  <div key={weight} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontWeight: parseInt(weight), fontSize: size, lineHeight: 1.2, flex: 1 }}>Crackd</span>
                    <span style={{ fontSize: 11, color: '#8B95A1' }}>{weight} / {size} — {use}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px' }}>
              <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>JetBrains Mono — Puzzle Tiles</div>
              <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 24, fontFamily: 'JetBrains Mono, monospace', color: '#F5A623' }}>Aa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['800', '32px', 'Tile letters'], ['700', '20px', 'Score display'], ['600', '16px', 'Timer, stats'], ['400', '14px', 'Code, labels']].map(([weight, size, use]) => (
                  <div key={weight} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontWeight: parseInt(weight), fontSize: size, lineHeight: 1.2, flex: 1, fontFamily: 'JetBrains Mono, monospace' }}>CRACK</span>
                    <span style={{ fontSize: 11, color: '#8B95A1' }}>{weight} / {size} — {use}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
