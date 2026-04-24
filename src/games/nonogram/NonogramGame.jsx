import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useNonogram } from './useNonogram.js';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export default function NonogramGame() {
  const navigate = useNavigate();
  const { SIZE, rowClues, colClues, player, crossed, won, mistakes, time, hintsUsed, wasSolved, toggleCell, hint, solve } = useNonogram();
  const [showModal, setShowModal] = useState(false);

  if (won && !showModal) setTimeout(() => setShowModal(true), 600);

  const CELL = 40;
  const CLUE_W = 48;
  const CLUE_H = 40;

  return (
    <GameShell gameId="nonogram" title="Nonogram" badge={`Mistakes: ${mistakes}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Reveal a row" gameOver={won}>
      <div className="flex flex-col items-center select-none">
        {/* Col clues */}
        <div className="flex" style={{ marginLeft: CLUE_W }}>
          {colClues.map((clue, c) => (
            <div key={c} className="flex flex-col justify-end items-center" style={{ width: CELL, height: CLUE_H, gap: 2 }}>
              {clue.map((n, i) => (
                <span key={i} className="text-[11px] font-black text-text font-mono">{n}</span>
              ))}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row clues */}
          <div className="flex flex-col">
            {rowClues.map((clue, r) => (
              <div key={r} className="flex items-center justify-end gap-1 pr-2" style={{ height: CELL, width: CLUE_W }}>
                {clue.map((n, i) => (
                  <span key={i} className="text-[11px] font-black text-text font-mono">{n}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="border border-white/20 rounded-lg overflow-hidden">
            {Array.from({ length: SIZE }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: SIZE }).map((_, c) => {
                  const filled = player[r][c];
                  const isX = crossed[r][c];
                  const borderR = (c + 1) % 5 === 0 ? 'border-r-2 border-r-white/30' : 'border-r border-r-white/10';
                  const borderB = (r + 1) % 5 === 0 ? 'border-b-2 border-b-white/30' : 'border-b border-b-white/10';
                  return (
                    <motion.div
                      key={c}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleCell(r, c)}
                      onContextMenu={(e) => { e.preventDefault(); toggleCell(r, c, true); }}
                      className={`flex items-center justify-center cursor-pointer ${borderR} ${borderB}`}
                      style={{
                        width: CELL, height: CELL,
                        background: filled ? '#F5A623' : 'rgba(255,255,255,0.03)',
                        transition: 'background 0.1s',
                      }}
                    >
                      {isX && !filled && <span className="text-muted text-sm font-black">✕</span>}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted mt-4">Tap to fill · Right-click to mark with X</p>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <LayoutGrid size={28} color="#F5A623" />
          </div>
          <h2 className="text-3xl font-black text-amber tracking-snug mb-2">Solved!</h2>
          <p className="text-muted mb-6">Completed in {time} with {mistakes} mistakes.</p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
