import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { toast } from '../components/ui/Toast.jsx';
import { GAMES_META } from '../lib/constants.js';

export const ACHIEVEMENTS = [
  { id: 'first_crack',       name: 'First Crack',       desc: 'Complete your first puzzle',                    icon: '🎯' },
  { id: 'daily_devotion',    name: 'Daily Devotion',    desc: 'Maintain a 7-day streak',                       icon: '🔥' },
  { id: 'full_house',        name: 'Full House',        desc: 'Complete all daily challenges in one day',       icon: '🏠' },
  { id: 'speed_demon',       name: 'Speed Demon',       desc: 'Solve Sudoku in under 2 minutes',               icon: '⚡' },
  { id: 'no_hints',          name: 'No Hints',          desc: 'Complete Cryptogram without using hints',        icon: '🧠' },
  { id: 'wordsmith',         name: 'Wordsmith',         desc: 'Win Wordle in 2 guesses or fewer',              icon: '📝' },
  { id: 'equation_machine',  name: 'Equation Machine',  desc: 'Win Nerdle 10 times',                           icon: '🔢' },
  { id: 'untangler',         name: 'Untangler',         desc: 'Complete Rope Untangle 10 times',               icon: '🪢' },
  { id: 'perfectionist',     name: 'Perfectionist',     desc: 'Complete any game with a perfect score',        icon: '💎' },
  { id: 'legend',            name: 'Legend',            desc: 'Reach Grandmaster level (level 20)',             icon: '👑' },
];

// localStorage keys for win-count achievements
const NERDLE_WINS_KEY = 'crackd-nerdle-wins';
const ROPE_WINS_KEY   = 'crackd-rope-wins';

function getCount(key) {
  return parseInt(localStorage.getItem(key) || '0', 10);
}
function incrementCount(key) {
  const next = getCount(key) + 1;
  localStorage.setItem(key, next);
  return next;
}

export function useAchievements() {
  const { user }                                              = useAuthStore();
  const { overallStreak, getCompletedCount, level, streaks } = useGameStore();

  // Persist unlock to Supabase and show toast — idempotent via DB unique check.
  const unlock = useCallback(async (achievementId) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    // Show toast optimistically for guest users too.
    const doToast = () =>
      toast.success(`🏅 Achievement unlocked: ${achievement.name} ${achievement.icon}`, { duration: 5000 });

    if (!user) { doToast(); return; }

    const { data } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (data) return; // already unlocked

    const { error } = await supabase.from('user_achievements').insert({
      user_id:        user.id,
      achievement_id: achievementId,
    });

    if (!error) doToast();
  }, [user]);

  // Passive checks — run whenever store state changes.
  const checkPassive = useCallback(() => {
    // First Crack — at least one game completed today (or ever via streak > 0)
    const completedToday = getCompletedCount();
    const anyStreak      = Object.values(streaks).some(s => s > 0);
    if (completedToday >= 1 || anyStreak) unlock('first_crack');

    // Daily Devotion — 7-day overall streak
    if (overallStreak >= 7) unlock('daily_devotion');

    // Full House — all games completed today
    if (completedToday >= GAMES_META.length) unlock('full_house');

    // Legend — level 20 (Grandmaster)
    if (level >= 20) unlock('legend');
  }, [overallStreak, getCompletedCount, streaks, level, unlock]);

  useEffect(() => {
    checkPassive();
  }, [checkPassive]);

  /**
   * Call this from any game hook after a result is determined.
   *
   * context shape:
   *   gameId       {string}  — 'wordle' | 'sudoku' | 'cryptogram' | 'nerdle' | 'rope' | ...
   *   won          {boolean}
   *   timeSeconds  {number}  — elapsed seconds
   *   hintsUsed    {number}  — hints consumed
   *   score        {number}  — game's own score metric
   *   maxScore     {number|undefined} — maximum possible score for this run
   *   guessesUsed  {number|undefined} — for guess-based games
   */
  const check = useCallback((context = {}) => {
    const { gameId, won, timeSeconds, hintsUsed, score, maxScore, guessesUsed } = context;

    // First Crack — any completion qualifies
    unlock('first_crack');

    if (!won) return;

    // Speed Demon — Sudoku solved in under 2 minutes
    if (gameId === 'sudoku' && timeSeconds < 120) {
      unlock('speed_demon');
    }

    // No Hints — Cryptogram completed without hints
    if (gameId === 'cryptogram' && hintsUsed === 0) {
      unlock('no_hints');
    }

    // Wordsmith — Wordle won in ≤ 2 guesses
    // useWordle submits score = MAX_GUESSES - rowIdx; rowIdx=1 → 2 guesses → score=5
    if (gameId === 'wordle') {
      const guesses = guessesUsed ?? (6 - score + 1);
      if (guesses <= 2) unlock('wordsmith');
    }

    // Equation Machine — Nerdle won 10 times (cumulative, localStorage)
    if (gameId === 'nerdle') {
      const wins = incrementCount(NERDLE_WINS_KEY);
      if (wins >= 10) unlock('equation_machine');
    }

    // Untangler — Rope Untangle completed 10 times
    if (gameId === 'rope') {
      const wins = incrementCount(ROPE_WINS_KEY);
      if (wins >= 10) unlock('untangler');
    }

    // Perfectionist — any game with a perfect / max score
    if (maxScore !== undefined && score !== undefined && score >= maxScore) {
      unlock('perfectionist');
    }
  }, [unlock]);

  return { unlock, check, ACHIEVEMENTS };
}
