import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useGameStore } from '../store/gameStore.js';
import { useDailyChallenge } from '../hooks/useDailyChallenge.js';
import { ACHIEVEMENTS } from '../hooks/useAchievements.js';
import { supabase } from '../lib/supabase.js';
import { getLevelInfo, getXpForNextLevel, formatNumber } from '../lib/utils.js';
import { Star, Flame, CalendarDays, Gamepad2, Pencil, Check, X } from 'lucide-react';
import { GAMES_META } from '../lib/constants.js';

function StatCard({ label, value, Icon }) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-2xl p-5 text-center">
      <div className="flex justify-center mb-2"><Icon size={22} className="text-amber" /></div>
      <div className="font-black text-2xl text-amber tracking-tight mb-1">{value}</div>
      <div className="text-xs text-muted font-medium">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, loadProfile }       = useAuthStore();
  const { totalXp, level: storedLevel, streaks, isCompletedToday } = useGameStore();
  const daily                                = useDailyChallenge();

  const [userAchievements, setUserAchievements] = useState([]);
  const [activeTab, setActiveTab]               = useState('Overview');
  const [gamesPlayed, setGamesPlayed]           = useState(null);

  // Edit username state
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput]     = useState('');
  const [savingUsername, setSavingUsername]   = useState(false);
  const [usernameError, setUsernameError]     = useState('');

  // Prefer gameStore totalXp (real-time + localStorage) over stale Supabase profile.xp
  const xp          = totalXp || profile?.xp || 0;
  const level       = getLevelInfo(xp);
  const nextLevelXp = getXpForNextLevel(xp);
  const progressPct = nextLevelXp
    ? Math.min(100, ((xp - (level.min || 0)) / (nextLevelXp - (level.min || 0))) * 100)
    : 100;

  // Use cross-game daily streak from useDailyChallenge
  const streak   = daily.dailyStreak ?? daily.overallStreak ?? 0;
  const username  = profile?.username || user?.email?.split('@')[0] || 'Player';
  const avatarUrl = profile?.avatar_url || null;
  const avatarLetter = username[0]?.toUpperCase() || 'P';

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAchievements();
      loadGamesPlayed();
    }
  }, [user]);

  async function loadAchievements() {
    if (!user) return;
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);
    setUserAchievements(data?.map(a => a.achievement_id) || []);
  }

  async function loadGamesPlayed() {
    if (!user) return;
    const { count } = await supabase
      .from('game_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);
    setGamesPlayed(count ?? 0);
  }

  function startEditUsername() {
    setUsernameInput(username);
    setUsernameError('');
    setEditingUsername(true);
  }

  function cancelEditUsername() {
    setEditingUsername(false);
    setUsernameError('');
  }

  async function saveUsername() {
    const trimmed = usernameInput.trim();
    if (!trimmed) { setUsernameError('Username cannot be empty'); return; }
    if (trimmed.length < 3) { setUsernameError('At least 3 characters'); return; }
    if (trimmed.length > 24) { setUsernameError('Max 24 characters'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setUsernameError('Letters, numbers, underscores only'); return; }

    setSavingUsername(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id);
    setSavingUsername(false);

    if (error) { setUsernameError(error.message); return; }
    await loadProfile();
    setEditingUsername(false);
  }

  const tabs = ['Overview', 'Games', 'Achievements'];

  return (
    <div className="min-h-screen bg-navy pt-20 pb-24 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="bg-surface border border-white/[0.06] rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                style={{ boxShadow: '0 0 24px rgba(245,166,35,0.2)' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-navy flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F5A623, #FFD166)', boxShadow: '0 0 24px rgba(245,166,35,0.3)' }}
              >
                {avatarLetter}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Username row */}
              {editingUsername ? (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      autoFocus
                      value={usernameInput}
                      onChange={e => { setUsernameInput(e.target.value); setUsernameError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') cancelEditUsername(); }}
                      className="bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-text
                        focus:outline-none focus:border-amber/40 transition-[border-color] duration-150 w-full max-w-[200px]"
                      maxLength={24}
                      placeholder="Username"
                    />
                    <button
                      onClick={saveUsername}
                      disabled={savingUsername}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber/15 border border-amber/30 text-amber
                        hover:bg-amber/25 transition-[background-color] duration-150 disabled:opacity-50"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={cancelEditUsername}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-muted
                        hover:text-text transition-[color] duration-150"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {usernameError && <p className="text-xs text-red-400">{usernameError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-black text-xl tracking-snug">{username}</h2>
                  <button
                    onClick={startEditUsername}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted/50 hover:text-amber
                      hover:bg-amber/10 transition-[color,background-color] duration-150"
                    title="Edit username"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: level.color }}>{level.title}</span>
                <span className="text-muted text-xs">·</span>
                <span className="text-muted text-xs font-mono">{formatNumber(xp)} XP</span>
                {streak > 0 && (
                  <>
                    <span className="text-muted text-xs">·</span>
                    <span className="text-xs text-amber font-semibold flex items-center gap-1"><Flame size={11} /> {streak}d streak</span>
                  </>
                )}
              </div>

              {/* XP progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted">
                  <span>{formatNumber(xp)} XP</span>
                  {nextLevelXp && <span>→ {formatNumber(nextLevelXp)} XP</span>}
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total XP"     value={formatNumber(xp)}            Icon={Star}       />
          <StatCard label="Day Streak"   value={`${streak}d`}                Icon={Flame}      />
          <StatCard label="Today"        value={`${daily.completedCount}/${GAMES_META.length}`} Icon={CalendarDays} />
          <StatCard label="Games Played" value={gamesPlayed === null ? '…' : formatNumber(gamesPlayed)} Icon={Gamepad2} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1.5 bg-surface border border-white/[0.06] rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-[background-color,color] duration-150
                ${activeTab === tab
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-muted hover:text-text border border-transparent'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Daily progress */}
            <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Today's Progress</h3>
              <div className="grid grid-cols-5 gap-2">
                {GAMES_META.map(game => {
                  const done = isCompletedToday(game.id);
                  return (
                    <div
                      key={game.id}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center
                        ${done ? 'bg-green/8 border-green/25' : 'bg-surface-2 border-white/[0.06]'}`}
                    >
                      <span className="text-xl">{game.icon}</span>
                      {done && <span className="text-[10px] text-green font-bold">✓</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>{daily.completedCount} of {GAMES_META.length} complete</span>
                  {daily.isFullHouse && <span className="text-amber font-bold">🏠 Full House!</span>}
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${daily.progressPct}%` }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-amber rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Game streaks */}
            <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Game Streaks</h3>
              <div className="space-y-2">
                {GAMES_META.slice(0, 5).map(game => {
                  const gameStreak = streaks[game.id] || 0;
                  return (
                    <div key={game.id} className="flex items-center gap-3">
                      <span className="text-base w-7 text-center">{game.icon || '🎮'}</span>
                      <span className="text-sm text-muted flex-1">{game.name}</span>
                      <div className="flex items-center gap-1">
                        {gameStreak > 0 && <Flame size={11} className="text-amber" />}
                        <span className={`text-sm font-bold ${gameStreak > 0 ? 'text-amber' : 'text-muted/40'}`}>
                          {gameStreak}d
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Games */}
        {activeTab === 'Games' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="space-y-3">
              {GAMES_META.map(game => {
                const gameStreak = streaks[game.id] || 0;
                const done       = isCompletedToday(game.id);
                return (
                  <div key={game.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-base w-7 text-center">{game.icon || '🎮'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text">{game.name}</p>
                      <p className="text-xs text-muted">{game.type === 'word' ? 'Word & Number' : 'Visual Puzzle'}</p>
                    </div>
                    <div className="text-right">
                      {done && <p className="text-xs text-green font-bold mb-0.5">✓ Done</p>}
                      <p className="text-xs text-muted flex items-center gap-1 justify-end">
                        {gameStreak > 0 && <Flame size={10} className="text-amber" />}
                        {gameStreak}d
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab: Achievements */}
        {activeTab === 'Achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-3">
            {ACHIEVEMENTS.map(a => {
              const unlocked = userAchievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-[background-color,border-color,opacity] duration-150
                    ${unlocked
                      ? 'bg-amber/[0.04] border-amber/20'
                      : 'bg-surface border-white/[0.06] opacity-40'
                    }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text">{a.name}</p>
                    <p className="text-xs text-muted">{a.desc}</p>
                  </div>
                  {unlocked && <span className="text-amber text-sm">✓</span>}
                </div>
              );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
}
