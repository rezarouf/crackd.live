import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { use2048 } from './use2048.js';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull, Lightbulb } from 'lucide-react';

const TILE_STYLES = {
  0:    { bg: 'rgba(255,255,255,0.04)', color: 'transparent' },
  2:    { bg: 'rgba(74,158,255,0.15)',  color: '#4A9EFF' },
  4:    { bg: 'rgba(74,158,255,0.25)',  color: '#4A9EFF' },
  8:    { bg: 'rgba(34,197,94,0.2)',    color: '#22C55E' },
  16:   { bg: 'rgba(34,197,94,0.3)',    color: '#22C55E' },
  32:   { bg: 'rgba(245,166,35,0.2)',   color: '#F5A623' },
  64:   { bg: 'rgba(245,166,35,0.35)',  color: '#F5A623' },
  128:  { bg: 'rgba(168,85,247,0.25)',  color: '#A855F7' },
  256:  { bg: 'rgba(168,85,247,0.4)',   color: '#A855F7' },
  512:  { bg: 'rgba(239,68,68,0.2)',    color: '#EF4444' },
  1024: { bg: 'rgba(239,68,68,0.35)',   color: '#EF4444' },
  2048: { bg: 'linear-gradient(135deg,#F5A623,#EF4444)', color: '#fff' },
  [-1]: { bg: 'rgba(255,255,255,0.06)', color: '#8B95A1' },
};

const CELL = 72;

export default function Game2048() {
  const navigate = useNavigate();
  const { grid, score, best, won, gameOver, moves, SIZE, hintsUsed, wasSolved, hintDir, move, hint, solve } = use2048();
  const [showModal, setShowModal] = useState(false);
  const touchStart = useRef(null);
  if (gameOver && !showModal) setTimeout(() => setShowModal(true), 500);

  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;
    if (absDx > absDy) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
    touchStart.current = null;
  }

  const right = (
    <div className="flex gap-2 text-xs">
      <div className="text-center">
        <div className="text-muted">SCORE</div>
        <div className="font-black text-amber font-mono">{score}</div>
      </div>
      <div className="text-center">
        <div className="text-muted">BEST</div>
        <div className="font-black text-blue font-mono">{best}</div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="twentyfortyeight" title="2048 Twist" right={right}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Best move" gameOver={gameOver}>
      <div
        className="select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="rounded-2xl p-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`, gap: 6 }}>
            {grid.map((row, r) =>
              row.map((val, c) => {
                const style = TILE_STYLES[val] || { bg: TILE_STYLES[2048].bg, color: '#fff' };
                const isBlocker = val === -1;
                const fontSize = val >= 1024 ? 16 : val >= 128 ? 20 : 24;
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    layout
                    className="flex items-center justify-center rounded-xl font-black font-mono"
                    style={{
                      width: CELL, height: CELL,
                      background: style.bg,
                      color: style.color,
                      fontSize,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {isBlocker ? '🚫' : val > 0 ? val : ''}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
        <p className="text-xs text-muted text-center mt-3">Arrow keys or swipe · 🚫 blockers appear every 10 moves</p>
        {hintDir && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-1.5 text-sm font-bold text-amber mt-2">
            <Lightbulb size={13} /> Try moving <span className="uppercase">{hintDir}</span>
          </motion.div>
        )}
      </div>

      {/* Direction buttons for mobile */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <button onClick={() => move('up')} className="w-12 h-10 rounded-xl text-muted hover:text-text font-bold text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>↑</button>
        <div className="flex gap-1">
          <button onClick={() => move('left')} className="w-12 h-10 rounded-xl text-muted hover:text-text font-bold text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>←</button>
          <button onClick={() => move('down')} className="w-12 h-10 rounded-xl text-muted hover:text-text font-bold text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>↓</button>
          <button onClick={() => move('right')} className="w-12 h-10 rounded-xl text-muted hover:text-text font-bold text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>→</button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {won ? <Trophy size={28} color="#F5A623" /> : <Skull size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-3xl font-black tracking-snug mb-2 ${won ? 'text-amber' : 'text-red'}`}>
            {won ? 'You reached 2048!' : 'Game Over'}
          </h2>
          <p className="text-muted mb-6">
            Score: <strong className="text-text">{score}</strong> · {moves} moves
          </p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
