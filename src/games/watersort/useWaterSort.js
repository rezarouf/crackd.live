import { useState, useCallback, useRef } from 'react';
import { seededRandom, getTodaySeed, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const COLORS = ['#F5A623','#4A9EFF','#22C55E','#EF4444','#A855F7','#2DD4BF'];
const TUBE_CAP = 4;

function generateTubes(numColors, rng) {
  // Start from solved state: each tube holds one color, plus 2 empty tubes
  const tubes = [];
  for (let i = 0; i < numColors; i++) tubes.push(Array(TUBE_CAP).fill(i));
  tubes.push([], []);

  // Apply random valid reverse-pours to scramble (guaranteed solvable)
  const shuffleSteps = numColors * 20;
  for (let step = 0; step < shuffleSteps; step++) {
    // Collect all valid pour pairs
    const valid = [];
    for (let f = 0; f < tubes.length; f++) {
      for (let t = 0; t < tubes.length; t++) {
        if (f !== t && canPour(tubes[f], tubes[t])) {
          // Skip moves that would pour an already-complete tube into empty (pointless)
          if (tubes[f].length === TUBE_CAP && tubes[f].every(c => c === tubes[f][0]) && tubes[t].length === 0) continue;
          valid.push([f, t]);
        }
      }
    }
    if (valid.length === 0) break;
    const [f, t] = valid[Math.floor(rng() * valid.length)];
    const color = tubes[f][tubes[f].length - 1];
    while (tubes[f].length > 0 && tubes[f][tubes[f].length - 1] === color && tubes[t].length < TUBE_CAP) {
      tubes[t].push(tubes[f].pop());
    }
  }

  return tubes;
}

function isSolved(tubes) {
  return tubes.every(tube => tube.length === 0 || (tube.length === TUBE_CAP && tube.every(c => c === tube[0])));
}

function canPour(from, to) {
  if (from.length === 0) return false;
  if (to.length === TUBE_CAP) return false;
  if (to.length === 0) return true;
  return from[from.length - 1] === to[to.length - 1];
}

function pour(tubes, fromIdx, toIdx) {
  const newTubes = tubes.map(t => [...t]);
  const from = newTubes[fromIdx], to = newTubes[toIdx];
  const color = from[from.length - 1];
  while (from.length > 0 && from[from.length - 1] === color && to.length < TUBE_CAP) to.push(from.pop());
  return newTubes;
}

// Find a valid hint move: look for a pour that makes progress
function findHintMove(tubes) {
  for (let f = 0; f < tubes.length; f++) {
    if (tubes[f].length === 0) continue;
    for (let t = 0; t < tubes.length; t++) {
      if (f === t) continue;
      if (canPour(tubes[f], tubes[t])) {
        // Prefer moves that consolidate same colors
        const topColor = tubes[f][tubes[f].length - 1];
        if (tubes[t].length > 0 && tubes[t][tubes[t].length - 1] === topColor) return [f, t];
      }
    }
  }
  // Fall back to any valid pour
  for (let f = 0; f < tubes.length; f++) {
    for (let t = 0; t < tubes.length; t++) {
      if (f !== t && canPour(tubes[f], tubes[t])) return [f, t];
    }
  }
  return null;
}

export function useWaterSort() {
  const rng = seededRandom(getTodaySeed() + 'watersort');
  const numColors = 5;
  const initTubes = generateTubes(numColors, rng);

  const startTimeRef = useRef(Date.now());
  const [tubes, setTubes] = useState(initTubes);
  const [selected, setSelected] = useState(null);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintMove, setHintMove] = useState(null); // [fromIdx, toIdx]

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  function finishGame(m, solved = false, hints = hintsUsed) {
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('watersort');
    const baseXp = calcXP('watersort', 'Easy');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'watersort', difficulty: 'Easy', score: Math.max(100, 1000 - m * 10), timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'watersort', score: m, timeSeconds, difficulty: 'Easy', xpEarned: xp });
  }

  const selectTube = useCallback((idx) => {
    if (won) return;
    if (selected === null) { if (tubes[idx].length > 0) setSelected(idx); return; }
    if (selected === idx) { setSelected(null); return; }
    if (canPour(tubes[selected], tubes[idx])) {
      const newTubes = pour(tubes, selected, idx);
      const m = moves + 1;
      setTubes(newTubes);
      setMoves(m);
      setSelected(null);
      setHintMove(null);
      if (isSolved(newTubes)) finishGame(m);
    } else {
      setSelected(idx);
    }
  }, [won, selected, tubes, moves]);

  const hint = useCallback(() => {
    if (won) return;
    const move = findHintMove(tubes);
    if (!move) return;
    const h = hintsUsed + 1;
    setHintsUsed(h);
    setHintMove(move);
    setSelected(null);
    setTimeout(() => setHintMove(null), 3000);
  }, [won, tubes, hintsUsed]);

  const solve = useCallback(() => {
    if (won) return;
    // Simulate sorting: for each color, consolidate into single tubes
    const numColors = 5;
    const solved = Array.from({ length: numColors }, (_, i) => Array(TUBE_CAP).fill(i));
    solved.push([], []);
    setTubes(solved);
    setWasSolved(true);
    finishGame(moves, true);
  }, [won, moves]);

  return { tubes, selected, won, moves, COLORS, TUBE_CAP, hintsUsed, wasSolved, hintMove, selectTube, hint, solve };
}
