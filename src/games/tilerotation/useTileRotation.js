import { useState, useCallback, useRef } from 'react';
import { seededRandom, getTodaySeed, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const TILE_TYPES = {
  I:    [1,0,1,0],
  L:    [1,1,0,0],
  T:    [1,1,0,1],
  FULL: [1,1,1,1],
  DEAD: [1,0,0,0],
};
const TILE_NAMES = Object.keys(TILE_TYPES);
const SIZE = 4;

// connections = [top, right, bottom, left]
// clockwise rotation: new top = old left
function rotateTile(c) { return [c[3], c[0], c[1], c[2]]; }
function rotateTileN(c, n) { let r = [...c]; for (let i = 0; i < n % 4; i++) r = rotateTile(r); return r; }

// Build a valid solved board first, then scramble.
// Each tile is chosen so its top/left edges match its already-placed neighbours —
// this guarantees isBoardSolved() will be true on the solution state.
function generateBoard(rng) {
  // Step 1: valid solved board
  const solved = [];
  for (let r = 0; r < SIZE; r++) {
    solved.push([]);
    for (let c = 0; c < SIZE; c++) {
      const needTop  = r > 0 ? solved[r - 1][c].connections[2] : null;
      const needLeft = c > 0 ? solved[r][c - 1].connections[1] : null;

      // Collect all unique (type, conn) pairs satisfying the constraints
      const seen = new Set();
      const candidates = [];
      for (const type of TILE_NAMES) {
        for (let rot = 0; rot < 4; rot++) {
          const conn = rotateTileN(TILE_TYPES[type], rot);
          if (needTop  !== null && conn[0] !== needTop)  continue;
          if (needLeft !== null && conn[3] !== needLeft) continue;
          const sig = conn.join();
          if (seen.has(sig)) continue;
          seen.add(sig);
          candidates.push({ type, conn });
        }
      }

      const pick = candidates[Math.floor(rng() * candidates.length)];
      solved[r].push({ type: pick.type, connections: pick.conn });
    }
  }

  // Step 2: scramble every tile 1–3 steps so none start solved
  const board = solved.map(row =>
    row.map(tile => {
      const scramRot = (Math.floor(rng() * 3) + 1); // 1, 2, or 3
      return {
        type: tile.type,
        connections: rotateTileN(tile.connections, scramRot),
        solConnections: tile.connections,
      };
    })
  );

  return board;
}

function isBoardSolved(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1 && board[r][c].connections[1] !== board[r][c + 1].connections[3]) return false;
      if (r < SIZE - 1 && board[r][c].connections[2] !== board[r + 1][c].connections[0]) return false;
    }
  }
  return true;
}

export function useTileRotation() {
  const rng = seededRandom(getTodaySeed() + 'tilerotation');
  const initBoard = generateBoard(rng);

  const startTimeRef = useRef(Date.now());
  const [board, setBoard]           = useState(initBoard);
  const [won, setWon]               = useState(false);
  const [rotations, setRotations]   = useState(0);
  const [hintsUsed, setHintsUsed]   = useState(0);
  const [wasSolved, setWasSolved]   = useState(false);
  const [hintCell, setHintCell]     = useState(null);

  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  function finishGame(rots, solved = false, hints = hintsUsed) {
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('tilerotation');
    const baseXp = calcXP('tilerotation', 'Hard');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'tilerotation', difficulty: 'Hard', score: Math.max(100, 1000 - rots * 5), timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'tilerotation', score: rots, timeSeconds, difficulty: 'Hard', xpEarned: xp });
  }

  const rotateTileAt = useCallback((r, c) => {
    if (won) return;
    setBoard(prev => {
      const n = prev.map(row => row.map(t => ({ ...t, connections: [...t.connections] })));
      n[r][c].connections = rotateTile(n[r][c].connections);
      const rots = rotations + 1;
      if (isBoardSolved(n)) finishGame(rots);
      return n;
    });
    setRotations(r => r + 1);
    setHintCell(null);
  }, [won, rotations]);

  const hint = useCallback(() => {
    if (won) return;
    let target = null;
    outer: for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c].connections.join() !== board[r][c].solConnections.join()) {
          target = [r, c]; break outer;
        }
      }
    }
    if (!target) return;
    const [tr, tc] = target;
    const h = hintsUsed + 1;
    setHintsUsed(h);
    setHintCell(target);
    setBoard(prev => {
      const n = prev.map(row => row.map(t => ({ ...t, connections: [...t.connections] })));
      n[tr][tc].connections = [...n[tr][tc].solConnections];
      if (isBoardSolved(n)) finishGame(rotations, false, h);
      return n;
    });
    setTimeout(() => setHintCell(null), 2000);
  }, [won, board, hintsUsed, rotations]);

  // Rotate every tile back to its solution orientation
  const solve = useCallback(() => {
    if (won) return;
    setBoard(prev => prev.map(row => row.map(t => ({ ...t, connections: [...t.solConnections] }))));
    setWasSolved(true);
    finishGame(rotations, true);
  }, [won, rotations]);

  return { board, won, rotations, SIZE, hintsUsed, wasSolved, hintCell, rotateTileAt, hint, solve };
}
