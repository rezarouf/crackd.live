import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase.js';
import { toast } from '../components/ui/Toast.jsx';

const TABS = ['Dashboard', 'Connections Puzzles', 'Cryptogram Quotes', 'Users'];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = '#F5A623', loading = false }) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-5">
      {loading ? (
        <div className="h-8 w-20 rounded-lg bg-white/[0.06] animate-pulse mb-2" />
      ) : (
        <div className="font-black text-2xl mb-1" style={{ color }}>{value}</div>
      )}
      <div className="text-xs text-muted font-medium">{label}</div>
      {sub && !loading && <div className="text-xs mt-1" style={{ color: `${color}99` }}>{sub}</div>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dau: 0, todayGames: 0, mostPlayed: '—',
    totalUsers: 0, totalGames: 0, topPlayers: [],
  });

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const weekStart  = new Date(Date.now() - 7 * 86_400_000).toISOString();

      // Fetch today's results (user_id + game_type) for DAU + most-played
      const [
        { data: todayRows },
        { count: totalUsers },
        { count: totalGames },
        { data: weekRows },
      ] = await Promise.all([
        supabase.from('game_results').select('user_id, game_type').gte('created_at', todayStart),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('game_results').select('id', { count: 'exact', head: true }),
        supabase.from('game_results').select('user_id, xp_earned').gte('created_at', weekStart),
      ]);

      // DAU — distinct users who played today
      const dau = new Set((todayRows || []).map(r => r.user_id)).size;

      // Total games played today
      const todayGames = todayRows?.length ?? 0;

      // Most-played game today via client-side group-by
      const gameCounts = {};
      (todayRows || []).forEach(r => {
        gameCounts[r.game_type] = (gameCounts[r.game_type] || 0) + 1;
      });
      const mostPlayedEntry = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0];
      const mostPlayed = mostPlayedEntry
        ? `${mostPlayedEntry[0]} (${mostPlayedEntry[1]}×)`
        : '—';

      // Top 5 by XP earned this week — aggregate client-side then look up profiles
      const userWeekXP = {};
      (weekRows || []).forEach(r => {
        userWeekXP[r.user_id] = (userWeekXP[r.user_id] || 0) + (r.xp_earned || 0);
      });
      const top5ids = Object.entries(userWeekXP)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      let topPlayers = [];
      if (top5ids.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, xp')
          .in('id', top5ids);

        topPlayers = top5ids.map((id, rank) => {
          const p = profiles?.find(p => p.id === id);
          return {
            rank: rank + 1,
            id,
            username: p?.username || 'Anonymous',
            weekXp: userWeekXP[id],
            totalXp: p?.xp ?? 0,
          };
        });
      }

      setStats({
        dau,
        todayGames,
        mostPlayed,
        totalUsers: totalUsers ?? 0,
        totalGames: totalGames ?? 0,
        topPlayers,
      });
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

      {/* Today row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Today</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Daily Active Users"  value={stats.dau.toLocaleString()}       color="#F5A623" loading={loading} />
          <StatCard label="Games Played Today"  value={stats.todayGames.toLocaleString()} color="#4A9EFF" loading={loading} />
          <StatCard label="Most Played Today"   value={stats.mostPlayed}                  color="#22C55E" loading={loading} />
        </div>
      </div>

      {/* All-time row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">All Time</p>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Users"        value={stats.totalUsers.toLocaleString()}  color="#A855F7" loading={loading} />
          <StatCard label="Total Games Played" value={stats.totalGames.toLocaleString()}  color="#8B95A1" loading={loading} />
        </div>
      </div>

      {/* Top 5 this week */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Top 5 Players — This Week</p>
        <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-4 w-4 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-4 w-16 rounded bg-white/[0.06] animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          ) : stats.topPlayers.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No games played this week yet</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {stats.topPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-sm font-black w-5 text-center"
                    style={{ color: p.rank === 1 ? '#F5A623' : p.rank === 2 ? '#8B95A1' : p.rank === 3 ? '#CD7F32' : '#4A5568' }}>
                    {p.rank}
                  </span>
                  <span className="text-sm font-semibold text-text flex-1">{p.username}</span>
                  <span className="text-xs text-muted font-mono">{p.weekXp.toLocaleString()} XP this week</span>
                  <span className="text-xs text-amber font-mono font-bold">{p.totalXp.toLocaleString()} total</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={loadStats}
        className="text-xs text-muted hover:text-text transition-colors duration-150"
      >
        ↺ Refresh
      </button>
    </motion.div>
  );
}

// ─── Connections editor ───────────────────────────────────────────────────────

function ConnectionsEditor() {
  const [puzzles, setPuzzles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newPuzzle, setNewPuzzle] = useState({
    date: new Date().toISOString().slice(0, 10),
    categories: [
      { name: '', color: 'yellow', words: ['', '', '', ''] },
      { name: '', color: 'green',  words: ['', '', '', ''] },
      { name: '', color: 'blue',   words: ['', '', '', ''] },
      { name: '', color: 'purple', words: ['', '', '', ''] },
    ],
  });

  useEffect(() => {
    supabase.from('connections_puzzles').select('*').order('date', { ascending: false }).then(({ data }) => {
      setPuzzles(data || []);
    });
  }, []);

  const savePuzzle = async () => {
    // Validate all fields filled
    for (const cat of newPuzzle.categories) {
      if (!cat.name.trim()) { toast.error(`Fill in the ${cat.color} category name`); return; }
      if (cat.words.some(w => !w.trim())) { toast.error(`Fill in all words for the ${cat.color} category`); return; }
    }

    setSaving(true);
    const { error } = await supabase.from('connections_puzzles').insert({
      date: newPuzzle.date,
      categories: newPuzzle.categories,
    });
    setSaving(false);

    if (error) {
      toast.error(`Failed to save: ${error.message}`);
    } else {
      toast.success('Puzzle saved!');
      // Refresh list and advance date
      const { data } = await supabase.from('connections_puzzles').select('*').order('date', { ascending: false });
      setPuzzles(data || []);
      setNewPuzzle(prev => ({
        ...prev,
        date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
        categories: prev.categories.map(c => ({ ...c, name: '', words: ['', '', '', ''] })),
      }));
    }
  };

  const COLOR_DOT = { yellow: '#EAB308', green: '#22C55E', blue: '#4A9EFF', purple: '#A855F7' };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-base">Add New Connections Puzzle</h3>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-5 space-y-5">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Puzzle Date</label>
          <input
            type="date"
            value={newPuzzle.date}
            onChange={e => setNewPuzzle(p => ({ ...p, date: e.target.value }))}
            className="input w-full"
          />
        </div>

        {newPuzzle.categories.map((cat, ci) => (
          <div key={ci} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLOR_DOT[cat.color] }} />
              <input
                placeholder={`${cat.color.charAt(0).toUpperCase() + cat.color.slice(1)} — category name`}
                value={cat.name}
                onChange={e => {
                  const c = [...newPuzzle.categories];
                  c[ci] = { ...c[ci], name: e.target.value };
                  setNewPuzzle(p => ({ ...p, categories: c }));
                }}
                className="input flex-1 text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {cat.words.map((word, wi) => (
                <input
                  key={wi}
                  placeholder={`Word ${wi + 1}`}
                  value={word}
                  onChange={e => {
                    const c = [...newPuzzle.categories];
                    const words = [...c[ci].words];
                    words[wi] = e.target.value.toUpperCase();
                    c[ci] = { ...c[ci], words };
                    setNewPuzzle(p => ({ ...p, categories: c }));
                  }}
                  className="input text-xs font-mono"
                />
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={savePuzzle}
          disabled={saving}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Puzzle'}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-muted">Saved Puzzles ({puzzles.length})</h4>
        {puzzles.length === 0 && (
          <p className="text-xs text-muted">No puzzles saved yet.</p>
        )}
        {puzzles.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-surface border border-white/[0.06] rounded-xl p-4">
            <span className="font-mono text-sm text-amber flex-shrink-0">{p.date}</span>
            <div className="flex gap-2 flex-1 min-w-0 flex-wrap">
              {p.categories?.map((c, i) => (
                <span key={i} className="text-xs text-muted truncate"
                  style={{ color: COLOR_DOT[c.color] + 'cc' }}>
                  {c.name || '—'}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cryptogram editor ────────────────────────────────────────────────────────

function CryptogramEditor() {
  const [quotes, setQuotes] = useState([]);
  const [form, setForm] = useState({ text: '', author: '', difficulty: 'Medium', category: 'inspiration' });

  useEffect(() => {
    supabase.from('cryptogram_quotes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setQuotes(data || []);
    });
  }, []);

  const saveQuote = async () => {
    if (!form.text.trim() || !form.author.trim()) { toast.error('Fill in all fields'); return; }
    const { error } = await supabase.from('cryptogram_quotes').insert({
      text: form.text.toUpperCase(),
      author: form.author,
      difficulty: form.difficulty,
      category: form.category,
    });
    if (error) toast.error('Failed to save');
    else {
      toast.success('Quote saved!');
      setForm({ text: '', author: '', difficulty: 'Medium', category: 'inspiration' });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-base">Add Cryptogram Quote</h3>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs text-muted font-medium mb-1.5 block">Quote Text (auto-uppercased)</label>
          <textarea
            value={form.text}
            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
            placeholder="Enter the quote..."
            rows={3}
            className="input w-full resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Author</label>
            <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="input w-full" placeholder="Author name" />
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input w-full">
              {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button onClick={saveQuote} className="btn btn-primary w-full">Save Quote</button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-bold text-muted">Saved Quotes ({quotes.length})</h4>
        {quotes.map(q => (
          <div key={q.id} className="bg-surface border border-white/[0.06] rounded-xl p-4">
            <p className="text-sm text-text font-medium mb-1 line-clamp-2">"{q.text}"</p>
            <p className="text-xs text-muted">— {q.author} · {q.difficulty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Users table ──────────────────────────────────────────────────────────────

function UsersTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    supabase.from('profiles').select('id, username, xp, streak_current, created_at')
      .order('xp', { ascending: false }).limit(100)
      .then(({ data }) => setUsers(data || []));
  }, []);

  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="grid grid-cols-4 gap-4 p-3 border-b border-white/[0.06] text-xs font-bold text-muted uppercase tracking-wider">
        <span>Username</span><span>XP</span><span>Streak</span><span>Joined</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {users.map(u => (
          <div key={u.id} className="grid grid-cols-4 gap-4 px-3 py-3 text-sm">
            <span className="font-medium text-text">{u.username || '—'}</span>
            <span className="text-amber font-mono font-bold">{(u.xp || 0).toLocaleString()}</span>
            <span className="text-muted">🔥 {u.streak_current || 0}d</span>
            <span className="text-muted text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {users.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">No users yet</div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-navy pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber mb-2">Admin</p>
          <h1 className="text-3xl font-black tracking-snug">Dashboard</h1>
        </div>

        <div className="flex gap-1 mb-8 p-1.5 bg-surface border border-white/[0.06] rounded-xl w-fit overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-[background-color,color] duration-150
                ${activeTab === tab
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-muted hover:text-text border border-transparent'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Dashboard'            && <Dashboard />}
        {activeTab === 'Connections Puzzles'  && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ConnectionsEditor /></motion.div>}
        {activeTab === 'Cryptogram Quotes'    && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><CryptogramEditor /></motion.div>}
        {activeTab === 'Users'                && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><UsersTable /></motion.div>}
      </div>
    </div>
  );
}
