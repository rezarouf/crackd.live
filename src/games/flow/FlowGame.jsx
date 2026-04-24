import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Workflow, Share2 } from 'lucide-react';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useFlow } from './useFlow.js';
import { toast } from '../../components/ui/Toast.jsx';

const CELL = 56;

export default function FlowGame() {
  const navigate = useNavigate();
  const { size, colors, endpoints, displayPaths, won, hintsUsed, wasSolved, startDraw, continueDraw, endDraw, hint, solve, COLOR_MAP } = useFlow();
  const [showModal, setShowModal] = useState(false);
  const shownRef = useRef(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (won && !shownRef.current) {
      shownRef.current = true;
      const t = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(t);
    }
  }, [won]);

  function posKey(r, c) { return `${r},${c}`; }

  function getCellFromEvent(e) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const c = Math.floor((clientX - rect.left) / CELL);
    const r = Math.floor((clientY - rect.top) / CELL);
    if (r < 0 || r >= size || c < 0 || c >= size) return null;
    return [r, c];
  }

  // XP estimate for share line
  const xpLabel = wasSolved ? '0 XP (auto-solved)' : hintsUsed > 0 ? `${Math.max(0, 100 - hintsUsed * 15)} XP` : '100 XP';

  function handleShare() {
    const COLOR_EMOJI = {
      amber: '🟡', blue: '🔵', green: '🟢', red: '🔴', purple: '🟣', teal: '🩵',
    };
    const cellColor = {};
    Object.entries(displayPaths).forEach(([color, path]) => {
      path.forEach(([r, c]) => { cellColor[posKey(r, c)] = color; });
    });
    const rows = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => {
        const col = cellColor[posKey(r, c)];
        return col ? (COLOR_EMOJI[col] || '⬜') : '⬜';
      }).join('')
    ).join('\n');
    const text = `Flow Connect ✅\n${rows}\ncrackd.live`;
    navigator.clipboard?.writeText(text).then(() => toast.success('Copied to clipboard!'));
  }

  // Build cell color map from paths
  const cellColor = {};
  Object.entries(displayPaths).forEach(([color, path]) => {
    path.forEach(([r, c]) => { cellColor[posKey(r, c)] = color; });
  });

  const totalW = size * CELL;
  const totalH = size * CELL;

  const handlers = won
    ? {}
    : {
        onMouseDown: e => { const pos = getCellFromEvent(e); if (pos) startDraw(...pos); },
        onMouseMove: e => { if (e.buttons === 1) { const pos = getCellFromEvent(e); if (pos) continueDraw(...pos); } },
        onMouseUp: endDraw,
        onTouchStart: e => { const pos = getCellFromEvent(e); if (pos) startDraw(...pos); },
        onTouchMove: e => { e.preventDefault(); const pos = getCellFromEvent(e); if (pos) continueDraw(...pos); },
        onTouchEnd: endDraw,
      };

  return (
    <GameShell gameId="flow" title="Flow Connect"
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Reveal a path" gameOver={won}>
      <div className="flex flex-col items-center">
        <svg
          ref={svgRef}
          width={totalW}
          height={totalH}
          style={{ touchAction: 'none', cursor: won ? 'default' : 'crosshair' }}
          {...handlers}
        >
          {/* Grid background */}
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const key = posKey(r, c);
              const pathColor = cellColor[key];
              return (
                <rect
                  key={key}
                  x={c * CELL + 1} y={r * CELL + 1}
                  width={CELL - 2} height={CELL - 2}
                  rx="6"
                  fill={pathColor ? `${COLOR_MAP[pathColor]}22` : 'rgba(255,255,255,0.03)'}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })
          )}

          {/* Path lines */}
          {Object.entries(displayPaths).map(([color, path]) => {
            if (path.length < 2) return null;
            const col = COLOR_MAP[color];
            const d = path.map(([r, c], i) => `${i === 0 ? 'M' : 'L'} ${c * CELL + CELL / 2} ${r * CELL + CELL / 2}`).join(' ');
            return (
              <path
                key={color}
                d={d}
                fill="none"
                stroke={col}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            );
          })}

          {/* Endpoints */}
          {Object.entries(colors).map(([color, [[r1,c1],[r2,c2]]]) => {
            const col = COLOR_MAP[color];
            return [[[r1,c1],0],[[r2,c2],1]].map(([[r,c], idx]) => (
              <circle
                key={`${color}-${idx}`}
                cx={c * CELL + CELL / 2}
                cy={r * CELL + CELL / 2}
                r={CELL * 0.3}
                fill={col}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="2"
              />
            ));
          })}
        </svg>

        <p className="text-xs text-muted mt-4">
          {won ? '✅ Puzzle complete!' : 'Drag to connect · Fill every cell'}
        </p>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Workflow size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black text-amber tracking-snug mb-1">Puzzle Complete!</h2>
          <p className="text-muted text-sm mb-1">All paths connected · Every cell filled</p>
          <p className="text-amber font-bold text-sm mb-6">{xpLabel}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleShare}>
              <Share2 size={15} className="inline mr-1.5 -mt-0.5" />Share
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>
              More Games →
            </Button>
          </div>
        </div>
      </Modal>
    </GameShell>
  );
}
