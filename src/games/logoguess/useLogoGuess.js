import { useState, useEffect, useRef } from 'react';
import { LOGOS } from './logoData.js';

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
  const [queue, setQueue]     = useState(() => shuffle(LOGOS));
  const [idx, setIdx]         = useState(0);
  const [streak, setStreak]   = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [input, setInput]     = useState('');
  const [flash, setFlash]     = useState(null); // null | 'correct' | 'wrong'
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Reshuffle when we exhaust the queue — endless play
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
      }, 500);
    } else {
      setFlash('wrong');
      timerRef.current = setTimeout(() => {
        setFlash(null);
        setGameOver(true);
      }, 800);
    }
  }

  function handleSkip() {
    if (gameOver || flash) return;
    setGameOver(true);
  }

  function newGame() {
    clearTimeout(timerRef.current);
    setQueue(shuffle(LOGOS));
    setIdx(0);
    setStreak(0);
    setGameOver(false);
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
    gameOver,
    input,
    setInput,
    flash,
    handleGuess,
    handleSkip,
    newGame,
    shareResult,
  };
}
