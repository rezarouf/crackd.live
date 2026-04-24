import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useMerge } from './useMerge.js';
import { useNavigate } from 'react-router-dom';
import { GitMerge } from 'lucide-react';

const TIER_COLORS = {
  1: { bg: 'rgba(74,158,255,0.15)',  border: 'rgba(74,158,255,0.35)',  text: '#4A9EFF'  },
  2: { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.35)',   text: '#22C55E'  },
  3: { bg: 'rgba(245,166,35,0.15)',  border: 'rgba(245,166,35,0.35)',  text: '#F5A623'  },
  4: { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.35)',  text: '#A855F7'  },
  5: { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)',   text: '#EF4444'  },
};

const CELL = 60;

export default function MergeGame() {
  const navigate = useNavigate();
  const { grid, selected, score, won, moves, GRID, MAX_VAL, hintsUsed, wasSolved, hintPair, selectCell, hint, solve } = useMerge();
  const [showModal, setShowModal] = useState(false);
  if (won && !showModal) setTimeout(() => setShowModal(true), 500);

  return (
    <GameShell gameId="merge" title="Merge Tiles" badge={`Score: ${score}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Show merge pair" gameOver={won}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 text-sm text-muted font-bold mb-2">
          <span>Moves: <span className="text-text">{moves}</span></span>
          <span>Goal: <span className="text-amber">500 pts</span></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`, gap: 6 }}>
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isHinted = hintPair?.some(([hr,hc]) => hr === r && hc === c);
              const colors = TIER_COLORS[val] || TIER_COLORS[1];
              return (
                <motion.div
                  key={`${r}-${c}`}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => selectCell(r, c)}
                  className="flex items-center justify-center cursor-pointer rounded-xl font-black text-xl font-mono select-none"
                  style={{
                    width: CELL, height: CELL,
                    background: colors.bg,
                    border: `2px solid ${isSelected ? '#F5A623' : isHinted ? '#22C55E' : colors.border}`,
                    color: colors.text,
                    boxShadow: isSelected ? '0 0 16px rgba(245,166,35,0.5)' : `0 2px 8px rgba(0,0,0,0.2)`,
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                >
                  {val}
                </motion.div>
              );
            })
          )}
        </div>

        <p className="text-xs text-muted mt-2">Tap two adjacent matching tiles to merge</p>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <GitMerge size={28} color="#F5A623" />
          </div>
          <h2 className="text-3xl font-black text-amber tracking-snug mb-2">Nice Merge!</h2>
          <p className="text-muted mb-6">Score: <strong className="text-text">{score}</strong> in {moves} moves.</p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
