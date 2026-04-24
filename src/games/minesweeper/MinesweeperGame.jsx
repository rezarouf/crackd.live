import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useMinesweeper } from './useMinesweeper.js';
import { useNavigate } from 'react-router-dom';
import { Trophy, Bomb, Zap } from 'lucide-react';

const NUM_COLORS = ['','#4A9EFF','#22C55E','#F5A623','#EF4444','#A855F7','#2DD4BF','#F0F0F0','#8B95A1'];

const CELL = 36;

function Cell({ r, c, isRevealed, isFlagged, isMine, isExploded, adjacentCount, onClick, onFlag }) {
  let bg = 'rgba(255,255,255,0.06)';
  let content = null;
  let textColor = '#F0F0F0';

  if (isExploded) bg = 'rgba(239,68,68,0.4)';
  else if (isRevealed && isMine) bg = 'rgba(239,68,68,0.2)';
  else if (isRevealed) bg = 'rgba(255,255,255,0.03)';

  if (isFlagged && !isRevealed) content = '🚩';
  else if (isRevealed && isMine) content = '💣';
  else if (isRevealed && adjacentCount > 0) {
    content = adjacentCount;
    textColor = NUM_COLORS[adjacentCount] || '#F0F0F0';
  }

  return (
    <motion.div
      whileTap={!isRevealed ? { scale: 0.9 } : {}}
      onClick={onClick}
      onContextMenu={onFlag}
      className="flex items-center justify-center cursor-pointer rounded select-none"
      style={{
        width: CELL, height: CELL,
        background: bg,
        border: `1px solid ${isRevealed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'}`,
        fontSize: isRevealed && typeof content === 'number' ? 13 : 16,
        fontWeight: 900,
        fontFamily: 'JetBrains Mono, monospace',
        color: textColor,
        boxShadow: !isRevealed ? '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
        transition: 'background 0.1s',
      }}
    >
      {content}
    </motion.div>
  );
}

export default function MinesweeperGame() {
  const navigate = useNavigate();
  const { ROWS, COLS, mines, revealed, flagged, exploded, gameOver, won, time, minesLeft, hintsUsed, wasSolved, reveal, flag, hint, solve, adjacentCount } = useMinesweeper();
  const [showModal, setShowModal] = useState(false);
  if (gameOver && !showModal) setTimeout(() => setShowModal(true), 800);

  const right = (
    <div className="flex items-center gap-1 text-sm font-mono font-bold text-amber">
      <Bomb size={14} /> {minesLeft}
    </div>
  );

  return (
    <GameShell gameId="minesweeper" title="Minesweeper" badge={time} right={right}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Reveal safe cell" gameOver={gameOver}>
      <div className="flex flex-col items-center select-none">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: 2 }}>
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const key = `${r},${c}`;
              return (
                <Cell
                  key={key}
                  r={r} c={c}
                  isRevealed={revealed.has(key)}
                  isFlagged={flagged.has(key)}
                  isMine={mines?.has(key)}
                  isExploded={exploded === key}
                  adjacentCount={adjacentCount(r, c)}
                  onClick={() => reveal(r, c)}
                  onFlag={(e) => flag(r, c, e)}
                />
              );
            })
          )}
        </div>
        <p className="text-xs text-muted mt-3">Click to reveal · Right-click to flag</p>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {won ? <Trophy size={28} color="#F5A623" /> : <Zap size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-3xl font-black tracking-snug mb-2 ${won ? 'text-amber' : 'text-red'}`}>
            {won ? 'Board Clear!' : 'Boom!'}
          </h2>
          <p className="text-muted mb-6">
            {won ? `Cleared in ${time}. Impressive!` : 'You hit a mine. Better luck tomorrow!'}
          </p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
