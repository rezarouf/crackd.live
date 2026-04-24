import { useState, useCallback, useRef } from 'react';
import { calcXP, getTodaySeed, seededRandom, applyHintPenalty } from '../../lib/utils.js';
import { useGameStore } from '../../store/gameStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../components/ui/Toast.jsx';
import { saveGameResult } from '../../lib/supabase.js';

// Rope Untangle: nodes connected by edges (ropes).
// Goal: drag nodes so no edges cross.

function doSegmentsIntersect(p1, p2, p3, p4) {
  const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-10) return false;
  const t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / cross;
  const u = ((p3.x - p1.x) * d1.y - (p3.y - p1.y) * d1.x) / cross;
  return t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99;
}

function countCrossings(nodes, edges) {
  let count = 0;
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i];
      const [c, d] = edges[j];
      if (a === c || a === d || b === c || b === d) continue;
      if (doSegmentsIntersect(nodes[a], nodes[b], nodes[c], nodes[d])) count++;
    }
  }
  return count;
}

function generateGraph(difficulty, seed, width, height) {
  const rng = seededRandom(seed);
  const nodeCount = { Easy: 5, Medium: 7, Hard: 9, Expert: 12 }[difficulty] || 7;

  // Start from untangled solved state: nodes evenly spaced on a circle
  const cx = width / 2, cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    x: cx + radius * Math.cos((2 * Math.PI * i) / nodeCount),
    y: cy + radius * Math.sin((2 * Math.PI * i) / nodeCount),
  }));

  // Build polygon edges (no crossings in circle layout)
  const edges = [];
  for (let i = 0; i < nodeCount; i++) edges.push([i, (i + 1) % nodeCount]);

  // Add diagonal chords that do NOT cross any existing edge in the current circle layout.
  // This keeps the graph planar (guaranteed untangleable).
  const diagonals = { Easy: 1, Medium: 3, Hard: 5, Expert: 7 }[difficulty] || 3;
  let attempts = 0, added = 0;
  while (added < diagonals && attempts < 300) {
    attempts++;
    const a = Math.floor(rng() * nodeCount);
    const b = Math.floor(rng() * nodeCount);
    if (b === a) continue;
    // Skip if it's already a polygon edge or duplicate
    if (edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) continue;
    // Only add if this chord doesn't cross any existing edge (using actual node positions)
    const crosses = edges.some(([c, d]) => {
      if (c === a || c === b || d === a || d === b) return false;
      return doSegmentsIntersect(nodes[a], nodes[b], nodes[c], nodes[d]);
    });
    if (!crosses) { edges.push([a, b]); added++; }
  }

  // Scramble node positions to create tangles (graph is planar so always solvable)
  const scrambled = nodes.map(n => ({
    ...n,
    x: width * 0.1 + rng() * width * 0.8,
    y: height * 0.1 + rng() * height * 0.8,
  }));

  return { nodes: scrambled, edges };
}

export function useRopeUntangle({ difficulty = 'Medium', width = 360, height = 360 } = {}) {
  const seed = getTodaySeed() + difficulty.charCodeAt(2);
  const initGraph = useRef(generateGraph(difficulty, seed, width, height));
  const startTimeRef = useRef(Date.now());

  const [nodes, setNodes] = useState(() => initGraph.current.nodes.map(n => ({ ...n })));
  const [edges] = useState(initGraph.current.edges);
  const [dragging, setDragging] = useState(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wasSolved, setWasSolved] = useState(false);

  const { markComplete, isCompletedToday, submitResult } = useGameStore();
  const { user } = useAuthStore();

  const crossings = countCrossings(nodes, edges);

  const startDrag = useCallback((id) => {
    if (won) return;
    setDragging(id);
  }, [won]);

  const moveDrag = useCallback((x, y) => {
    if (dragging === null) return;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
  }, [dragging]);

  const endDrag = useCallback(() => {
    if (dragging === null) return;
    setDragging(null);
    setMoves(m => m + 1);
    const newCrossings = countCrossings(nodes, edges);
    if (newCrossings === 0) {
      setWon(true);
      const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const movesUsed = moves + 1;
      if (!isCompletedToday('rope')) {
        markComplete('rope');
        const baseXp = calcXP('rope', difficulty);
        const xp = applyHintPenalty(baseXp, hintsUsed, wasSolved);
        submitResult({ userId: user?.id, gameId: 'rope', difficulty, score: movesUsed, timeSeconds, xpEarned: xp, completed: true });
        saveGameResult({ userId: user?.id, gameType: 'rope', score: movesUsed, timeSeconds, difficulty, xpEarned: xp });
        toast.success(`+${xp} XP!`, { icon: '🪢' });
      }
    }
  }, [dragging, nodes, edges, moves, won, difficulty, user, hintsUsed, wasSolved, isCompletedToday, markComplete, submitResult]);

  const hint = useCallback(() => {
    if (won) return;
    // Find two crossing edges and highlight the first involved node
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const [a,b] = edges[i], [c,d] = edges[j];
        if (a===c||a===d||b===c||b===d) continue;
        if (countCrossings(nodes, [[a,b],[c,d]]) > 0) {
          setHintsUsed(h => h + 1);
          toast(`💡 Try moving node ${a + 1} or ${b + 1} — those ropes are crossing`, { duration: 3500 });
          return;
        }
      }
    }
  }, [won, nodes, edges]);

  const solve = useCallback(() => {
    if (won) return;
    // Arrange nodes in a circle (guaranteed untangled)
    const cx = width / 2, cy = height / 2;
    const radius = Math.min(width, height) * 0.38;
    const solved = nodes.map((n, i) => ({
      ...n,
      x: cx + radius * Math.cos((2 * Math.PI * i) / nodes.length),
      y: cy + radius * Math.sin((2 * Math.PI * i) / nodes.length),
    }));
    setNodes(solved);
    setWasSolved(true);
    setWon(true);
    const timeSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (!isCompletedToday('rope')) {
      markComplete('rope');
      const baseXp = calcXP('rope', difficulty);
      const xp = applyHintPenalty(baseXp, hintsUsed, true);
      submitResult({ userId: user?.id, gameId: 'rope', difficulty, score: moves, timeSeconds, xpEarned: xp, completed: true });
      saveGameResult({ userId: user?.id, gameType: 'rope', score: moves, timeSeconds, difficulty, xpEarned: xp });
    }
  }, [won, nodes, moves, difficulty, hintsUsed, width, height, user, isCompletedToday, markComplete, submitResult]);

  const newGame = useCallback(() => {
    const g = generateGraph(difficulty, Date.now(), width, height);
    setNodes(g.nodes.map(n => ({ ...n })));
    setDragging(null); setMoves(0); setWon(false);
    setHintsUsed(0); setWasSolved(false); startTimeRef.current = Date.now();
  }, [difficulty, width, height]);

  return { nodes, edges, dragging, crossings, moves, won, hintsUsed, wasSolved, startDrag, moveDrag, endDrag, hint, solve, newGame };
}
