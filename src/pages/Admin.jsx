/*
  ── Supabase SQL — run once in the SQL editor ──────────────────────────────────

  CREATE TABLE IF NOT EXISTS wordle_words (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    word        TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS wordladder_words (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    word        TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS spellingbee_words (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    word        TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS connections_words (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    word        TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS cryptogram_phrases (
    id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    phrase      TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  -- Seed defaults (run once):
  -- INSERT INTO site_config (key, value) VALUES
  --   ('maintenance_mode', 'false'),
  --   ('featured_game', 'wordle')
  -- ON CONFLICT DO NOTHING;

  CREATE TABLE IF NOT EXISTS logoguess_logos (
    id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    name       TEXT        NOT NULL,
    answer     TEXT        NOT NULL UNIQUE,
    category   TEXT        NOT NULL,
    image_url  TEXT        NOT NULL,
    aliases    TEXT[]      DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS: allow service_role full access; authenticated admins read/write
  ALTER TABLE wordle_words      ENABLE ROW LEVEL SECURITY;
  ALTER TABLE wordladder_words  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE spellingbee_words ENABLE ROW LEVEL SECURITY;
  ALTER TABLE connections_words ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cryptogram_phrases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE logoguess_logos   ENABLE ROW LEVEL SECURITY;

  ──────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase.js';
import { toast } from '../components/ui/Toast.jsx';

const TABS = ['Dashboard', 'Word Library', 'Logo Rush', 'Connections Puzzles', 'Cryptogram Quotes', 'Users'];

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

const GAME_OPTIONS = [
  'wordle','connections','nerdle','cryptogram','sudoku','spellingbee',
  'wordladder','screw','pinpull','rope','woodblock','nutsbolts',
  'watersort','tilerotation','flow','minesweeper','twentyfortyeight',
  'merge','emojiphrase','nonogram','logoguess',
];

function Dashboard() {
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({
    dau: 0, todayGames: 0, mostPlayed: '—',
    totalUsers: 0, totalGames: 0, weekActiveUsers: 0,
    topPlayers: [], recentActivity: [],
  });
  const [config, setConfig]         = useState({ maintenance_mode: 'false', featured_game: 'wordle' });
  const [configLoading, setConfigLoading] = useState(true);
  const [savingConfig, setSavingConfig]   = useState(false);

  useEffect(() => { loadStats(); loadConfig(); }, []);

  async function loadConfig() {
    setConfigLoading(true);
    const { data } = await supabase.from('site_config').select('key, value');
    if (data) {
      const map = {};
      data.forEach(r => { map[r.key] = r.value; });
      setConfig(prev => ({ ...prev, ...map }));
    }
    setConfigLoading(false);
  }

  async function saveConfig(key, value) {
    setSavingConfig(true);
    await supabase.from('site_config').upsert({ key, value });
    setSavingConfig(false);
    setConfig(prev => ({ ...prev, [key]: value }));
    toast.success('Saved!');
  }

  async function loadStats() {
    setLoading(true);
    try {
      const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const weekStart  = new Date(Date.now() - 7 * 86_400_000).toISOString();

      const [
        { data: todayRows },
        { count: totalUsers },
        { count: totalGames },
        { data: weekRows },
        { data: recentRows },
      ] = await Promise.all([
        supabase.from('game_results').select('user_id, game_type').gte('created_at', todayStart),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('game_results').select('id', { count: 'exact', head: true }),
        supabase.from('game_results').select('user_id, xp_earned').gte('created_at', weekStart),
        supabase.from('game_results')
          .select('id, user_id, game_type, score, xp_earned, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const dau       = new Set((todayRows || []).map(r => r.user_id)).size;
      const todayGames = todayRows?.length ?? 0;
      const weekActiveUsers = new Set((weekRows || []).map(r => r.user_id)).size;

      const gameCounts = {};
      (todayRows || []).forEach(r => {
        gameCounts[r.game_type] = (gameCounts[r.game_type] || 0) + 1;
      });
      const mostPlayedEntry = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0];
      const mostPlayed = mostPlayedEntry ? `${mostPlayedEntry[0]} (${mostPlayedEntry[1]}×)` : '—';

      // Top 10 by total XP — pull profiles sorted by xp
      const { data: topProfiles } = await supabase
        .from('profiles')
        .select('id, username, xp, streak_current, created_at')
        .order('xp', { ascending: false })
        .limit(10);

      // Games played per user (week) for top players
      const userGameCount = {};
      (weekRows || []).forEach(r => {
        userGameCount[r.user_id] = (userGameCount[r.user_id] || 0) + 1;
      });

      const topPlayers = (topProfiles || []).map((p, i) => ({
        rank: i + 1,
        id: p.id,
        username: p.username || 'Anonymous',
        totalXp: p.xp ?? 0,
        gamesThisWeek: userGameCount[p.id] ?? 0,
        joinedAt: p.created_at,
      }));

      // Enrich recent activity with usernames
      const activityUserIds = [...new Set((recentRows || []).map(r => r.user_id))];
      let usernameMap = {};
      if (activityUserIds.length) {
        const { data: actProfiles } = await supabase
          .from('profiles').select('id, username').in('id', activityUserIds);
        (actProfiles || []).forEach(p => { usernameMap[p.id] = p.username || 'Anonymous'; });
      }
      const recentActivity = (recentRows || []).map(r => ({
        ...r,
        username: usernameMap[r.user_id] || 'Anonymous',
      }));

      setStats({ dau, todayGames, mostPlayed, totalUsers: totalUsers ?? 0,
        totalGames: totalGames ?? 0, weekActiveUsers, topPlayers, recentActivity });
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

      {/* Stats grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Today</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Users"          value={stats.totalUsers.toLocaleString()}     color="#A855F7" loading={loading} />
          <StatCard label="Games Played Today"   value={stats.todayGames.toLocaleString()}     color="#4A9EFF" loading={loading} />
          <StatCard label="Most Played Today"    value={stats.mostPlayed}                      color="#22C55E" loading={loading} />
          <StatCard label="Active (7 days)"      value={stats.weekActiveUsers.toLocaleString()} color="#F5A623" loading={loading} />
        </div>
      </div>

      {/* Top players table */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Top Players</p>
        <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[32px_1fr_80px_80px_90px] gap-3 px-4 py-2 border-b border-white/[0.06] text-xs font-bold text-muted uppercase tracking-wider">
            <span>#</span><span>Username</span><span>Total XP</span><span>Wk Games</span><span>Joined</span>
          </div>
          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-4 py-3">
                  <div className="h-4 w-6 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats.topPlayers.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No players yet</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {stats.topPlayers.map(p => (
                <div key={p.id} className="grid grid-cols-[32px_1fr_80px_80px_90px] gap-3 px-4 py-2.5 items-center text-sm">
                  <span className="font-black text-xs text-center"
                    style={{ color: p.rank === 1 ? '#F5A623' : p.rank === 2 ? '#8B95A1' : p.rank === 3 ? '#CD7F32' : '#4A5568' }}>
                    {p.rank}
                  </span>
                  <span className="font-semibold text-text truncate">{p.username}</span>
                  <span className="text-amber font-mono text-xs font-bold">{p.totalXp.toLocaleString()}</span>
                  <span className="text-muted text-xs font-mono">{p.gamesThisWeek}</span>
                  <span className="text-muted text-xs">{new Date(p.joinedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Site controls */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Site Controls</p>
        <div className="bg-surface border border-white/[0.06] rounded-xl p-5 space-y-5">
          {configLoading ? (
            <div className="h-6 w-48 rounded bg-white/[0.06] animate-pulse" />
          ) : (
            <>
              {/* Maintenance mode */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text">Maintenance Mode</p>
                  <p className="text-xs text-muted mt-0.5">Locks all game routes and shows a maintenance message</p>
                </div>
                <button
                  onClick={() => saveConfig('maintenance_mode', config.maintenance_mode === 'true' ? 'false' : 'true')}
                  disabled={savingConfig}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${config.maintenance_mode === 'true' ? 'bg-red' : 'bg-white/[0.12]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${config.maintenance_mode === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Featured game */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text">Featured Game</p>
                  <p className="text-xs text-muted mt-0.5">Highlighted on the homepage hero section</p>
                </div>
                <select
                  value={config.featured_game}
                  onChange={e => saveConfig('featured_game', e.target.value)}
                  disabled={savingConfig}
                  className="input text-sm w-44 flex-shrink-0"
                >
                  {GAME_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent activity feed */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Recent Activity</p>
        <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted text-sm">Loading…</div>
          ) : stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No recent activity</div>
          ) : (
            <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
              {stats.recentActivity.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-text w-28 truncate flex-shrink-0">{r.username}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] text-muted font-mono flex-shrink-0">{r.game_type}</span>
                  {r.score != null && (
                    <span className="text-xs text-muted font-mono flex-shrink-0">score {r.score}</span>
                  )}
                  <span className="text-xs text-amber font-mono flex-shrink-0">+{r.xp_earned ?? 0} XP</span>
                  <span className="text-xs text-muted ml-auto flex-shrink-0">
                    {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={loadStats} className="text-xs text-muted hover:text-text transition-colors duration-150">
        ↺ Refresh
      </button>
    </motion.div>
  );
}

// ─── Connections editor ───────────────────────────────────────────────────────

const COLOR_DOT = { yellow: '#EAB308', green: '#22C55E', blue: '#4A9EFF', purple: '#A855F7' };

const BLANK_CATEGORIES = [
  { name: '', color: 'yellow', words: ['', '', '', ''] },
  { name: '', color: 'green',  words: ['', '', '', ''] },
  { name: '', color: 'blue',   words: ['', '', '', ''] },
  { name: '', color: 'purple', words: ['', '', '', ''] },
];

function ConnectionsEditor() {
  const [puzzles, setPuzzles]     = useState([]);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState({
    date: new Date().toISOString().slice(0, 10),
    categories: BLANK_CATEGORIES.map(c => ({ ...c, words: [...c.words] })),
  });

  useEffect(() => { loadPuzzles(); }, []);

  async function loadPuzzles() {
    const { data } = await supabase.from('connections_puzzles').select('*').order('date', { ascending: false });
    setPuzzles(data || []);
  }

  function startEdit(puzzle) {
    setEditingId(puzzle.id);
    setForm({ date: puzzle.date, categories: puzzle.categories.map(c => ({ ...c, words: [...c.words] })) });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      categories: BLANK_CATEGORIES.map(c => ({ ...c, words: [...c.words] })),
    });
  }

  async function savePuzzle() {
    for (const cat of form.categories) {
      if (!cat.name.trim()) { toast.error(`Fill in the ${cat.color} category name`); return; }
      if (cat.words.some(w => !w.trim())) { toast.error(`Fill in all words for ${cat.color}`); return; }
    }
    setSaving(true);
    const payload = { date: form.date, categories: form.categories };
    let error;
    if (editingId) {
      ({ error } = await supabase.from('connections_puzzles').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('connections_puzzles').insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success(editingId ? 'Puzzle updated!' : 'Puzzle saved!');
    await loadPuzzles();
    if (editingId) {
      cancelEdit();
    } else {
      setForm(prev => ({
        date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
        categories: prev.categories.map(c => ({ ...c, name: '', words: ['', '', '', ''] })),
      }));
    }
  }

  async function deletePuzzle(id) {
    const { error } = await supabase.from('connections_puzzles').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    if (editingId === id) cancelEdit();
    setPuzzles(prev => prev.filter(p => p.id !== id));
  }

  function updateCat(ci, field, value) {
    setForm(prev => {
      const cats = [...prev.categories];
      cats[ci] = { ...cats[ci], [field]: value };
      return { ...prev, categories: cats };
    });
  }

  function updateWord(ci, wi, value) {
    setForm(prev => {
      const cats = [...prev.categories];
      const words = [...cats[ci].words];
      words[wi] = value.toUpperCase();
      cats[ci] = { ...cats[ci], words };
      return { ...prev, categories: cats };
    });
  }

  return (
    <div className="space-y-6">

      {/* Saved puzzles list */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-muted">Saved Puzzles ({puzzles.length})</h4>
        {puzzles.length === 0 && <p className="text-xs text-muted">No puzzles saved yet.</p>}
        <div className="max-h-64 overflow-y-auto space-y-1.5">
          {puzzles.map(p => (
            <div key={p.id}
              className={`flex items-center gap-3 bg-surface border rounded-xl px-4 py-3 ${editingId === p.id ? 'border-amber/40' : 'border-white/[0.06]'}`}
            >
              <span className="font-mono text-sm text-amber flex-shrink-0">{p.date}</span>
              <div className="flex gap-2 flex-1 min-w-0 flex-wrap">
                {p.categories?.map((c, i) => (
                  <span key={i} className="text-xs" style={{ color: COLOR_DOT[c.color] + 'cc' }}>
                    {c.name || '—'}
                  </span>
                ))}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => editingId === p.id ? cancelEdit() : startEdit(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] text-muted hover:text-text transition-colors duration-150"
                >
                  {editingId === p.id ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => deletePuzzle(p.id)}
                  className="text-xs px-2.5 py-1 rounded-lg text-red/50 hover:text-red hover:bg-red/10 transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit form */}
      <div>
        <h3 className="font-bold text-base mb-4">{editingId ? 'Edit Puzzle' : 'Add New Puzzle'}</h3>
        <div className="bg-surface border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Puzzle Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="input w-full"
            />
          </div>

          {form.categories.map((cat, ci) => (
            <div key={ci} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_DOT[cat.color] }} />
                <input
                  placeholder={`${cat.color.charAt(0).toUpperCase() + cat.color.slice(1)} — category name`}
                  value={cat.name}
                  onChange={e => updateCat(ci, 'name', e.target.value)}
                  className="input flex-1 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {cat.words.map((word, wi) => (
                  <input
                    key={wi}
                    placeholder={`Word ${wi + 1}`}
                    value={word}
                    onChange={e => updateWord(ci, wi, e.target.value)}
                    className="input text-xs font-mono"
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button onClick={savePuzzle} disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving…' : (editingId ? 'Update Puzzle' : 'Save Puzzle')}
            </button>
            {editingId && (
              <button onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cryptogram editor ────────────────────────────────────────────────────────

const CRYPTO_CATEGORIES = ['Inspiration', 'Wisdom', 'Humor', 'History', 'Science', 'Philosophy', 'Literature'];

function CryptogramEditor() {
  const [quotes, setQuotes]       = useState([]);
  const [form, setForm]           = useState({ text: '', author: '', difficulty: 'Medium', category: 'Inspiration' });
  const [saving, setSaving]       = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => { loadQuotes(); }, []);

  async function loadQuotes() {
    const { data } = await supabase.from('cryptogram_quotes').select('*').order('created_at', { ascending: false }).limit(500);
    setQuotes(data || []);
  }

  async function saveQuote() {
    if (!form.text.trim() || !form.author.trim()) { toast.error('Fill in all fields'); return; }
    setSaving(true);
    const { error } = await supabase.from('cryptogram_quotes').insert({
      text: form.text.toUpperCase(),
      author: form.author,
      difficulty: form.difficulty,
      category: form.category,
    });
    setSaving(false);
    if (error) toast.error('Failed to save');
    else {
      toast.success('Quote saved!');
      setForm({ text: '', author: '', difficulty: 'Medium', category: 'Inspiration' });
      await loadQuotes();
    }
  }

  async function deleteQuote(id) {
    const { error } = await supabase.from('cryptogram_quotes').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setQuotes(prev => prev.filter(q => q.id !== id));
  }

  function parseQuoteCSV(text) {
    return text.split(/[\r\n]+/)
      .map(line => line.trim()).filter(Boolean)
      .map(line => {
        const parts = line.split(/[,;|\t]/);
        const quoteText  = (parts[0] || '').trim();
        const author     = (parts[1] || '').trim();
        const category   = (parts[2] || 'Inspiration').trim();
        const difficulty = (parts[3] || 'Medium').trim();
        if (!quoteText || !author) return null;
        return { text: quoteText.toUpperCase(), author, category, difficulty };
      })
      .filter(Boolean);
  }

  function handleCSVFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed   = parseQuoteCSV(ev.target.result);
      const existing = new Set(quotes.map(q => q.text));
      const newOnes  = parsed.filter(q => !existing.has(q.text));
      setCsvPreview({ all: parsed, newOnes });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function importQuotes() {
    if (!csvPreview?.newOnes?.length) return;
    setImporting(true);
    for (let i = 0; i < csvPreview.newOnes.length; i += 100) {
      const { error } = await supabase.from('cryptogram_quotes').insert(csvPreview.newOnes.slice(i, i + 100));
      if (error) { toast.error(`Import error: ${error.message}`); setImporting(false); return; }
    }
    toast.success(`Imported ${csvPreview.newOnes.length} quotes!`);
    setCsvPreview(null);
    setImporting(false);
    await loadQuotes();
  }

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
            <label className="text-xs text-muted font-medium mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input w-full">
              {CRYPTO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-medium mb-1.5 block">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input w-full">
              {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button onClick={saveQuote} disabled={saving} className="btn btn-primary w-full disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Quote'}
        </button>
      </div>

      {/* Bulk import */}
      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-4">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Bulk Import (CSV)</p>
        <p className="text-xs text-muted leading-relaxed">
          Each row: <span className="text-amber font-mono">text, author, category, difficulty</span>.
          Example: <span className="text-amber font-mono">Life is short, Oscar Wilde, Wisdom, Medium</span>
        </p>
        <label className="btn btn-secondary text-sm cursor-pointer w-fit">
          📂 Choose CSV
          <input type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" />
        </label>
        {csvPreview && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-muted">Parsed: <strong className="text-text">{csvPreview.all.length}</strong></span>
              <span className="text-muted">New: <strong className="text-amber">{csvPreview.newOnes.length}</strong></span>
              <span className="text-muted">Duplicates: <strong className="text-muted/60">{csvPreview.all.length - csvPreview.newOnes.length}</strong></span>
            </div>
            {csvPreview.newOnes.length > 0 ? (
              <div className="bg-navy border border-white/[0.06] rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
                <p className="text-xs text-muted font-bold mb-2">Preview (first 10):</p>
                {csvPreview.newOnes.slice(0, 10).map((q, i) => (
                  <div key={i} className="text-xs text-muted">
                    <span className="text-text font-medium">"{q.text.slice(0, 60)}{q.text.length > 60 ? '…' : ''}"</span>
                    <span className="ml-2">— {q.author}</span>
                  </div>
                ))}
                {csvPreview.newOnes.length > 10 && (
                  <p className="text-xs text-muted">+{csvPreview.newOnes.length - 10} more</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted italic">All quotes already exist.</p>
            )}
            <div className="flex gap-2">
              {csvPreview.newOnes.length > 0 && (
                <button onClick={importQuotes} disabled={importing} className="btn btn-primary text-sm disabled:opacity-40">
                  {importing ? 'Importing…' : `Import ${csvPreview.newOnes.length} Quotes`}
                </button>
              )}
              <button onClick={() => setCsvPreview(null)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Saved list */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-muted">Saved Quotes ({quotes.length})</h4>
        {quotes.length === 0 && <p className="text-xs text-muted">No quotes saved yet.</p>}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {quotes.map(q => (
            <div key={q.id} className="flex items-start gap-3 bg-surface border border-white/[0.06] rounded-xl p-4 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text font-medium mb-1 line-clamp-2">"{q.text}"</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  <span>— {q.author}</span>
                  {q.category && <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">{q.category}</span>}
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">{q.difficulty}</span>
                </div>
              </div>
              <button
                onClick={() => deleteQuote(q.id)}
                className="text-xs text-red/40 hover:text-red group-hover:text-red/60 transition-colors duration-150 flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
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

// ─── Word Library ─────────────────────────────────────────────────────────────

const WORD_GAMES = [
  { id: 'wordle', label: 'Wordle', table: 'wordle_words', field: 'word', hint: '5-letter words' },
];

const LIBRARY_TABS = ['Wordle', 'Word Ladder', 'Spelling Bee'];

function parseWords(text) {
  return [...new Set(
    text.split(/[\r\n,;|\t]+/)
      .map(w => w.trim().toUpperCase().replace(/[^A-Z0-9\s']/g, '').trim())
      .filter(w => w.length >= 2)
  )];
}

// ── Word Library sub-editor: simple word lists ────────────────────────────────
function WordGameEditor({ game }) {
  const [words, setWords]         = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [newWord, setNewWord]     = useState('');
  const [adding, setAdding]       = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => { setSearch(''); setCsvPreview(null); load(); }, [game]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(game.table).select('id, ' + game.field)
      .order(game.field, { ascending: true }).limit(5000);
    setLoading(false);
    if (error) { toast.error('Failed to load'); return; }
    setWords(data || []);
  }

  async function addWord() {
    const val = newWord.trim().toUpperCase();
    if (!val) return;
    setAdding(true);
    const { error } = await supabase.from(game.table).insert({ [game.field]: val });
    setAdding(false);
    if (error) toast.error(error.code === '23505' ? 'Already exists' : error.message);
    else { toast.success('Added!'); setNewWord(''); await load(); }
  }

  async function deleteWord(id) {
    const { error } = await supabase.from(game.table).delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setWords(prev => prev.filter(w => w.id !== id));
  }

  function handleCSVFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseWords(ev.target.result);
      const existing = new Set(words.map(w => w[game.field]));
      setCsvPreview({ all: parsed, newOnes: parsed.filter(w => !existing.has(w)) });
    };
    reader.readAsText(file); e.target.value = '';
  }

  async function importWords() {
    if (!csvPreview?.newOnes?.length) return;
    setImporting(true);
    const rows = csvPreview.newOnes.map(w => ({ [game.field]: w }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from(game.table).insert(rows.slice(i, i + 500));
      if (error) { toast.error(`Import error: ${error.message}`); setImporting(false); return; }
    }
    toast.success(`Imported ${rows.length} words!`);
    setCsvPreview(null); setImporting(false); await load();
  }

  const filtered = words.filter(w => (w[game.field] || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/20 whitespace-nowrap">
          {words.length.toLocaleString()} {game.field}s
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Filter ${game.label} ${game.field}s…`} className="input flex-1 text-sm" />
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-muted text-sm">Loading…</div>
          : filtered.length === 0 ? <div className="p-8 text-center text-muted text-sm">{search ? 'No matches' : `No ${game.field}s yet`}</div>
          : (
            <>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                {filtered.slice(0, 400).map(w => (
                  <div key={w.id} className="flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] group">
                    <span className="text-sm font-mono text-text">{w[game.field]}</span>
                    <button onClick={() => deleteWord(w.id)} className="text-xs text-red/40 hover:text-red group-hover:text-red/60 transition-colors duration-150">✕</button>
                  </div>
                ))}
              </div>
              {filtered.length > 400 && <div className="px-4 py-2 text-xs text-muted text-center border-t border-white/[0.04]">Showing 400 of {filtered.length}</div>}
            </>
          )}
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4">
        <p className="text-xs text-muted font-bold uppercase tracking-wider mb-3">Add {game.field}</p>
        <div className="flex gap-2">
          <input value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder={`Enter a ${game.hint.toLowerCase()}…`} className="input flex-1 text-sm" />
          <button onClick={addWord} disabled={adding || !newWord.trim()} className="btn btn-primary px-5 text-sm disabled:opacity-40">
            {adding ? '…' : 'Add'}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Bulk Import (CSV / TXT)</p>
        <p className="text-xs text-muted">Words separated by commas, newlines, or semicolons. Duplicates skipped.</p>
        <label className="btn btn-secondary text-sm cursor-pointer w-fit">
          📂 Choose File <input type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" />
        </label>
        {csvPreview && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-muted">Parsed: <strong className="text-text">{csvPreview.all.length}</strong></span>
              <span className="text-muted">New: <strong className="text-amber">{csvPreview.newOnes.length}</strong></span>
              <span className="text-muted">Dupes: <strong className="text-muted/60">{csvPreview.all.length - csvPreview.newOnes.length}</strong></span>
            </div>
            {csvPreview.newOnes.length > 0 ? (
              <div className="bg-navy border border-white/[0.06] rounded-xl p-3 max-h-28 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {csvPreview.newOnes.slice(0, 50).map((w, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber/10 text-amber border border-amber/20">{w}</span>
                  ))}
                  {csvPreview.newOnes.length > 50 && <span className="text-xs text-muted self-center">+{csvPreview.newOnes.length - 50} more</span>}
                </div>
              </div>
            ) : <p className="text-xs text-muted italic">All words already exist.</p>}
            <div className="flex gap-2">
              {csvPreview.newOnes.length > 0 && (
                <button onClick={importWords} disabled={importing} className="btn btn-primary text-sm disabled:opacity-40">
                  {importing ? 'Importing…' : `Import ${csvPreview.newOnes.length} Words`}
                </button>
              )}
              <button onClick={() => setCsvPreview(null)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Word Library sub-editor: Word Ladder puzzles ──────────────────────────────
function WordLadderEditor() {
  const [puzzles, setPuzzles]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [form, setForm]         = useState({ start: '', target: '', steps: '', solution: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('wordladder_puzzles').select('*').order('start', { ascending: true }).limit(500);
    setLoading(false);
    if (error) { toast.error('Failed to load'); return; }
    setPuzzles(data || []);
  }

  async function addPuzzle() {
    const { start, target, steps, solution } = form;
    if (!start.trim() || !target.trim() || !steps) return;
    const solArr = solution.trim() ? solution.toUpperCase().split(/[\s,]+/).filter(Boolean) : [];
    setAdding(true);
    const { error } = await supabase.from('wordladder_puzzles').insert({
      start: start.toUpperCase().trim(),
      target: target.toUpperCase().trim(),
      steps: parseInt(steps, 10),
      solution: solArr,
    });
    setAdding(false);
    if (error) toast.error(error.code === '23505' ? 'Already exists' : error.message);
    else { toast.success('Added!'); setForm({ start: '', target: '', steps: '', solution: '' }); await load(); }
  }

  async function deletePuzzle(id) {
    const { error } = await supabase.from('wordladder_puzzles').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setPuzzles(prev => prev.filter(p => p.id !== id));
  }

  function handleCSVFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const existing = new Set(puzzles.map(p => p.start + '>' + p.target));
      const parsed = ev.target.result.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean).map(line => {
        const parts = line.split(',');
        const start  = (parts[0] || '').trim().toUpperCase();
        const target = (parts[1] || '').trim().toUpperCase();
        const steps  = parseInt(parts[2], 10) || 0;
        const sol    = parts[3] ? parts[3].trim().toUpperCase().split(/\s+/).filter(Boolean) : [];
        if (!start || !target) return null;
        return { start, target, steps, solution: sol };
      }).filter(Boolean);
      const newOnes = parsed.filter(p => !existing.has(p.start + '>' + p.target));
      setCsvPreview({ all: parsed, newOnes });
    };
    reader.readAsText(file); e.target.value = '';
  }

  async function importPuzzles() {
    if (!csvPreview?.newOnes?.length) return;
    setImporting(true);
    for (let i = 0; i < csvPreview.newOnes.length; i += 100) {
      const { error } = await supabase.from('wordladder_puzzles').insert(csvPreview.newOnes.slice(i, i + 100));
      if (error) { toast.error(`Import error: ${error.message}`); setImporting(false); return; }
    }
    toast.success(`Imported ${csvPreview.newOnes.length} puzzles!`);
    setCsvPreview(null); setImporting(false); await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/20 whitespace-nowrap">
          {puzzles.length} puzzles
        </span>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-muted text-sm">Loading…</div>
          : puzzles.length === 0 ? <div className="p-8 text-center text-muted text-sm">No puzzles yet — add some below</div>
          : (
            <>
              <div className="grid grid-cols-[1fr_1fr_60px_1fr_36px] gap-3 px-4 py-2 border-b border-white/[0.06] text-xs font-bold text-muted uppercase tracking-wider">
                <span>Start</span><span>Target</span><span>Steps</span><span>Solution</span><span></span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                {puzzles.map(p => (
                  <div key={p.id} className="grid grid-cols-[1fr_1fr_60px_1fr_36px] gap-3 px-4 py-2.5 items-center hover:bg-white/[0.02] group">
                    <span className="text-sm font-mono text-amber">{p.start}</span>
                    <span className="text-sm font-mono text-amber">{p.target}</span>
                    <span className="text-xs text-muted font-mono">{p.steps}</span>
                    <span className="text-xs text-muted font-mono truncate">{Array.isArray(p.solution) ? p.solution.join(' → ') : p.solution}</span>
                    <button onClick={() => deletePuzzle(p.id)} className="text-xs text-red/40 hover:text-red group-hover:text-red/60 transition-colors duration-150 text-center">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Add Puzzle</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Start word</label>
            <input value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
              placeholder="COLD" className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Target word</label>
            <input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              placeholder="WARM" className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Steps</label>
            <input type="number" min="1" value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
              placeholder="4" className="input w-full text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Solution (space-separated)</label>
            <input value={form.solution} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))}
              placeholder="COLD CORD WORD WARD WARM" className="input w-full text-sm font-mono" />
          </div>
        </div>
        <button onClick={addPuzzle} disabled={adding || !form.start.trim() || !form.target.trim() || !form.steps}
          className="btn btn-primary text-sm disabled:opacity-40">
          {adding ? 'Adding…' : 'Add Puzzle'}
        </button>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Bulk Import (CSV)</p>
        <p className="text-xs text-muted">Each row: <span className="text-amber font-mono">start,target,steps,WORD1 WORD2 WORD3</span></p>
        <label className="btn btn-secondary text-sm cursor-pointer w-fit">
          📂 Choose CSV <input type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" />
        </label>
        {csvPreview && (
          <div className="space-y-3">
            <div className="flex gap-4 text-xs">
              <span className="text-muted">Parsed: <strong className="text-text">{csvPreview.all.length}</strong></span>
              <span className="text-muted">New: <strong className="text-amber">{csvPreview.newOnes.length}</strong></span>
              <span className="text-muted">Dupes: <strong className="text-muted/60">{csvPreview.all.length - csvPreview.newOnes.length}</strong></span>
            </div>
            {csvPreview.newOnes.length > 0 ? (
              <div className="bg-navy border border-white/[0.06] rounded-xl p-3 max-h-28 overflow-y-auto space-y-1">
                {csvPreview.newOnes.slice(0, 10).map((p, i) => (
                  <div key={i} className="text-xs font-mono text-amber">{p.start} → {p.target} ({p.steps} steps)</div>
                ))}
                {csvPreview.newOnes.length > 10 && <div className="text-xs text-muted">+{csvPreview.newOnes.length - 10} more</div>}
              </div>
            ) : <p className="text-xs text-muted italic">All puzzles already exist.</p>}
            <div className="flex gap-2">
              {csvPreview.newOnes.length > 0 && (
                <button onClick={importPuzzles} disabled={importing} className="btn btn-primary text-sm disabled:opacity-40">
                  {importing ? 'Importing…' : `Import ${csvPreview.newOnes.length} Puzzles`}
                </button>
              )}
              <button onClick={() => setCsvPreview(null)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Word Library sub-editor: Spelling Bee puzzles ─────────────────────────────
function SpellingBeeEditor() {
  const [puzzles, setPuzzles]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [form, setForm]         = useState({ center: '', letters: '', pangram: '', words: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('spellingbee_data').select('*').order('pangram', { ascending: true }).limit(500);
    setLoading(false);
    if (error) { toast.error('Failed to load'); return; }
    setPuzzles(data || []);
  }

  async function addPuzzle() {
    const { center, letters, pangram, words } = form;
    if (!center.trim() || !letters.trim() || !pangram.trim()) return;
    const lettersArr = letters.toUpperCase().split(/[\s,]+/).filter(Boolean);
    const wordsArr   = words.toUpperCase().split(/[\s,]+/).filter(Boolean);
    setAdding(true);
    const { error } = await supabase.from('spellingbee_data').insert({
      center:  center.toUpperCase().trim().charAt(0),
      letters: lettersArr,
      pangram: pangram.toUpperCase().trim(),
      words:   wordsArr,
    });
    setAdding(false);
    if (error) toast.error(error.code === '23505' ? 'Pangram already exists' : error.message);
    else { toast.success('Added!'); setForm({ center: '', letters: '', pangram: '', words: '' }); await load(); }
  }

  async function deletePuzzle(id) {
    const { error } = await supabase.from('spellingbee_data').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setPuzzles(prev => prev.filter(p => p.id !== id));
  }

  function handleCSVFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const existing = new Set(puzzles.map(p => p.pangram));
      const parsed = ev.target.result.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean).map(line => {
        const parts   = line.split(',');
        const center  = (parts[0] || '').trim().toUpperCase().charAt(0);
        const letters = (parts[1] || '').trim().toUpperCase().split(/\s+/).filter(Boolean);
        const pangram = (parts[2] || '').trim().toUpperCase();
        const words   = (parts[3] || '').trim().toUpperCase().split(/\s+/).filter(Boolean);
        if (!center || !pangram) return null;
        return { center, letters, pangram, words };
      }).filter(Boolean);
      const newOnes = parsed.filter(p => !existing.has(p.pangram));
      setCsvPreview({ all: parsed, newOnes });
    };
    reader.readAsText(file); e.target.value = '';
  }

  async function importPuzzles() {
    if (!csvPreview?.newOnes?.length) return;
    setImporting(true);
    for (const row of csvPreview.newOnes) {
      await supabase.from('spellingbee_data').insert(row);
    }
    toast.success(`Imported ${csvPreview.newOnes.length} puzzles!`);
    setCsvPreview(null); setImporting(false); await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/20 whitespace-nowrap">
          {puzzles.length} puzzles
        </span>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-muted text-sm">Loading…</div>
          : puzzles.length === 0 ? <div className="p-8 text-center text-muted text-sm">No puzzles yet — add some below</div>
          : (
            <>
              <div className="grid grid-cols-[48px_1fr_1fr_36px] gap-3 px-4 py-2 border-b border-white/[0.06] text-xs font-bold text-muted uppercase tracking-wider">
                <span>Center</span><span>Letters</span><span>Pangram</span><span></span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                {puzzles.map(p => (
                  <div key={p.id} className="grid grid-cols-[48px_1fr_1fr_36px] gap-3 px-4 py-2.5 items-center hover:bg-white/[0.02] group">
                    <span className="text-sm font-mono text-amber font-bold">{p.center}</span>
                    <span className="text-xs font-mono text-muted">{Array.isArray(p.letters) ? p.letters.join(' ') : p.letters}</span>
                    <span className="text-xs font-mono text-text">{p.pangram}</span>
                    <button onClick={() => deletePuzzle(p.id)} className="text-xs text-red/40 hover:text-red group-hover:text-red/60 transition-colors duration-150 text-center">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Add Puzzle</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Center letter</label>
            <input value={form.center} onChange={e => setForm(f => ({ ...f, center: e.target.value }))}
              placeholder="T" maxLength={1} className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Outer letters (space-separated)</label>
            <input value={form.letters} onChange={e => setForm(f => ({ ...f, letters: e.target.value }))}
              placeholder="A B C H U N" className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Pangram</label>
            <input value={form.pangram} onChange={e => setForm(f => ({ ...f, pangram: e.target.value }))}
              placeholder="UNHATCHED" className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Valid words (space-separated)</label>
            <input value={form.words} onChange={e => setForm(f => ({ ...f, words: e.target.value }))}
              placeholder="ACHE ACHED CATCH HATCH…" className="input w-full text-sm font-mono" />
          </div>
        </div>
        <button onClick={addPuzzle} disabled={adding || !form.center.trim() || !form.pangram.trim()}
          className="btn btn-primary text-sm disabled:opacity-40">
          {adding ? 'Adding…' : 'Add Puzzle'}
        </button>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-3">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Bulk Import (CSV)</p>
        <p className="text-xs text-muted">Each row: <span className="text-amber font-mono">center, L1 L2 L3 L4 L5 L6, PANGRAM, WORD1 WORD2…</span></p>
        <label className="btn btn-secondary text-sm cursor-pointer w-fit">
          📂 Choose CSV <input type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" />
        </label>
        {csvPreview && (
          <div className="space-y-3">
            <div className="flex gap-4 text-xs">
              <span className="text-muted">Parsed: <strong className="text-text">{csvPreview.all.length}</strong></span>
              <span className="text-muted">New: <strong className="text-amber">{csvPreview.newOnes.length}</strong></span>
              <span className="text-muted">Dupes: <strong className="text-muted/60">{csvPreview.all.length - csvPreview.newOnes.length}</strong></span>
            </div>
            {csvPreview.newOnes.length > 0 ? (
              <div className="bg-navy border border-white/[0.06] rounded-xl p-3 max-h-28 overflow-y-auto space-y-1">
                {csvPreview.newOnes.slice(0, 10).map((p, i) => (
                  <div key={i} className="text-xs font-mono text-amber">{p.center} — {p.pangram}</div>
                ))}
                {csvPreview.newOnes.length > 10 && <div className="text-xs text-muted">+{csvPreview.newOnes.length - 10} more</div>}
              </div>
            ) : <p className="text-xs text-muted italic">All puzzles already exist.</p>}
            <div className="flex gap-2">
              {csvPreview.newOnes.length > 0 && (
                <button onClick={importPuzzles} disabled={importing} className="btn btn-primary text-sm disabled:opacity-40">
                  {importing ? 'Importing…' : `Import ${csvPreview.newOnes.length} Puzzles`}
                </button>
              )}
              <button onClick={() => setCsvPreview(null)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Word Library top-level (tab router) ───────────────────────────────────────
function WordLibrary() {
  const [activeTab, setActiveTab] = useState('Wordle');
  const activeGame = WORD_GAMES.find(g => g.label === activeTab);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex gap-1.5 flex-wrap">
        {LIBRARY_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-[background,color] duration-150
              ${activeTab === tab
                ? 'bg-amber/15 text-amber border border-amber/30'
                : 'text-muted hover:text-text border border-white/[0.08] bg-surface'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeGame  && <WordGameEditor key={activeGame.id} game={activeGame} />}
      {activeTab === 'Word Ladder'  && <WordLadderEditor />}
      {activeTab === 'Spelling Bee' && <SpellingBeeEditor />}
    </motion.div>
  );
}

// ─── Logo Rush Admin ──────────────────────────────────────────────────────────

const LOGO_CATEGORIES = ['Tech', 'Social', 'Productivity', 'Finance', 'Gaming', 'Media', 'Food', 'Fashion', 'Auto', 'Airline', 'Energy', 'Retail'];

function LogoRushAdmin() {
  const [logos, setLogos]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [name, setName]             = useState('');
  const [slug, setSlug]             = useState('');
  const [category, setCategory]     = useState(LOGO_CATEGORIES[0]);
  const [aliases, setAliases]       = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting]   = useState(false);

  useEffect(() => { loadLogos(); }, []);

  async function loadLogos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('logoguess_logos')
      .select('*')
      .order('name', { ascending: true })
      .limit(2000);
    setLoading(false);
    if (error) { toast.error('Failed to load logos'); return; }
    setLogos(data || []);
  }

  async function saveLogo() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    const cleanSlug  = slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const aliasArr   = aliases.split(',').map(a => a.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
    const { error } = await supabase.from('logoguess_logos').insert({
      name:      name.trim(),
      answer:    cleanSlug,
      category,
      image_url: `https://cdn.simpleicons.org/${cleanSlug}`,
      aliases:   aliasArr,
    });
    setSaving(false);
    if (error) {
      toast.error(error.code === '23505' ? 'Slug already exists' : error.message);
    } else {
      toast.success('Logo added!');
      setName(''); setSlug(''); setAliases(''); setPreviewUrl(null);
      await loadLogos();
    }
  }

  async function deleteLogo(id) {
    const { error } = await supabase.from('logoguess_logos').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else setLogos(prev => prev.filter(l => l.id !== id));
  }

  function parseLogoCSV(text) {
    return text.split(/[\r\n]+/)
      .map(line => line.trim()).filter(Boolean)
      .map(line => {
        const parts = line.split(/[,;|\t]/);
        const rawName    = (parts[0] || '').trim();
        const rawSlug    = (parts[1] || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const rawCat     = (parts[2] || 'Tech').trim();
        const rawAliases = (parts[3] || '').split('/').map(a => a.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
        if (!rawName || !rawSlug) return null;
        return { name: rawName, answer: rawSlug, category: rawCat, image_url: `https://cdn.simpleicons.org/${rawSlug}`, aliases: rawAliases };
      })
      .filter(Boolean);
  }

  function handleCSVFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed   = parseLogoCSV(ev.target.result);
      const existing = new Set(logos.map(l => l.answer));
      const newOnes  = parsed.filter(l => !existing.has(l.answer));
      setCsvPreview({ all: parsed, newOnes });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function importLogos() {
    if (!csvPreview?.newOnes?.length) return;
    setImporting(true);
    for (let i = 0; i < csvPreview.newOnes.length; i += 100) {
      const { error } = await supabase.from('logoguess_logos').insert(csvPreview.newOnes.slice(i, i + 100));
      if (error) { toast.error(`Import error: ${error.message}`); setImporting(false); return; }
    }
    toast.success(`Imported ${csvPreview.newOnes.length} logos!`);
    setCsvPreview(null);
    setImporting(false);
    await loadLogos();
  }

  const filtered = logos.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.answer.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Count + search */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/20 whitespace-nowrap">
          {logos.length} logos
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by name, slug, or category…"
          className="input flex-1 text-sm"
        />
      </div>

      {/* Logo grid */}
      <div className="bg-surface border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            {search ? 'No matches' : 'No logos yet — add some below'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[48px_1fr_90px_110px_36px] gap-3 px-4 py-2 border-b border-white/[0.06] text-xs font-bold text-muted uppercase tracking-wider">
              <span>Logo</span><span>Name</span><span>Category</span><span>Slug</span><span></span>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
              {filtered.slice(0, 300).map(logo => (
                <div key={logo.id} className="grid grid-cols-[48px_1fr_90px_110px_36px] gap-3 px-4 py-2 items-center hover:bg-white/[0.02] group">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/[0.04] rounded-lg">
                    <img
                      src={logo.image_url}
                      alt={logo.name}
                      className="w-6 h-6 object-contain"
                      style={{ filter: 'invert(1)' }}
                      onError={e => { e.target.style.opacity = '0.2'; }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{logo.name}</div>
                    {logo.aliases?.length > 0 && (
                      <div className="text-xs text-muted font-mono">{logo.aliases.join(', ')}</div>
                    )}
                  </div>
                  <span className="text-xs text-muted px-2 py-0.5 rounded-md bg-white/[0.04] w-fit">{logo.category}</span>
                  <span className="text-xs font-mono text-amber">{logo.answer}</span>
                  <button
                    onClick={() => deleteLogo(logo.id)}
                    className="text-xs text-red/40 hover:text-red group-hover:text-red/60 transition-colors duration-150 text-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {filtered.length > 300 && (
              <div className="px-4 py-2 text-xs text-muted text-center border-t border-white/[0.04]">
                Showing 300 of {filtered.length} — use search to narrow down
              </div>
            )}
          </>
        )}
      </div>

      {/* Add new logo form */}
      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-4">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Add New Logo</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Brand Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apple" className="input w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Simple Icons Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. apple" className="input w-full text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input w-full text-sm">
              {LOGO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Aliases (comma separated)</label>
            <input value={aliases} onChange={e => setAliases(e.target.value)} placeholder="e.g. fb, facebook" className="input w-full text-sm" />
          </div>
        </div>

        {previewUrl && (
          <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl">
            <div className="w-12 h-12 flex items-center justify-center bg-white/[0.06] rounded-xl">
              <img src={previewUrl} alt="preview" className="w-8 h-8 object-contain" style={{ filter: 'invert(1)' }} onError={e => { e.target.style.opacity = '0.2'; }} />
            </div>
            <div>
              <div className="text-sm font-medium text-text">{name || 'Brand'}</div>
              <div className="text-xs text-muted font-mono break-all">{previewUrl}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setPreviewUrl(slug.trim() ? `https://cdn.simpleicons.org/${slug.trim().toLowerCase()}` : null)}
            disabled={!slug.trim()}
            className="btn btn-secondary text-sm disabled:opacity-40"
          >
            Preview
          </button>
          <button
            onClick={saveLogo}
            disabled={saving || !name.trim() || !slug.trim()}
            className="btn btn-primary text-sm disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Logo'}
          </button>
        </div>
      </div>

      {/* Bulk CSV import */}
      <div className="bg-surface border border-white/[0.06] rounded-xl p-4 space-y-4">
        <p className="text-xs text-muted font-bold uppercase tracking-wider">Bulk Import (CSV)</p>
        <p className="text-xs text-muted leading-relaxed">
          Each row: <span className="text-amber font-mono">name, slug, category, aliases</span> — aliases separated by <span className="text-amber font-mono">/</span>.
          Example: <span className="text-amber font-mono">Apple, apple, Tech,</span>
        </p>
        <label className="btn btn-secondary text-sm cursor-pointer w-fit">
          📂 Choose CSV
          <input type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" />
        </label>

        {csvPreview && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-muted">Parsed: <strong className="text-text">{csvPreview.all.length}</strong></span>
              <span className="text-muted">New: <strong className="text-amber">{csvPreview.newOnes.length}</strong></span>
              <span className="text-muted">Duplicates skipped: <strong className="text-muted/60">{csvPreview.all.length - csvPreview.newOnes.length}</strong></span>
            </div>
            {csvPreview.newOnes.length > 0 ? (
              <div className="bg-navy border border-white/[0.06] rounded-xl p-3 max-h-36 overflow-y-auto">
                <p className="text-xs text-muted mb-2 font-bold">Preview (first 30):</p>
                <div className="flex flex-wrap gap-1.5">
                  {csvPreview.newOnes.slice(0, 30).map((l, i) => (
                    <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber/10 text-amber border border-amber/20">
                      {l.name} ({l.answer})
                    </span>
                  ))}
                  {csvPreview.newOnes.length > 30 && (
                    <span className="text-xs text-muted self-center">+{csvPreview.newOnes.length - 30} more</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted italic">All logos already exist.</p>
            )}
            <div className="flex gap-2">
              {csvPreview.newOnes.length > 0 && (
                <button onClick={importLogos} disabled={importing} className="btn btn-primary text-sm disabled:opacity-40">
                  {importing ? 'Importing…' : `Import ${csvPreview.newOnes.length} Logos`}
                </button>
              )}
              <button onClick={() => setCsvPreview(null)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
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
        {activeTab === 'Word Library'         && <WordLibrary />}
        {activeTab === 'Logo Rush'            && <LogoRushAdmin />}
        {activeTab === 'Connections Puzzles'  && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ConnectionsEditor /></motion.div>}
        {activeTab === 'Cryptogram Quotes'    && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><CryptogramEditor /></motion.div>}
        {activeTab === 'Users'                && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><UsersTable /></motion.div>}
      </div>
    </div>
  );
}
