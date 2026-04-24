import { useState, useEffect, useCallback, useRef } from 'react';
import { SPELLING_BEE_PUZZLES } from './spellingbeeData.js';
import { seededRandom, getTodaySeed, formatTime, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

function getDailyPuzzle() {
  const seed = getTodaySeed();
  const rng = seededRandom(seed + 'spellingbee');
  const idx = Math.floor(rng() * SPELLING_BEE_PUZZLES.length);
  return SPELLING_BEE_PUZZLES[idx];
}

function scoreWord(word, pangram) {
  if (word.length < 4) return 0;
  const upper = word.toUpperCase();
  if (word.length === 4) return 1;
  const unique = new Set(upper.split('')).size;
  const allLetters = pangram ? new Set(pangram.split('')).size : 7;
  if (unique === allLetters) return word.length + 7;
  return word.length;
}

export function useSpellingBee() {
  const puzzle = getDailyPuzzle();
  const allLetters = [puzzle.center, ...puzzle.letters];
  const validWords = puzzle.words.map(w => w.toUpperCase());

  const [input, setInput] = useState('');
  const [found, setFound] = useState([]);
  const foundSet = useRef(new Set());
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const resultSavedRef = useRef(false);

  const { submitResult, isCompletedToday, markComplete } = useGameStore();
  const { user } = useAuthStore();
  const alreadyDone = isCompletedToday('spellingbee');

  useEffect(() => {
    if (!timerActive || gameOver) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, gameOver]);

  const maxScore = validWords.reduce((acc, w) => acc + scoreWord(w, puzzle.pangram), 0);

  const addLetter = useCallback((letter) => {
    setInput(prev => prev + letter.toUpperCase());
  }, []);

  const deleteLetter = useCallback(() => {
    setInput(prev => prev.slice(0, -1));
  }, []);

  const clearInput = useCallback(() => setInput(''), []);

  function showMsg(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 1500);
  }

  function saveResult(finalScore, timeSeconds, solved = false, hints = hintsUsed) {
    if (resultSavedRef.current) return;
    resultSavedRef.current = true;
    const baseXp = calcXP('spellingbee', 'Medium');
    const xp = applyHintPenalty(baseXp, hints, solved);
    saveGameResult({ userId: user?.id, gameType: 'spellingbee', score: finalScore, timeSeconds, difficulty: 'Medium', xpEarned: xp });
    return xp;
  }

  function finishGame(finalFound, finalScore, solved = false, hints = hintsUsed) {
    setGameOver(true);
    setTimerActive(false);
    markComplete('spellingbee');
    const baseXp = calcXP('spellingbee', 'Medium');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'spellingbee', difficulty: 'Medium', score: finalScore, timeSeconds: seconds, xpEarned: xp, completed: true });
    saveResult(finalScore, seconds, solved, hints);
  }

  const submit = useCallback(() => {
    const word = input.trim().toUpperCase();
    if (word.length < 4) { showMsg('Too short!'); return; }
    const center = puzzle.center ? puzzle.center.toUpperCase() : '';
    if (!center || !word.split('').includes(center)) { showMsg('Missing center letter!'); return; }
    if (!word.split('').every(l => allLetters.map(a => a.toUpperCase()).includes(l))) { showMsg('Bad letters!'); return; }
    if (foundSet.current.has(word)) { showMsg('Already found!'); return; }
    if (!validWords.includes(word)) { showMsg('Not in word list'); return; }

    foundSet.current.add(word);
    const pts = scoreWord(word, puzzle.pangram);
    const newFound = [...found, word];
    const newScore = score + pts;
    setFound(newFound);
    setScore(newScore);
    setInput('');

    const isPangram = word.toUpperCase() === puzzle.pangram?.toUpperCase();
    showMsg(isPangram ? '🌟 Pangram!' : pts >= 5 ? 'Amazing!' : 'Nice!');

    if (newFound.length >= validWords.length) {
      finishGame(newFound, newScore);
    } else if (!resultSavedRef.current && maxScore > 0 && newScore / maxScore >= 0.7) {
      saveResult(newScore, seconds);
    }
  }, [input, found, score, puzzle, allLetters, validWords, seconds, user, submitResult, markComplete, maxScore, hintsUsed]);

  const hint = useCallback(() => {
    if (gameOver) return;
    const unfound = validWords.filter(w => !found.includes(w));
    if (!unfound.length) return;
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    const h = hintsUsed + 1;
    setHintsUsed(h);
    showMsg(`💡 Try a ${pick.length}-letter word starting with "${pick[0]}"`);
  }, [gameOver, validWords, found, hintsUsed]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const allWords = validWords;
    const totalScore = allWords.reduce((acc, w) => acc + scoreWord(w, puzzle.pangram), 0);
    foundSet.current = new Set(allWords);
    setFound(allWords);
    setScore(totalScore);
    setWasSolved(true);
    finishGame(allWords, totalScore, true);
    showMsg('🤖 Solved!');
  }, [gameOver, validWords, puzzle, seconds, user]);

  const getRank = () => {
    const pct = maxScore > 0 ? score / maxScore : 0;
    if (pct >= 1.0) return { label: 'Queen Bee 👑', color: '#F5A623' };
    if (pct >= 0.7) return { label: 'Genius', color: '#A855F7' };
    if (pct >= 0.5) return { label: 'Amazing', color: '#4A9EFF' };
    if (pct >= 0.3) return { label: 'Great', color: '#22C55E' };
    if (pct >= 0.15) return { label: 'Good', color: '#8B95A1' };
    return { label: 'Beginner', color: '#8B95A1' };
  };

  return {
    puzzle, allLetters, found, score, maxScore, input, message, gameOver,
    time: formatTime(seconds), rank: getRank(),
    hintsUsed, wasSolved,
    addLetter, deleteLetter, clearInput, submit, hint, solve, alreadyDone,
  };
}
