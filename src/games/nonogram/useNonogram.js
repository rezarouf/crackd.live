import { useState, useEffect, useCallback, useRef } from 'react';
import { seededRandom, getTodaySeed, formatTime, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const SIZE = 7;

function buildClues(line) {
  const clues = []; let count = 0;
  for (const cell of line) {
    if (cell) count++;
    else if (count) { clues.push(count); count = 0; }
  }
  if (count) clues.push(count);
  return clues.length ? clues : [0];
}

// BACKWARD GENERATION:
// 1. Fill a random solution grid
// 2. Guarantee no all-empty row or column (avoids ambiguous [0] clues)
// 3. Derive row/col clues FROM that grid
// This ensures the puzzle is always solvable and clues are always consistent.
function generatePuzzle(rng) {
  const solution = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => (rng() > 0.4 ? 1 : 0))
  );

  // Ensure every row has at least one filled cell
  for (let r = 0; r < SIZE; r++) {
    if (solution[r].every(c => c === 0)) {
      solution[r][Math.floor(rng() * SIZE)] = 1;
    }
  }
  // Ensure every column has at least one filled cell
  for (let c = 0; c < SIZE; c++) {
    if (solution.every(row => row[c] === 0)) {
      solution[Math.floor(rng() * SIZE)][c] = 1;
    }
  }

  const rowClues = solution.map(row => buildClues(row));
  const colClues = Array.from({ length: SIZE }, (_, c) =>
    buildClues(solution.map(row => row[c]))
  );

  return { solution, rowClues, colClues };
}

function isSolved(player, solution) {
  return player.every((row, r) => row.every((cell, c) => cell === solution[r][c]));
}

export function useNonogram() {
  const puzzleRef = useRef(null);
  if (!puzzleRef.current) {
    const rng = seededRandom(getTodaySeed() + 'nonogram');
    puzzleRef.current = generatePuzzle(rng);
  }
  const { solution, rowClues, colClues } = puzzleRef.current;

  const [player, setPlayer] = useState(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(0)));
  const [crossed, setCrossed] = useState(() => Array.from({ length: SIZE }, () => Array(SIZE).fill(false)));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintRow, setHintRow] = useState(null); // row index highlighted by last hint

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  function finishGame(p, solved = false, hints = hintsUsed) {
    setWon(true);
    setGameOver(true);
    markComplete('nonogram');
    const baseXp = calcXP('nonogram', 'Hard');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'nonogram', difficulty: 'Hard', score: Math.max(50, 1000 - mistakes * 50), timeSeconds: seconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'nonogram', score: mistakes, timeSeconds: seconds, difficulty: 'Hard', xpEarned: xp });
  }

  const toggleCell = useCallback((r, c, rightClick = false) => {
    if (gameOver) return;
    if (rightClick) {
      setCrossed(prev => { const n = prev.map(row => [...row]); n[r][c] = !n[r][c]; return n; });
      return;
    }
    setPlayer(prev => {
      const n = prev.map(row => [...row]);
      n[r][c] = n[r][c] ? 0 : 1;
      if (n[r][c] && !solution[r][c]) setMistakes(m => m + 1);
      if (isSolved(n, solution)) finishGame(n);
      return n;
    });
  }, [gameOver, solution, mistakes, seconds]);

  const hint = useCallback(() => {
    if (gameOver) return;
    // Reveal the first incomplete row that has unfilled cells
    let targetRow = -1;
    for (let r = 0; r < SIZE; r++) {
      const rowComplete = solution[r].every((cell, c) => player[r][c] === cell);
      if (!rowComplete) { targetRow = r; break; }
    }
    if (targetRow === -1) return;
    const h = hintsUsed + 1;
    setHintsUsed(h);
    setHintRow(targetRow);
    setPlayer(prev => {
      const n = prev.map(row => [...row]);
      solution[targetRow].forEach((cell, c) => { n[targetRow][c] = cell; });
      if (isSolved(n, solution)) finishGame(n, false, h);
      return n;
    });
    setTimeout(() => setHintRow(null), 2000);
  }, [gameOver, solution, player, hintsUsed, seconds]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const fullSolution = solution.map(row => [...row]);
    setPlayer(fullSolution);
    setWasSolved(true);
    finishGame(fullSolution, true);
  }, [gameOver, solution, seconds]);

  return {
    SIZE, rowClues, colClues, player, crossed, gameOver, won, mistakes,
    time: formatTime(seconds), hintRow, hintsUsed, wasSolved,
    toggleCell, hint, solve,
  };
}
