import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrewPuzzle } from './useScrewPuzzle.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useState } from 'react';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Settings2 } from 'lucide-react';

function ScrewDisc({ color, isTop, isSelected }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="w-10 h-4 rounded-full mx-auto flex items-center justify-center"
      style={{
        backgroundColor: color,
        boxShadow: isTop && isSelected
          ? `0 0 12px ${color}80, 0 0 4px ${color}`
          : `0 2px 6px ${color}40`,
        border: `1px solid ${color}80`,
      }}
    >
      {isTop && (
        <div className="w-3 h-1 rounded-full bg-black/30" />
      )}
    </motion.div>
  );
}

function Peg({ screws, maxPerPeg, isSelected, onClick }) {
  const emptySlots = maxPerPeg * 2 - screws.length;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`relative flex flex-col items-center justify-end gap-1 pb-3 pt-2 px-3 rounded-2xl border-2 transition-[border-color,background-color] duration-150
        ${isSelected
          ? 'border-amber bg-amber/10'
          : 'border-white/10 bg-surface hover:border-white/20'
        }`}
      style={{ minHeight: `${maxPerPeg * 2 * 20 + 48}px`, minWidth: '56px' }}
    >
      {/* Empty slot indicators */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div key={`empty-${i}`} className="w-10 h-4 rounded-full border border-dashed border-white/10" />
      ))}

      {/* Screws (bottom to top in render = top of stack visually last) */}
      <AnimatePresence>
        {screws.map((color, i) => (
          <ScrewDisc
            key={`${color}-${i}`}
            color={color}
            isTop={i === screws.length - 1}
            isSelected={isSelected}
          />
        ))}
      </AnimatePresence>

      {/* Peg rod */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-white/20 rounded-b-full" />
    </motion.button>
  );
}

export default function ScrewPuzzleGame({ difficulty = 'Medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = useScrewPuzzle({ difficulty });

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 600);

  const halfLen = Math.ceil(game.pegs.length / 2);
  const topRow = game.pegs.slice(0, halfLen);
  const bottomRow = game.pegs.slice(halfLen);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4">
      {htp.open && <HowToPlay gameId="screw" onClose={htp.hide} />}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-white/[0.06] mb-8">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <span className="font-black text-lg tracking-snug">Screw Sort</span>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="text-muted text-sm font-mono">{game.moves} moves</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-8 text-center max-w-sm">
        Tap a peg to pick up its top screws, then tap another peg to move them. Sort all screws by color.
      </p>

      <div className="flex flex-col gap-6 items-center">
        {/* Top row */}
        <div className="flex gap-3 flex-wrap justify-center">
          {topRow.map((screws, i) => (
            <Peg
              key={i}
              screws={screws}
              maxPerPeg={game.maxPerPeg}
              isSelected={game.selected === i}
              onClick={() => game.selectPeg(i)}
            />
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex gap-3 flex-wrap justify-center">
          {bottomRow.map((screws, i) => (
            <Peg
              key={halfLen + i}
              screws={screws}
              maxPerPeg={game.maxPerPeg}
              isSelected={game.selected === halfLen + i}
              onClick={() => game.selectPeg(halfLen + i)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={game.newGame}
        className="mt-10 text-xs text-muted hover:text-text transition-colors duration-150"
      >
        ↺ New puzzle
      </button>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Show next move" disabled={game.won} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Settings2 size={28} color="#F5A623" />
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
