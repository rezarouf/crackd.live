import { useState, useCallback, useRef } from 'react';
import { seededRandom, getTodaySeed, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const GRID = 5;
const MAX_VAL = 5;
const WIN_SCORE = 500;

// BACKWARD GENERATION:
// Start with a board full of value-2 tiles (each was a valid merge of two 1s).
// Repeatedly split a random tile back into two adjacent lower-value tiles,
// ensuring at least one valid merge pair always exists at the end.
// This guarantees the player can always make progress from the first move.
function initGrid(rng) {
  const grid = Array.from({ length: GRID }, () => Array(GRID).fill(2));

  const splitSteps = GRID * GRID * 2;
  for (let step = 0; step < splitSteps; step++) {
    // Pick a random cell with value > 1 to split
    const candidates = [];
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++)
        if (grid[r][c] > 1) candidates.push([r, c]);
    if (!candidates.length) break;

    const [r, c] = candidates[Math.floor(rng() * candidates.length)];
    const adj = getAdj(r, c);
    if (!adj.length) continue;
    const [nr, nc] = adj[Math.floor(rng() * adj.length)];

    // Split: lower both cells to val-1 (reverse of a merge)
    const lo = grid[r][c] - 1;
    grid[r][c] = lo;
    grid[nr][nc] = lo;
  }

  // Safety: if no merge pair exists, force one by making two adjacent cells equal
  if (!findMergePair(grid)) {
    grid[0][0] = 1;
    grid[0][1] = 1;
  }

  return grid;
}

function getAdj(r, c) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc]) => nr >= 0 && nr < GRID && nc >= 0 && nc < GRID);
}

// Find any valid merge pair
function findMergePair(grid) {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      for (const [nr, nc] of getAdj(r, c)) {
        if (grid[r][c] === grid[nr][nc]) return [[r,c],[nr,nc]];
      }
    }
  }
  return null;
}

export function useMerge() {
  const rng = seededRandom(getTodaySeed() + 'merge');
  const [grid, setGrid] = useState(() => initGrid(rng));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintPair, setHintPair] = useState(null); // [[r,c],[nr,nc]]

  const startTimeRef = useRef(Date.now());
  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  function finishGame(s, solved = false, hints = hintsUsed) {
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('merge');
    const baseXp = calcXP('merge', 'Medium');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'merge', difficulty: 'Medium', score: s, timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'merge', score: s, timeSeconds, difficulty: 'Medium', xpEarned: xp });
  }

  const selectCell = useCallback((r, c) => {
    if (won) return;
    setHintPair(null);
    if (!selected) { setSelected([r, c]); return; }
    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }
    const adj = getAdj(sr, sc);
    const isAdj = adj.some(([nr,nc]) => nr === r && nc === c);
    if (isAdj && grid[sr][sc] === grid[r][c]) {
      const newVal = grid[sr][sc] + 1;
      const pts = newVal * 10;
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = newVal;
      newGrid[sr][sc] = Math.floor(rng() * 3) + 1;
      setGrid(newGrid);
      const newScore = score + pts;
      setScore(newScore);
      setMoves(m => m + 1);
      setSelected(null);
      if (newScore >= WIN_SCORE) {
        finishGame(newScore);
      } else if (!findMergePair(newGrid)) {
        const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        saveGameResult({ userId: user?.id, gameType: 'merge', score: newScore, timeSeconds, difficulty: 'Medium', xpEarned: 0 });
      }
    } else {
      setSelected([r, c]);
    }
  }, [won, selected, grid, score, rng]);

  const hint = useCallback(() => {
    if (won) return;
    const pair = findMergePair(grid);
    if (!pair) return;
    setHintsUsed(h => h + 1);
    setHintPair(pair);
    setSelected(null);
    setTimeout(() => setHintPair(null), 3000);
  }, [won, grid]);

  const solve = useCallback(() => {
    if (won) return;
    setWasSolved(true);
    finishGame(WIN_SCORE, true);
  }, [won]);

  return { grid, selected, score, won, moves, GRID, MAX_VAL, WIN_SCORE, hintsUsed, wasSolved, hintPair, selectCell, hint, solve };
}
