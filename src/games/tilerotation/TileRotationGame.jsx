import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useTileRotation } from './useTileRotation.js';
import { useNavigate } from 'react-router-dom';
import { Cpu } from 'lucide-react';

const CELL = 72;
const WIRE_COLOR = '#F5A623';
const INACTIVE_COLOR = 'rgba(255,255,255,0.12)';

function TileSVG({ connections }) {
  const [top, right, bottom, left] = connections;
  const mid = CELL / 2;
  const lines = [
    top    && `M${mid},0 L${mid},${mid}`,
    right  && `M${mid},${mid} L${CELL},${mid}`,
    bottom && `M${mid},${mid} L${mid},${CELL}`,
    left   && `M0,${mid} L${mid},${mid}`,
  ].filter(Boolean);

  return (
    <svg width={CELL} height={CELL} viewBox={`0 0 ${CELL} ${CELL}`} style={{ display: 'block' }}>
      <rect width={CELL} height={CELL} fill="rgba(255,255,255,0.04)" />
      {/* Inactive cross */}
      <line x1={mid} y1={0} x2={mid} y2={CELL} stroke={INACTIVE_COLOR} strokeWidth="2" strokeDasharray="4,4" />
      <line x1={0} y1={mid} x2={CELL} y2={mid} stroke={INACTIVE_COLOR} strokeWidth="2" strokeDasharray="4,4" />
      {/* Active wires */}
      {lines.map((d, i) => (
        <path key={i} d={d} stroke={WIRE_COLOR} strokeWidth="5" strokeLinecap="round" fill="none" />
      ))}
      {/* Center node */}
      <circle cx={mid} cy={mid} r="5" fill={WIRE_COLOR} />
    </svg>
  );
}

export default function TileRotationGame() {
  const navigate = useNavigate();
  const { board, won, rotations, SIZE, hintsUsed, wasSolved, rotateTileAt, hint, solve } = useTileRotation();
  const [showModal, setShowModal] = useState(false);
  if (won && !showModal) setTimeout(() => setShowModal(true), 500);

  return (
    <GameShell gameId="tilerotation" title="Circuit" badge={`Rotations: ${rotations}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Fix one tile" gameOver={won}>
      <div className="flex flex-col items-center">
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`, gap: 0 }}
        >
          {board.map((row, r) =>
            row.map((tile, c) => (
              <motion.div
                key={`${r}-${c}`}
                whileTap={{ scale: 0.93 }}
                onClick={() => rotateTileAt(r, c)}
                className="cursor-pointer border border-white/[0.06] relative"
                style={{ width: CELL, height: CELL }}
              >
                <TileSVG connections={tile.connections} />
              </motion.div>
            ))
          )}
        </div>
        <p className="text-xs text-muted mt-4">Tap tiles to rotate · Connect all wires</p>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Cpu size={28} color="#F5A623" />
          </div>
          <h2 className="text-3xl font-black text-amber tracking-snug mb-2">Circuit Complete!</h2>
          <p className="text-muted mb-6">All wires connected in <strong className="text-text">{rotations} rotations</strong>.</p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
