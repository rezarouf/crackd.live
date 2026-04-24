
const ALL_PLAYERS = [
  { rank:1, name:'xCipherKing', country:'🇺🇸', xp:9840, streak:94, winRate:96, speed:'1:12', avatar:'CK', color:'#F5A623' },
  { rank:2, name:'PuzzlrPro', country:'🇬🇧', xp:9210, streak:67, winRate:91, speed:'1:28', avatar:'PP', color:'#8B95A1' },
  { rank:3, name:'GridMaster9', country:'🇩🇪', xp:8755, streak:51, winRate:88, speed:'1:44', avatar:'GM', color:'#CD7F32' },
  { rank:4, name:'SolveQueen', country:'🇫🇷', xp:8100, streak:44, winRate:85, speed:'1:51', avatar:'SQ', color:'#4A9EFF' },
  { rank:5, name:'CrackdDaily', country:'🇨🇦', xp:7890, streak:38, winRate:82, speed:'2:02', avatar:'CD', color:'#4A9EFF' },
  { rank:6, name:'WordWitch', country:'🇦🇺', xp:7440, streak:29, winRate:79, speed:'2:10', avatar:'WW', color:'#4A9EFF' },
  { rank:7, name:'NumberNinja', country:'🇯🇵', xp:7210, streak:22, winRate:76, speed:'2:18', avatar:'NN', color:'#4A9EFF' },
  { rank:8, name:'TileBreaker', country:'🇧🇷', xp:6980, streak:19, winRate:74, speed:'2:25', avatar:'TB', color:'#4A9EFF' },
  { rank:9, name:'CryptoKing', country:'🇮🇳', xp:6710, streak:15, winRate:71, speed:'2:33', avatar:'CK', color:'#4A9EFF' },
  { rank:10, name:'PuzzleGod', country:'🇰🇷', xp:6490, streak:11, winRate:69, speed:'2:41', avatar:'PG', color:'#4A9EFF' },
  { rank:247, name:'You', country:'🇺🇸', xp:4200, streak:23, winRate:61, speed:'3:14', avatar:'ME', color:'#F5A623', isMe: true },
];

const LeaderboardPage = ({ setPage }) => {
  const [gameFilter, setGameFilter] = React.useState('All Games');
  const [timeFilter, setTimeFilter] = React.useState('Today');
  const [metricFilter, setMetricFilter] = React.useState('XP');
  const [tabFilter, setTabFilter] = React.useState('Global');

  const gameFilters = ['All Games','Wordle','Connections','Nerdle','Cryptogram','Sudoku','Visual'];
  const timeFilters = ['Today','This Week','This Month','All Time'];
  const metricFilters = ['XP','Win Rate','Streak','Speed'];
  const tabs = ['Global','My Country','Friends'];

  const topThree = [
    { ...ALL_PLAYERS[1], podiumRank: 2, metal: 'silver', color: '#8B95A1', glow: 'rgba(139,149,161,0.15)' },
    { ...ALL_PLAYERS[0], podiumRank: 1, metal: 'gold', color: '#F5A623', glow: 'rgba(245,166,35,0.25)' },
    { ...ALL_PLAYERS[2], podiumRank: 3, metal: 'bronze', color: '#CD7F32', glow: 'rgba(205,127,50,0.15)' },
  ];

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Rankings</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px' }}>Leaderboard</h1>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          {/* Game filter */}
          <div style={{ display: 'flex', gap: 4, background: '#161B25', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            {gameFilters.map(f => (
              <button key={f} onClick={() => setGameFilter(f)} style={{
                background: gameFilter === f ? 'rgba(245,166,35,0.15)' : 'transparent',
                border: gameFilter === f ? '1px solid rgba(245,166,35,0.3)' : '1px solid transparent',
                color: gameFilter === f ? '#F5A623' : '#8B95A1', fontWeight: 600, fontSize: 12,
                padding: '7px 14px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
          {/* Time filter */}
          <div style={{ display: 'flex', gap: 4, background: '#161B25', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            {timeFilters.map(f => (
              <button key={f} onClick={() => setTimeFilter(f)} style={{
                background: timeFilter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', color: timeFilter === f ? '#F0F0F0' : '#8B95A1', fontWeight: 600, fontSize: 13,
                padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
          {/* Metric filter */}
          <div style={{ display: 'flex', gap: 4, background: '#161B25', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            {metricFilters.map(f => (
              <button key={f} onClick={() => setMetricFilter(f)} style={{
                background: metricFilter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', color: metricFilter === f ? '#F0F0F0' : '#8B95A1', fontWeight: 600, fontSize: 13,
                padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
          {/* Tab */}
          <div style={{ display: 'flex', gap: 4, background: '#161B25', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            {tabs.map(f => (
              <button key={f} onClick={() => setTabFilter(f)} style={{
                background: tabFilter === f ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', color: tabFilter === f ? '#F0F0F0' : '#8B95A1', fontWeight: 600, fontSize: 13,
                padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          {topThree.map((p, i) => (
            <div key={p.rank} style={{
              background: `linear-gradient(145deg, rgba(22,27,37,1), rgba(13,15,20,1))`,
              border: `1px solid ${p.color}30`,
              borderRadius: 20, padding: '36px 24px', textAlign: 'center',
              transform: i === 1 ? 'translateY(-12px)' : 'none',
              boxShadow: `0 8px 40px ${p.glow}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
              <div style={{ fontSize: 36, marginBottom: 4 }}>{p.podiumRank === 1 ? '🥇' : p.podiumRank === 2 ? '🥈' : '🥉'}</div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 900, fontSize: 20, color: '#0D0F14', boxShadow: `0 0 24px ${p.color}60` }}>{p.avatar}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 15, marginBottom: 16 }}>{p.country}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: p.color, marginBottom: 4 }}>{p.xp.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600 }}>XP · 🔥 {p.streak} streak</div>
            </div>
          ))}
        </div>

        {/* Full ranked table */}
        <div style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px 56px 1fr 80px 80px 80px 80px', gap: 0, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            {['#','','Player','XP','Win %','Streak','Speed'].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#8B95A1', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i > 2 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {ALL_PLAYERS.map((p, i) => (
            <div key={p.rank} style={{
              display: 'grid', gridTemplateColumns: '56px 56px 1fr 80px 80px 80px 80px', gap: 0,
              padding: '14px 24px',
              background: p.isMe ? 'rgba(245,166,35,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              borderLeft: p.isMe ? '3px solid #F5A623' : '3px solid transparent',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: p.rank <= 3 ? ['#F5A623','#8B95A1','#CD7F32'][p.rank-1] : '#8B95A1' }}>#{p.rank}</div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.isMe ? '#F5A623' : '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#0D0F14' }}>{p.avatar}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: p.isMe ? '#F5A623' : '#F0F0F0' }}>{p.name} {p.isMe && <span style={{ fontSize: 11, background: 'rgba(245,166,35,0.15)', color: '#F5A623', padding: '2px 8px', borderRadius: 10, marginLeft: 6 }}>You</span>}</div>
                <div style={{ fontSize: 12, color: '#8B95A1' }}>{p.country}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700 }}>{p.xp.toLocaleString()}</div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{p.winRate}%</div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#F5A623' }}>🔥 {p.streak}</div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#8B95A1', fontFamily: 'JetBrains Mono, monospace' }}>{p.speed}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LeaderboardPage });
