import { useState, useEffect, useCallback, useRef } from 'react';
import { generatePuzzle } from './sudokuGenerator.js';
import { calcXP, formatTime, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

export function useSudoku({ difficulty = 'Medium' } = {}) {
  const generated = useRef(generatePuzzle(difficulty));
  const { puzzle, solution } = generated.current;

  const [board, setBoard]         = useState(puzzle.map(r => [...r]));
  const [notes, setNotes]         = useState(() => Array.from({ length: 81 }, () => new Set()));
  const [selected, setSelected]   = useState(null);
  const [pencilMode, setPencil]   = useState(false);
  const [showErrors, setShowErrors] = useState(true);
  const [history, setHistory]     = useState([]);
  const [gameOver, setGameOver]   = useState(false);
  const [won, setWon]             = useState(false);
  const [paused, setPaused]       = useState(false);
  const [time, setTime]           = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const mistakeCountRef = useRef(0);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!gameOver && !paused) { const t = setInterval(() => setTime(p => p + 1), 1000); return () => clearInterval(t); }
  }, [gameOver, paused]);

  const isGiven = useCallback((row, col) => puzzle[row][col] !== 0, [puzzle]);

  function finishGame(b, hints = hintsUsed, solved = wasSolved) {
    setGameOver(true); setWon(true);
    if (!isCompletedToday('sudoku')) {
      markComplete('sudoku');
      const baseXp = calcXP('sudoku', difficulty);
      const xp = applyHintPenalty(baseXp, hints, solved);
      submitResult({ userId: user?.id, gameId: 'sudoku', difficulty, score: time, timeSeconds: time, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'sudoku', score: mistakeCountRef.current, timeSeconds: time, difficulty, xpEarned: xp });
      toast.success(`+${xp} XP! Solved in ${formatTime(time)}`);
    }
  }

  const setCellValue = useCallback((row, col, val) => {
    if (isGiven(row, col) || gameOver) return;
    const idx = row * 9 + col;
    if (pencilMode) {
      setNotes(prev => { const n = prev.map(s => new Set(s)); n[idx].has(val) ? n[idx].delete(val) : n[idx].add(val); return n; });
      return;
    }
    setHistory(prev => [...prev, { board: board.map(r => [...r]), notes: notes.map(s => new Set(s)) }]);
    const newBoard = board.map(r => [...r]);
    const newVal = newBoard[row][col] === val ? 0 : val;
    if (newVal !== 0 && newVal !== solution[row][col]) mistakeCountRef.current += 1;
    newBoard[row][col] = newVal;
    setBoard(newBoard);
    setNotes(prev => { const n = prev.map(s => new Set(s)); n[idx].clear(); return n; });
    if (newBoard.every((r, ri) => r.every((c, ci) => c === solution[ri][ci]))) finishGame(newBoard);
  }, [board, notes, pencilMode, gameOver, isGiven, solution, difficulty, time, hintsUsed, wasSolved]);

  const undo = useCallback(() => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setBoard(last.board); setNotes(last.notes);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  const handleKeyboard = useCallback((e) => {
    if (!selected) return;
    const [row, col] = selected;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) setCellValue(row, col, num);
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      if (!isGiven(row, col)) { const nb = board.map(r => [...r]); nb[row][col] = 0; setBoard(nb); }
    }
    if (e.key === 'ArrowUp'    && row > 0) setSelected([row - 1, col]);
    if (e.key === 'ArrowDown'  && row < 8) setSelected([row + 1, col]);
    if (e.key === 'ArrowLeft'  && col > 0) setSelected([row, col - 1]);
    if (e.key === 'ArrowRight' && col < 8) setSelected([row, col + 1]);
  }, [selected, board, setCellValue, isGiven]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const isError = useCallback((row, col) => {
    if (!showErrors) return false;
    const val = board[row][col];
    if (val === 0) return false;
    return val !== solution[row][col];
  }, [board, solution, showErrors]);

  const isRelated = useCallback((row, col) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    return row === sr || col === sc || (Math.floor(row/3) === Math.floor(sr/3) && Math.floor(col/3) === Math.floor(sc/3));
  }, [selected]);

  const isHighlighted = useCallback((row, col) => {
    if (!selected) return false;
    const selVal = board[selected[0]][selected[1]];
    return selVal !== 0 && board[row][col] === selVal;
  }, [selected, board]);

  const hint = useCallback(() => {
    if (gameOver) return;
    // Fill in one random incorrect/empty cell with its solution value
    const empties = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (!isGiven(r, c) && board[r][c] !== solution[r][c]) empties.push([r, c]);
    }
    if (!empties.length) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const h = hintsUsed + 1;
    setHintsUsed(h);
    setHistory(prev => [...prev, { board: board.map(row => [...row]), notes: notes.map(s => new Set(s)) }]);
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = solution[r][c];
    setBoard(newBoard);
    setSelected([r, c]);
    toast(`💡 Filled position (${r+1},${c+1})`, { duration: 2000 });
    if (newBoard.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]))) finishGame(newBoard, h);
  }, [gameOver, board, notes, solution, isGiven, hintsUsed, time]);

  const solve = useCallback(() => {
    if (gameOver) return;
    const fullBoard = solution.map(r => [...r]);
    setBoard(fullBoard);
    setWasSolved(true);
    finishGame(fullBoard, hintsUsed, true);
  }, [gameOver, solution, hintsUsed, time]);

  const newGame = () => {
    generated.current = generatePuzzle(difficulty);
    setBoard(generated.current.puzzle.map(r => [...r]));
    setNotes(Array.from({ length: 81 }, () => new Set()));
    setSelected(null); setHistory([]); setGameOver(false); setWon(false); setTime(0);
    setHintsUsed(0); setWasSolved(false); mistakeCountRef.current = 0;
  };

  return {
    board, notes, selected, pencilMode, showErrors, gameOver, won, paused,
    time: formatTime(time),
    hintsUsed, wasSolved,
    setSelected, setCellValue, setPencil, setShowErrors, setPaused, undo, newGame,
    isGiven, isError, isRelated, isHighlighted, puzzle, solution, difficulty,
    hint, solve,
  };
}
