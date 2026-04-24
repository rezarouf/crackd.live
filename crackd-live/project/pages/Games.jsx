
const GamesPage = ({ setPage }) => {
  const [filter, setFilter] = React.useState('All');
  const [hoveredGame, setHoveredGame] = React.useState(null);

  const filters = ['All Games', 'Word & Number', 'Visual Puzzles', 'Daily Only'];
  const wordGames = GAMES.filter(g => g.type === 'word');
  const visualGames = GAMES.filter(g => g.type === 'visual');

  const personalBests = {
    wordle: 'Best: 3 guesses', connections: 'Win rate: 84%',
    nerdle: 'Best time: 2:14', cryptogram: 'Best time: 4:32',
    sudoku: 'Best: 12:40', screw: 'Best time: 0:58',
    pin: 'Win rate: 91%', rope: 'Best time: 1:22',
    wood: 'Best: 18 moves', nuts: 'Best time: 0:44',
  };

  const GameCard = ({ game, visual }) => (
    <div
      onClick={() => game.id === 'wordle' ? setPage('wordle') : game.id === 'screw' ? setPage('screw') : null}
      onMouseEnter={() => setHoveredGame(game.id)}
      onMouseLeave={() => setHoveredGame(null)}
      style={{
        background: visual
          ? 'linear-gradient(145deg, #1A2030, #161B25)'
          : '#161B25',
        border: hoveredGame === game.id
          ? '1px solid rgba(245,166,35,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '28px 24px', cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hoveredGame === game.id ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hoveredGame === game.id
          ? '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,166,35,0.15)'
          : '0 4px 16px rgba(0,0,0,0.2)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Visual game texture */}
      {visual && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(74,158,255,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      )}

      {game.done && (
        <div style={{ position: 'absolute', top: 16, right: 16, background: '#22C55E', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>✓ Done</div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{game.icon}</div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>{game.name}</div>
        <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20, lineHeight: 1.5 }}>{game.desc}</div>

        {/* Personal best */}
        <div style={{ fontSize: 12, color: '#4A9EFF', fontWeight: 600, marginBottom: 16 }}>
          📊 {personalBests[game.id]}
        </div>

        {/* Difficulty pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {['Easy', 'Medium', 'Hard', 'Expert'].map(d => (
            <span key={d} style={{
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
              background: d === game.difficulty ? `${diffColor[d]}20` : 'rgba(255,255,255,0.04)',
              color: d === game.difficulty ? diffColor[d] : '#8B95A1',
              border: d === game.difficulty ? `1px solid ${diffColor[d]}40` : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
            }}>{d}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
            <span style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600 }}>Daily Available · +{game.xp} XP</span>
          </div>
          <button style={{
            background: hoveredGame === game.id ? '#F5A623' : 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.3)',
            color: hoveredGame === game.id ? '#0D0F14' : '#F5A623',
            fontWeight: 700, fontSize: 13, padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
            transition: 'all 0.2s',
          }}>Play Now</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0D0F14', minHeight: '100vh', color: '#F0F0F0', fontFamily: 'Inter, sans-serif', paddingTop: 90 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>All Games</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px' }}>Game Lobby</h1>
          <p style={{ fontSize: 17, color: '#8B95A1', margin: 0 }}>10 daily challenges across word, number, and visual puzzle genres.</p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 60, padding: '6px', background: '#161B25', borderRadius: 12, width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'rgba(245,166,35,0.15)' : 'transparent',
              border: filter === f ? '1px solid rgba(245,166,35,0.3)' : '1px solid transparent',
              color: filter === f ? '#F5A623' : '#8B95A1', fontWeight: 600, fontSize: 14,
              padding: '9px 22px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
            }}>{f}</button>
          ))}
        </div>

        {/* Word & Number */}
        {(filter === 'All Games' || filter === 'Word & Number' || filter === 'Daily Only') && (
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Word & Number Games</h2>
              <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 13, color: '#8B95A1', fontWeight: 600 }}>5 games</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {wordGames.map(g => <GameCard key={g.id} game={g} visual={false} />)}
            </div>
          </div>
        )}

        {/* Visual Puzzles */}
        {(filter === 'All Games' || filter === 'Visual Puzzles' || filter === 'Daily Only') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Visual Puzzle Games</h2>
              <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 13, color: '#8B95A1', fontWeight: 600 }}>5 games</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {visualGames.map(g => <GameCard key={g.id} game={g} visual={true} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { GamesPage });
