import { useState, useCallback, useRef } from 'react';
import { getDailyQuote, generateCipher, encodeText } from './quotes.js';
import { calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

export function useCryptogram({ difficulty = 'Medium' } = {}) {
  const quote  = getDailyQuote();
  const cipher = generateCipher(0.42);
  const encoded = encodeText(quote.text, cipher);

  const startTimeRef = useRef(Date.now());
  const [selectedEncoded, setSelected] = useState(null);
  const [solved, setSolved]   = useState({});
  const [hintsUsed, setHints] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon]           = useState(false);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const uniqueEncoded = [...new Set(quote.text.split('').filter(c => /[A-Z]/.test(c)).map(c => cipher.encode[c]))];

  function checkWin(newSolved, hints = hintsUsed, solved2 = wasSolved) {
    const allSolved = uniqueEncoded.every(el => newSolved[el] === cipher.decode[el]);
    if (allSolved) {
      setGameOver(true); setWon(true);
      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (!isCompletedToday('cryptogram')) {
        markComplete('cryptogram');
        const baseXp = calcXP('cryptogram', hints === 0 && !solved2 ? 'Expert' : difficulty);
        const xp = applyHintPenalty(baseXp, hints, solved2);
        submitResult({ userId: user?.id, gameId: 'cryptogram', difficulty, score: 1, timeSeconds, xpEarned: xp, completed: true });
        saveGameResult({ userId: user?.id, gameType: 'cryptogram', score: hints, timeSeconds, difficulty, xpEarned: xp });
        toast.success(`+${xp} XP!`, { icon: '⭐' });
        if (hints === 0 && !solved2) toast.success('No Hints achievement! 🧠');
      }
    }
  }

  const selectLetter = useCallback((encodedLetter) => {
    if (gameOver) return;
    if (/^[A-Z]$/.test(encodedLetter)) setSelected(prev => prev === encodedLetter ? null : encodedLetter);
  }, [gameOver]);

  const typeLetter = useCallback((realLetter) => {
    if (!selectedEncoded || gameOver) return;
    const newSolved = { ...solved, [selectedEncoded]: realLetter };
    setSolved(newSolved);
    checkWin(newSolved);
    setSelected(null);
  }, [selectedEncoded, solved, gameOver, cipher, quote, hintsUsed, wasSolved]);

  const useHint = useCallback(() => {
    if (gameOver) return;
    const unsolved = uniqueEncoded.filter(el => solved[el] !== cipher.decode[el]);
    if (!unsolved.length) return;
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)];
    const newSolved = { ...solved, [pick]: cipher.decode[pick] };
    setSolved(newSolved);
    const h = hintsUsed + 1;
    setHints(h);
    toast(`💡 Hint ${h} used`, { icon: '💡' });
    checkWin(newSolved, h);
  }, [hintsUsed, gameOver, cipher, solved, uniqueEncoded]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const fullSolved = {};
    uniqueEncoded.forEach(el => { fullSolved[el] = cipher.decode[el]; });
    setSolved(fullSolved);
    setWasSolved(true);
    checkWin(fullSolved, hintsUsed, true);
  }, [gameOver, uniqueEncoded, cipher, hintsUsed]);

  const getDisplayChar = (encodedChar) => {
    if (!/[A-Z]/.test(encodedChar)) return encodedChar;
    return solved[encodedChar] || '';
  };
  const isCorrect = (encodedChar) => solved[encodedChar] === cipher.decode[encodedChar];
  const words = encoded.split(' ');

  return {
    quote, encoded, words, cipher, solved, selectedEncoded,
    hintsUsed, wasSolved, gameOver, won,
    selectLetter, typeLetter, useHint, hint: useHint, solve, getDisplayChar, isCorrect,
  };
}
