import { useState, useCallback, useRef } from 'react';
import { calcXP, getTodaySeed, seededRandom, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

const COLORS = ['#F5A623', '#4A9EFF', '#22C55E', '#EC4899', '#A855F7', '#EF4444'];

function generateLevel(difficulty, seed) {
  const rng = seededRandom(seed);
  const screwsPerPeg = { Easy: 2, Medium: 3, Hard: 4, Expert: 5 }[difficulty] || 3;
  const colorCount   = { Easy: 2, Medium: 3, Hard: 4, Expert: 5 }[difficulty] || 3;
  const colorPool    = COLORS.slice(0, colorCount);
  const screwsPerColor = screwsPerPeg * 2; // capacity per peg = win-state size

  // Total pegs: same formula as before so the UI layout is unchanged
  const pegCount   = colorCount * 2;
  const emptyCount = Math.max(2, Math.floor(pegCount * 0.25));
  const totalPegs  = pegCount + emptyCount;

  // ── Step 1: build a guaranteed-solved starting state ────────────────────
  // One full peg per color, the rest empty.
  const pegs = [];
  for (let i = 0; i < colorCount; i++) {
    pegs.push(Array(screwsPerColor).fill(colorPool[i]));
  }
  for (let i = colorCount; i < totalPegs; i++) pegs.push([]);

  // ── Step 2: scramble by applying valid game-moves repeatedly ────────────
  // Applying moves in any order keeps the board solvable (reverse the moves).
  const scrambleMoves = screwsPerColor * colorCount * 5;
  let lastFrom = -1, lastTo = -1;

  for (let m = 0; m < scrambleMoves; m++) {
    const validMoves = [];
    for (let f = 0; f < pegs.length; f++) {
      if (!pegs[f].length) continue;
      const topColor = pegs[f][pegs[f].length - 1];
      let moveCount = 0;
      for (let i = pegs[f].length - 1; i >= 0 && pegs[f][i] === topColor; i--) moveCount++;

      for (let t = 0; t < pegs.length; t++) {
        if (f === t) continue;
        if (f === lastTo && t === lastFrom) continue; // avoid immediate undo
        const destLen = pegs[t].length;
        const destTop = destLen ? pegs[t][destLen - 1] : null;
        const canPlace = destTop === null ||
          (destTop === topColor && destLen + moveCount <= screwsPerColor);
        if (canPlace) validMoves.push([f, t]);
      }
    }
    if (!validMoves.length) break;

    const [f, t] = validMoves[Math.floor(rng() * validMoves.length)];
    const topColor = pegs[f][pegs[f].length - 1];
    let moveCount = 0;
    for (let i = pegs[f].length - 1; i >= 0 && pegs[f][i] === topColor; i--) moveCount++;
    const moved = pegs[f].splice(pegs[f].length - moveCount, moveCount);
    pegs[t].push(...moved);
    lastFrom = f; lastTo = t;
  }

  return { pegs, maxPerPeg: screwsPerPeg, colors: colorPool };
}

export function useScrewPuzzle({ difficulty = 'Medium' } = {}) {
  const seed = getTodaySeed() + difficulty.length;
  const initLevel = useRef(generateLevel(difficulty, seed));
  const startTimeRef = useRef(Date.now());

  const [pegs, setPegs] = useState(() => initLevel.current.pegs.map(p => [...p]));
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const maxPerPeg = initLevel.current.maxPerPeg;
  const colors = initLevel.current.colors;

  const checkWin = useCallback((newPegs) => {
    return newPegs.every(peg =>
      peg.length === 0 ||
      (peg.length === maxPerPeg * 2 && peg.every(c => c === peg[0]))
    );
  }, [maxPerPeg]);

  const selectPeg = useCallback((idx) => {
    if (won) return;

    if (selected === null) {
      // Select if peg has screws
      if (pegs[idx].length > 0) setSelected(idx);
      return;
    }

    if (selected === idx) {
      setSelected(null);
      return;
    }

    const fromPeg = pegs[selected];
    const toPeg = pegs[idx];

    // Can only move top screw to empty or matching color on top
    const movingColor = fromPeg[fromPeg.length - 1];
    const canMove = toPeg.length === 0 ||
      (toPeg[toPeg.length - 1] === movingColor && toPeg.length < maxPerPeg * 2);

    if (canMove) {
      const newPegs = pegs.map(p => [...p]);
      // Move all consecutive same-color screws from top
      let count = 0;
      for (let i = newPegs[selected].length - 1; i >= 0; i--) {
        if (newPegs[selected][i] === movingColor) count++;
        else break;
      }

      const moved = newPegs[selected].splice(newPegs[selected].length - count, count);
      newPegs[idx].push(...moved);
      setPegs(newPegs);
      setMoves(m => m + 1);
      setSelected(null);

      if (checkWin(newPegs)) {
        setWon(true);
        setGameOver(true);
        const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        const movesUsed = moves + 1;
        if (!isCompletedToday('screw')) {
          markComplete('screw');
          const baseXp = calcXP('screw', difficulty);
          const xp = applyHintPenalty(baseXp, hintsUsed, wasSolved);
          submitResult({ userId: user?.id, gameId: 'screw', difficulty, score: movesUsed, timeSeconds, xpEarned: xp, completed: true });
          saveGameResult({ userId: user?.id, gameType: 'screw', score: movesUsed, timeSeconds, difficulty, xpEarned: xp });
          toast.success(`+${xp} XP!`, { icon: '🔩' });
        }
      }
    } else {
      setSelected(idx);
    }
  }, [pegs, selected, won, moves, maxPerPeg, checkWin, difficulty, user, isCompletedToday, markComplete, submitResult]);

  const hint = useCallback(() => {
    if (won) return;
    // Find first peg with screws that can be moved to consolidate colors
    for (let f = 0; f < pegs.length; f++) {
      if (!pegs[f].length) continue;
      const topColor = pegs[f][pegs[f].length - 1];
      for (let t = 0; t < pegs.length; t++) {
        if (f === t) continue;
        const toTop = pegs[t].length ? pegs[t][pegs[t].length - 1] : null;
        if (toTop === topColor && pegs[t].length < maxPerPeg * 2) {
          setHintsUsed(h => h + 1);
          toast(`💡 Move screw from peg ${f + 1} to peg ${t + 1}`, { duration: 3000 });
          return;
        }
      }
    }
    toast('💡 Try moving to an empty peg', { duration: 3000 });
    setHintsUsed(h => h + 1);
  }, [won, pegs, maxPerPeg]);

  const solve = useCallback(() => {
    if (won) return;
    // Build solved state: group screws by color into pegs
    const colorGroups = {};
    pegs.forEach(peg => peg.forEach(c => { colorGroups[c] = (colorGroups[c] || 0) + 1; }));
    const solvedPegs = Object.entries(colorGroups).map(([color, count]) => Array(count).fill(color));
    while (solvedPegs.length < pegs.length) solvedPegs.push([]);
    setPegs(solvedPegs);
    setWasSolved(true);
    setWon(true); setGameOver(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (!isCompletedToday('screw')) {
      markComplete('screw');
      const baseXp = calcXP('screw', difficulty);
      const xp = applyHintPenalty(baseXp, hintsUsed, true);
      submitResult({ userId: user?.id, gameId: 'screw', difficulty, score: moves, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'screw', score: moves, timeSeconds, difficulty, xpEarned: xp });
    }
  }, [won, pegs, moves, difficulty, hintsUsed, user, isCompletedToday, markComplete, submitResult]);

  const newGame = useCallback(() => {
    const newLevel = generateLevel(difficulty, Date.now());
    setPegs(newLevel.pegs.map(p => [...p]));
    setSelected(null); setMoves(0); setWon(false); setGameOver(false);
    setHintsUsed(0); setWasSolved(false); startTimeRef.current = Date.now();
  }, [difficulty]);

  return { pegs, selected, moves, won, gameOver, maxPerPeg, colors, hintsUsed, wasSolved, selectPeg, hint, solve, newGame };
}
