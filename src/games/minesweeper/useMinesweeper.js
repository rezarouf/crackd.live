import { useState, useCallback, useEffect, useRef } from 'react';
import { seededRandom, getTodaySeed, formatTime, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const ROWS = 9, COLS = 9, MINES = 12;

// Constraint-propagation solver: simulates a player deducing the board logically.
// Returns true if every non-mine cell can be revealed without guessing.
function isSolvable(minesSet, firstR, firstC) {
  const revealed = new Set();
  const flagged = new Set();

  // Simulate the first click (flood-reveals zeros)
  floodReveal(firstR, firstC, minesSet, revealed, flagged).forEach(k => revealed.add(k));

  let progress = true;
  while (progress) {
    progress = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r},${c}`;
        if (!revealed.has(key) || minesSet.has(key)) continue;
        const adjMines = countAdj(r, c, minesSet);
        if (adjMines === 0) continue;

        const hidden = [], adjFlagged = [];
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          const nk = `${nr},${nc}`;
          if (flagged.has(nk)) adjFlagged.push(nk);
          else if (!revealed.has(nk)) hidden.push([nr, nc, nk]);
        }

        const remaining = adjMines - adjFlagged.length;

        // All hidden neighbours are mines → flag them
        if (remaining === hidden.length && remaining > 0) {
          hidden.forEach(([,, nk]) => { if (!flagged.has(nk)) { flagged.add(nk); progress = true; } });
        }
        // No remaining mines → all hidden neighbours are safe → reveal them
        if (remaining === 0 && hidden.length > 0) {
          hidden.forEach(([nr, nc, nk]) => {
            if (!revealed.has(nk)) {
              floodReveal(nr, nc, minesSet, revealed, flagged).forEach(k => revealed.add(k));
              progress = true;
            }
          });
        }
      }
    }
  }

  return revealed.size === ROWS * COLS - MINES;
}

function placeMines(safeR, safeC, rng) {
  // Exclude the 3×3 area around first click from mine placement
  const safe = new Set();
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) safe.add(`${safeR+dr},${safeC+dc}`);

  const candidates = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!safe.has(`${r},${c}`)) candidates.push([r, c]);

  // Try up to 100 shuffles; return first layout the solver can fully deduce
  for (let attempt = 0; attempt < 100; attempt++) {
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const mineSet = new Set(candidates.slice(0, MINES).map(([r, c]) => `${r},${c}`));
    if (isSolvable(mineSet, safeR, safeC)) return mineSet;
  }

  // Fallback: last shuffle still guarantees first-click safety
  return new Set(candidates.slice(0, MINES).map(([r, c]) => `${r},${c}`));
}

function countAdj(r, c, mines) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (dr === 0 && dc === 0) continue;
    if (mines.has(`${r+dr},${c+dc}`)) count++;
  }
  return count;
}

function floodReveal(r, c, mines, revealed, flagged) {
  const toReveal = new Set();
  const queue = [[r, c]];
  while (queue.length) {
    const [cr, cc] = queue.pop();
    const key = `${cr},${cc}`;
    if (toReveal.has(key) || revealed.has(key) || flagged.has(key)) continue;
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    toReveal.add(key);
    if (!mines.has(key) && countAdj(cr, cc, mines) === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) queue.push([cr+dr, cc+dc]);
      }
    }
  }
  return toReveal;
}

export function useMinesweeper() {
  const [mines, setMines] = useState(null);
  const [revealed, setRevealed] = useState(new Set());
  const [flagged, setFlagged] = useState(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [exploded, setExploded] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintCell, setHintCell] = useState(null);

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!started || gameOver) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, gameOver]);

  function finishWin(newRevealed, solved = false, hints = hintsUsed) {
    setWon(true);
    setGameOver(true);
    markComplete('minesweeper');
    const baseXp = calcXP('minesweeper', 'Hard');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'minesweeper', difficulty: 'Hard', score: Math.max(100, 3000 - seconds * 10), timeSeconds: seconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'minesweeper', score: newRevealed.size, timeSeconds: seconds, difficulty: 'Hard', xpEarned: xp });
  }

  const reveal = useCallback((r, c) => {
    if (gameOver) return;
    const key = `${r},${c}`;
    if (flagged.has(key) || revealed.has(key)) return;

    let currentMines = mines;
    if (!currentMines) {
      const rng = seededRandom(getTodaySeed() + 'minesweeper');
      currentMines = placeMines(r, c, rng);
      setMines(currentMines);
      setStarted(true);
    }

    if (currentMines.has(key)) {
      setExploded(key);
      setGameOver(true);
      setRevealed(new Set([...revealed, ...currentMines]));
      saveGameResult({ userId: user?.id, gameType: 'minesweeper', score: revealed.size, timeSeconds: seconds, difficulty: 'Hard', xpEarned: 0 });
      return;
    }

    const newReveals = floodReveal(r, c, currentMines, revealed, flagged);
    const newRevealed = new Set([...revealed, ...newReveals]);
    setRevealed(newRevealed);
    setHintCell(null);

    if (newRevealed.size === ROWS * COLS - MINES) finishWin(newRevealed);
  }, [gameOver, mines, revealed, flagged, seconds]);

  const flag = useCallback((r, c, e) => {
    e?.preventDefault();
    if (gameOver) return;
    const key = `${r},${c}`;
    if (revealed.has(key)) return;
    setFlagged(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, [gameOver, revealed]);

  const hint = useCallback(() => {
    if (gameOver || !mines) return;
    // Find a safe unrevealed unflagged cell and reveal it
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r},${c}`;
        if (!mines.has(key) && !revealed.has(key) && !flagged.has(key)) {
          const h = hintsUsed + 1;
          setHintsUsed(h);
          setHintCell(key);
          const newReveals = floodReveal(r, c, mines, revealed, flagged);
          const newRevealed = new Set([...revealed, ...newReveals]);
          setRevealed(newRevealed);
          setTimeout(() => setHintCell(null), 2000);
          if (newRevealed.size === ROWS * COLS - MINES) finishWin(newRevealed, false, h);
          return;
        }
      }
    }
  }, [gameOver, mines, revealed, flagged, hintsUsed, seconds]);

  const solve = useCallback(() => {
    if (gameOver || !mines) return;
    const allSafe = new Set();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const key = `${r},${c}`;
      if (!mines.has(key)) allSafe.add(key);
    }
    setRevealed(allSafe);
    setWasSolved(true);
    finishWin(allSafe, true);
  }, [gameOver, mines, seconds]);

  // hint for boards not yet started - no mines placed yet
  const hintNoStart = useCallback(() => {
    if (!mines) {
      setHintsUsed(h => h + 1);
      return; // nothing to reveal yet
    }
    hint();
  }, [mines, hint]);

  return {
    ROWS, COLS, MINES, mines, revealed, flagged, exploded, gameOver, won,
    time: formatTime(seconds), minesLeft: MINES - flagged.size,
    hintsUsed, wasSolved, hintCell,
    reveal, flag, hint: mines ? hint : hintNoStart, solve,
    adjacentCount: (r, c) => mines ? countAdj(r, c, mines) : 0,
  };
}
