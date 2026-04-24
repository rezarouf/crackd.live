import LogoMark from '../components/LogoMark.jsx';
import { GAMES, ALL_PLAYERS, DIFF_COLOR } from '../constants.js';

function MobileFrame({ label, children }) {
  return (
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
        <div style={{ height: 580, overflowY: 'auto', overflowX: 'hidden' }}>{children}</div>
        <div style={{ background: '#0A0C10', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B95A1', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function MobileHome() {
  const completed = GAMES.filter(g => g.done).length;
  return (
    <div style={{ background: '#0D0F14', minHeight: '100%', fontFamily: 'Inter, sans-serif', color: '#F0F0F0' }}>
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
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ fontSize: 10, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Daily · April 21</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Today's Challenges</h2>
        <p style={{ fontSize: 12, color: '#8B95A1', margin: '0 0 16px' }}>{completed} of 10 complete · +500 XP bonus available</p>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 20 }}>
          <div style={{ height: '100%', width: `${completed / 10 * 100}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)', borderRadius: 4 }} />
        </div>
      </div>
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
              <div style={{ fontSize: 11, color: DIFF_COLOR[g.difficulty] }}>{g.difficulty} · +{g.xp} XP</div>
            </div>
            {g.done
              ? <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</div>
              : <div style={{ fontSize: 12, fontWeight: 700, color: '#F5A623', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '4px 10px' }}>Play</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileWordle() {
  const rows = [
    { letters: ['C','R','A','N','E'], states: ['correct','absent','correct','absent','present'] },
    { letters: ['C','H','A','R','K'], states: ['correct','absent','correct','present','correct'] },
    { letters: ['C','R','A','C','K'], states: ['correct','correct','correct','correct','correct'] },
    null, null, null,
  ];
  const tileStyles = {
    correct: { bg: '#F5A623', border: '#F5A623', color: '#0D0F14' },
    present: { bg: '#4A9EFF', border: '#4A9EFF', color: '#fff' },
    absent:  { bg: '#2A2F3A', border: '#2A2F3A', color: '#8B95A1' },
    empty:   { bg: 'transparent', border: 'rgba(255,255,255,0.1)', color: '#F0F0F0' },
  };
  return (
    <div style={{ background: '#0D0F14', minHeight: '100%', fontFamily: 'Inter, sans-serif', color: '#F0F0F0', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>Wordle</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#8B95A1', fontFamily: 'JetBrains Mono, monospace' }}>TIME</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#4A9EFF' }}>01:37</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#8B95A1' }}>STREAK</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F5A623' }}>🔥 23</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, alignItems: 'center' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, ci) => {
              const state = row?.states[ci] || 'empty';
              const tc = tileStyles[state];
              return (
                <div key={ci} style={{ width: 46, height: 46, borderRadius: 8, background: tc.bg, border: `2px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: tc.color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {row?.letters[ci] || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#F5A623', marginBottom: 4 }}>🎉 Brilliant!</div>
        <div style={{ fontSize: 12, color: '#8B95A1' }}>The word was <strong style={{ color: '#F0F0F0' }}>CRACK</strong> · 3/6 guesses · +100 XP</div>
      </div>
    </div>
  );
}

function MobileLeaderboard() {
  return (
    <div style={{ background: '#0D0F14', minHeight: '100%', fontFamily: 'Inter, sans-serif', color: '#F0F0F0', padding: '16px' }}>
      <div style={{ fontSize: 10, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Rankings</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 20px' }}>Leaderboard</h2>
      {/* Podium (compact) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[ALL_PLAYERS[1], ALL_PLAYERS[0], ALL_PLAYERS[2]].map((p, i) => {
          const colors = ['#8B95A1', '#F5A623', '#CD7F32'];
          const c = colors[i];
          return (
            <div key={p.rank} style={{ background: '#161B25', border: `1px solid ${c}30`, borderRadius: 12, padding: '12px 8px', textAlign: 'center', transform: i === 1 ? 'translateY(-6px)' : 'none' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontWeight: 900, fontSize: 11, color: '#0D0F14' }}>{p.avatar}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{p.name.slice(0, 8)}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: c }}>{(p.xp / 1000).toFixed(1)}k</div>
            </div>
          );
        })}
      </div>
      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ALL_PLAYERS.slice(3).map((p) => (
          <div key={p.rank} style={{ background: p.isMe ? 'rgba(245,166,35,0.06)' : '#161B25', border: p.isMe ? '1px solid rgba(245,166,35,0.2)' : '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8B95A1', width: 20 }}>#{p.rank}</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.isMe ? '#F5A623' : '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#0D0F14' }}>{p.avatar}</div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: p.isMe ? '#F5A623' : '#F0F0F0' }}>{p.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{p.xp.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MobilePage() {
  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 60px' }}>
        <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Mobile</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 48px' }}>Mobile Screens</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, alignItems: 'start' }}>
          <MobileFrame label="Home · Daily Hub"><MobileHome /></MobileFrame>
          <MobileFrame label="Wordle · In-Game"><MobileWordle /></MobileFrame>
          <MobileFrame label="Leaderboard"><MobileLeaderboard /></MobileFrame>
        </div>
      </div>
    </div>
  );
}
