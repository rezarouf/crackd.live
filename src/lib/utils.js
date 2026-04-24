import { LEVELS, STREAK_BONUSES, XP_MULTIPLIERS, XP_BASE } from './constants.js';

export function getLevelInfo(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1];
}

export function getXpForNextLevel(xp) {
  const level = LEVELS.find(l => xp >= l.min && xp <= l.max);
  if (!level || level.max === Infinity) return null;
  return level.max + 1;
}

export function getStreakBonus(streak) {
  const bonus = STREAK_BONUSES.find(b => streak >= b.days);
  return bonus ? bonus.multiplier : 1;
}

export function calcXP(gameId, difficulty, streak = 0) {
  const base = XP_BASE[gameId] || 100;
  const diffMult = XP_MULTIPLIERS[difficulty] || 1;
  const streakMult = getStreakBonus(streak);
  return Math.round(base * diffMult * streakMult);
}

// Penalty: each hint costs 25% XP (min 25%), solve gives 10%
export function applyHintPenalty(xp, hintsUsed = 0, wasSolved = false) {
  if (wasSolved) return Math.max(1, Math.round(xp * 0.1));
  if (hintsUsed <= 0) return xp;
  const mult = Math.max(0.25, 1 - hintsUsed * 0.25);
  return Math.round(xp * mult);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getTodaySeed() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function seededRandom(seed) {
  const str = String(seed);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return function() {
    h ^= h >>> 16;
    h = Math.imul(h, 0x45d9f3b);
    h ^= h >>> 16;
    return ((h >>> 0) / 0x100000000);
  };
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n) {
  return n.toLocaleString();
}

export function generateShareText({ gameName, date, streakDays = 0, lines = [], note = '', hintsUsed = 0, wasSolved = false }) {
  const parts = [
    `Crackd.live — ${gameName}`,
    date,
    streakDays > 0 ? `🔥 ${streakDays} day streak` : '',
    wasSolved ? '🤖 Auto-solved' : hintsUsed > 0 ? `💡 ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used` : '',
    '',
    ...lines,
    note ? `\n${note}` : '',
    '\ncrackd.live',
  ];
  return parts.filter(p => p !== undefined).join('\n').trim();
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

// Fisher-Yates shuffle with seeded RNG
export function seededShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick N items from array using seeded RNG
export function seededPick(arr, n, rng) {
  return seededShuffle(arr, rng).slice(0, n);
}
