import { useState, useCallback, useEffect } from 'react';
import { EMOJI_PHRASES } from './emojiPhraseData.js';
import { seededRandom, getTodaySeed, formatTime, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

function getDailyPhrase() {
  const rng = seededRandom(getTodaySeed() + 'emojiphrase');
  return EMOJI_PHRASES[Math.floor(rng() * EMOJI_PHRASES.length)];
}

export function useEmojiPhrase() {
  const phrase = getDailyPhrase();
  const answer = phrase.answer.toUpperCase();

  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintText, setHintText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const MAX_GUESSES = 5;

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  function finishGame(guessCount, isWin = true, solved = false, hints = hintsUsed) {
    markComplete('emojiphrase');
    const baseXp = calcXP('emojiphrase', 'Easy');
    const xp = isWin ? applyHintPenalty(baseXp, hints, solved) : 0;
    if (isWin) submitResult({ userId: user?.id, gameId: 'emojiphrase', difficulty: 'Easy', score: Math.max(50, 500 - (guessCount - 1) * 80 - hints * 50), timeSeconds: seconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'emojiphrase', score: guessCount, timeSeconds: seconds, difficulty: 'Easy', xpEarned: xp });
  }

  const submit = useCallback(() => {
    const guess = input.trim().toUpperCase();
    if (!guess) return;
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setInput('');
    if (guess === answer) {
      setWon(true);
      setGameOver(true);
      finishGame(newGuesses.length, true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      finishGame(newGuesses.length, false);
    }
  }, [input, guesses, answer, seconds]);

  const hint = useCallback(() => {
    if (gameOver) return;
    const h = hintsUsed + 1;
    setHintsUsed(h);
    if (h === 1) {
      setHintText(`💡 ${phrase.hint}`);
    } else {
      // Reveal one more letter of the answer
      const revealed = answer.split('').map((ch, i) => (i < h || ch === ' ') ? ch : '_').join('');
      setHintText(`💡 ${revealed}`);
    }
  }, [gameOver, hintsUsed, phrase, answer]);

  const solve = useCallback(() => {
    if (gameOver) return;
    setWon(true);
    setGameOver(true);
    setWasSolved(true);
    finishGame(guesses.length, true);
  }, [gameOver, guesses, seconds]);

  function getLetterFeedback(guess) {
    return guess.split('').map((ch, i) => {
      if (ch === answer[i]) return 'correct';
      if (answer.includes(ch)) return 'present';
      return 'absent';
    });
  }

  return {
    phrase, answer, guesses, input, setInput, won, gameOver,
    hintsUsed, wasSolved, hintText, MAX_GUESSES, time: formatTime(seconds),
    submit, hint, solve, getLetterFeedback,
  };
}
