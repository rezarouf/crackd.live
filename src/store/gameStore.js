import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase.js';
import { getTodaySeed } from '../lib/utils.js';

const DIFFICULTY_MULTIPLIERS = {
  easy: 1,   Easy: 1,
  medium: 1.5, Medium: 1.5,
  hard: 2,   Hard: 2,
  expert: 3, Expert: 3,
};

function getStreakBonus(streak) {
  if (streak >= 30) return 0.50;
  if (streak >= 7)  return 0.25;
  if (streak >= 3)  return 0.10;
  return 0;
}

export function xpToLevel(totalXp) {
  // Level 1 at 0 XP; each level requires progressively more XP.
  return Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1;
}

export function calcXPWithMultipliers(baseXp, difficulty, streak = 0) {
  const diffMult   = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1;
  const streakMult = 1 + getStreakBonus(streak);
  return Math.round(baseXp * diffMult * streakMult);
}

// Returns diff in whole UTC days between two 'YYYY-MM-DD' strings.
function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + 'T00:00:00Z');
  const b = new Date(dateStrB + 'T00:00:00Z');
  return Math.round((b - a) / 86_400_000);
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Daily completion tracking
      dailyCompletions: {},    // { 'YYYY-MM-DD': { wordle: true, ... } }

      // Per-game consecutive-day streaks
      streaks: {},             // { gameId: number }
      lastStreakDates: {},     // { gameId: 'YYYY-MM-DD' }

      // Cross-game daily streak (any game completed each day)
      overallStreak: 0,
      lastOverallStreakDate: null,

      // XP & level (persisted to localStorage)
      totalXp: 0,
      level: 1,

      getTodayCompletions() {
        const today = getTodaySeed();
        return get().dailyCompletions[today] || {};
      },

      isCompletedToday(gameId) {
        const today = getTodaySeed();
        return !!(get().dailyCompletions[today]?.[gameId]);
      },

      markComplete(gameId) {
        const today = getTodaySeed();
        const current = get().dailyCompletions[today] || {};
        // Guard: do not mark twice in the same day.
        if (current[gameId]) return;
        set(state => ({
          dailyCompletions: {
            ...state.dailyCompletions,
            [today]: { ...current, [gameId]: true },
          },
        }));
        get()._updateGameStreak(gameId, today);
        get()._updateOverallStreak(today);
      },

      // Increment per-game streak only once per UTC day.
      _updateGameStreak(gameId, today) {
        const state       = get();
        const lastDate    = state.lastStreakDates[gameId] || null;
        const current     = state.streaks[gameId] || 0;

        if (lastDate === today) return; // already counted today

        const diff     = lastDate ? daysBetween(lastDate, today) : null;
        const newStreak = diff === 1 ? current + 1 : 1; // consecutive → +1, gap → reset

        set(s => ({
          streaks:         { ...s.streaks,         [gameId]: newStreak },
          lastStreakDates: { ...s.lastStreakDates,  [gameId]: today    },
        }));
      },

      // Increment overall daily streak only once per UTC day.
      _updateOverallStreak(today) {
        const state    = get();
        const lastDate = state.lastOverallStreakDate;

        if (lastDate === today) return; // already counted today

        const diff      = lastDate ? daysBetween(lastDate, today) : null;
        const newStreak = diff === 1 ? state.overallStreak + 1 : 1;

        set({ overallStreak: newStreak, lastOverallStreakDate: today });
      },

      getCompletedCount() {
        return Object.keys(get().getTodayCompletions()).length;
      },

      // Add XP with difficulty and streak multipliers, update level.
      addXp(baseXp, difficulty, gameId) {
        const state  = get();
        const streak = Math.max(
          state.streaks[gameId] || 0,
          state.overallStreak   || 0,
        );
        const earned  = calcXPWithMultipliers(baseXp, difficulty, streak);
        const totalXp = state.totalXp + earned;
        set({ totalXp, level: xpToLevel(totalXp) });
        return earned;
      },

      // Sync result to Supabase and apply XP locally.
      submitResult: async ({ userId, gameId, difficulty, score, timeSeconds, xpEarned, completed }) => {
        // Apply multipliers locally (store) so localStorage is always up to date.
        if (xpEarned > 0) get().addXp(xpEarned, difficulty, gameId);

        if (!userId) return;
        await supabase.from('game_results').insert({
          user_id:      userId,
          game_type:    gameId,
          difficulty,
          score,
          time_seconds: timeSeconds,
          xp_earned:    xpEarned,
          completed,
        });
        if (xpEarned > 0) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single();
          if (profile) {
            const multiplied = calcXPWithMultipliers(xpEarned, difficulty,
              Math.max(
                get().streaks[gameId] || 0,
                get().overallStreak   || 0,
              ));
            await supabase
              .from('profiles')
              .update({ xp: profile.xp + multiplied })
              .eq('id', userId);
          }
        }
      },
    }),
    {
      name: 'crackd-game-store',
      partialize: (state) => ({
        dailyCompletions:     state.dailyCompletions,
        streaks:              state.streaks,
        lastStreakDates:      state.lastStreakDates,
        overallStreak:        state.overallStreak,
        lastOverallStreakDate: state.lastOverallStreakDate,
        totalXp:              state.totalXp,
        level:                state.level,
      }),
    }
  )
);
