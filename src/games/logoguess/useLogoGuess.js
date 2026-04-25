import { useState, useEffect, useRef } from 'react';
import { LOGOS } from './logoData.js';

const MAX_SKIPS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function isMatch(input, logo) {
  const n = normalize(input);
  if (!n) return false;
  if (n === normalize(logo.name)) return true;
  return (logo.aliases || []).some(a => n === normalize(a));
}

export function useLogoGuess(difficulty = 'medium') {
  const [queue, setQueue]       = useState(() => shuffle(LOGOS));
  const [idx, setIdx]           = useState(0);
  const [streak, setStreak]     = useState(0);
  const [skipsLeft, setSkipsLeft] = useState(MAX_SKIPS);
  const [gameOver, setGameOver] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(null); // correct name shown on game over
  const [input, setInput]       = useState('');
  const [flash, setFlash]       = useState(null); // null | 'correct' | 'wrong'
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Reshuffle when queue exhausted — endless play
  useEffect(() => {
    if (!gameOver && idx >= queue.length) {
      setQueue(shuffle(LOGOS));
      setIdx(0);
    }
  }, [idx, queue.length, gameOver]);

  const current = gameOver ? null : (queue[idx] ?? null);

  function handleGuess() {
    if (gameOver || flash || !input.trim() || !current) return;

    if (isMatch(input, current)) {
      setFlash('correct');
      setStreak(s => s + 1);
      setInput('');
      timerRef.current = setTimeout(() => {
        setFlash(null);
        setIdx(i => i + 1);
      }, 600);
    } else {
      setWrongAnswer(current.name);
      setFlash('wrong');
      timerRef.current = setTimeout(() => {
        setFlash(null);
        setGameOver(true);
      }, 900);
    }
  }

  // Skip moves to next logo, preserves streak, costs one skip token
  function handleSkip() {
    if (gameOver || flash || skipsLeft <= 0) return;
    setSkipsLeft(s => s - 1);
    setInput('');
    setIdx(i => i + 1);
  }

  function newGame() {
    clearTimeout(timerRef.current);
    setQueue(shuffle(LOGOS));
    setIdx(0);
    setStreak(0);
    setSkipsLeft(MAX_SKIPS);
    setGameOver(false);
    setWrongAnswer(null);
    setInput('');
    setFlash(null);
  }

  function shareResult() {
    const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    const text = `🔥 I identified ${streak} logo${streak !== 1 ? 's' : ''} in a row on Crackd.live!\nMode: ${diffLabel} · Can you beat ${streak}?\n👉 crackd.live`;
    if (navigator.share) {
      navigator.share({ title: 'Logo Rush — Crackd.live', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return {
    current,
    streak,
    skipsLeft,
    gameOver,
    wrongAnswer,
    input,
    setInput,
    flash,
    handleGuess,
    handleSkip,
    newGame,
    shareResult,
  };
}
