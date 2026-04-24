
const SCREW_COLORS = ['#EF4444','#F5A623','#22C55E','#4A9EFF','#A855F7'];
const INITIAL_SCREWS = [
  { id:1, color: SCREW_COLORS[0], board: 0, col: 0, free: false },
  { id:2, color: SCREW_COLORS[1], board: 0, col: 2, free: false },
  { id:3, color: SCREW_COLORS[2], board: 1, col: 1, free: false },
  { id:4, color: SCREW_COLORS[0], board: 1, col: 3, free: false },
  { id:5, color: SCREW_COLORS[3], board: 2, col: 0, free: false },
  { id:6, color: SCREW_COLORS[1], board: 2, col: 2, free: false },
  { id:7, color: SCREW_COLORS[4], board: 3, col: 1, free: false },
  { id:8, color: SCREW_COLORS[2], board: 3, col: 3, free: false },
  { id:9, color: SCREW_COLORS[3], board: 4, col: 0, free: false },
  { id:10, color: SCREW_COLORS[4], board: 4, col: 2, free: false },
];

const ScrewPuzzlePage = ({ setPage }) => {
  const [screws, setScrews] = React.useState(INITIAL_SCREWS);
  const [moves, setMoves] = React.useState(0);
  const [time, setTime] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [freed, setFreed] = React.useState([]);
  const [showWin, setShowWin] = React.useState(false);
  const [hints, setHints] = React.useState(3);

  React.useEffect(() => {
    const t = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleScrew = (screw) => {
    if (freed.includes(screw.id)) return;
    if (selected && selected.id !== screw.id) {
      // Attempt to free matching color pair
      if (selected.color === screw.color) {
        setFreed(p => [...p, selected.id, screw.id]);
        setSelected(null);
        setMoves(m => m + 1);
        if (freed.length + 2 >= INITIAL_SCREWS.length) {
          setTimeout(() => setShowWin(true), 500);
        }
      } else {
        setSelected(screw);
        setMoves(m => m + 1);
      }
    } else {
      setSelected(s => s?.id === screw.id ? null : screw);
    }
  };

  const reset = () => {
    setScrews(INITIAL_SCREWS);
    setFreed([]);
    setSelected(null);
    setMoves(0);
    setTime(0);
    setShowWin(false);
  };

  const BOARDS = [0,1,2,3,4];

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
        <button onClick={() => setPage('games')} style={{ background: 'none', border: 'none', color: '#8B95A1', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Screw Puzzle</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: diffColor['Easy'], background: `${diffColor['Easy']}15`, padding: '3px 10px', borderRadius: 20 }}>Easy</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['MOVES', moves], ['TIME', fmt(time)]].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#8B95A1', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4A9EFF' }}>{val}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#8B95A1', letterSpacing: '0.08em' }}>HINTS</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F5A623' }}>💡 {hints}</div>
          </div>
        </div>
      </div>

      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 20, padding: '6px 20px', marginBottom: 36 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#4A9EFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Level 47 of ∞ · Daily Challenge</span>
      </div>

      {/* Instructions */}
      <p style={{ fontSize: 14, color: '#8B95A1', textAlign: 'center', marginBottom: 32, maxWidth: 440 }}>
        Select two screws of the <span style={{ color: '#F0F0F0', fontWeight: 600 }}>same color</span> to free them from their boards. Match all pairs to complete the puzzle.
      </p>

      {/* Game boards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, width: '100%', maxWidth: 560 }}>
        {BOARDS.map(bi => {
          const boardScrews = screws.filter(s => s.board === bi);
          return (
            <div key={bi} style={{
              background: 'linear-gradient(135deg, #1E1208, #2A1A0E)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Wood grain */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 12px)', pointerEvents: 'none' }} />

              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 700, width: 40, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Board {bi + 1}</div>
              <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
                {[0,1,2,3].map(col => {
                  const screw = boardScrews.find(s => s.col === col);
                  const isFree = screw && freed.includes(screw.id);
                  const isSelected = screw && selected?.id === screw.id;
                  return (
                    <div key={col} style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {screw ? (
                        <div onClick={() => handleScrew(screw)} style={{
                          width: isFree ? 36 : 48, height: isFree ? 36 : 48,
                          borderRadius: '50%', cursor: isFree ? 'default' : 'pointer',
                          background: isFree ? 'rgba(34,197,94,0.1)' : screw.color,
                          border: isSelected ? `3px solid #fff` : isFree ? '2px dashed rgba(34,197,94,0.3)' : `3px solid rgba(0,0,0,0.3)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isFree ? 'none' : isSelected ? `0 0 20px ${screw.color}80` : `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          opacity: isFree ? 0.3 : 1,
                        }}>
                          {!isFree && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }} />
                          )}
                          {isFree && <span style={{ fontSize: 16, color: '#22C55E' }}>✓</span>}
                        </div>
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.08)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SCREW_COLORS.map((c, i) => {
          const colorScrews = INITIAL_SCREWS.filter(s => s.color === c);
          const allFree = colorScrews.every(s => freed.includes(s.id));
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: allFree ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.04)', border: `1px solid ${allFree ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: '6px 14px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 12, color: allFree ? '#22C55E' : '#8B95A1', fontWeight: 600 }}>{allFree ? 'Freed ✓' : 'Locked'}</span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => { setMoves(m => m+1); setHints(h => Math.max(0,h-1)); }} style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>💡 Hint (−1 XP)</button>
        <button onClick={reset} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>↺ Restart</button>
        <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#8B95A1', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, cursor: 'not-allowed', opacity: 0.5 }}>Next Level 🔒</button>
      </div>

      {/* Win overlay */}
      {showWin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#161B25', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '48px', textAlign: 'center', maxWidth: 380, boxShadow: '0 0 60px rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔩</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#22C55E', margin: '0 0 8px' }}>Solved!</h2>
            <p style={{ color: '#8B95A1', margin: '0 0 32px' }}>Level 47 complete</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[['Moves', moves], ['Time', fmt(time)], ['XP', '+90']].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: l === 'XP' ? '#F5A623' : '#F0F0F0' }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setPage('games')} style={{ width: '100%', background: '#22C55E', border: 'none', color: '#0D0F14', fontWeight: 700, padding: '14px', borderRadius: 10, cursor: 'pointer', fontSize: 15 }}>Next Level →</button>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ScrewPuzzlePage });
