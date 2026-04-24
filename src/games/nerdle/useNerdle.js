import { useState, useEffect, useCallback, useRef } from 'react';
import { calcXP, formatTime, seededRandom, getTodaySeed, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

const MAX_GUESSES = 6;
const EQ_LEN = 8;

function buildEquationPool(mode = 'medium') {
  const pool = [];
  if (mode === 'easy') {
    for (let a = 10; a <= 49; a++) for (let b = 10; b <= 49; b++) { const r = a + b; if (r >= 10 && r <= 99) pool.push(`${a}+${b}=${r}`); }
    for (let a = 21; a <= 99; a++) for (let b = 10; b <= a - 10; b++) { const r = a - b; if (r >= 10 && r <= 99) pool.push(`${a}-${b}=${r}`); }
  } else {
    for (let a = 10; a <= 49; a++) for (let b = 10; b <= 49; b++) { const r = a + b; if (r >= 10 && r <= 99) pool.push(`${a}+${b}=${r}`); }
    for (let a = 21; a <= 99; a++) for (let b = 10; b <= a - 10; b++) { const r = a - b; if (r >= 10 && r <= 99) pool.push(`${a}-${b}=${r}`); }
    for (let d = 2; d <= 9; d++) for (let r = 10; r <= 99; r++) { const abc = r * d; if (abc >= 100 && abc <= 999) pool.push(`${abc}/${d}=${r}`); }
    for (let a = 2; a <= 9; a++) for (let bc = 12; bc <= 99; bc++) { const r = a * bc; if (r >= 100 && r <= 999) pool.push(`${a}*${bc}=${r}`); }
  }
  return pool;
}

function generateEquation(mode = 'medium', seed = getTodaySeed()) {
  const pool = buildEquationPool(mode);
  if (!pool.length) return '10+34=44';
  return pool[Math.floor(seededRandom(seed + mode)() * pool.length)];
}

function hasLeadingZero(expr) {
  // Match any number token that starts with 0 but has more digits
  return /(?<![0-9])0[0-9]/.test(expr);
}

function safeEval(expr) {
  // Only allow digits and operators; no function calls or identifiers
  if (!/^[0-9+\-*/]+$/.test(expr)) return null;
  if (hasLeadingZero(expr)) return null;
  // Check division by zero: any /0 not followed by another digit
  if (/\/0(?![0-9])/.test(expr)) return null;
  try {
    const result = Function(`"use strict"; return (${expr})`)();
    return Number.isFinite(result) ? result : null;
  } catch { return null; }
}

function isValidEquation(str) {
  // Must contain exactly one =
  const eqParts = str.split('=');
  if (eqParts.length !== 2) return { valid: false, reason: 'Must contain exactly one =' };
  const [lhs, rhs] = eqParts;
  if (!lhs || !rhs) return { valid: false, reason: 'Invalid equation' };
  if (hasLeadingZero(lhs) || hasLeadingZero(rhs)) return { valid: false, reason: 'No leading zeros' };
  // RHS must be a plain integer (no operators)
  if (!/^[0-9]+$/.test(rhs)) return { valid: false, reason: 'Right side must be a number' };
  const lhsVal = safeEval(lhs);
  if (lhsVal === null) {
    if (/\/0(?![0-9])/.test(lhs)) return { valid: false, reason: 'Division by zero' };
    return { valid: false, reason: 'Invalid equation' };
  }
  const rhsVal = Number(rhs);
  if (Math.abs(lhsVal - rhsVal) >= 0.0001) return { valid: false, reason: 'Equation is not balanced' };
  return { valid: true };
}

function evaluateNerdle(guess, target) {
  const result = Array(EQ_LEN).fill('absent');
  const targetArr = target.split('');
  const guessArr  = guess.split('');
  const used = Array(EQ_LEN).fill(false);
  guessArr.forEach((ch, i) => { if (ch === targetArr[i]) { result[i] = 'correct'; used[i] = true; } });
  guessArr.forEach((ch, i) => {
    if (result[i] === 'correct') return;
    const j = targetArr.findIndex((t, ti) => t === ch && !used[ti]);
    if (j !== -1) { result[i] = 'present'; used[j] = true; }
  });
  return result;
}

const NERDLE_KEYS = [
  ['7','8','9','+','-'],
  ['4','5','6','*','/'],
  ['1','2','3','=','⌫'],
  ['0','ENTER'],
];

export function useNerdle({ mode = 'medium', daily = true }) {
  const target = useRef(generateEquation(mode, getTodaySeed()));
  const [rows, setRows]           = useState(() => Array(MAX_GUESSES).fill(null).map(() => ({ chars: [], states: [] })));
  const [currentRow, setCurrentRow] = useState(0);
  const [input, setInput]         = useState([]);
  const [gameOver, setGameOver]   = useState(false);
  const [won, setWon]             = useState(false);
  const [shake, setShake]         = useState(false);
  const [time, setTime]           = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!gameOver) { const t = setInterval(() => setTime(p => p + 1), 1000); return () => clearInterval(t); }
  }, [gameOver]);

  const charStates = {};
  rows.forEach(r => r.chars.forEach((c, i) => { const s = r.states[i]; if (s && (!charStates[c] || s === 'correct')) charStates[c] = s; }));

  function finishGame(isWin, rowIdx, hints = hintsUsed, solved = wasSolved) {
    setGameOver(true); setWon(isWin);
    const difficulty = mode === 'easy' ? 'Easy' : 'Hard';
    const guessesUsed = rowIdx + 1;
    if (isWin && daily && !isCompletedToday('nerdle')) {
      markComplete('nerdle');
      const baseXp = calcXP('nerdle', difficulty);
      const xp = applyHintPenalty(baseXp, hints, solved);
      submitResult({ userId: user?.id, gameId: 'nerdle', difficulty: mode, score: MAX_GUESSES - rowIdx, timeSeconds: time, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'nerdle', score: guessesUsed, timeSeconds: time, difficulty, xpEarned: xp });
      toast.success(`+${xp} XP!`, { icon: '⭐' });
    }
    if (!isWin) {
      saveGameResult({ userId: user?.id, gameType: 'nerdle', score: guessesUsed, timeSeconds: time, difficulty, xpEarned: 0 });
      toast.error(`Answer: ${target.current}`);
    }
  }

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    if (key === '⌫') { setInput(p => p.slice(0, -1)); return; }
    if (key === 'ENTER') {
      if (input.length < EQ_LEN) { setShake(true); setTimeout(() => setShake(false), 400); toast.error('Fill all 8 cells'); return; }
      const guess = input.join('');
      const validation = isValidEquation(guess);
      if (!validation.valid) { setShake(true); setTimeout(() => setShake(false), 400); toast.error(validation.reason); return; }
      const states = evaluateNerdle(guess, target.current);
      const newRows = [...rows]; newRows[currentRow] = { chars: input, states };
      setRows(newRows); setInput([]);
      const isWin = states.every(s => s === 'correct');
      const isLast = currentRow === MAX_GUESSES - 1;
      if (isWin || isLast) finishGame(isWin, currentRow);
      else setCurrentRow(r => r + 1);
      return;
    }
    if (input.length < EQ_LEN) setInput(p => [...p, key]);
  }, [gameOver, input, currentRow, rows, mode, daily, time, hintsUsed, wasSolved]);

  useEffect(() => {
    const handler = (e) => {
      if ('0123456789+-*/='.includes(e.key)) handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('⌫');
      else if (e.key === 'Enter') handleKey('ENTER');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const hint = useCallback(() => {
    if (gameOver) return;
    const knownCorrect = Array(EQ_LEN).fill(null);
    rows.forEach(row => row.states.forEach((s, i) => { if (s === 'correct') knownCorrect[i] = row.chars[i]; }));
    const unknown = knownCorrect.map((c, i) => c ? null : i).filter(i => i !== null);
    if (!unknown.length) return;
    const pos = unknown[Math.floor(Math.random() * unknown.length)];
    const ch = target.current[pos];
    setHintsUsed(h => h + 1);
    toast(`💡 Position ${pos + 1} is "${ch}"`, { duration: 4000 });
  }, [gameOver, rows, hintsUsed]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const chars = target.current.split('');
    const states = chars.map(() => 'correct');
    const newRows = [...rows]; newRows[currentRow] = { chars, states };
    setRows(newRows); setWasSolved(true);
    finishGame(true, currentRow, hintsUsed, true);
  }, [gameOver, rows, currentRow, hintsUsed]);

  const getState = (row, col) => { const r = rows[row]; if (row === currentRow && !r.chars.length) return col < input.length ? 'filled' : 'empty'; return r.states[col] || 'empty'; };
  const getChar = (row, col) => { const r = rows[row]; if (row === currentRow && !r.chars.length) return input[col] || ''; return r.chars[col] || ''; };

  return { rows, currentRow, input, gameOver, won, shake, time: formatTime(time), charStates, handleKey, getState, getChar, NERDLE_KEYS, EQ_LEN, MAX_GUESSES, target: target.current, hintsUsed, wasSolved, hint, solve };
}
