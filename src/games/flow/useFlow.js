import { useState, useCallback, useRef } from 'react';
import { FLOW_PUZZLES, COLOR_MAP } from './flowData.js';
import { seededRandom, getTodaySeed, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

function getDailyPuzzle() {
  const rng = seededRandom(getTodaySeed() + 'flow');
  return FLOW_PUZZLES[Math.floor(rng() * FLOW_PUZZLES.length)];
}

function posKey(r, c) { return `${r},${c}`; }

export function useFlow() {
  const puzzle = getDailyPuzzle();
  const { size, colors, solution } = puzzle;

  const endpoints = {};
  Object.entries(colors).forEach(([color, [[r1,c1],[r2,c2]]]) => {
    endpoints[posKey(r1,c1)] = color;
    endpoints[posKey(r2,c2)] = color;
  });

  const [paths, setPaths] = useState(() => {
    const p = {};
    Object.keys(colors).forEach(c => { p[c] = []; });
    return p;
  });
  const [drawing, setDrawing] = useState(null);
  const [won, setWon] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintColor, setHintColor] = useState(null);
  const startTimeRef = useRef(Date.now());

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  function finishGame(solved = false, hints = hintsUsed) {
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('flow');
    const baseXp = calcXP('flow', 'Medium');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'flow', difficulty: 'Medium', score: 1000, timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'flow', score: hints, timeSeconds, difficulty: 'Medium', xpEarned: xp });
  }

  function checkWin(newPaths) {
    const totalCells = size * size;
    const covered = new Set();
    let allConnected = true;
    Object.entries(colors).forEach(([color, [[r1,c1],[r2,c2]]]) => {
      const path = newPaths[color];
      if (path.length < 2) { allConnected = false; return; }
      const start = path[0], end = path[path.length - 1];
      const ep1 = posKey(r1,c1), ep2 = posKey(r2,c2);
      if (posKey(start[0],start[1]) !== ep1 && posKey(start[0],start[1]) !== ep2) { allConnected = false; return; }
      if (posKey(end[0],end[1]) !== ep2 && posKey(end[0],end[1]) !== ep1) { allConnected = false; return; }
      path.forEach(([r,c]) => covered.add(posKey(r,c)));
    });
    if (allConnected && covered.size === totalCells) finishGame();
  }

  const startDraw = useCallback((r, c) => {
    if (won) return;
    const key = posKey(r, c);
    let color = endpoints[key];
    if (!color) {
      Object.entries(paths).forEach(([col, path]) => {
        path.forEach(([pr, pc]) => { if (pr === r && pc === c) color = col; });
      });
    }
    if (!color) return;
    const ep = colors[color];
    const [r1,c1] = ep[0], [r2,c2] = ep[1];
    const useStart = Math.abs(r - r1) + Math.abs(c - c1) <= Math.abs(r - r2) + Math.abs(c - c2);
    const anchor = useStart ? [r1,c1] : [r2,c2];
    setDrawing({ color, path: [anchor] });
    setPaths(prev => ({ ...prev, [color]: [] }));
  }, [won, endpoints, paths, colors]);

  const continueDraw = useCallback((r, c) => {
    if (!drawing) return;
    const { color, path } = drawing;
    const last = path[path.length - 1];
    if (last[0] === r && last[1] === c) return;
    if (Math.abs(r - last[0]) + Math.abs(c - last[1]) !== 1) return;
    const existing = path.findIndex(([pr,pc]) => pr === r && pc === c);
    if (existing >= 0) { setDrawing({ color, path: path.slice(0, existing + 1) }); return; }
    const key = posKey(r, c);
    const cellColor = endpoints[key];
    if (cellColor && cellColor !== color) return;
    setDrawing({ color, path: [...path, [r, c]] });
  }, [drawing, endpoints]);

  const endDraw = useCallback(() => {
    if (!drawing) return;
    const { color, path } = drawing;
    setPaths(prev => {
      const newPaths = { ...prev, [color]: path };
      checkWin(newPaths);
      return newPaths;
    });
    setDrawing(null);
  }, [drawing]);

  // Reveal the full solution path for the first incomplete color
  const hint = useCallback(() => {
    if (won) return;
    let targetColor = null;
    for (const color of Object.keys(colors)) {
      const sol = solution[color];
      const cur = paths[color];
      if (cur.length < sol.length) { targetColor = color; break; }
    }
    if (!targetColor) return;

    const h = hintsUsed + 1;
    setHintsUsed(h);
    setHintColor(targetColor);
    setPaths(prev => {
      const newPaths = { ...prev, [targetColor]: solution[targetColor] };
      checkWin(newPaths);
      return newPaths;
    });
    setTimeout(() => setHintColor(null), 2000);
  }, [won, paths, colors, solution, hintsUsed]);

  // Reveal the full solution
  const solve = useCallback(() => {
    if (won) return;
    setPaths(solution);
    setWasSolved(true);
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('flow');
    const baseXp = calcXP('flow', 'Medium');
    const xp = applyHintPenalty(baseXp, hintsUsed, true);
    submitResult({ userId: user?.id, gameId: 'flow', difficulty: 'Medium', score: 500, timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'flow', score: hintsUsed, timeSeconds, difficulty: 'Medium', xpEarned: xp });
  }, [won, solution, hintsUsed, user, submitResult, markComplete]);

  const displayPaths = { ...paths };
  if (drawing) displayPaths[drawing.color] = drawing.path;

  return { puzzle, size, colors, endpoints, displayPaths, won, hintsUsed, wasSolved, hintColor, startDraw, continueDraw, endDraw, hint, solve, COLOR_MAP };
}
