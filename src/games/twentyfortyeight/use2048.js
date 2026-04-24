import { useState, useCallback, useEffect, useRef } from 'react';
import { seededRandom, getTodaySeed, calcXP, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { saveGameResult } from '../../lib/supabase.js';

const SIZE = 4;
const WIN_VALUE = 2048;

function emptyGrid() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }

function addTile(grid, rng, blocker = false) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return grid;
  const [r, c] = empty[Math.floor(rng() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = blocker ? -1 : (rng() < 0.9 ? 2 : 4);
  return newGrid;
}

function slideRow(row) {
  const nums = row.filter(n => n > 0);
  const merged = []; let score = 0; let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) { merged.push(nums[i] * 2); score += nums[i] * 2; i += 2; }
    else { merged.push(nums[i]); i++; }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
}

function moveGrid(grid, dir) {
  let newGrid = grid.map(r => [...r]);
  let totalScore = 0; let moved = false;
  const tf = { left: g => g, right: g => g.map(r => [...r].reverse()), up: g => Array.from({length:SIZE},(_,c)=>g.map(r=>r[c])), down: g => Array.from({length:SIZE},(_,c)=>g.map(r=>r[c]).reverse()) };
  const utf = { left: g => g, right: g => g.map(r => [...r].reverse()), up: g => Array.from({length:SIZE},(_,r)=>g.map(row=>row[r])), down: g => Array.from({length:SIZE},(_,r)=>g.map(row=>row[r]).reverse()) };
  let t = tf[dir](newGrid);
  t = t.map(row => {
    const blockers = row.map((v,i)=>v===-1?i:-1).filter(i=>i>=0);
    if (!blockers.length) { const {row:slid,score} = slideRow(row); totalScore+=score; if(slid.join()!==row.join()) moved=true; return slid; }
    const segs=[]; let prev=0;
    for(const bi of blockers){segs.push(row.slice(prev,bi));segs.push([-1]);prev=bi+1;}
    segs.push(row.slice(prev));
    const result=[];
    for(const seg of segs){if(seg[0]===-1){result.push(-1);continue;}const{row:slid,score}=slideRow(seg);totalScore+=score;if(slid.join()!==seg.join())moved=true;result.push(...slid.slice(0,seg.length));}
    return result;
  });
  newGrid = utf[dir](t);
  return { newGrid, score: totalScore, moved };
}

function hasMovesLeft(grid) {
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if(grid[r][c]===0)return true;
    if(c+1<SIZE&&(grid[r][c]===grid[r][c+1]||grid[r][c+1]===0))return true;
    if(r+1<SIZE&&(grid[r][c]===grid[r+1][c]||grid[r+1][c]===0))return true;
  }
  return false;
}

// Score each direction by tiles merged
function scoreDirection(grid, dir) {
  const { score } = moveGrid(grid, dir);
  return score;
}

export function use2048() {
  const rng = seededRandom(getTodaySeed() + '2048');
  const initGrid = () => { let g = emptyGrid(); g = addTile(g, rng); g = addTile(g, rng); return g; };

  const [grid, setGrid] = useState(initGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);
  const [hintDir, setHintDir] = useState(null);

  const startTimeRef = useRef(Date.now());
  const { submitResult, markComplete } = useGameStore();
  const { user } = useAuthStore();

  function finishWin(s, solved = false, hints = hintsUsed) {
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    markComplete('twentyfortyeight');
    const baseXp = calcXP('twentyfortyeight', 'Expert');
    const xp = applyHintPenalty(baseXp, hints, solved);
    submitResult({ userId: user?.id, gameId: 'twentyfortyeight', difficulty: 'Expert', score: s, timeSeconds, xpEarned: xp, completed: true });
    saveGameResult({ userId: user?.id, gameType: 'twentyfortyeight', score: s, timeSeconds, difficulty: 'Expert', xpEarned: xp });
  }

  const move = useCallback((dir) => {
    if (gameOver) return;
    setGrid(prev => {
      const { newGrid, score: gained, moved } = moveGrid(prev, dir);
      if (!moved) return prev;
      const withTile = addTile(newGrid, rng, moves > 0 && moves % 10 === 0);
      setScore(s => { const ns = s + gained; setBest(b => Math.max(b, ns)); return ns; });
      setMoves(m => m + 1);
      setHintDir(null);
      if (withTile.flat().some(v => v >= WIN_VALUE) && !won) finishWin(score + gained);
      if (!hasMovesLeft(withTile)) {
        setGameOver(true);
        const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        saveGameResult({ userId: user?.id, gameType: 'twentyfortyeight', score: score + gained, timeSeconds, difficulty: 'Expert', xpEarned: 0 });
      }
      return withTile;
    });
  }, [gameOver, won, moves, score, rng]);

  useEffect(() => {
    function handleKey(e) {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const hint = useCallback(() => {
    if (gameOver) return;
    const dirs = ['left','right','up','down'];
    let bestDir = 'up', bestScore = -1;
    for (const d of dirs) {
      const s = scoreDirection(grid, d);
      if (s > bestScore) { bestScore = s; bestDir = d; }
    }
    setHintsUsed(h => h + 1);
    setHintDir(bestDir);
    setTimeout(() => setHintDir(null), 2500);
  }, [gameOver, grid]);

  const solve = useCallback(() => {
    if (gameOver) return;
    // Place a 2048 tile directly
    const newGrid = grid.map(r => [...r]);
    outer: for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (newGrid[r][c] === 0) { newGrid[r][c] = WIN_VALUE; break outer; }
    setGrid(newGrid);
    setWasSolved(true);
    finishWin(score + WIN_VALUE, true);
  }, [gameOver, grid, score]);

  return { grid, score, best, won, gameOver, moves, SIZE, WIN_VALUE, hintsUsed, wasSolved, hintDir, move, hint, solve };
}
