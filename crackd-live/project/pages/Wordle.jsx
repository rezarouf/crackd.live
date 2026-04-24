
const WORD = 'CRACK';
const INITIAL_GUESSES = [
  { letters: ['C','R','A','N','E'], states: ['correct','absent','correct','absent','present'] },
  { letters: ['C','H','A','R','K'], states: ['correct','absent','correct','present','correct'] },
  { letters: [], states: [] },
  { letters: [], states: [] },
  { letters: [], states: [] },
  { letters: [], states: [] },
];

const TILE_COLORS = {
  empty: { bg: 'transparent', border: 'rgba(255,255,255,0.1)', color: '#F0F0F0' },
  filled: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.25)', color: '#F0F0F0' },
  correct: { bg: '#F5A623', border: '#F5A623', color: '#0D0F14' },
  present: { bg: '#4A9EFF', border: '#4A9EFF', color: '#fff' },
  absent: { bg: '#2A2F3A', border: '#2A2F3A', color: '#8B95A1' },
};

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

const WordlePage = ({ setPage }) => {
  const [guesses, setGuesses] = React.useState(INITIAL_GUESSES);
  const [currentRow, setCurrentRow] = React.useState(2);
  const [currentLetters, setCurrentLetters] = React.useState([]);
  const [won, setWon] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [showWin, setShowWin] = React.useState(false);
  const [time, setTime] = React.useState(97);

  React.useEffect(() => {
    const t = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const letterStates = {};
  guesses.forEach(g => {
    g.letters.forEach((l, i) => {
      const s = g.states[i];
      if (!letterStates[l] || s === 'correct') letterStates[l] = s;
    });
  });

  const handleKey = (key) => {
    if (won) return;
    if (key === '⌫') {
      setCurrentLetters(p => p.slice(0,-1));
    } else if (key === 'ENTER') {
      if (currentLetters.length < 5) { setShake(true); setTimeout(() => setShake(false), 400); return; }
      const guess = currentLetters.join('');
      const states = currentLetters.map((l, i) =>
        l === WORD[i] ? 'correct' : WORD.includes(l) ? 'present' : 'absent'
      );
      const newGuesses = [...guesses];
      newGuesses[currentRow] = { letters: currentLetters, states };
      setGuesses(newGuesses);
      setCurrentLetters([]);
      if (guess === WORD) { setWon(true); setTimeout(() => setShowWin(true), 600); return; }
      setCurrentRow(r => r + 1);
    } else if (currentLetters.length < 5 && key.length === 1) {
      setCurrentLetters(p => [...p, key]);
    }
  };

  React.useEffect(() => {
    const handler = e => handleKey(e.key.toUpperCase() === 'BACKSPACE' ? '⌫' : e.key.toUpperCase() === 'ENTER' ? 'ENTER' : e.key.toUpperCase());
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentLetters, currentRow, won]);

  const tileColor = (rowIdx, colIdx) => {
    const g = guesses[rowIdx];
    if (rowIdx === currentRow && !g.letters.length) {
      return colIdx < currentLetters.length ? TILE_COLORS.filled : TILE_COLORS.empty;
    }
    if (!g.states[colIdx]) return TILE_COLORS.empty;
    return TILE_COLORS[g.states[colIdx]];
  };

  const tileChar = (rowIdx, colIdx) => {
    if (rowIdx === currentRow && !guesses[rowIdx].letters.length) return currentLetters[colIdx] || '';
    return guesses[rowIdx].letters[colIdx] || '';
  };

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <button onClick={() => setPage('games')} style={{ background: 'none', border: 'none', color: '#8B95A1', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Wordle</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: diffColor['Medium'], background: `${diffColor['Medium']}15`, padding: '3px 10px', borderRadius: 20 }}>Medium</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8B95A1', fontFamily: 'JetBrains Mono, monospace' }}>TIME</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4A9EFF' }}>{fmt(time)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8B95A1' }}>STREAK</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F5A623' }}>🔥 23</div>
          </div>
        </div>
      </div>

      {/* Daily badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 28 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Daily Challenge · April 21, 2026</span>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32, animation: shake ? 'shake 0.4s ease' : 'none' }}>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, col) => {
              const tc = tileColor(row, col);
              const ch = tileChar(row, col);
              return (
                <div key={col} style={{
                  width: 64, height: 64, borderRadius: 10,
                  background: tc.bg, border: `2px solid ${tc.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 900, color: tc.color,
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'all 0.15s ease',
                  transform: ch ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: tc.bg !== 'transparent' && tc.bg !== 'rgba(255,255,255,0.08)' ? `0 0 16px ${tc.border}30` : 'none',
                }}>{ch}</div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {row.map(key => {
              const state = letterStates[key];
              const tc = state ? TILE_COLORS[state] : null;
              const isWide = key.length > 1;
              return (
                <button key={key} onClick={() => handleKey(key)} style={{
                  width: isWide ? 64 : 42, height: 54, borderRadius: 8,
                  background: tc ? tc.bg : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${tc ? tc.border : 'rgba(255,255,255,0.1)'}`,
                  color: tc ? tc.color : '#F0F0F0',
                  fontSize: isWide ? 12 : 16, fontWeight: 700, cursor: 'pointer',
                  fontFamily: isWide ? 'Inter, sans-serif' : 'JetBrains Mono, monospace',
                  transition: 'all 0.15s',
                }}>{key}</button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>📤 Share</button>
        <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, cursor: 'pointer' }}>📊 Stats</button>
      </div>

      {/* Win overlay */}
      {showWin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#161B25', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '48px', textAlign: 'center', maxWidth: 400, boxShadow: '0 0 60px rgba(245,166,35,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#F5A623', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Brilliant!</h2>
            <p style={{ color: '#8B95A1', margin: '0 0 32px' }}>The word was <strong style={{ color: '#F0F0F0' }}>CRACK</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[['Guesses', '3/6'], ['Time', fmt(time)], ['XP Earned', '+100']].map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '16px 8px' }}>
                  <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: label === 'XP Earned' ? '#F5A623' : '#F0F0F0' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowWin(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F0', fontWeight: 600, padding: '12px', borderRadius: 10, cursor: 'pointer' }}>📤 Share</button>
              <button onClick={() => setPage('games')} style={{ flex: 1, background: '#F5A623', border: 'none', color: '#0D0F14', fontWeight: 700, padding: '12px', borderRadius: 10, cursor: 'pointer' }}>Next Puzzle →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { WordlePage });
