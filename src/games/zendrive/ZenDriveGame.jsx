import { useZenDrive } from './useZenDrive.js';

function SmoothnessMeter({ value }) {
  const pct = Math.round(value * 100);
  const color = value > 0.7 ? '#C8F55A' : value > 0.4 ? '#FF9052' : '#EF4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 200 }}>
      <div style={{ fontSize: 11, color: '#7A7A8C', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Smoothness
      </div>
      <div style={{ width: '100%', height: 8, background: '#18181F', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 4,
          transition: 'width 0.3s ease, background 0.5s ease',
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

function StatPill({ label, value, color = '#F0EEE6' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color, lineHeight: 1, textShadow: color !== '#F0EEE6' ? `0 0 12px ${color}88` : 'none' }}>
        {value}
      </div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, color: '#7A7A8C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  );
}

export default function ZenDriveGame() {
  const { canvasRef, phase, stats, dailyBest, start, end, share, smoothnessRating, touchRef, CANVAS_W, CANVAS_H } = useZenDrive();

  // Touch controls
  function handleTouchStart(e) {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = touch.clientX - rect.left;
    touchRef.current = relX < rect.width / 2 ? 'left' : 'right';
  }
  function handleTouchEnd() { touchRef.current = null; }

  const rating = smoothnessRating(stats.smoothness);
  const ratingColor = { 'A+': '#C8F55A', 'A': '#C8F55A', 'B+': '#FF9052', 'B': '#FF9052', 'C+': '#EF4444', 'C': '#EF4444' }[rating] || '#F0EEE6';

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0E0E14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
      padding: '16px 0',
      gap: 12,
    }}>

      {/* Game title */}
      {phase === 'idle' && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: '#A67CFF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            Daily Chill
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F0EEE6', margin: 0, letterSpacing: '-0.02em' }}>
            Zen Drive
          </h1>
          <p style={{ color: '#7A7A8C', fontSize: 13, marginTop: 8, maxWidth: 300, lineHeight: 1.5 }}>
            No crashes. No rush. Just drive.
          </p>
        </div>
      )}

      {/* Canvas wrapper */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 40px rgba(14,14,20,0.8), 0 0 1px rgba(255,255,255,0.08)' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '70dvh', objectFit: 'contain' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(14,14,20,0.82)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 20,
          }}>
            {dailyBest > 0 && (
              <div style={{ fontFamily: 'Space Mono, monospace', color: '#7A7A8C', fontSize: 13 }}>
                Today's best: <span style={{ color: '#C8F55A' }}>{dailyBest} km</span>
              </div>
            )}
            <button onClick={start} style={{
              background: '#C8F55A',
              color: '#0E0E14',
              border: 'none',
              borderRadius: 12,
              padding: '14px 40px',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 0 24px #C8F55A44',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; e.target.style.boxShadow = '0 0 32px #C8F55A66'; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 24px #C8F55A44'; }}
            >
              Start Driving
            </button>
            <div style={{ color: '#7A7A8C', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
              ← → arrow keys or A/D to steer<br />
              <span style={{ color: '#4a4a5a' }}>ESC or X to stop</span>
            </div>
          </div>
        )}

        {/* Playing HUD */}
        {phase === 'playing' && (
          <>
            {/* Top left — distance */}
            <div style={{
              position: 'absolute', top: 12, left: 14,
              fontFamily: 'Space Mono, monospace',
              fontSize: 15, color: '#F0EEE6',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}>
              {stats.distance.toFixed(2)} <span style={{ fontSize: 10, color: '#7A7A8C' }}>km</span>
            </div>

            {/* Top right — score */}
            <div style={{
              position: 'absolute', top: 12, right: 14,
              fontFamily: 'Space Mono, monospace',
              fontSize: 15, color: '#C8F55A',
              textShadow: '0 0 10px #C8F55A66',
            }}>
              {stats.score.toLocaleString()}
            </div>

            {/* Bottom center — smoothness bar */}
            <div style={{
              position: 'absolute', bottom: 14, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <SmoothnessMeter value={stats.smoothness} />
            </div>

            {/* End button */}
            <button onClick={end} style={{
              position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(14,14,20,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#7A7A8C',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 12,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}>
              ✕ End
            </button>
          </>
        )}

        {/* End screen */}
        {phase === 'ended' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(14,14,20,0.90)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 24,
            padding: 32,
          }}>
            <div style={{ fontSize: 14, color: '#A67CFF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Feeling better?
            </div>

            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
              <StatPill label="km driven" value={stats.distance.toFixed(1)} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 42, fontWeight: 700, color: ratingColor, lineHeight: 1, textShadow: `0 0 20px ${ratingColor}66` }}>
                  {rating}
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, color: '#7A7A8C', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                  smoothness
                </div>
              </div>
              <StatPill label="orbs" value={stats.orbs} color="#A67CFF" />
            </div>

            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, color: '#C8F55A', textShadow: '0 0 12px #C8F55A66' }}>
              {stats.score.toLocaleString()} pts
            </div>

            {dailyBest > 0 && (
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#7A7A8C' }}>
                Today's best: <span style={{ color: '#F0EEE6' }}>{dailyBest} km</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={start} style={{
                background: '#C8F55A', color: '#0E0E14',
                border: 'none', borderRadius: 10, padding: '12px 28px',
                fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer',
                boxShadow: '0 0 20px #C8F55A44',
              }}>
                Drive Again
              </button>
              <button onClick={share} style={{
                background: 'rgba(166,124,255,0.12)', color: '#A67CFF',
                border: '1px solid rgba(166,124,255,0.3)', borderRadius: 10, padding: '12px 20px',
                fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer',
              }}>
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Below-canvas controls hint for mobile */}
      {phase === 'playing' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {['← Left', 'Right →'].map((label, i) => (
            <button
              key={i}
              onTouchStart={() => { touchRef.current = i === 0 ? 'left' : 'right'; }}
              onTouchEnd={() => { touchRef.current = null; }}
              onMouseDown={() => { touchRef.current = i === 0 ? 'left' : 'right'; }}
              onMouseUp={() => { touchRef.current = null; }}
              style={{
                background: '#18181F', border: '1px solid rgba(255,255,255,0.08)',
                color: '#7A7A8C', borderRadius: 10, padding: '12px 28px',
                fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer',
                userSelect: 'none', WebkitUserSelect: 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
