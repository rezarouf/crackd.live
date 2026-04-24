import { useState, useCallback, useRef } from 'react';
import { calcXP, getTodaySeed, seededRandom, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

// Wood Block: place tetromino-like pieces on a grid.
// Clear rows/columns to score. No time pressure — score as high as possible.

const GRID_SIZE = 8;

const PIECES = [
  { cells: [[0,0],[0,1],[1,0],[1,1]], color: '#F5A623' }, // 2x2 square
  { cells: [[0,0],[0,1],[0,2],[0,3]], color: '#4A9EFF' }, // 4-straight H
  { cells: [[0,0],[1,0],[2,0],[3,0]], color: '#22C55E' }, // 4-straight V
  { cells: [[0,0],[0,1],[0,2],[1,2]], color: '#EC4899' }, // L
  { cells: [[0,0],[1,0],[1,1],[1,2]], color: '#A855F7' }, // J
  { cells: [[0,1],[0,2],[1,0],[1,1]], color: '#F97316' }, // S
  { cells: [[0,0],[0,1],[1,1],[1,2]], color: '#06B6D4' }, // Z
  { cells: [[0,0],[0,1],[0,2]], color: '#EAB308' },       // 3-straight H
  { cells: [[0,0],[1,0],[2,0]], color: '#84CC16' },       // 3-straight V
  { cells: [[0,0],[0,1],[1,0]], color: '#F43F5E' },       // corner
  { cells: [[0,0],[1,0],[1,1]], color: '#8B5CF6' },       // corner 2
  { cells: [[0,0]], color: '#14B8A6' },                   // 1x1
  { cells: [[0,0],[0,1]], color: '#FB923C' },             // 2-H
  { cells: [[0,0],[1,0]], color: '#60A5FA' },             // 2-V
];

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function pieceHasValidPlacement(grid, piece) {
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (canPlace(grid, piece, r, c)) return true;
  return false;
}

// Only pick pieces that have at least one valid placement on the current grid.
// If fewer than `count` placeable pieces exist among all PIECES, clear the board
// and pick from a fresh empty grid instead.
function pickPieces(rng, grid, count = 3) {
  const placeable = PIECES.filter(p => pieceHasValidPlacement(grid, p));

  // If the board is too full for enough pieces, caller should clear; return null signal
  if (placeable.length < count) return null;

  return Array.from({ length: count }, () => placeable[Math.floor(rng() * placeable.length)]);
}

function canPlace(grid, piece, row, col) {
  return piece.cells.every(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] === null;
  });
}

function placePiece(grid, piece, row, col) {
  const newGrid = grid.map(r => [...r]);
  piece.cells.forEach(([dr, dc]) => { newGrid[row + dr][col + dc] = piece.color; });
  return newGrid;
}

function clearLines(grid) {
  let newGrid = grid.map(r => [...r]);
  let cleared = 0;

  // Find full rows
  const fullRows = newGrid.map((row, i) => row.every(c => c !== null) ? i : -1).filter(i => i >= 0);
  const fullCols = Array.from({ length: GRID_SIZE }, (_, c) => newGrid.every(r => r[c] !== null) ? c : -1).filter(i => i >= 0);

  fullRows.forEach(r => { newGrid[r] = Array(GRID_SIZE).fill(null); cleared++; });
  fullCols.forEach(c => { newGrid.forEach(row => { row[c] = null; }); cleared++; });

  return { newGrid, cleared };
}

export function useWoodBlock({ difficulty = 'Medium' } = {}) {
  const seed = getTodaySeed() + 99;
  const rng = useRef(seededRandom(seed));
  const startTimeRef = useRef(Date.now());
  const movesRef = useRef(0);

  const [grid, setGrid] = useState(createEmptyGrid);
  const [queue, setQueue] = useState(() => pickPieces(rng.current, createEmptyGrid()) ?? pickPieces(rng.current, createEmptyGrid()));
  const [dragging, setDragging] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [combo, setCombo] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintPlacement, setHintPlacement] = useState(null); // { pieceIdx, row, col }

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const checkGameOver = useCallback((currentGrid, currentQueue) => {
    return currentQueue.every(piece =>
      !Array.from({ length: GRID_SIZE }, (_, r) =>
        Array.from({ length: GRID_SIZE }, (_, c) => canPlace(currentGrid, piece, r, c))
      ).flat().some(Boolean)
    );
  }, []);

  const placePieceOnGrid = useCallback((pieceIdx, row, col) => {
    const piece = queue[pieceIdx];
    if (!canPlace(grid, piece, row, col)) return false;

    const placed = placePiece(grid, piece, row, col);
    const { newGrid, cleared } = clearLines(placed);

    const newCombo = cleared > 0 ? combo + 1 : 0;
    const points = piece.cells.length + cleared * GRID_SIZE + (newCombo > 1 ? newCombo * 5 : 0);

    const newQueue = queue.filter((_, i) => i !== pieceIdx);
    let finalGrid = newGrid;
    let finalQueue = newQueue;
    if (newQueue.length === 0) {
      // Pick next batch only from pieces that fit the current board.
      // If none fit, clear the board and pick from a fresh empty grid.
      const next = pickPieces(rng.current, newGrid);
      if (next) {
        finalQueue = next;
      } else {
        finalGrid = createEmptyGrid();
        finalQueue = pickPieces(rng.current, finalGrid) ?? [];
        toast('Board cleared — fresh start!', { duration: 1500 });
      }
    }

    movesRef.current += 1;
    setGrid(finalGrid);
    setQueue(finalQueue);
    setScore(s => s + points);
    setCombo(newCombo);
    setDragging(null);
    setHoverCell(null);

    if (cleared > 0) toast(`${cleared > 1 ? '🔥 ' : ''}+${cleared} line${cleared > 1 ? 's' : ''} cleared!`, { duration: 1200 });
    if (newCombo >= 2) toast.success(`${newCombo}x Combo!`, { icon: '⚡' });

    if (checkGameOver(newGrid, finalQueue)) {
      setGameOver(true);
      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (!isCompletedToday('woodblock') && score + points > 50) {
        markComplete('woodblock');
        const baseXp = calcXP('woodblock', difficulty);
        const xp = applyHintPenalty(baseXp, hintsUsed, wasSolved);
        submitResult({ userId: user?.id, gameId: 'woodblock', difficulty, score: score + points, timeSeconds, xpEarned: xp, completed: true });
        saveGameResult({ userId: user?.id, gameType: 'woodblock', score: score + points, timeSeconds, difficulty, xpEarned: xp });
        toast.success(`+${xp} XP!`, { icon: '🪵' });
      }
    }

    return true;
  }, [grid, queue, combo, score, hintsUsed, wasSolved, checkGameOver, difficulty, user, isCompletedToday, markComplete, submitResult]);

  const hint = useCallback(() => {
    if (gameOver) return;
    // Find first valid placement for first piece
    for (let pi = 0; pi < queue.length; pi++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlace(grid, queue[pi], r, c)) {
            setHintsUsed(h => h + 1);
            setHintPlacement({ pieceIdx: pi, row: r, col: c });
            toast(`💡 Piece ${pi + 1} fits at row ${r + 1}, col ${c + 1}`, { duration: 3000 });
            setTimeout(() => setHintPlacement(null), 3000);
            return;
          }
        }
      }
    }
  }, [gameOver, grid, queue]);

  // Solve = not meaningful for open-ended game; just mark with token XP
  const solve = useCallback(() => {
    if (gameOver) return;
    setWasSolved(true);
    setGameOver(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (!isCompletedToday('woodblock')) {
      markComplete('woodblock');
      const baseXp = calcXP('woodblock', difficulty);
      const xp = applyHintPenalty(baseXp, hintsUsed, true);
      submitResult({ userId: user?.id, gameId: 'woodblock', difficulty, score, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'woodblock', score, timeSeconds, difficulty, xpEarned: xp });
    }
  }, [gameOver, score, difficulty, hintsUsed, user, isCompletedToday, markComplete, submitResult]);

  const newGame = useCallback(() => {
    rng.current = seededRandom(Date.now());
    const freshGrid = createEmptyGrid();
    setGrid(freshGrid);
    setQueue(pickPieces(rng.current, freshGrid) ?? []);
    setScore(0); setCombo(0); setGameOver(false); setWon(false);
    setDragging(null); setHoverCell(null);
    setHintsUsed(0); setWasSolved(false); setHintPlacement(null);
    startTimeRef.current = Date.now(); movesRef.current = 0;
  }, []);

  const previewCells = (dragging !== null && hoverCell)
    ? queue[dragging]?.cells.map(([dr, dc]) => [hoverCell.row + dr, hoverCell.col + dc])
    : null;

  const canPreview = previewCells && previewCells.every(([r, c]) =>
    r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] === null
  );

  return {
    grid, queue, score, gameOver, won, combo, dragging, hoverCell, previewCells, canPreview,
    hintsUsed, wasSolved, hintPlacement,
    setDragging, setHoverCell, placePieceOnGrid, hint, solve, newGame, GRID_SIZE,
  };
}
