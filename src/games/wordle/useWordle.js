import { useState, useEffect, useCallback, useRef } from 'react';
import { getDailyWord, getRandomWord, isValidWord, getWordLength } from './wordbank.js';
import { calcXP, formatTime, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

const MAX_GUESSES = 6;

function getDailyKey(mode) {
  const today = new Date().toISOString().slice(0, 10);
  return `wordle-daily-${today}-${mode}`;
}

function loadSaved(mode) {
  try {
    const raw = localStorage.getItem(getDailyKey(mode));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDailyState(mode, state) {
  try {
    localStorage.setItem(getDailyKey(mode), JSON.stringify(state));
  } catch {}
}

function evaluateGuess(guess, target) {
  const result = Array(guess.length).fill('absent');
  const targetArr = target.split('');
  const guessArr  = guess.split('');
  const used = Array(target.length).fill(false);
  guessArr.forEach((letter, i) => { if (letter === targetArr[i]) { result[i] = 'correct'; used[i] = true; } });
  guessArr.forEach((letter, i) => {
    if (result[i] === 'correct') return;
    const j = targetArr.findIndex((t, ti) => t === letter && !used[ti]);
    if (j !== -1) { result[i] = 'present'; used[j] = true; }
  });
  return result;
}

export function useWordle({ mode = 'normal', daily = true }) {
  const wordLen = getWordLength(mode);
  const target  = useRef(daily ? getDailyWord(mode) : getRandomWord(mode));

  const savedRef = useRef(daily ? loadSaved(mode) : null);
  const saved = savedRef.current;
  const isRestored = !!(saved?.rows?.some(r => r.states.length > 0));

  const [rows, setRows]             = useState(() => saved?.rows || Array(MAX_GUESSES).fill(null).map(() => ({ letters: [], states: [] })));
  const [currentRow, setCurrentRow] = useState(() => saved?.currentRow ?? 0);
  const [currentInput, setCurrentInput] = useState(() => Array(wordLen).fill(null));
  const [hintedPositions, setHintedPositions] = useState(() => new Set());
  const [gameOver, setGameOver]     = useState(() => saved?.gameOver ?? false);
  const [won, setWon]               = useState(() => saved?.won ?? false);
  const [shake, setShake]           = useState(false);
  const [time, setTime]             = useState(0);
  const [hintsUsed, setHintsUsed]   = useState(() => saved?.hintsUsed ?? 0);
  const [wasSolved, setWasSolved]   = useState(() => saved?.wasSolved ?? false);
  const timerRef = useRef(null);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!gameOver) { timerRef.current = setInterval(() => setTime(t => t + 1), 1000); }
    return () => clearInterval(timerRef.current);
  }, [gameOver]);

  useEffect(() => {
    if (!daily) return;
    saveDailyState(mode, { rows, currentRow, gameOver, won, hintsUsed, wasSolved });
  }, [rows, currentRow, gameOver, won, hintsUsed, wasSolved, daily, mode]);

  const letterStates = {};
  rows.forEach(row => {
    row.letters.forEach((l, i) => {
      const s = row.states[i];
      if (s && (!letterStates[l] || s === 'correct')) letterStates[l] = s;
    });
  });

  function finishGame(isWin, rowIdx, hints = hintsUsed, solved = wasSolved) {
    clearInterval(timerRef.current);
    setGameOver(true);
    setWon(isWin);

    const diffLabel = mode === 'normal' ? 'Medium' : mode === 'hard' ? 'Hard' : 'Expert';
    const baseXp    = calcXP('wordle', diffLabel);
    const xp        = isWin ? applyHintPenalty(baseXp, hints, solved) : 0;
    // score = remaining guesses (higher = fewer guesses used = better)
    const score     = isWin ? MAX_GUESSES - rowIdx : 0;

    if (isWin && daily && !isCompletedToday('wordle')) {
      markComplete('wordle');
      submitResult({ userId: user?.id, gameId: 'wordle', difficulty: mode, score, timeSeconds: time, xpEarned: xp, completed: true });
      toast.success(`+${xp} XP earned!`, { icon: '⭐' });
    }

    // Persist to Supabase for both wins and losses so history is complete.
    if (user?.id) {
      saveGameResult(user.id, 'wordle', score, time, mode, xp).catch(() => {});
    }

    if (!isWin) toast.error(`The word was ${target.current}`);
  }

  const handleKey = useCallback((key) => {
    if (gameOver) return;
    const k = key.toUpperCase();
    if (k === 'BACKSPACE' || k === '⌫') {
      setCurrentInput(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i] !== null && !hintedPositions.has(i)) { next[i] = null; return next; }
        }
        return prev;
      });
      return;
    }
    if (k === 'ENTER') {
      if (currentInput.some(l => l === null)) { setShake(true); setTimeout(() => setShake(false), 400); toast.error('Not enough letters'); return; }
      const guess = currentInput.join('');
      if (!isValidWord(guess, mode)) { setShake(true); setTimeout(() => setShake(false), 400); toast.error('Not in word list'); return; }
      if (mode !== 'normal') {
        // Collect constraints from all previous rows
        const greenConstraints = {}; // position → letter
        const yellowConstraints = new Set(); // letters that must appear somewhere
        rows.forEach(row => {
          row.states.forEach((s, i) => {
            if (s === 'correct') greenConstraints[i] = row.letters[i];
            if (s === 'present') yellowConstraints.add(row.letters[i]);
          });
        });
        for (const [pos, letter] of Object.entries(greenConstraints)) {
          if (guess[pos] !== letter) {
            toast.error(`Position ${Number(pos) + 1} must be "${letter}"`);
            return;
          }
        }
        for (const letter of yellowConstraints) {
          if (!guess.includes(letter)) {
            toast.error(`Must include "${letter}"`);
            return;
          }
        }
      }
      const states = evaluateGuess(guess, target.current);
      const newRows = [...rows]; newRows[currentRow] = { letters: currentInput, states };
      setRows(newRows);
      setCurrentInput(Array(wordLen).fill(null));
      setHintedPositions(new Set());
      const isWin = states.every(s => s === 'correct');
      const isLast = currentRow === MAX_GUESSES - 1;
      if (isWin || isLast) finishGame(isWin, currentRow);
      else setCurrentRow(r => r + 1);
      return;
    }
    if (/^[A-Z]$/.test(k)) {
      setCurrentInput(prev => {
        const next = [...prev];
        const emptyIdx = next.findIndex((l, i) => l === null && !hintedPositions.has(i));
        if (emptyIdx === -1) return prev;
        next[emptyIdx] = k;
        return next;
      });
    }
  }, [gameOver, currentInput, hintedPositions, currentRow, rows, wordLen, mode, daily, time, hintsUsed, wasSolved]);

  useEffect(() => {
    const handler = (e) => { if (e.ctrlKey || e.metaKey || e.altKey) return; handleKey(e.key); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const getTileState = (rowIdx, colIdx) => {
    const row = rows[rowIdx];
    if (rowIdx === currentRow && !row.letters.length) {
      if (hintedPositions.has(colIdx)) return 'hint';
      return currentInput[colIdx] ? 'filled' : 'empty';
    }
    if (!row.states[colIdx]) return 'empty';
    return row.states[colIdx];
  };
  const getTileLetter = (rowIdx, colIdx) => {
    const row = rows[rowIdx];
    if (rowIdx === currentRow && !row.letters.length) return currentInput[colIdx] || '';
    return row.letters[colIdx] || '';
  };

  const hint = useCallback(() => {
    if (gameOver) return;
    const knownCorrect = Array(wordLen).fill(null);
    rows.forEach(row => row.states.forEach((s, i) => { if (s === 'correct') knownCorrect[i] = row.letters[i]; }));
    hintedPositions.forEach(i => { knownCorrect[i] = currentInput[i]; });
    const unknownPositions = knownCorrect.map((l, i) => l ? null : i).filter(i => i !== null);
    if (!unknownPositions.length) return;
    const pos = unknownPositions[Math.floor(Math.random() * unknownPositions.length)];
    const letter = target.current[pos];
    setHintsUsed(h => h + 1);
    setHintedPositions(prev => new Set([...prev, pos]));
    setCurrentInput(prev => { const next = [...prev]; next[pos] = letter; return next; });
  }, [gameOver, rows, wordLen, hintsUsed, hintedPositions, currentInput]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const word = target.current.split('');
    const states = word.map(() => 'correct');
    const newRows = [...rows];
    newRows[currentRow] = { letters: word, states };
    setRows(newRows);
    setWasSolved(true);
    finishGame(true, currentRow, hintsUsed, true);
  }, [gameOver, rows, currentRow, hintsUsed]);

  const newGame = () => {
    target.current = getRandomWord(mode);
    setRows(Array(MAX_GUESSES).fill(null).map(() => ({ letters: [], states: [] })));
    setCurrentRow(0); setCurrentInput(Array(wordLen).fill(null)); setHintedPositions(new Set());
    setGameOver(false); setWon(false); setTime(0); setHintsUsed(0); setWasSolved(false);
  };

  const shareResult = () => {
    const emoji = { correct: '🟧', present: '🟦', absent: '⬛' };
    const lines = rows.slice(0, currentRow + (won ? 1 : 0)).filter(r => r.states.length > 0)
      .map(r => r.states.map(s => emoji[s] || '⬛').join('')).join('\n');
    const hintLine = wasSolved ? '\n🤖 Auto-solved' : hintsUsed > 0 ? `\n💡 ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used` : '';
    const text = `Crackd.live Wordle\n${won ? currentRow + 1 : 'X'}/${MAX_GUESSES}${hintLine}\n\n${lines}\ncrackd.live`;
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
  };

  return {
    rows, currentRow, currentInput, gameOver, won, shake,
    time: formatTime(time), letterStates, target: target.current,
    handleKey, getTileState, getTileLetter, newGame, shareResult,
    wordLen, MAX_GUESSES, hintsUsed, wasSolved, hint, solve, isRestored,
  };
}
