import { useState, useCallback, useRef } from 'react';
import { calcXP, getTodaySeed, seededRandom, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

// Nuts & Bolts: Rods with colored rings stacked on them.
// Goal: sort rings so each rod has only one color.
// Mechanic: pick a ring from one rod, slide it onto another rod with same top color or empty space.

const COLORS = ['#F5A623', '#4A9EFF', '#22C55E', '#EC4899', '#A855F7'];

function generateLevel(difficulty, seed) {
  const rng = seededRandom(seed);
  const numColors = { Easy: 2, Medium: 3, Hard: 4, Expert: 5 }[difficulty] || 3;
  const ringsPerColor = { Easy: 3, Medium: 3, Hard: 4, Expert: 4 }[difficulty] || 3;
  const numRods = numColors + (difficulty === 'Easy' ? 1 : 2);
  const colors = COLORS.slice(0, numColors);

  // Start from solved state: each color rod is full, buffer rods are empty
  const rods = colors.map(c => Array(ringsPerColor).fill(c));
  for (let i = numColors; i < numRods; i++) rods.push([]);

  // Helper: top ring of a rod
  const top = r => r.length ? r[r.length - 1] : null;

  // Helper: count consecutive same-color rings at top
  const topCount = r => {
    if (!r.length) return 0;
    const c = r[r.length - 1];
    let n = 0;
    for (let i = r.length - 1; i >= 0 && r[i] === c; i--) n++;
    return n;
  };

  // Apply random valid moves in reverse to scramble (guarantees solvability)
  const shuffleSteps = numColors * 25;
  for (let step = 0; step < shuffleSteps; step++) {
    const valid = [];
    for (let f = 0; f < numRods; f++) {
      if (!rods[f].length) continue;
      const tc = topCount(rods[f]);
      // Skip moving a fully-sorted complete rod into an empty one (no-op scramble)
      if (tc === ringsPerColor && rods[f].length === ringsPerColor) continue;
      const moving = top(rods[f]);
      for (let t = 0; t < numRods; t++) {
        if (f === t) continue;
        const toTop = top(rods[t]);
        const canMove = rods[t].length === 0 ||
          (toTop === moving && rods[t].length + tc <= ringsPerColor);
        if (canMove) valid.push([f, t]);
      }
    }
    if (!valid.length) break;
    const [f, t] = valid[Math.floor(rng() * valid.length)];
    const moving = top(rods[f]);
    const count = topCount(rods[f]);
    const rings = rods[f].splice(rods[f].length - count, count);
    rods[t].push(...rings);
  }

  return { rods, maxHeight: ringsPerColor, colors };
}

export function useNutsAndBolts({ difficulty = 'Medium' } = {}) {
  const seed = getTodaySeed() + difficulty.charCodeAt(0);
  const initLevel = useRef(generateLevel(difficulty, seed));
  const startTimeRef = useRef(Date.now());

  const [rods, setRods] = useState(() => initLevel.current.rods.map(r => [...r]));
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const maxHeight = initLevel.current.maxHeight;

  const checkWin = useCallback((newRods) => {
    return newRods.every(rod =>
      rod.length === 0 || (rod.length === maxHeight && rod.every(c => c === rod[0]))
    );
  }, [maxHeight]);

  const selectRod = useCallback((idx) => {
    if (won) return;

    if (selected === null) {
      if (rods[idx].length > 0) setSelected(idx);
      return;
    }

    if (selected === idx) { setSelected(null); return; }

    const fromRod = rods[selected];
    const toRod = rods[idx];
    const topRing = fromRod[fromRod.length - 1];
    const canMove = toRod.length === 0 ||
      (toRod[toRod.length - 1] === topRing && toRod.length < maxHeight);

    if (canMove) {
      const newRods = rods.map(r => [...r]);
      // Move consecutive same-color rings from top
      let count = 1;
      for (let i = newRods[selected].length - 2; i >= 0; i--) {
        if (newRods[selected][i] === topRing) count++;
        else break;
      }
      const moved = newRods[selected].splice(newRods[selected].length - count, count);
      newRods[idx].push(...moved);
      setRods(newRods);
      setMoves(m => m + 1);
      setSelected(null);

      if (checkWin(newRods)) {
        setWon(true);
        const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const movesUsed = moves + 1;
        if (!isCompletedToday('nutsbolts')) {
          markComplete('nutsbolts');
          const baseXp = calcXP('nutsbolts', difficulty);
          const xp = applyHintPenalty(baseXp, hintsUsed, wasSolved);
          submitResult({ userId: user?.id, gameId: 'nutsbolts', difficulty, score: movesUsed, timeSeconds, xpEarned: xp, completed: true });
          saveGameResult({ userId: user?.id, gameType: 'nutsbolts', score: movesUsed, timeSeconds, difficulty, xpEarned: xp });
          toast.success(`+${xp} XP!`, { icon: '🔧' });
        }
      }
    } else {
      setSelected(idx);
    }
  }, [rods, selected, won, moves, maxHeight, checkWin, difficulty, user, isCompletedToday, markComplete, submitResult]);

  const hint = useCallback(() => {
    if (won) return;
    for (let f = 0; f < rods.length; f++) {
      if (!rods[f].length) continue;
      const top = rods[f][rods[f].length - 1];
      for (let t = 0; t < rods.length; t++) {
        if (f === t) continue;
        const toTop = rods[t].length ? rods[t][rods[t].length - 1] : null;
        if (toTop === top && rods[t].length < maxHeight) {
          setHintsUsed(h => h + 1);
          toast(`💡 Move ring from rod ${f + 1} to rod ${t + 1}`, { duration: 3000 });
          return;
        }
      }
    }
    toast('💡 Try an empty rod', { duration: 3000 });
    setHintsUsed(h => h + 1);
  }, [won, rods, maxHeight]);

  const solve = useCallback(() => {
    if (won) return;
    const colorGroups = {};
    rods.forEach(rod => rod.forEach(c => { colorGroups[c] = (colorGroups[c] || []).concat(c); }));
    const solvedRods = Object.values(colorGroups);
    while (solvedRods.length < rods.length) solvedRods.push([]);
    setRods(solvedRods);
    setWasSolved(true);
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (!isCompletedToday('nutsbolts')) {
      markComplete('nutsbolts');
      const baseXp = calcXP('nutsbolts', difficulty);
      const xp = applyHintPenalty(baseXp, hintsUsed, true);
      submitResult({ userId: user?.id, gameId: 'nutsbolts', difficulty, score: moves, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'nutsbolts', score: moves, timeSeconds, difficulty, xpEarned: xp });
    }
  }, [won, rods, moves, difficulty, hintsUsed, user, isCompletedToday, markComplete, submitResult]);

  const newGame = useCallback(() => {
    const lv = generateLevel(difficulty, Date.now());
    setRods(lv.rods.map(r => [...r]));
    setSelected(null); setMoves(0); setWon(false);
    setHintsUsed(0); setWasSolved(false); startTimeRef.current = Date.now();
  }, [difficulty]);

  return { rods, selected, moves, won, maxHeight, colors: initLevel.current.colors, hintsUsed, wasSolved, selectRod, hint, solve, newGame };
}
