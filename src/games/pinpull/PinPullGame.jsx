import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePinPull } from './usePinPull.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { MapPin } from 'lucide-react';

function Ball({ color, released }) {
  return (
    <motion.div
      animate={released
        ? { y: 120, opacity: [1, 1, 0], scale: [1, 1.1, 0.6] }
        : { y: 0, opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-10 h-10 rounded-full mx-auto"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 16px ${color}60, 0 2px 8px ${color}40`,
        border: `2px solid ${color}`,
      }}
    />
  );
}

function PinButton({ pin, colColor, onClick, isAnimating }) {
  return (
    <AnimatePresence>
      {!pin.pulled && (
        <motion.button
          initial={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0, x: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClick}
          disabled={isAnimating}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-[background-color,border-color] duration-150
            bg-surface border-white/10 hover:border-amber/40 hover:bg-amber/10 active:scale-95"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colColor, boxShadow: `0 0 8px ${colColor}60` }}
          />
          <span className="text-xs font-mono text-muted font-semibold">PULL</span>
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-0.5 rounded-full"
            style={{ backgroundColor: colColor }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function PinPullGame({ difficulty = 'Medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = usePinPull({ difficulty });

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 800);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4">
      {htp.open && <HowToPlay gameId="pinpull" onClose={htp.hide} />}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-white/[0.06] mb-8">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <span className="font-black text-lg tracking-snug">Pin Pull</span>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="text-muted text-sm font-mono">{game.pullSequence.length} pulled</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-8 text-center max-w-sm">
        Pull the pins in the correct order to release the balls into their matching buckets.
      </p>

      {game.failed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <p className="text-red-400 text-sm font-semibold text-center">
            Wrong order! <button onClick={game.reset} className="underline ml-1">Try again</button>
          </p>
        </motion.div>
      )}

      <div className="flex gap-8 justify-center flex-wrap">
        {game.cols.map((col, ci) => (
          <div key={ci} className="flex flex-col items-center gap-3">
            {/* Ball */}
            <Ball color={col.color} released={col.ballReleased} />

            {/* Pipe / channel */}
            <div
              className="w-1 flex-1 rounded-full min-h-[80px]"
              style={{ background: `linear-gradient(to bottom, ${col.color}30, ${col.color}10)` }}
            />

            {/* Pins */}
            <div className="flex flex-col gap-2 items-center">
              {col.pins.map(pin => (
                <PinButton
                  key={pin.id}
                  pin={pin}
                  colColor={col.color}
                  onClick={() => game.pullPin(ci, pin.id)}
                  isAnimating={game.animating !== null}
                />
              ))}
            </div>

            {/* Bucket */}
            <div
              className="w-14 h-8 rounded-b-2xl rounded-t-sm border-2 border-t-0 flex items-center justify-center"
              style={{ borderColor: `${col.color}60`, background: `${col.color}15` }}
            >
              {col.ballReleased && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={game.reset} className="mt-10 text-xs text-muted hover:text-text transition-colors duration-150">
        ↺ Reset
      </button>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Show next pin" disabled={game.won} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <MapPin size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">Nailed It!</h2>
          <p className="text-muted text-sm mb-6">{difficulty} · All balls sorted</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); game.reset(); }}>Play Again</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
