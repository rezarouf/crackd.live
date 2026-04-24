
const MobilePage = () => {
  const [activeScreen, setActiveScreen] = React.useState(0);
  const screens = ['Home · Daily Hub', 'Wordle · In-Game', 'Leaderboard'];

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 60px' }}>
        <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Mobile</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 48px' }}>Mobile Screens</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, alignItems: 'start' }}>
          {/* Mobile 1: Home */}
          <MobileFrame label="Home · Daily Hub" screenIdx={0}>
            <MobileHome />
          </MobileFrame>

          {/* Mobile 2: Wordle */}
          <MobileFrame label="Wordle · In-Game" screenIdx={1}>
            <MobileWordle />
          </MobileFrame>

          {/* Mobile 3: Leaderboard */}
          <MobileFrame label="Leaderboard" screenIdx={2}>
            <MobileLeaderboard />
          </MobileFrame>
        </div>
      </div>
    </div>
  );
};

const MobileFrame = ({ label, children, screenIdx }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
    <div style={{
      width: 320, background: '#0A0C10',
      borderRadius: 44, border: '2px solid rgba(255,255,255,0.12)',
      overflow: 'hidden', position: 'relative',
      boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      {/* Notch */}
      <div style={{ background: '#000', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 120, height: 28, background: '#000', borderRadius: '0 0 20px 20px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#1A1A1A', margin: '8px auto 0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px 20px', alignItems: 'center', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#F0F0F0' }}>9:41</span>
          <span style={{ fontSize: 11, color: '#F0F0F0' }}>●●●● 5G 🔋</span>
        </div>
      </div>
      {/* Screen content */}
      <div style={{ height: 580, overflowY: 'auto', overflowX: 'hidden' }}>{children}</div>
      {/* Home indicator */}
      <div style={{ background: '#0A0C10', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
      </div>
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#8B95A1', textAlign: 'center' }}>{label}</div>
  </div>
);

const MobileHome = () => (
  <div style={{ background: '#0D0F14', minHeight: '100%', fontFamily: 'Inter, sans-serif', color: '#F0F0F0' }}>
    {/* Nav */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <LogoMark size={20} />
        <span style={{ fontWeight: 800, fontSize: 15 }}>Crackd<span style={{ color: '#F5A623' }}>.live</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F5A623' }}>23</span>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #F5A623, #FFD166)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#0D0F14' }}>ME</div>
      </div>
    </div>
    {/* Hero */}
    <div style={{ padding: '24px 16px 16px' }}>
      <div style={{ fontSize: 10, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Daily · April 21</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Today's Challenges</h2>
      <p style={{ fontSize: 12, color: '#8B95A1', margin: '0 0 16px' }}>3 of 10 complete · +500 XP bonus available</p>
      {/* Progress */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 20 }}>
        <div style={{ height: '100%', width: '30%', background: 'linear-gradient(90deg, #F5A623, #FFD166)', borderRadius: 4 }} />
      </div>
    </div>
    {/* Game cards (scrollable) */}
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {GAMES.map(g => (
        <div key={g.id} style={{
          background: g.done ? 'rgba(34,197,94,0.05)' : '#161B25',
          border: g.done ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>{g.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</div>
            <div style={{ fontSize: 11, color: diffColor[g.difficulty] }}>{g.difficulty} · +{g.xp} XP</div>
          </div>
          {g.done
            ? <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</span></div>
            : <div style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', background: 'rgba(245,166,35,0.1)', padding: '4px 10px', borderRadius: 8 }}>Play</div>
          }
        </div>
      ))}
    </div>
    <div style={{ height: 20 }} />
  </div>
);

const MobileWordle = () => {
  const guesses = [
    { letters: ['C','R','A','N','E'], states: ['correct','absent','correct','absent','present'] },
    { letters: ['C','H','A','R','K'], states: ['correct','absent','correct','present','correct'] },
    { letters: [], states: [] },
    { letters: [], states: [] },
    { letters: [], states: [] },
    { letters: [], states: [] },
  ];
  const kbRows = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['↵','Z','X','C','V','B','N','M','⌫']];
  const letterStates = { C:'correct', R:'absent', A:'correct', N:'absent', E:'present', H:'absent', K:'correct' };
  return (
    <div style={{ background: '#0D0F14', fontFamily: 'Inter, sans-serif', color: '#F0F0F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 11, color: '#8B95A1' }}>←</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Wordle</div>
          <div style={{ fontSize: 10, color: '#F5A623', fontWeight: 600 }}>Daily · Apr 21</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#4A9EFF' }}>01:37</div>
      </div>
      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0' }}>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: 5 }).map((_, col) => {
              const g = guesses[row];
              const state = g.states[col];
              const tc = state ? TILE_COLORS[state] : TILE_COLORS.empty;
              return (
                <div key={col} style={{ width: 44, height: 44, borderRadius: 7, background: tc.bg, border: `2px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: tc.color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {g.letters[col] || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Keyboard */}
      <div style={{ padding: '0 4px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {kbRows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            {row.map(key => {
              const state = letterStates[key];
              const tc = state ? TILE_COLORS[state] : null;
              return (
                <div key={key} style={{ flex: key.length > 1 ? 1.5 : 1, height: 36, background: tc ? tc.bg : 'rgba(255,255,255,0.08)', border: `1px solid ${tc ? tc.border : 'rgba(255,255,255,0.1)'}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: key.length > 1 ? 10 : 13, fontWeight: 700, color: tc ? tc.color : '#F0F0F0', cursor: 'pointer' }}>{key}</div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileLeaderboard = () => (
  <div style={{ background: '#0D0F14', fontFamily: 'Inter, sans-serif', color: '#F0F0F0' }}>
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 10, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Rankings</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Leaderboard</h2>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#161B25', borderRadius: 10, padding: 4 }}>
        {['Global','Country','Friends'].map((t, i) => (
          <div key={t} style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: 7, background: i === 0 ? 'rgba(245,166,35,0.15)' : 'transparent', fontSize: 12, fontWeight: 600, color: i === 0 ? '#F5A623' : '#8B95A1', cursor: 'pointer' }}>{t}</div>
        ))}
      </div>
    </div>
    {/* Top 3 compact */}
    <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
      {[ALL_PLAYERS[1], ALL_PLAYERS[0], ALL_PLAYERS[2]].map((p, i) => (
        <div key={p.rank} style={{ flex: 1, background: '#161B25', border: `1px solid ${['rgba(139,149,161,0.2)','rgba(245,166,35,0.25)','rgba(205,127,50,0.2)'][i]}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center', transform: i === 1 ? 'translateY(-4px)' : 'none' }}>
          <div style={{ fontSize: 18 }}>{['🥈','🥇','🥉'][i]}</div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: ['#8B95A1','#F5A623','#CD7F32'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px auto 4px', fontSize: 11, fontWeight: 800, color: '#0D0F14' }}>{p.avatar}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F0F0F0' }}>{p.name.slice(0,8)}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: ['#8B95A1','#F5A623','#CD7F32'][i] }}>{(p.xp/1000).toFixed(1)}k</div>
        </div>
      ))}
    </div>
    {/* List */}
    <div style={{ padding: '0 16px' }}>
      {ALL_PLAYERS.slice(3).map((p, i) => (
        <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: p.isMe ? 'rgba(245,166,35,0.04)' : 'transparent', borderLeft: p.isMe ? '3px solid #F5A623' : '3px solid transparent', paddingLeft: p.isMe ? 8 : 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#8B95A1', width: 20 }}>#{p.rank}</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.isMe ? '#F5A623' : '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0D0F14' }}>{p.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: p.isMe ? '#F5A623' : '#F0F0F0' }}>{p.name}</div>
            <div style={{ fontSize: 10, color: '#8B95A1' }}>🔥 {p.streak} · {p.country}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{p.xp.toLocaleString()}</div>
        </div>
      ))}
    </div>
  </div>
);

Object.assign(window, { MobilePage });
