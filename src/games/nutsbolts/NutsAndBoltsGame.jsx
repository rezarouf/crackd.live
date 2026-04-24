import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutsAndBolts } from './useNutsAndBolts.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Wrench } from 'lucide-react';

function Ring({ color, isTop, isSelected }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scaleX: 0.5 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="relative w-full h-5 flex items-center justify-center"
    >
      {/* Ring body */}
      <div
        className="w-full h-5 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: isTop && isSelected
            ? `0 0 14px ${color}80`
            : `0 2px 4px rgba(0,0,0,0.3)`,
          border: `2px solid ${isSelected ? 'rgba(255,255,255,0.6)' : `${color}80`}`,
        }}
      >
        {/* Bolt hole */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-navy border border-white/20" />
        </div>
      </div>
    </motion.div>
  );
}

function Rod({ rings, maxHeight, isSelected, onClick }) {
  const empty = maxHeight - rings.length;

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-3 pb-4 rounded-2xl border-2 cursor-pointer transition-[border-color,background-color] duration-150
        ${isSelected
          ? 'border-amber bg-amber/8'
          : 'border-white/10 bg-surface hover:border-white/20'
        }`}
      style={{ minWidth: '64px' }}
    >
      {/* Bolt rod */}
      <div className="absolute top-2 bottom-3 left-1/2 -translate-x-1/2 w-1.5 bg-white/15 rounded-full z-0" />

      {/* Empty slots */}
      {Array.from({ length: empty }).map((_, i) => (
        <div key={i} className="w-12 h-5 rounded-full border border-dashed border-white/8 relative z-10" />
      ))}

      {/* Rings (bottom to top) */}
      <AnimatePresence>
        {rings.map((color, i) => (
          <div key={`${color}-${i}`} className="relative z-10 w-12">
            <Ring
              color={color}
              isTop={i === rings.length - 1}
              isSelected={isSelected}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Nut at bottom */}
      <div className="relative z-10 w-8 h-3 rounded-sm bg-white/20 border border-white/10" />
    </motion.button>
  );
}

export default function NutsAndBoltsGame({ difficulty = 'Medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = useNutsAndBolts({ difficulty });

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 600);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4">
      {htp.open && <HowToPlay gameId="nutsbolts" onClose={htp.hide} />}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-white/[0.06] mb-8">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <span className="font-black text-lg tracking-snug">Nuts & Bolts</span>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="text-muted text-sm font-mono">{game.moves} moves</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-8 text-center max-w-sm">
        Tap a rod to pick up its top rings, then move them to a rod with matching top color. Sort each rod to one color.
      </p>

      <div className="flex gap-4 flex-wrap justify-center items-end">
        {game.rods.map((rings, i) => (
          <Rod
            key={i}
            rings={rings}
            maxHeight={game.maxHeight}
            isSelected={game.selected === i}
            onClick={() => game.selectRod(i)}
          />
        ))}
      </div>

      <button onClick={game.newGame} className="mt-10 text-xs text-muted hover:text-text transition-colors duration-150">
        ↺ New puzzle
      </button>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Show next move" disabled={game.won} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Wrench size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">All Sorted!</h2>
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
