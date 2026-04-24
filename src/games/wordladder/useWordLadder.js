import { useState, useEffect, useCallback } from 'react';
import { WORD_LADDER_PUZZLES, VALID_4_LETTER_WORDS } from './wordladderData.js';
import { seededRandom, getTodaySeed, formatTime, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

function getDailyPuzzle() {
  const rng = seededRandom(getTodaySeed() + 'wordladder');
  return WORD_LADDER_PUZZLES[Math.floor(rng() * WORD_LADDER_PUZZLES.length)];
}

function differsBy1(a, b) {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

// BFS to find the next step from `from` toward `to` using the valid word set
function bfsNextStep(from, to, wordSet) {
  if (from === to) return null;
  const visited = new Set([from]);
  const queue = [[from]];
  while (queue.length) {
    const path = queue.shift();
    const word = path[path.length - 1];
    for (let i = 0; i < word.length; i++) {
      for (let c = 65; c <= 90; c++) {
        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (next === word) continue;
        if (next === to) return path.length >= 1 ? path[1] || to : to;
        if (wordSet.has(next.toLowerCase()) && !visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
  }
  return null;
}

export function useWordLadder() {
  const puzzle = getDailyPuzzle();
  const [chain, setChain] = useState([puzzle.start]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintWord, setHintWord] = useState(null);

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  function finishGame(steps, solved = false, hints = hintsUsed) {
    setWon(true);
    setGameOver(true);
    markComplete('wordladder');
    const baseXp = calcXP('wordladder', 'Medium');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'wordladder', difficulty: 'Medium', score: Math.max(0, 1000 - (steps - puzzle.steps - 1) * 100), timeSeconds: seconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'wordladder', score: steps, timeSeconds: seconds, difficulty: 'Medium', xpEarned: xp });
  }

  const submit = useCallback(() => {
    const word = input.trim().toUpperCase();
    if (word.length !== 4) { setError('Must be 4 letters'); return; }
    const last = chain[chain.length - 1];
    if (!differsBy1(word, last)) { setError('Must differ by exactly 1 letter'); setTimeout(() => setError(''), 2000); return; }
    if (!VALID_4_LETTER_WORDS.has(word.toLowerCase())) { setError('Not a valid word'); setTimeout(() => setError(''), 2000); return; }
    if (chain.includes(word)) { setError('Already used!'); setTimeout(() => setError(''), 2000); return; }

    const newChain = [...chain, word];
    setChain(newChain);
    setInput('');
    setError('');
    setHintWord(null);

    if (word === puzzle.end) finishGame(newChain.length - 1);
  }, [input, chain, puzzle, seconds]);

  const hint = useCallback(() => {
    if (gameOver) return;
    const currentWord = chain[chain.length - 1];
    const nextWord = bfsNextStep(currentWord, puzzle.end, VALID_4_LETTER_WORDS);
    if (!nextWord) return;
    setHintsUsed(h => h + 1);
    setHintWord(nextWord);
    setInput(nextWord);
    setTimeout(() => setHintWord(null), 4000);
  }, [gameOver, chain, puzzle]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const solution = puzzle.solution || [puzzle.start, puzzle.end];
    setChain(solution);
    setWasSolved(true);
    finishGame(solution.length - 1, true);
  }, [gameOver, puzzle, seconds]);

  return {
    puzzle, chain, input, setInput, error, won, gameOver,
    time: formatTime(seconds), hintWord, hintsUsed, wasSolved,
    submit, hint, solve,
  };
}
