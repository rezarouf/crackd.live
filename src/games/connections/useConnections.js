import { useState, useCallback, useEffect, useRef } from 'react';
import { calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

const MAX_MISTAKES = 4;
const COLOR_ORDER = ['yellow', 'green', 'blue', 'purple'];

function getDailyKey() {
  return `connections-daily-${new Date().toISOString().slice(0, 10)}`;
}
function loadSaved() {
  try { const r = localStorage.getItem(getDailyKey()); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(getDailyKey(), JSON.stringify(state)); } catch {}
}

export function useConnections(puzzle) {
  const allWords = puzzle.categories.flatMap(c => c.words.map(w => ({ word: w, category: c.name, color: c.color })));

  const startTimeRef = useRef(Date.now());
  const savedRef = useRef(loadSaved());
  const saved = savedRef.current;
  const isRestored = !!(saved?.gameOver);

  const [words, setWords]       = useState(() => shuffleArr([...allWords]));
  const [selected, setSelected] = useState([]);
  const [solved, setSolved]     = useState(() => saved?.solved || []);
  const [mistakes, setMistakes] = useState(() => saved?.mistakes ?? 0);
  const [shake, setShake]       = useState(false);
  const [gameOver, setGameOver] = useState(() => saved?.gameOver ?? false);
  const [won, setWon]           = useState(() => saved?.won ?? false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintWord, setHintWord] = useState(null);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    saveState({ solved, mistakes, gameOver, won });
  }, [solved, mistakes, gameOver, won]);

  function finishGame(isWin, newSolved, mist, hints = hintsUsed, solved = wasSolved) {
    setGameOver(true); setWon(isWin);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const difficulty = mist === 0 ? 'Expert' : mist <= 1 ? 'Hard' : 'Medium';
    const mistakesLeft = MAX_MISTAKES - mist;
    if (isWin && !isCompletedToday('connections')) {
      markComplete('connections');
      const baseXp = calcXP('connections', difficulty);
      const xp = applyHintPenalty(baseXp, hints, solved);
      submitResult({ userId: user?.id, gameId: 'connections', difficulty, score: mistakesLeft, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'connections', score: mistakesLeft, timeSeconds, difficulty, xpEarned: xp });
      toast.success(`+${xp} XP!`, { icon: '⭐' });
    }
    if (!isWin) {
      saveGameResult({ userId: user?.id, gameType: 'connections', score: 0, timeSeconds, difficulty, xpEarned: 0 });
      toast.error('Out of guesses!');
    }
  }

  const toggleWord = useCallback((wordObj) => {
    if (gameOver) return;
    if (solved.find(s => s.words.includes(wordObj.word))) return;
    setSelected(prev => {
      const exists = prev.find(w => w.word === wordObj.word);
      if (exists) return prev.filter(w => w.word !== wordObj.word);
      if (prev.length >= 4) return prev;
      return [...prev, wordObj];
    });
    setHintWord(null);
  }, [gameOver, solved]);

  const submitGuess = useCallback(() => {
    if (selected.length !== 4) { toast.error('Select exactly 4 words'); return; }
    const categoryName = selected[0].category;
    const allSame = selected.every(w => w.category === categoryName);
    if (allSame) {
      const cat = puzzle.categories.find(c => c.name === categoryName);
      const newSolved = [...solved, { ...cat, words: cat.words }];
      setSolved(newSolved); setSelected([]);
      toast.success(`✅ ${categoryName}`);
      if (newSolved.length === puzzle.categories.length) finishGame(true, newSolved, mistakes);
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes); setShake(true); setTimeout(() => setShake(false), 500);
      if (newMistakes >= MAX_MISTAKES) finishGame(false, solved, newMistakes);
      else toast.error(`Wrong! ${MAX_MISTAKES - newMistakes} ${MAX_MISTAKES - newMistakes === 1 ? 'guess' : 'guesses'} left`);
      setSelected([]);
    }
  }, [selected, solved, mistakes, puzzle, user, hintsUsed, wasSolved]);

  const shuffle = () => setWords(prev => shuffleArr([...prev]));

  const getWordState = (wordObj) => {
    if (solved.find(s => s.words.includes(wordObj.word))) return 'solved';
    if (selected.find(w => w.word === wordObj.word)) return 'selected';
    if (hintWord === wordObj.word) return 'hint';
    return 'idle';
  };

  const hint = useCallback(() => {
    if (gameOver) return;
    // Find unsolved category with fewest selected words and reveal one of its words
    const unsolvedCats = puzzle.categories.filter(cat => !solved.find(s => s.name === cat.name));
    if (!unsolvedCats.length) return;
    const easiest = unsolvedCats[0]; // first = easiest by puzzle order
    const unhinted = easiest.words.filter(w => !selected.find(s => s.word === w));
    if (!unhinted.length) return;
    const pick = unhinted[0];
    setHintsUsed(h => h + 1);
    setHintWord(pick);
    toast(`💡 "${pick}" belongs to one group`, { duration: 4000 });
    setTimeout(() => setHintWord(null), 4000);
  }, [gameOver, puzzle, solved, selected, hintsUsed]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const allSolved = puzzle.categories.map(cat => ({ ...cat }));
    setSolved(allSolved); setSelected([]);
    setWasSolved(true);
    finishGame(true, allSolved, mistakes, hintsUsed, true);
  }, [gameOver, puzzle, mistakes, hintsUsed]);

  const solvedInOrder = COLOR_ORDER.map(color => solved.find(s => s.color === color)).filter(Boolean);

  return {
    words, selected, solved: solvedInOrder, mistakes, shake, gameOver, won,
    hintsUsed, wasSolved, hintWord, isRestored,
    toggleWord, submitGuess, shuffle, getWordState, MAX_MISTAKES,
    unsolvedWords: words.filter(w => !solved.find(s => s.words.includes(w.word))),
    hint, solve,
  };
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
