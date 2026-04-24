import { useState, useCallback, useRef } from 'react';
import { calcXP, getTodaySeed, seededRandom, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

// A "pin" is a plug that blocks a colored ball's path to a goal.
// Pull pins in the right order so balls fall into matching buckets.

const BUCKET_COLORS = ['#F5A623', '#4A9EFF', '#22C55E', '#EC4899'];

function generateLevel(difficulty, seed) {
  const rng = seededRandom(seed);
  const count = { Easy: 2, Medium: 3, Hard: 4, Expert: 4 }[difficulty] || 3;
  const pinCount = { Easy: 1, Medium: 2, Hard: 3, Expert: 4 }[difficulty] || 2;
  const colors = BUCKET_COLORS.slice(0, count);

  // BACKWARD GENERATION:
  // Start from solved state (all balls in buckets, no pins).
  // Build the pull sequence by randomly interleaving per-column pin events,
  // respecting the physical constraint that within each column pin 0 must
  // be pulled before pin 1, pin 1 before pin 2, etc.
  // This guarantees every puzzle has a valid solution by construction.

  // Each column contributes an ordered queue of pin pulls: [pin-c-0, pin-c-1, ...]
  const queues = Array.from({ length: count }, (_, c) =>
    Array.from({ length: pinCount }, (_, j) => `pin-${c}-${j}`)
  );

  // Randomly interleave queues while respecting per-column ordering
  const correctOrder = [];
  while (queues.some(q => q.length > 0)) {
    const available = queues.map((q, c) => q.length > 0 ? c : -1).filter(c => c >= 0);
    const colIdx = available[Math.floor(rng() * available.length)];
    correctOrder.push(queues[colIdx].shift());
  }

  // Build cols with pin order derived from correctOrder position
  const cols = colors.map((color, c) => ({
    color,
    pins: Array.from({ length: pinCount }, (_, j) => ({
      id: `pin-${c}-${j}`,
      color,
      pulled: false,
      order: correctOrder.indexOf(`pin-${c}-${j}`),
    })),
    bucketColor: color,
    ballReleased: false,
  }));

  return { cols, correctOrder };
}

export function usePinPull({ difficulty = 'Medium' } = {}) {
  const seed = getTodaySeed() + difficulty.length * 3;
  const initLevel = useRef(generateLevel(difficulty, seed));
  const startTimeRef = useRef(Date.now());

  const [cols, setCols] = useState(() => initLevel.current.cols.map(c => ({
    ...c, pins: c.pins.map(p => ({ ...p })),
  })));
  const [pullSequence, setPullSequence] = useState([]);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);
  const [animating, setAnimating] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const correctOrder = initLevel.current.correctOrder;

  const pullPin = useCallback((colIdx, pinId) => {
    if (won || failed || animating) return;
    const expectedNext = correctOrder[pullSequence.length];

    if (pinId !== expectedNext) {
      // Wrong pin — fail
      setFailed(true);
      toast.error('Wrong pin! Try again.', { icon: '❌' });
      return;
    }

    const newSeq = [...pullSequence, pinId];
    setPullSequence(newSeq);
    setAnimating(pinId);

    setTimeout(() => {
      setCols(prev => {
        const next = prev.map(c => ({
          ...c,
          pins: c.pins.map(p => p.id === pinId ? { ...p, pulled: true } : p),
        }));
        // Release ball if all pins in column pulled
        return next.map(c => ({
          ...c,
          ballReleased: c.pins.every(p => p.pulled),
        }));
      });
      setAnimating(null);

      if (newSeq.length === correctOrder.length) {
        setWon(true);
        const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (!isCompletedToday('pinpull')) {
          markComplete('pinpull');
          const baseXp = calcXP('pinpull', difficulty);
          const xp = applyHintPenalty(baseXp, hintsUsed, wasSolved);
          submitResult({ userId: user?.id, gameId: 'pinpull', difficulty, score: newSeq.length, timeSeconds, xpEarned: xp, completed: true });
          saveGameResult({ userId: user?.id, gameType: 'pinpull', score: newSeq.length, timeSeconds, difficulty, xpEarned: xp });
          toast.success(`+${xp} XP!`, { icon: '📌' });
        }
      }
    }, 400);
  }, [won, failed, animating, pullSequence, correctOrder, difficulty, user, isCompletedToday, markComplete, submitResult]);

  const hint = useCallback(() => {
    if (won || failed) return;
    const nextPin = correctOrder[pullSequence.length];
    if (!nextPin) return;
    setHintsUsed(h => h + 1);
    toast(`💡 Pull pin: ${nextPin}`, { duration: 3000 });
  }, [won, failed, pullSequence, correctOrder]);

  const solve = useCallback(() => {
    if (won) return;
    // Pull all remaining pins in order
    const remaining = correctOrder.slice(pullSequence.length);
    const allPulled = [...pullSequence, ...remaining];
    setPullSequence(allPulled);
    setCols(prev => prev.map(c => ({ ...c, pins: c.pins.map(p => ({ ...p, pulled: true })), ballReleased: true })));
    setWasSolved(true);
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (!isCompletedToday('pinpull')) {
      markComplete('pinpull');
      const baseXp = calcXP('pinpull', difficulty);
      const xp = applyHintPenalty(baseXp, hintsUsed, true);
      submitResult({ userId: user?.id, gameId: 'pinpull', difficulty, score: allPulled.length, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'pinpull', score: allPulled.length, timeSeconds, difficulty, xpEarned: xp });
    }
  }, [won, pullSequence, correctOrder, difficulty, hintsUsed, user, isCompletedToday, markComplete, submitResult]);

  const reset = useCallback(() => {
    setCols(initLevel.current.cols.map(c => ({
      ...c, pins: c.pins.map(p => ({ ...p, pulled: false })), ballReleased: false,
    })));
    setPullSequence([]); setWon(false); setFailed(false); setAnimating(null);
    setHintsUsed(0); setWasSolved(false); startTimeRef.current = Date.now();
  }, []);

  return { cols, pullSequence, won, failed, animating, hintsUsed, wasSolved, pullPin, hint, solve, reset };
}
