import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRopeUntangle } from './useRopeUntangle.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { GitBranch } from 'lucide-react';

// Logical coordinate space — node positions live in this grid.
// The SVG scales to fill its container via width="100%", so all
// pointer maths map screen pixels → logical coords via getBoundingClientRect.
const W = 340, H = 340;

export default function RopeUntangleGame({ difficulty = 'Medium' }) {
  const navigate     = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp          = useHowToPlay();
  const svgRef       = useRef(null);
  const containerRef = useRef(null); // for non-passive touch listener

  const game = useRopeUntangle({ difficulty, width: W, height: H });

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 600);

  // Map a mouse or touch event to logical SVG coordinates.
  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect   = svg.getBoundingClientRect();
    // changedTouches for touchend (touches list is empty at end); touches for move/start
    const touch  = e.touches?.[0] ?? e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return {
      x: ((clientX - rect.left)  / rect.width)  * W,
      y: ((clientY - rect.top)   / rect.height) * H,
    };
  }, []);

  const handleMove = useCallback((e) => {
    const { x, y } = getSVGPoint(e);
    game.moveDrag(x, y);
  }, [game, getSVGPoint]);

  // Attach touchmove as a non-passive native listener so preventDefault works
  // and the browser doesn't scroll the page while the user is dragging a node.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e) => { e.preventDefault(); handleMove(e); };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [handleMove]);

  // Detect crossing edges for colour feedback
  const crossingEdges = new Set();
  for (let i = 0; i < game.edges.length; i++) {
    for (let j = i + 1; j < game.edges.length; j++) {
      const [a, b] = game.edges[i];
      const [c, d] = game.edges[j];
      if (a === c || a === d || b === c || b === d) continue;
      const na = game.nodes[a], nb = game.nodes[b];
      const nc = game.nodes[c], nd = game.nodes[d];
      const d1 = { x: nb.x - na.x, y: nb.y - na.y };
      const d2 = { x: nd.x - nc.x, y: nd.y - nc.y };
      const cross = d1.x * d2.y - d1.y * d2.x;
      if (Math.abs(cross) > 1e-10) {
        const t = ((nc.x - na.x) * d2.y - (nc.y - na.y) * d2.x) / cross;
        const u = ((nc.x - na.x) * d1.y - (nc.y - na.y) * d1.x) / cross;
        if (t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99) {
          crossingEdges.add(i);
          crossingEdges.add(j);
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4 overflow-x-hidden">
      {htp.open && <HowToPlay gameId="rope" onClose={htp.hide} />}

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <div className="text-center">
          <span className="font-black text-lg tracking-snug block">Rope Untangle</span>
          <span className="text-xs text-muted">{game.crossings} crossing{game.crossings !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="text-muted text-sm font-mono">{game.moves} moves</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-6 text-center max-w-sm">
        Drag the nodes so no ropes cross each other.
      </p>

      {/*
        Canvas container — w-full so the SVG fills available width on mobile.
        touch-none prevents browser pan/zoom gestures inside the canvas;
        the non-passive touchmove listener above prevents page scroll during drag.
      */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm border border-white/10 rounded-2xl overflow-hidden bg-surface touch-none"
        style={{ boxShadow: '0 0 40px rgba(245,166,35,0.05), 0 2px 24px rgba(0,0,0,0.4)' }}
        onMouseMove={handleMove}
        onMouseUp={game.endDrag}
        onTouchEnd={game.endDrag}
      >
        <svg
          ref={svgRef}
          // width="100%" makes the SVG scale to its container width on all screen sizes.
          // viewBox keeps the logical coordinate space at 340×340 so node positions
          // remain valid — getSVGPoint maps rendered pixels back to logical coords.
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="block"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Edges */}
          {game.edges.map(([a, b], i) => {
            const na = game.nodes[a], nb = game.nodes[b];
            const isCrossing = crossingEdges.has(i);
            return (
              <line
                key={i}
                x1={na.x} y1={na.y}
                x2={nb.x} y2={nb.y}
                stroke={isCrossing ? '#EF4444' : '#4A9EFF'}
                strokeWidth={isCrossing ? 2.5 : 1.5}
                strokeOpacity={isCrossing ? 0.8 : 0.4}
              />
            );
          })}

          {/* Nodes */}
          {game.nodes.map(node => {
            const isDragging = game.dragging === node.id;
            return (
              <g key={node.id}>
                {/* Visible circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={14}
                  fill={isDragging ? '#F5A623' : '#1E2535'}
                  stroke={isDragging ? '#F5A623' : '#4A9EFF'}
                  strokeWidth={2}
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isDragging ? '#0D0F14' : '#8B95A1'}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.id + 1}
                </text>
                {/*
                  Transparent hit area — r=22 gives a 44px diameter tap target,
                  meeting Apple HIG and Android minimum touch target guidelines.
                  Rendered last so it sits on top and captures all pointer events.
                */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill="transparent"
                  stroke="none"
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => { e.stopPropagation(); game.startDrag(node.id); }}
                  onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); game.startDrag(node.id); }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <button onClick={game.newGame} className="mt-8 text-xs text-muted hover:text-text transition-colors duration-150">
        ↺ New puzzle
      </button>

      <HintSolveBar
        onHint={game.hint} onSolve={game.solve}
        hintsUsed={game.hintsUsed} wasSolved={game.wasSolved}
        hintLabel="Move a node" disabled={game.won}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <GitBranch size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">Untangled!</h2>
          <p className="text-muted text-sm mb-6">{game.moves} moves · {difficulty}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); game.newGame(); }}>Play Again</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
