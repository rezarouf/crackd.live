
const ACHIEVEMENTS = [
  { id:1, name:'First Crack', desc:'Complete your first puzzle', icon:'🔓', unlocked:true },
  { id:2, name:'Wordsmith', desc:'Win Wordle in 2 guesses', icon:'✍️', unlocked:true },
  { id:3, name:'On Fire', desc:'Reach a 7-day streak', icon:'🔥', unlocked:true },
  { id:4, name:'Speed Demon', desc:'Solve Wordle in under 1 min', icon:'⚡', unlocked:true },
  { id:5, name:'Full House', desc:'Complete all 10 daily challenges', icon:'🏠', unlocked:true },
  { id:6, name:'Grandmaster', desc:'Reach 5,000 XP', icon:'👑', unlocked:false },
  { id:7, name:'Polymath', desc:'Win every game type in one day', icon:'🎓', unlocked:false },
  { id:8, name:'Century', desc:'Reach a 100-day streak', icon:'💯', unlocked:false },
  { id:9, name:'Unbreakable', desc:'50 days no mistakes in Wordle', icon:'🛡️', unlocked:false },
  { id:10, name:'Crackd Elite', desc:'Top 10 global ranking', icon:'🏆', unlocked:false },
  { id:11, name:'The Oracle', desc:'Guess Wordle on first try', icon:'🔮', unlocked:false },
  { id:12, name:'Untangler', desc:'Complete all visual puzzles', icon:'🪢', unlocked:false },
];

const RECENT_ACTIVITY = [
  { game:'Wordle', result:'Won', guesses:'3/6', xp:'+100', time:'2 hrs ago', icon:'🔤' },
  { game:'Connections', result:'Won', guesses:'1 mistake', xp:'+120', time:'2 hrs ago', icon:'🔗' },
  { game:'Screw Puzzle', result:'Won', guesses:'8 moves', xp:'+90', time:'3 hrs ago', icon:'🔩' },
  { game:'Nerdle', result:'Lost', guesses:'6/6', xp:'+0', time:'Yesterday', icon:'🔢' },
  { game:'Sudoku', result:'Won', guesses:'12:40', xp:'+110', time:'Yesterday', icon:'🔳' },
];

const PER_GAME = [
  { game:'Wordle', icon:'🔤', plays:284, wins:241, winRate:85, best:'2 guesses', avg:'3.4 guesses' },
  { game:'Connections', icon:'🔗', plays:201, wins:178, winRate:89, best:'No mistakes', avg:'1.2 mistakes' },
  { game:'Nerdle', icon:'🔢', plays:156, wins:119, winRate:76, best:'2 guesses', avg:'3.8 guesses' },
  { game:'Sudoku', icon:'🔳', plays:143, wins:130, winRate:91, best:'8:22', avg:'12:40' },
  { game:'Screw Puzzle', icon:'🔩', plays:312, wins:298, winRate:96, best:'0:44', avg:'1:18' },
];

const ProfilePage = ({ setPage }) => {
  const [expandedGame, setExpandedGame] = React.useState(null);
  const xp = 4200, nextXp = 5000, level = 12;

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 48px' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 48, background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '36px 40px' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #F5A623, #FFD166)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#0D0F14', flexShrink: 0, boxShadow: '0 0 30px rgba(245,166,35,0.4)' }}>ME</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>CrackdPlayer</h1>
              <span style={{ fontSize: 12, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#F5A623', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>Mastermind</span>
            </div>
            <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20 }}>Member since January 2026 · 🇺🇸 United States</div>
            {/* XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Level {level} · Mastermind</span>
                <span style={{ fontSize: 13, color: '#8B95A1' }}>{xp.toLocaleString()} / {nextXp.toLocaleString()} XP to Grandmaster</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
                <div style={{ height: '100%', width: `${xp/nextXp*100}%`, background: 'linear-gradient(90deg, #F5A623, #FFD166)', borderRadius: 6 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Total Games', value: '1,096', icon: '🎮' },
            { label: 'Win Rate', value: '84%', icon: '🎯', color: '#22C55E' },
            { label: 'Current Streak', value: '23 days', icon: '🔥', color: '#F5A623' },
            { label: 'Longest Streak', value: '41 days', icon: '📈', color: '#F5A623' },
            { label: 'Global Rank', value: '#247', icon: '🌍', color: '#4A9EFF' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color || '#F0F0F0', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two columns: achievements + activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 48 }}>
          {/* Achievements */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Achievements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} style={{
                  background: a.unlocked ? 'rgba(245,166,35,0.05)' : '#161B25',
                  border: a.unlocked ? '1px solid rgba(245,166,35,0.2)' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 12, padding: '16px 12px', textAlign: 'center',
                  opacity: a.unlocked ? 1 : 0.45,
                  filter: a.unlocked ? 'none' : 'grayscale(1)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: a.unlocked ? '#F0F0F0' : '#8B95A1' }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: '#8B95A1', lineHeight: 1.4 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{a.game}</div>
                    <div style={{ fontSize: 12, color: '#8B95A1' }}>{a.guesses} · {a.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: a.result === 'Won' ? '#22C55E' : '#EF4444' }}>{a.result}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>{a.xp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-game stats accordion */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Game Statistics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PER_GAME.map(g => (
              <div key={g.game} style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                <div onClick={() => setExpandedGame(expandedGame === g.game ? null : g.game)} style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', cursor: 'pointer', gap: 16 }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{g.game}</span>
                  <span style={{ fontSize: 14, color: '#22C55E', fontWeight: 700 }}>{g.winRate}% WR</span>
                  <span style={{ fontSize: 14, color: '#8B95A1' }}>{g.plays} games</span>
                  <span style={{ color: '#8B95A1', fontSize: 14, transition: 'transform 0.2s', transform: expandedGame === g.game ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                </div>
                {expandedGame === g.game && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 16 }}>
                    {[['Played', g.plays], ['Wins', g.wins], ['Best', g.best], ['Average', g.avg]].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#8B95A1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ProfilePage });
