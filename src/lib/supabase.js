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
 * Persist a game result and update leaderboard + profile.
 * Resolves the current user internally — passed userId is a fallback only.
 * Never throws; logs all errors to console.
 */
export async function saveGameResult(userIdOrObj, gameType, score, timeSeconds, difficulty, xpEarned, isDaily = false) {
  // Support both calling conventions:
  //   saveGameResult(userId, gameType, score, ...)
  //   saveGameResult({ userId, gameType, score, ... })
  let _userId, _gameType, _score, _timeSeconds, _difficulty, _xpEarned, _isDaily;
  if (userIdOrObj && typeof userIdOrObj === 'object' && !Array.isArray(userIdOrObj)) {
    ({ userId: _userId, gameType: _gameType, score: _score, timeSeconds: _timeSeconds,
       difficulty: _difficulty, xpEarned: _xpEarned, isDaily: _isDaily = false } = userIdOrObj);
  } else {
    _userId = userIdOrObj; _gameType = gameType; _score = score;
    _timeSeconds = timeSeconds; _difficulty = difficulty;
    _xpEarned = xpEarned; _isDaily = isDaily;
  }

  try {
    // ── Resolve current user ────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id || _userId || null;
    if (!uid) {
      console.error('[saveGameResult] No user ID available — aborting save.');
      return { success: false, error: new Error('No user ID') };
    }

    // ── 1. Insert game_results ──────────────────────────────────────────────
    const { error: resultError } = await supabase
      .from('game_results')
      .insert({
        user_id:      uid,
        game_type:    _gameType,
        difficulty:   _difficulty || 'medium',
        score:        _score || 0,
        time_seconds: _timeSeconds || 0,
        xp_earned:    _xpEarned || 0,
        completed:    true,
        is_daily:     _isDaily || false,
        created_at:   new Date().toISOString(),
      });
    if (resultError) {
      console.error('[saveGameResult] game_results insert failed:', resultError.message, resultError);
    }

    // ── 2. Upsert leaderboard_entries ───────────────────────────────────────
    const { error: lbError } = await supabase
      .from('leaderboard_entries')
      .upsert(
        {
          user_id:    uid,
          game_type:  _gameType,
          period:     'all_time',
          score:      _score || 0,
          xp:         _xpEarned || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, game_type, period', ignoreDuplicates: false }
      );
    if (lbError) {
      console.error('[saveGameResult] leaderboard_entries upsert failed:', lbError.message, lbError);
    }

    // ── 3. Update profiles (xp + games_played) ──────────────────────────────
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, games_played')
      .eq('id', uid)
      .single();
    if (fetchError) {
      console.error('[saveGameResult] profiles fetch failed:', fetchError.message, fetchError);
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          xp:           (profile.xp || 0) + (_xpEarned || 0),
          games_played: (profile.games_played || 0) + 1,
        })
        .eq('id', uid);
      if (profileError) {
        console.error('[saveGameResult] profiles update failed:', profileError.message, profileError);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[saveGameResult] Unexpected error:', err);
    return { success: false, error: err };
  }
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
