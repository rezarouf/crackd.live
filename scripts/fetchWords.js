import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function isClean(word) {
  return /^[a-z]+$/.test(word);
}

function getFreq(entry) {
  const tag = (entry.tags || []).find(t => t.startsWith('f:'));
  return tag ? parseFloat(tag.slice(2)) : 0;
}

async function fetchPattern(pattern) {
  const url = `https://api.datamuse.com/words?sp=${pattern}&max=1000&md=f`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Datamuse ${pattern}: HTTP ${res.status}`);
  return res.json();
}

async function upsertBatch(table, rows) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from(table)
      .insert(chunk, { ignoreDuplicates: true });
    if (error) {
      if (error.code === '42P01') return null; // table missing
      console.error(`  insert error (${table}):`, error.message);
    } else {
      inserted += chunk.length;
    }
  }
  return inserted;
}

// ── Section 1 — Wordle (5-letter words) ──────────────────────────────────────

async function fetchWordle() {
  console.log('\n── Wordle Words ─────────────────────────────────────────');

  const PATTERNS = [
    '?????',
    'a????', 'b????', 'c????', 'd????', 'e????',
    'f????', 'g????', 'h????', 'i????', 'l????',
    'm????', 'p????', 'r????', 's????', 't????', 'w????',
  ];

  const seen = new Set();
  let fetched = 0;

  for (const pat of PATTERNS) {
    process.stdout.write(`  Fetching ${pat} ... `);
    try {
      const data = await fetchPattern(pat);
      let added = 0;
      for (const entry of data) {
        const w = entry.word.toLowerCase();
        if (w.length === 5 && isClean(w) && getFreq(entry) > 1 && !seen.has(w)) {
          seen.add(w);
          added++;
        }
      }
      fetched += added;
      console.log(`${data.length} raw → ${added} kept (total ${seen.size})`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 120)); // be polite to the API
  }

  const rows = [...seen].map(w => ({ word: w }));
  console.log(`  Upserting ${rows.length} words to wordle_words ...`);

  const inserted = await upsertBatch('wordle_words', rows);
  if (inserted === null) {
    console.log('  wordle_words table missing — create it in Supabase first');
  } else {
    console.log(`  Wordle: fetched ${fetched} words, added ${inserted} new`);
  }
}

// ── Section 2 — Word Ladder valid words ──────────────────────────────────────

async function fetchWordLadder() {
  console.log('\n── Word Ladder Valid Words ───────────────────────────────');

  const PATTERNS_4 = ['????', 'a???', 'b???', 'c???', 'd???', 'e???', 'f???', 'g???', 'h???', 'l???', 'm???', 'p???', 'r???', 's???', 't???', 'w???'];
  const PATTERNS_5 = ['?????', 'a????', 'b????', 'c????', 'd????', 'e????', 'f????', 'g????', 'h????', 'l????', 'm????', 'p????', 'r????', 's????', 't????', 'w????'];

  async function collectSet(patterns, length) {
    const seen = new Set();
    for (const pat of patterns) {
      process.stdout.write(`  Fetching ${pat} (${length}L) ... `);
      try {
        const data = await fetchPattern(pat);
        let added = 0;
        for (const entry of data) {
          const w = entry.word.toLowerCase();
          if (w.length === length && isClean(w) && getFreq(entry) > 1 && !seen.has(w)) {
            seen.add(w);
            added++;
          }
        }
        console.log(`${data.length} raw → ${added} kept (total ${seen.size})`);
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 120));
    }
    return seen;
  }

  const four  = await collectSet(PATTERNS_4, 4);
  const five  = await collectSet(PATTERNS_5, 5);

  const rows = [
    ...[...four].map(w => ({ word: w, length: 4 })),
    ...[...five].map(w => ({ word: w, length: 5 })),
  ];

  console.log(`  Upserting ${rows.length} words to wordladder_valid_words ...`);
  const inserted = await upsertBatch('wordladder_valid_words', rows);

  if (inserted === null) {
    console.log('  wordladder_valid_words table missing — create it in Supabase first');
    console.log('  SQL: CREATE TABLE wordladder_valid_words (word TEXT PRIMARY KEY, length INTEGER, created_at TIMESTAMPTZ DEFAULT NOW());');
  } else {
    console.log(`  Word Ladder: added ${four.size} four-letter words, ${five.size} five-letter words (${inserted} new)`);
  }
}

// ── Section 3 — Spelling Bee valid words ─────────────────────────────────────

async function fetchSpellingBee() {
  console.log('\n── Spelling Bee Valid Words ──────────────────────────────');

  const PATTERNS = [
    '????*',
    'a???*', 'b???*', 'c???*', 'd???*', 'e???*',
    'f???*', 'g???*', 'h???*', 'i???*', 'l???*',
    'm???*', 'p???*', 'r???*', 's???*', 't???*', 'w???*',
  ];

  const seen = new Set();

  for (const pat of PATTERNS) {
    process.stdout.write(`  Fetching ${pat} ... `);
    try {
      const data = await fetchPattern(pat);
      let added = 0;
      for (const entry of data) {
        const w = entry.word.toLowerCase();
        if (w.length >= 4 && isClean(w) && getFreq(entry) > 1 && !seen.has(w)) {
          seen.add(w);
          added++;
        }
      }
      console.log(`${data.length} raw → ${added} kept (total ${seen.size})`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 120));
  }

  const rows = [...seen].map(w => ({ word: w, length: w.length }));
  console.log(`  Upserting ${rows.length} words to spellingbee_valid_words ...`);

  const inserted = await upsertBatch('spellingbee_valid_words', rows);

  if (inserted === null) {
    console.log('  spellingbee_valid_words table missing — create it in Supabase first');
    console.log('  SQL: CREATE TABLE spellingbee_valid_words (word TEXT PRIMARY KEY, length INTEGER, created_at TIMESTAMPTZ DEFAULT NOW());');
  } else {
    console.log(`  Spelling Bee: added ${inserted} valid words`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  console.log('Starting word fetch...');
  console.log(`Supabase: ${process.env.VITE_SUPABASE_URL}`);

  await fetchWordle();
  await fetchWordLadder();
  await fetchSpellingBee();

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
