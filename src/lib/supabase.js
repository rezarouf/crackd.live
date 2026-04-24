import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] Missing environment variables.\n' +
    '  VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING',
    '\n  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗ MISSING',
    '\nAdd them to your .env file and restart the dev server.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'http://localhost:54321',
  supabaseKey  || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Persist a game result row.
 * Returns { data, error }.
 */
export async function saveGameResult(userId, gameType, score, timeSeconds, difficulty, xpEarned) {
  return supabase.from('game_results').insert({
    user_id:      userId,
    game_type:    gameType,
    score,
    time_seconds: timeSeconds,
    difficulty,
    xp_earned:    xpEarned,
    completed:    true,
    created_at:   new Date().toISOString(),
  });
}

/**
 * Fetch leaderboard entries for a game type and time period.
 * period: 'Today' | 'This Week' | 'All Time'
 * Returns { data, error } where data is an array ordered by xp desc.
 */
export async function getLeaderboard(gameType = 'all', period = 'All Time', limit = 50) {
  let query = supabase
    .from('leaderboard_entries')
    .select('user_id, username, xp, streak, country, game_type, created_at')
    .order('xp', { ascending: false })
    .limit(limit);

  if (gameType !== 'all') {
    query = query.eq('game_type', gameType);
  }

  if (period === 'Today') {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    query = query.gte('created_at', start.toISOString());
  } else if (period === 'This Week') {
    query = query.gte('created_at', new Date(Date.now() - 7 * 86_400_000).toISOString());
  }

  return query;
}

/**
 * Fetch a user's profile row.
 * Returns { data, error } where data is the profile object or null.
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

/**
 * Add xpToAdd to the user's current XP total atomically.
 * Falls back to a read-then-write if the RPC isn't available.
 * Returns { data, error }.
 */
export async function updateUserXP(userId, xpToAdd) {
  if (xpToAdd <= 0) return { data: null, error: null };

  // Try a server-side RPC first (avoids race conditions).
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('increment_user_xp', { uid: userId, amount: xpToAdd });

  if (!rpcError) return { data: rpcData, error: null };

  // Fallback: read current XP then write the new total.
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  return supabase
    .from('profiles')
    .update({ xp: (profile.xp || 0) + xpToAdd })
    .eq('id', userId);
}

/**
 * Check whether a user has already completed a game today.
 * date: 'YYYY-MM-DD' UTC string
 * Returns { completed: boolean, error }.
 */
export async function checkDailyCompletion(userId, gameType, date) {
  const { data, error } = await supabase
    .from('daily_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('game_type', gameType)
    .eq('completion_date', date)
    .maybeSingle();

  return { completed: !!data, error };
}

/**
 * Record that a user completed a game on a given UTC date.
 * Silently ignores duplicate inserts (unique constraint on the table).
 * date: 'YYYY-MM-DD' UTC string
 * Returns { data, error }.
 */
export async function saveDailyCompletion(userId, gameType, date) {
  return supabase
    .from('daily_completions')
    .upsert(
      { user_id: userId, game_type: gameType, completion_date: date },
      { onConflict: 'user_id,game_type,completion_date', ignoreDuplicates: true }
    );
}
