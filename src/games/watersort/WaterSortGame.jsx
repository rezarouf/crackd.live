import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useWaterSort } from './useWaterSort.js';
import { useNavigate } from 'react-router-dom';
import { Droplets } from 'lucide-react';

const TUBE_W = 44;
const TUBE_H = 160;
const SEGMENT_H = TUBE_H / 4;

function Tube({ tube, isSelected, onClick, COLORS, TUBE_CAP }) {
  const empty = TUBE_CAP - tube.length;
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col-reverse cursor-pointer rounded-b-full rounded-t-3xl overflow-hidden"
      style={{
        width: TUBE_W,
        height: TUBE_H,
        border: `2px solid ${isSelected ? '#F5A623' : 'rgba(255,255,255,0.15)'}`,
        background: 'rgba(255,255,255,0.04)',
        boxShadow: isSelected ? '0 0 20px rgba(245,166,35,0.4)' : 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {tube.map((colorIdx, i) => (
        <div
          key={i}
          style={{
            height: SEGMENT_H,
            background: COLORS[colorIdx],
            opacity: 0.85,
            borderTop: i < tube.length - 1 ? '1px solid rgba(0,0,0,0.15)' : 'none',
          }}
        />
      ))}
    </motion.div>
  );
}

export default function WaterSortGame() {
  const navigate = useNavigate();
  const { tubes, selected, won, moves, COLORS, TUBE_CAP, hintsUsed, wasSolved, hintMove, selectTube, hint, solve } = useWaterSort();
  const [showModal, setShowModal] = useState(false);
  if (won && !showModal) setTimeout(() => setShowModal(true), 500);

  const half = Math.ceil(tubes.length / 2);

  return (
    <GameShell gameId="watersort" title="Water Sort" badge={`Moves: ${moves}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Show best pour" gameOver={won}>
      <div className="flex flex-col items-center gap-8 px-4">
        {/* Top row */}
        <div className="flex gap-4 justify-center">
          {tubes.slice(0, half).map((tube, i) => (
            <Tube key={i} tube={tube} isSelected={selected === i} onClick={() => selectTube(i)} COLORS={COLORS} TUBE_CAP={TUBE_CAP} />
          ))}
        </div>
        {/* Bottom row */}
        <div className="flex gap-4 justify-center">
          {tubes.slice(half).map((tube, i) => (
            <Tube key={i + half} tube={tube} isSelected={selected === i + half} onClick={() => selectTube(i + half)} COLORS={COLORS} TUBE_CAP={TUBE_CAP} />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted mt-6">Tap a tube to select · Tap another to pour</p>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Droplets size={28} color="#F5A623" />
          </div>
          <h2 className="text-3xl font-black text-amber tracking-snug mb-2">All Sorted!</h2>
          <p className="text-muted mb-6">Completed in <strong className="text-text">{moves} moves</strong>.</p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
