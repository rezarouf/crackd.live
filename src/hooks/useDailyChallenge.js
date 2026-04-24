import { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { GAMES_META, FULL_HOUSE_BONUS } from '../lib/constants.js';

// Shared UTC date string — all comparisons use this format so midnight UTC is the boundary.
function getUtcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Deterministic numeric seed derived from today's UTC date.
// Every user worldwide resolves to the same seed on the same UTC day.
export function getDailySeed(gameId = '') {
  const parts = getUtcDateString().split('-').map(Number); // [YYYY, MM, DD]
  const base = parts[0] * 10000 + parts[1] * 100 + parts[2];
  // Mix in a stable per-game offset so games don't all pick the same puzzle.
  let hash = base;
  for (let i = 0; i < gameId.length; i++) {
    hash = (hash * 31 + gameId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function useDailyChallenge() {
  const { dailyCompletions, isCompletedToday } = useGameStore();

  // Reactive today string — refreshes automatically at midnight UTC.
  const [today, setToday] = useState(() => getUtcDateString());

  useEffect(() => {
    function scheduleReset() {
      const now = new Date();
      const nextMidnightUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // tomorrow at 00:00:00 UTC
      ));
      const msUntilMidnight = nextMidnightUtc - now;
      return setTimeout(() => {
        setToday(getUtcDateString());
      }, msUntilMidnight);
    }
    const timer = scheduleReset();
    return () => clearTimeout(timer);
  }, [today]); // reschedule whenever today flips

  // Whether a game is locked for the rest of today (completed earlier today).
  const isLockedToday = (gameId) => {
    const todayEntries = dailyCompletions[today] || {};
    return !!todayEntries[gameId];
  };

  const completedGames = useMemo(
    () => GAMES_META.filter(g => isCompletedToday(g.id)),
    [dailyCompletions, today]
  );

  const completedCount = completedGames.length;
  const totalGames = GAMES_META.length;
  const isFullHouse = completedCount === totalGames;
  const progressPct = (completedCount / totalGames) * 100;

  const wordGamesCompleted = completedGames.filter(g => g.type === 'word').length;
  const visualGamesCompleted = completedGames.filter(g => g.type === 'visual').length;

  // Consecutive-day streak: counts how many back-to-back UTC days (ending today)
  // had at least one game completed. Each day counts once regardless of how many
  // games were finished that day.
  const dailyStreak = useMemo(() => {
    const sortedDates = Object.keys(dailyCompletions)
      .filter(d => Object.keys(dailyCompletions[d] || {}).length > 0)
      .sort()
      .reverse(); // most recent first

    if (!sortedDates.length) return 0;

    let streak = 0;
    // Start from today; allow today to be either present or absent (game in progress).
    let cursor = new Date(today + 'T00:00:00Z');

    for (const dateStr of sortedDates) {
      const d = new Date(dateStr + 'T00:00:00Z');
      const diffDays = Math.round((cursor - d) / 86_400_000);
      if (diffDays === 0) {
        // Same day as cursor — counts, stay on cursor.
        streak++;
      } else if (diffDays === 1) {
        // Previous consecutive day.
        streak++;
        cursor = d;
      } else {
        // Gap — streak is broken.
        break;
      }
    }
    return streak;
  }, [dailyCompletions, today]);

  const xpEarnedToday = useMemo(() => {
    const todayEntries = dailyCompletions[today] || {};
    return Object.keys(todayEntries).length * 100;
  }, [dailyCompletions, today]);

  const remainingGames = GAMES_META.filter(g => !isCompletedToday(g.id));

  return {
    completedGames,
    completedCount,
    totalGames,
    isFullHouse,
    progressPct,
    wordGamesCompleted,
    visualGamesCompleted,
    overallStreak: dailyStreak,
    dailyStreak,
    xpEarnedToday,
    remainingGames,
    isLockedToday,
    today,
    FULL_HOUSE_BONUS,
  };
}
