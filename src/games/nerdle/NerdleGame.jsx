import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNerdle } from './useNerdle.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Hash, Frown } from 'lucide-react';

const TILE_COLORS = {
  empty:   { bg: 'transparent', border: 'rgba(255,255,255,0.1)', color: '#F0F0F0' },
  filled:  { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.25)', color: '#F0F0F0' },
  correct: { bg: '#F5A623', border: '#F5A623', color: '#0D0F14' },
  present: { bg: '#4A9EFF', border: '#4A9EFF', color: '#fff' },
  absent:  { bg: '#2A2F3A', border: '#2A2F3A', color: '#8B95A1' },
};

export default function NerdleGame({ mode = 'medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = useNerdle({ mode });
  if (game.gameOver && !showModal) setTimeout(() => setShowModal(true), 600);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4">
      {htp.open && <HowToPlay gameId="nerdle" onClose={htp.hide} />}
      <div className="w-full max-w-lg flex items-center justify-between px-4 pb-4 border-b border-white/[0.06] mb-6">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">← Back</button>
        <span className="font-black text-lg tracking-snug">Nerdle</span>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <div className="font-mono text-blue font-bold">{game.time}</div>
        </div>
      </div>

      <p className="text-sm text-muted mb-6 font-mono">Guess the 8-character equation</p>

      {/* Grid */}
      <motion.div
        className="flex flex-col gap-2 mb-8"
        animate={game.shake ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length: game.MAX_GUESSES }).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: game.EQ_LEN }).map((_, col) => {
              const state = game.getState(row, col);
              const tc = TILE_COLORS[state] || TILE_COLORS.empty;
              return (
                <div
                  key={col}
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-mono font-black text-xl border-2 select-none"
                  style={{ background: tc.bg, borderColor: tc.border, color: tc.color }}
                >
                  {game.getChar(row, col)}
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* Keypad */}
      <div className="flex flex-col gap-2">
        {game.NERDLE_KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-2 justify-center">
            {row.map(key => {
              const isWide = key === 'ENTER' || key === '0';
              const state = game.charStates[key];
              const tc = state ? TILE_COLORS[state] : null;
              return (
                <motion.button
                  key={key}
                  onClick={() => game.handleKey(key)}
                  whileTap={{ scale: 0.92 }}
                  style={tc ? { background: tc.bg, borderColor: tc.border, color: tc.color } : {}}
                  className={`${isWide ? 'px-6' : 'w-12'} h-12 rounded-lg font-mono font-bold text-sm border
                    ${tc ? '' : 'bg-white/[0.07] border-white/10 text-text hover:bg-white/12'}
                    transition-[background-color,border-color] duration-150`}
                >
                  {key}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Reveal a digit" disabled={game.gameOver} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: game.won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${game.won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {game.won ? <Hash size={28} color="#F5A623" /> : <Frown size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-2xl font-black tracking-snug mb-2 ${game.won ? 'text-amber' : 'text-red'}`}>
            {game.won ? 'Equation Cracked!' : 'Out of guesses'}
          </h2>
          <p className="text-muted text-sm mb-6">
            {game.won ? `Solved in ${game.currentRow} guess${game.currentRow !== 1 ? 'es' : ''}!` : `Answer: `}
            {!game.won && <span className="font-mono font-bold text-amber">{game.target}</span>}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>See Board</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
