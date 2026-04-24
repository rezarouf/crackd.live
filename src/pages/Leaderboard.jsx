import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../store/authStore.js';
import { getLevelInfo } from '../lib/utils.js';
import { Flame } from 'lucide-react';

const PERIODS = ['Today', 'This Week', 'All Time'];

const GAMES = [
  { id: 'all',        label: 'All Games'   },
  { id: 'wordle',     label: 'Wordle'      },
  { id: 'nerdle',     label: 'Nerdle'      },
  { id: 'connections',label: 'Connections' },
  { id: 'sudoku',     label: 'Sudoku'      },
  { id: 'cryptogram', label: 'Cryptogram'  },
];

function periodStart(period) {
  if (period === 'Today') {
    return new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
  }
  if (period === 'This Week') {
    return new Date(Date.now() - 7 * 86_400_000).toISOString();
  }
  return null; // All Time — no filter
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl animate-pulse"
      style={{ background: 'rgba(22,27,37,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="w-8 h-4 rounded bg-white/[0.06] flex-shrink-0" />
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-white/[0.06]" />
        <div className="h-2.5 w-20 rounded bg-white/[0.04]" />
      </div>
      <div className="w-16 h-4 rounded bg-white/[0.06]" />
    </div>
  );
}

// ─── Podium ──────────────────────────────────────────────────────────────────

function Podium({ players }) {
  if (!players[0]) return null;
  const order = [players[1], players[0], players[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-3 mb-12">
      {order.map((p) => {
        const isFirst = p.rank === 1;
        const level   = getLevelInfo(p.xp);
        const podiumH = isFirst ? 'h-28' : p.rank === 2 ? 'h-20' : 'h-14';
        const medal   = ['🥇', '🥈', '🥉'][p.rank - 1];

        return (
          <motion.div
            key={p.rank}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (3 - p.rank) * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="rounded-2xl flex items-center justify-center font-black flex-shrink-0"
              style={{
                width:      isFirst ? 64 : 52,
                height:     isFirst ? 64 : 52,
                background: isFirst
                  ? 'linear-gradient(135deg, #F5A623, #FFD166)'
                  : `linear-gradient(135deg, ${level.color}80, ${level.color}40)`,
                boxShadow:  isFirst ? '0 0 28px rgba(245,166,35,0.4)' : 'none',
                fontSize:   isFirst ? 22 : 16,
                color:      isFirst ? '#0D0F14' : level.color,
              }}
            >
              {p.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="text-center">
              <p className={`font-black text-text ${isFirst ? 'text-base' : 'text-sm'}`}>{p.username}</p>
              <p className="text-xs text-muted font-mono">{p.xp.toLocaleString()} XP</p>
            </div>

            <div
              className={`w-24 ${podiumH} rounded-t-xl flex items-center justify-center text-2xl`}
              style={{
                background:   isFirst
                  ? 'linear-gradient(180deg, rgba(245,166,35,0.2) 0%, rgba(245,166,35,0.06) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border:       `1px solid ${isFirst ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderBottom: 'none',
              }}
            >
              {medal}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function PlayerRow({ player, index, isCurrentUser }) {
  const level = getLevelInfo(player.xp);
  const isTop3 = player.rank <= 3;

  const baseBorder = isCurrentUser
    ? 'rgba(74,158,255,0.35)'
    : isTop3
    ? 'rgba(245,166,35,0.12)'
    : 'rgba(255,255,255,0.05)';

  const baseBg = isCurrentUser
    ? 'rgba(74,158,255,0.07)'
    : isTop3
    ? 'rgba(245,166,35,0.04)'
    : 'rgba(22,27,37,0.8)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-[border-color] duration-150"
      style={{ background: baseBg, borderColor: baseBorder }}
      onMouseEnter={e  => { e.currentTarget.style.borderColor = isCurrentUser ? 'rgba(74,158,255,0.55)' : 'rgba(255,255,255,0.12)'; }}
      onMouseLeave={e  => { e.currentTarget.style.borderColor = baseBorder; }}
    >
      <span className="w-8 text-center flex-shrink-0">
        {player.rank <= 3
          ? <span className="text-lg">{['🥇','🥈','🥉'][player.rank - 1]}</span>
          : <span className="text-sm font-black text-muted/50">#{player.rank}</span>
        }
      </span>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
        style={{ background: `${level.color}18`, color: level.color, border: `1px solid ${level.color}30` }}
      >
        {player.username.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-sm text-text truncate">{player.username}</p>
          {isCurrentUser && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ color: '#4A9EFF', background: 'rgba(74,158,255,0.12)' }}>You</span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden sm:block"
            style={{ color: level.color, background: `${level.color}15` }}>{level.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{player.country}</span>
          <span className="text-muted/30 text-xs">·</span>
          <span className="text-xs text-muted flex items-center gap-0.5"><Flame size={10} /> {player.streak}d</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-black text-amber tabular-nums">{player.xp.toLocaleString()}</p>
        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">XP</p>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ game, period }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🏆</div>
      <p className="font-black text-lg text-text mb-1">No scores yet</p>
      <p className="text-sm text-muted">
        Be the first on the {game === 'all' ? '' : GAMES.find(g => g.id === game)?.label + ' '}
        leaderboard for {period.toLowerCase()}!
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { user }             = useAuthStore();
  const [period, setPeriod]  = useState('All Time');
  const [game, setGame]      = useState('all');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]    = useState(null);

  useEffect(() => { loadLeaderboard(); }, [period, game]);

  async function loadLeaderboard() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('leaderboard_entries')
        .select('user_id, username, xp, streak, country, game_type')
        .order('xp', { ascending: false })
        .limit(50);

      // Time period filter
      const since = periodStart(period);
      if (since) query = query.gte('created_at', since);

      // Game filter
      if (game !== 'all') query = query.eq('game_type', game);

      const { data, error: qErr } = await query;
      if (qErr) throw qErr;

      setPlayers(
        (data || []).map((p, i) => ({
          rank:     i + 1,
          userId:   p.user_id,
          username: p.username || 'Anonymous',
          xp:       p.xp       || 0,
          streak:   p.streak   || 0,
          country:  p.country  || '🌍',
        }))
      );
    } catch (err) {
      setError(err?.message || 'Failed to load leaderboard');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy pt-16 pb-28 relative overflow-x-hidden">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse at right top, #F5A623 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse at left bottom, #4A9EFF 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="pt-12 pb-10 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-eyebrow mb-3">
            Rankings
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}
            className="text-[clamp(36px,7vw,56px)] font-black tracking-[-0.04em] mb-3"
          >
            Global Leaderboard
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
            className="text-muted">Top puzzle solvers from around the world</motion.p>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl border border-white/[0.06] w-fit mx-auto"
          style={{ background: 'rgba(22,27,37,0.8)' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-[color] duration-150
                ${period === p ? 'text-navy' : 'text-muted hover:text-text'}`}
            >
              {period === p && (
                <motion.div layoutId="lb-pill" className="absolute inset-0 bg-amber rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">{p}</span>
            </button>
          ))}
        </div>

        {/* Game filter */}
        <div className="flex gap-2 mb-10 flex-wrap justify-center">
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setGame(g.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-[background-color,border-color,color] duration-150
                ${game === g.id
                  ? 'bg-blue/15 border-blue/40 text-blue'
                  : 'bg-white/[0.03] border-white/[0.06] text-muted hover:text-text hover:border-white/20'
                }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Podium — hidden while loading */}
        {!loading && players.length > 0 && <Podium players={players} />}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-red-400 font-semibold mb-1">Couldn't load leaderboard</p>
            <p className="text-xs text-muted mb-4">{error}</p>
            <button onClick={loadLeaderboard}
              className="text-xs text-amber hover:underline">Try again</button>
          </div>
        ) : players.length === 0 ? (
          <EmptyState game={game} period={period} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`${period}-${game}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-2">
              {players.map((p, i) => (
                <PlayerRow
                  key={`${p.userId}-${p.rank}`}
                  player={p}
                  index={i}
                  isCurrentUser={!!user && p.userId === user.id}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
