import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function upsertRows(table, rows, onConflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict, ignoreDuplicates: true });
  if (error) throw error;
}

// ── 1. Connections puzzles ────────────────────────────────────────────────────

try {
  process.stdout.write('Seeding connections... ');
  const { PUZZLES } = await import('../src/games/connections/puzzles.js');
  const rows = PUZZLES.map(p => ({
    title:      p.title,
    categories: JSON.stringify(p.categories),
    difficulty: 'medium',
    is_daily:   true,
    daily_date: null,
  }));
  await upsertRows('connections_puzzles', rows, 'title');
  console.log(`${rows.length} puzzles done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 2. Cryptogram quotes ──────────────────────────────────────────────────────

try {
  process.stdout.write('Seeding cryptogram... ');
  const { QUOTES } = await import('../src/games/cryptogram/quotes.js');
  const rows = QUOTES.map(q => ({
    quote:           q.text,
    author:          q.author,
    category:        q.category,
    difficulty:      q.difficulty,
    encoded_version: null,
    is_daily:        false,
    daily_date:      null,
  }));
  await upsertRows('cryptogram_quotes', rows, 'quote');
  console.log(`${rows.length} quotes done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 3. Achievements ───────────────────────────────────────────────────────────
// useAchievements.js imports React/JSX which can't run in Node.
// We extract the ACHIEVEMENTS constant here directly — it's static data.

try {
  process.stdout.write('Seeding achievements... ');

  // Attempt dynamic import; will likely fail due to JSX deps (Toast.jsx etc.)
  let ACHIEVEMENTS;
  try {
    ({ ACHIEVEMENTS } = await import('../src/hooks/useAchievements.js'));
  } catch {
    // Fallback: inline the known static list from useAchievements.js
    ACHIEVEMENTS = [
      { id: 'first_crack',      name: 'First Crack',      desc: 'Complete your first puzzle',               icon: '🎯' },
      { id: 'daily_devotion',   name: 'Daily Devotion',   desc: 'Maintain a 7-day streak',                  icon: '🔥' },
      { id: 'full_house',       name: 'Full House',        desc: 'Complete all daily challenges in one day', icon: '🏠' },
      { id: 'speed_demon',      name: 'Speed Demon',       desc: 'Solve Sudoku in under 2 minutes',          icon: '⚡' },
      { id: 'no_hints',         name: 'No Hints',          desc: 'Complete Cryptogram without using hints',  icon: '🧠' },
      { id: 'wordsmith',        name: 'Wordsmith',         desc: 'Win Wordle in 2 guesses or fewer',         icon: '📝' },
      { id: 'equation_machine', name: 'Equation Machine',  desc: 'Win Nerdle 10 times',                     icon: '🔢' },
      { id: 'untangler',        name: 'Untangler',         desc: 'Complete Rope Untangle 10 times',          icon: '🪢' },
      { id: 'perfectionist',    name: 'Perfectionist',     desc: 'Complete any game with a perfect score',   icon: '💎' },
      { id: 'legend',           name: 'Legend',            desc: 'Reach Grandmaster level (level 20)',       icon: '👑' },
    ];
  }

  const rows = ACHIEVEMENTS.map(a => ({
    key:         a.id,
    name:        a.name,
    description: a.desc || a.description || '',
    icon:        a.icon,
    xp_reward:   a.xp || 50,
    category:    a.category || 'general',
  }));
  await upsertRows('achievements', rows, 'key');
  console.log(`${rows.length} achievements done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 4. Logo Rush logos ────────────────────────────────────────────────────────

try {
  process.stdout.write('Seeding logos... ');
  const { LOGOS } = await import('../src/games/logoguess/logoData.js');
  const rows = LOGOS.map(logo => ({
    name:      logo.name,
    answer:    logo.answer,
    category:  logo.category,
    image_url: logo.imageUrl,
    aliases:   logo.aliases || [],
  }));
  await upsertRows('logoguess_logos', rows, 'name');
  console.log(`${rows.length} logos done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 5. Wordle words ───────────────────────────────────────────────────────────

try {
  process.stdout.write('Seeding wordle words... ');
  const { ANSWER_WORDS } = await import('../src/games/wordle/wordbank.js');
  const rows = ANSWER_WORDS.map(w => ({ word: w.toLowerCase() }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase
      .from('wordle_words')
      .upsert(rows.slice(i, i + 500), { onConflict: 'word', ignoreDuplicates: true });
    if (error) throw error;
  }
  console.log(`${rows.length} words done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 6. Word Ladder puzzles ────────────────────────────────────────────────────

try {
  process.stdout.write('Seeding word ladder... ');
  const { WORD_LADDER_PUZZLES } = await import('../src/games/wordladder/wordladderData.js');
  const rows = WORD_LADDER_PUZZLES.map(p => ({
    start:    p.start,
    target:   p.end,
    steps:    p.steps,
    solution: p.solution,
  }));
  await upsertRows('wordladder_puzzles', rows, 'start,target');
  console.log(`${rows.length} puzzles done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

// ── 7. Spelling Bee puzzles ───────────────────────────────────────────────────

try {
  process.stdout.write('Seeding spelling bee... ');
  const { SPELLING_BEE_PUZZLES } = await import('../src/games/spellingbee/spellingbeeData.js');
  const rows = SPELLING_BEE_PUZZLES.map(p => ({
    center:  p.center,
    letters: p.letters,
    pangram: p.pangram,
    words:   p.words,
  }));
  for (const row of rows) {
    await supabase.from('spellingbee_data').insert(row);
  }
  console.log(`${rows.length} puzzles done`);
} catch (err) {
  console.log(`❌  ${err.message}`);
}

console.log('\n✅  Seed complete.');
