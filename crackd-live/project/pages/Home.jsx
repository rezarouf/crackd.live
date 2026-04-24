
const GAMES = [
  { id: 'wordle', name: 'Wordle', icon: '🔤', type: 'word', desc: 'Guess the 5-letter word in 6 tries', xp: 100, difficulty: 'Medium', done: true },
  { id: 'connections', name: 'Connections', icon: '🔗', type: 'word', desc: 'Group 16 words into 4 categories', xp: 120, difficulty: 'Hard', done: true },
  { id: 'nerdle', name: 'Nerdle', icon: '🔢', type: 'word', desc: 'Guess the equation in 6 tries', xp: 130, difficulty: 'Hard', done: false },
  { id: 'cryptogram', name: 'Cryptogram', icon: '🔐', type: 'word', desc: 'Decode the encrypted message', xp: 150, difficulty: 'Expert', done: false },
  { id: 'sudoku', name: 'Sudoku', icon: '🔳', type: 'word', desc: 'Fill the 9×9 grid with digits', xp: 110, difficulty: 'Medium', done: false },
  { id: 'screw', name: 'Screw Puzzle', icon: '🔩', type: 'visual', desc: 'Unscrew and free the bolts by color', xp: 90, difficulty: 'Easy', done: true },
  { id: 'pin', name: 'Pin Pull', icon: '📌', type: 'visual', desc: 'Pull pins in the right order', xp: 80, difficulty: 'Easy', done: false },
  { id: 'rope', name: 'Rope Untangle', icon: '🪢', type: 'visual', desc: 'Untangle the knotted ropes', xp: 95, difficulty: 'Medium', done: false },
  { id: 'wood', name: 'Wood Block', icon: '🟫', type: 'visual', desc: 'Slide blocks to clear the board', xp: 100, difficulty: 'Medium', done: false },
  { id: 'nuts', name: 'Nuts & Bolts', icon: '⚙️', type: 'visual', desc: 'Match and tighten nut-bolt pairs', xp: 85, difficulty: 'Easy', done: false },
];

const LEADERBOARD = [
  { rank: 1, name: 'xCipherKing', country: '🇺🇸', xp: 9840, streak: 94, avatar: 'CK' },
  { rank: 2, name: 'PuzzlrPro', country: '🇬🇧', xp: 9210, streak: 67, avatar: 'PP' },
  { rank: 3, name: 'GridMaster9', country: '🇩🇪', xp: 8755, streak: 51, avatar: 'GM' },
  { rank: 4, name: 'SolveQueen', country: '🇫🇷', xp: 8100, streak: 44, avatar: 'SQ' },
  { rank: 5, name: 'CrackdDaily', country: '🇨🇦', xp: 7890, streak: 38, avatar: 'CD' },
  { rank: 6, name: 'WordWitch', country: '🇦🇺', xp: 7440, streak: 29, avatar: 'WW' },
  { rank: 7, name: 'NumberNinja', country: '🇯🇵', xp: 7210, streak: 22, avatar: 'NN' },
];

const diffColor = { Easy: '#22C55E', Medium: '#F5A623', Hard: '#4A9EFF', Expert: '#EF4444' };

const HomePage = ({ setPage }) => {
  const [lbTab, setLbTab] = React.useState('Global');
  const completed = GAMES.filter(g => g.done).length;

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif' }}>
      {/* Animated Grid BG */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 140, paddingBottom: 100, textAlign: 'center', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F5A623', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live Now · 3,201 players active</span>
        </div>

        <h1 style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 auto 24px', maxWidth: 800 }}>
          Crack the Puzzle.<br />
          <span style={{ color: '#F5A623' }}>Beat the World.</span>
        </h1>
        <p style={{ fontSize: 20, color: '#8B95A1', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.6 }}>
          10 daily challenges. Global leaderboards. One login.<br />Are you sharp enough?
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 80 }}>
          <button onClick={() => setPage('games')} style={{
            background: '#F5A623', color: '#0D0F14', fontWeight: 700, fontSize: 16,
            padding: '14px 32px', borderRadius: 10, border: 'none', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(245,166,35,0.3)',
            transition: 'all 0.2s',
          }}>Play Today's Challenges →</button>
          <button onClick={() => setPage('leaderboard')} style={{
            background: 'transparent', color: '#F0F0F0', fontWeight: 600, fontSize: 16,
            padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
          }}>See Leaderboard</button>
        </div>

        {/* Floating challenge card */}
        <div style={{
          display: 'inline-block', background: '#161B25', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '24px 32px', textAlign: 'left', minWidth: 360,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Today's Challenges</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>April 21, 2026</div>
            </div>
            <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F5A623' }}>{completed}/10</span>
            </div>
          </div>
          {GAMES.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span>
                <span style={{ fontSize: 14, color: g.done ? '#F0F0F0' : '#8B95A1' }}>{g.name}</span>
              </div>
              {g.done
                ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</span>
                  </div>
                : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
              }
            </div>
          ))}
          {/* Full House bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#8B95A1' }}>Full House Bonus</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F5A623' }}>+500 XP</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${completed / 10 * 100}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats ticker */}
      <div style={{ background: 'rgba(245,166,35,0.05)', borderTop: '1px solid rgba(245,166,35,0.1)', borderBottom: '1px solid rgba(245,166,35,0.1)', padding: '12px 0', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
          {['12,480 puzzles solved today', '3,201 active players', 'Top streak: 94 days', '48 countries competing'].map((s, i) => (
            <span key={i} style={{ fontSize: 13, color: '#8B95A1', fontWeight: 500, whiteSpace: 'nowrap' }}>
              <span style={{ color: '#F5A623', marginRight: 8 }}>◆</span>{s}
            </span>
          ))}
        </div>
      </div>

      {/* Daily Challenge Hub */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Daily · April 21</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Today's Challenges</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#8B95A1' }}>{completed} of 10 complete</span>
            <button onClick={() => setPage('games')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#F0F0F0', fontWeight: 500, fontSize: 14, padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>View All →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {GAMES.map(g => (
            <div key={g.id} onClick={() => g.id === 'wordle' ? setPage('wordle') : g.id === 'screw' ? setPage('screw') : null}
              style={{
                background: g.done ? 'rgba(34,197,94,0.05)' : '#161B25',
                border: g.done ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '24px 20px', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {g.done && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>✓</span>
              </div>}
              <div style={{ fontSize: 28, marginBottom: 12 }}>{g.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{g.name}</div>
              <div style={{ fontSize: 12, color: '#8B95A1', marginBottom: 12 }}>{g.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: diffColor[g.difficulty], background: `${diffColor[g.difficulty]}15`, padding: '3px 8px', borderRadius: 20 }}>{g.difficulty}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#F5A623' }}>+{g.xp} XP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Full house bar */}
        <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 28px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 24 }}>🏆</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Full House — Complete all 10 for a bonus</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#F5A623' }}>+500 XP · {completed}/10</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
              <div style={{ height: '100%', width: `${completed / 10 * 100}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)', borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 80px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Live Rankings</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Today's Top Players</h2>
          </div>
          <button onClick={() => setPage('leaderboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#F0F0F0', fontWeight: 500, fontSize: 14, padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Full Leaderboard →</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Global', 'My Country', 'Friends'].map(t => (
            <button key={t} onClick={() => setLbTab(t)} style={{
              background: lbTab === t ? 'rgba(245,166,35,0.1)' : 'transparent',
              border: lbTab === t ? '1px solid rgba(245,166,35,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: lbTab === t ? '#F5A623' : '#8B95A1', fontWeight: 600, fontSize: 13,
              padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { ...LEADERBOARD[1], metal: 'silver', color: '#8B95A1', bg: 'rgba(139,149,161,0.06)', border: 'rgba(139,149,161,0.2)' },
            { ...LEADERBOARD[0], metal: 'gold', color: '#F5A623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.25)' },
            { ...LEADERBOARD[2], metal: 'bronze', color: '#CD7F32', bg: 'rgba(205,127,50,0.06)', border: 'rgba(205,127,50,0.2)' },
          ].map((p, i) => (
            <div key={p.rank} style={{
              background: p.bg, border: `1px solid ${p.border}`, borderRadius: 16,
              padding: '32px 24px', textAlign: 'center',
              transform: i === 1 ? 'translateY(-8px)' : 'none',
              boxShadow: i === 1 ? '0 8px 40px rgba(245,166,35,0.15)' : 'none',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: 18, color: '#0D0F14' }}>{p.avatar}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: p.color, marginBottom: 4 }}>#{p.rank}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 12 }}>{p.country}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F0F0F0' }}>{p.xp.toLocaleString()} XP</div>
              <div style={{ fontSize: 13, color: '#F5A623', marginTop: 4 }}>🔥 {p.streak} day streak</div>
            </div>
          ))}
        </div>

        {/* Ranks 4–7 */}
        <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {LEADERBOARD.slice(3).map((p, i) => (
            <div key={p.rank} style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none', gap: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#8B95A1', width: 24 }}>#{p.rank}</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0D0F14' }}>{p.avatar}</div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{p.name} <span style={{ fontSize: 14 }}>{p.country}</span></span>
              <span style={{ fontSize: 14, color: '#F5A623', fontWeight: 700 }}>🔥 {p.streak}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{p.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <LogoMark size={24} />
            <span style={{ fontWeight: 700, fontSize: 18 }}>Crackd<span style={{ color: '#F5A623' }}>.live</span></span>
          </div>
          <div style={{ fontSize: 13, color: '#8B95A1' }}>Crack the puzzle. Beat the clock. Beat the world.</div>
        </div>
        <div style={{ fontSize: 13, color: '#8B95A1' }}>© Crackd.live 2026 · All rights reserved</div>
      </footer>
    </div>
  );
};

Object.assign(window, { HomePage });
